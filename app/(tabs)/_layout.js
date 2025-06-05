import React, { useState, useEffect, createContext, useContext } from 'react';
import { Tabs, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, AntDesign, MaterialIcons, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { apiPost } from '../serviceApi';
import eventEmitter from '../eventEmitter';
import { LinearGradient } from 'expo-linear-gradient';

// Theme context setup
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
  const [activeTab, setActiveTab] = useState('home');
  const scaleValue = new Animated.Value(1);
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
    const listener = () => fetchUnreadCount();
    eventEmitter.on('updateUnreadBadge', listener);

    return () => {
      eventEmitter.removeListener('updateUnreadBadge', listener);
    };
  }, []);

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    // Add a little animation when tab is pressed
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setLogoutVisible(false);
    router.replace('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerTitle: '',
          headerTitleAlign: 'center',
          headerTransparent: true,
          headerStyle: {
            backgroundColor: isDark ? '#1a1a2e' : '#6C63FF',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={{ marginLeft: 20 }}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={isDark ? '#fff' : '#fff'} 
                />
              </TouchableOpacity>
            ) : null,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={{ marginRight: 20 }}
              >
                <MaterialIcons 
                  name={isDark ? 'light-mode' : 'dark-mode'} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.navigate('notifications/notification')}
                style={{ marginRight: 20 }}
              >
                <View style={{ position: 'relative' }}>
                  <Ionicons 
                    name="notifications-outline" 
                    size={24} 
                    color="#fff" 
                  />
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
                <Ionicons 
                  name="log-out-outline" 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          ),
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            height: 70,
            borderRadius: 15,
            backgroundColor: isDark ? '#16213E' : '#fff',
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            paddingBottom: 0,
          },
          tabBarItemStyle: {
            height: 70,
          },
          tabBarActiveTintColor: isDark ? '#6C63FF' : '#6C63FF',
          tabBarInactiveTintColor: isDark ? '#a8a8a8' : '#888',
        }}
      >
        <Tabs.Screen
          name="home"
          listeners={{
            tabPress: () => handleTabPress('home'),
          }}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>
                Home
              </Text>
            ),
            tabBarIcon: ({ focused, color }) => (
              <Animated.View style={focused ? { transform: [{ scale: scaleValue }] } : null}>
                <FontAwesome 
                  name="home" 
                  size={24} 
                  color={color} 
                  style={focused ? styles.iconActive : null}
                />
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="bills"
          listeners={{
            tabPress: () => handleTabPress('bills'),
          }}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>
                Bills
              </Text>
            ),
            tabBarIcon: ({ focused, color }) => (
              <Animated.View style={focused ? { transform: [{ scale: scaleValue }] } : null}>
                <MaterialIcons 
                  name="receipt" 
                  size={24} 
                  color={color} 
                  style={focused ? styles.iconActive : null}
                />
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          listeners={{
            tabPress: () => handleTabPress('messages'),
          }}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>
                Messages
              </Text>
            ),
            tabBarIcon: ({ focused, color }) => (
              <Animated.View style={focused ? { transform: [{ scale: scaleValue }] } : null}>
                <FontAwesome6 
                  name="message" 
                  size={20} 
                  color={color} 
                  style={focused ? styles.iconActive : null}
                />
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="maintenance"
          listeners={{
            tabPress: () => handleTabPress('maintenance'),
          }}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>
                Maintenance
              </Text>
            ),
            tabBarIcon: ({ focused, color }) => (
              <Animated.View style={focused ? { transform: [{ scale: scaleValue }] } : null}>
                <Feather 
                  name="tool" 
                  size={24} 
                  color={color} 
                  style={focused ? styles.iconActive : null}
                />
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          listeners={{
            tabPress: () => handleTabPress('profile'),
          }}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>
                Profile
              </Text>
            ),
            tabBarIcon: ({ focused, color }) => (
              <Animated.View style={focused ? { transform: [{ scale: scaleValue }] } : null}>
                <Ionicons 
                  name="person-circle-outline" 
                  size={24} 
                  color={color} 
                  style={focused ? styles.iconActive : null}
                />
              </Animated.View>
            ),
          }}
        />
      </Tabs>

      {/* Logout Modal */}
      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#16213E' : '#fff' }]}>
            <Ionicons 
              name="log-out-outline" 
              size={40} 
              color="#ff5555" 
              style={styles.modalIcon}
            />
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#333' }]}>
              Confirm Logout
            </Text>
            <Text style={[styles.modalMessage, { color: isDark ? '#ccc' : '#666' }]}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.cancelButton, { backgroundColor: isDark ? '#0F3460' : '#eee' }]} 
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={[styles.cancelText, { color: isDark ? '#fff' : '#333' }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
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
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ff5555',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelText: {
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: '#ff5555',
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
});

export default function LayoutWrapper() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}