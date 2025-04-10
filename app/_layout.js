import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    
  <Stack screenOptions={(
    { headerShown: false, animation: "fade_from_bottom" }
  )}>
    <Stack.Screen name="(tabs)" options={{
      headerShown: false,
      headerStyle: { backgroundColor: "#f4511e" },
    }} />

    <Stack.Screen name="home" options={{
      headerShown: true,
      title: "",
      headerStyle: { backgroundColor: "#f4511e" },
    }} />
    <Stack.Screen name="forgotPassword" options={{
      headerShown: false,
      title: "",

    }} />
    <Stack.Screen name="otpPage" options={{
      headerShown: false,
      title: "",

    }} />

    <Stack.Screen name="register" options={{
      headerShown: false,
      title: "",

    }} />
    <Stack.Screen 
        name="chats/chatsPage"
        options={{
          presentation: 'modal',
          headerShown:false
        }}
               
      />
       <Stack.Screen 
        name="payments/paymentPage"
        options={{
          headerShown:false,
        }}/>
         
  </Stack>
  )
}
