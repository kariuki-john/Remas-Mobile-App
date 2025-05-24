import React, { useState, useEffect, createContext, useContext } from 'react';
import { Tabs, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { apiPost } from '../serviceApi';
import eventEmitter from '../eventEmitter';
import { ImageBackground } from 'react-native';
import backgroundImage from '../../assets/images/bg.jpg'; 


// Theme context setup in same file
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);
 

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => {
      if (saved) setTheme(saved);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const LayoutContent = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isDark = theme === 'dark';

  const fetchUnreadCount = async () => {
    try {
      const response = await apiPost('/bills-notifications/all-unread-notifications', {
        pageNumber: 0,
        pageSize: 50,
      });
      setUnreadCount(response?.data?.content?.length ?? 0);
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

 

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setLogoutVisible(false);
    router.replace('/login');
  };

  return (
   
    <Tabs
      screenOptions={({ navigation }) => ({
        headerTitle: '',
        headerTitleAlign: 'center',
        headerTransparent: true,
        headerBackground: () => (
          <ImageBackground
            source={backgroundImage}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 60 }}
          />
        ),
        headerStyle: {
           borderBottomRightRadius: 50,
                  borderBottomLeftRadius: 50,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowColor: 200,
        },
        tabBarActiveTintColor: '#99d1f5',
        headerLeft: () =>
          navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 20 }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#333'} />
          </TouchableOpacity>
        ) : null,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
          <TouchableOpacity onPress={() => router.navigate('notifications/notification')}>
            <View style={{ position: 'relative', marginRight: 20 }}>
              <AntDesign name="bells" size={24} color={isDark ? '#fff' : 'black'} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogoutVisible(true)}>
            <Ionicons name="log-out-outline" size={24} color={isDark ? '#fff' : '#333'} />
          </TouchableOpacity>
        </View>
      ),
    })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome6 name="message" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Feather name="tool" size={24} color={color} />,
        }}
      />
      {/* Logout Modal */}
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
    </Tabs>
  );
};

const styles = StyleSheet.create({
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

export default function LayoutWrapper() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}
