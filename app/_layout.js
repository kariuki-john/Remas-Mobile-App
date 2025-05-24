import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemeProvider, useTheme } from "./ThemeContext";
import backgroundImage from "../assets/images/bg.jpg";
import { ImageBackground } from "react-native";
import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const { fullName, Email } = useLocalSearchParams();
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getMyEmail = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setMyEmail(decoded?.email);
      }
    };
    getMyEmail();
  }, []);

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="forgotPassword"
          options={{
            headerShown: false,
            title: "",
          }}
        />
        <Stack.Screen
          name="otpPage"
          options={{
            headerShown: false,
            title: "",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            title: "",
          }}
        />
        <Stack.Screen
          name="chats/chatsPage"
          options={{
            headerShown: true,
            headerTransparent: true,
            justifyContent: "center",
            alignItems:'center',
          
            headerBackground: () => (
              <ImageBackground
                source={backgroundImage}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
            ),
            header: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 20,
                 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="black"
                  onPress={() => router.back()}
                />
                <Image
                  source={require("../assets/images/adaptive-icon.png")}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    marginLeft: 10,
                  }}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "black" }}
                  >
                    {Email || fullName || "Chat"}
                  </Text>
                  {otherUserTyping && (
                    <Text style={{ fontSize: 12, color: "gray" }}>
                      typing...
                    </Text>
                  )}
                </View>
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="payments/paymentPage"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications/notification"
          options={{
            headerShown: true,
            headerBackground: () => (
              <ImageBackground
                source={backgroundImage}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
            ),
            title: "Notifications",
            headerTitleAlign: "center",
            headerTransparent: true,
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
