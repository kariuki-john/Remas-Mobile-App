import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Link, useRouter, } from 'expo-router';

const router = useRouter();
export default function LoginScreen() {
  return (
    

    <ImageBackground source={require("../assets/images/login.png")} style={styles.image}>
      <View style={{ width: "100%", alignItems: "center",justifyContent:"center", height: "100%", }}>
        <Image
          source={require("../assets/images/removedbackground.png")}
          style={{ width: 100, height: 100, marginBottom: 10,backgroundColor:"#eeeeee" }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#53A0C1", marginBottom: 30 }}>
          REMAS
        </Text>

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Email"
          placeholderTextColor="#888"
        />

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
        />

        <TouchableOpacity onPress={()=>{
          router.navigate('/forgotPassword')
        }}>
          <Text style={{ alignSelf: "flex-end", color: "black", textDecorationLine: "underline", marginBottom: 20 }}>
            forgot password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#53A0C1",
            width: "90%",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() => { 
            router.navigate("/home") 
          }}
          
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{
          router.navigate("/register")
        }}>
          <Text style={{ color: "#53A0C1", marginTop: 20, textDecorationLine: "underline" }}>
            Join the tenants community
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>

  )
}
const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
  }
})