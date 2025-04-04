import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign } from "@expo/vector-icons";
import { Text } from 'react-native';




const _layout = () => {
  const router = useRouter();


  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#99d1f5', headerShown: true, headerStyle:{
        backgroundColor:"#99d1f5"
      },

        headerLeft: () =>
          <Feather name="arrow-left-circle" size={24} color="black" style={styles.raisedIcon} onPress={() => {
            router.back()
          }} />,
          headerRight: () => (
            <TouchableOpacity style={{ position: "absolute", top: 10, right: 15, marginTop:8}}>
              <AntDesign name="bells" size={24} color="black" />
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
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>3</Text>
              </View>
            </TouchableOpacity>
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
        name="payment"
        options={{
          title: 'payment',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cash-multiple" size={24} color={color} />
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