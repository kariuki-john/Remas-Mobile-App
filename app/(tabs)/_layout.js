import React, { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AntDesign } from "@expo/vector-icons";
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet } from '../serviceApi';



const _layout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); 
            console.log('Token cleared');
      router.replace('/login'); 
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const response = await apiGet('/bills-notifications/unread-count');
      setUnreadCount(response?.count || 0); 
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  fetchUnreadCount();

  const interval = setInterval(fetchUnreadCount, 10000); 
  return () => clearInterval(interval);
}, []);

  

  return (
    <>
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#99d1f5', headerShown: true, headerStyle: {
        backgroundColor: "#99d1f5"
      },

      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="arrow-left-circle" size={24} color="black" style={styles.raisedIcon} onPress={() => {
            router.back()
          }} />
          
        </View>
      ),
      headerTitle: () => (
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Remas</Text>
      ),
      headerTitleAlign: 'center',
      headerRight: () => (
        <View style={{ flex: 1, flexDirection: 'row', marginRight: 20 }}>
          <TouchableOpacity onPress={() => router.navigate('notifications/notification')}>
  <View style={{ position: "relative", marginRight: 25 }}>
    <AntDesign name="bells" size={24} color="black" />
    {unreadCount > 0 && (
      <View
        style={{
          position: "absolute",
          right: -5,
          top: -5,
          backgroundColor: "red",
          borderRadius: 10,
          width: 20,
          height: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </Text>
      </View>
    )}
  </View>
</TouchableOpacity>

      
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 100 }}>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={{ position: "absolute", right: 15, marginTop: 8 }} onPress={() => {
              router.navigate('/messages')
            }}>
            </TouchableOpacity>
          </View>
        </View>
      )
        



    }}>
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
          title: 'messages',
          tabBarIcon: ({ color }) => <FontAwesome6 name="message" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => < Feather name="tool" size={24} color={color} />,
        }}
      />
    </Tabs>
</>
  )
}

const styles = StyleSheet.create({
  raisedIcon: {
    shadowColor: 'white',
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 1.5,
    shadowRadius: 13,
    padding: 10,
  },
})
export default _layout