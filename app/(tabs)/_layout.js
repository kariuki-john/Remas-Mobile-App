import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, useNavigationContainerRef } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { apiPost } from '../serviceApi';
import eventEmitter from '../eventEmitter';

const _layout = () => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiPost('/bills-notifications/all-unread-notifications', {
        pageNumber: 0,
        pageSize: 50,
      });
      const count = response?.data?.content?.length ?? 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    const listener = () => fetchUnreadCount();
    eventEmitter.on('updateUnreadBadge', listener);
  
    return () => {
      clearInterval(interval);
      eventEmitter.removeListener('updateUnreadBadge', listener);
    };
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setLogoutVisible(false);
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#99d1f5',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#99d1f5',
          },
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather
                name="arrow-left-circle"
                size={24}
                color="black"
                style={styles.raisedIcon}
                onPress={() => router.back()}
              />
            </View>
          ),
          headerTitle: () => (
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Remas</Text>
          ),
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
              <TouchableOpacity onPress={() => router.navigate('notifications/notification')}>
                <View style={{ position: 'relative', marginRight: 25 }}>
                  <AntDesign name="bells" size={24} color="black" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLogoutVisible(true)}>
                <Ionicons name="log-out-outline" size={28} color="#333" />
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <FontAwesome6 name="message" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-circle-outline" size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Feather name="tool" size={24} color={color} />,
          }}
        />
      </Tabs>

      {/* Logout Confirmation Modal */}
      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  raisedIcon: {
    shadowColor: 'white',
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 1.5,
    shadowRadius: 13,
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#ff5555',
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default _layout;
