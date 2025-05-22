import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "./ThemeContext";


export default function RootLayout() {
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
            headerStyle: {
              backgroundColor: "transparent",
              elevation: 10, // Android shadow
              shadowColor: "#000", // iOS shadow
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerStyle: {
              backgroundColor: "transparent",
              elevation: 10, // Android shadow
              shadowColor: "#000", // iOS shadow
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
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
            presentation: "modal",
            headerShown: false,
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
            title: "Notifications",
            headerTitleAlign: "center",
            headerTransparent: true,
            headerStyle: {
              backgroundColor: "transparent",
              elevation: 10, // Android shadow
              shadowColor: "#000", // iOS shadow
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
