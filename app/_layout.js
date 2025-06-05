import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemeProvider, useTheme } from "./ThemeContext";
import backgroundImage from "../assets/images/bg.jpg";
import { 
  ImageBackground, 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions,
  Animated,
  Platform,
  StatusBar
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function RootLayout() {
  const { fullName, email } = useLocalSearchParams();
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Animate header entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Commented out original logic
    // const getMyEmail = async () => {
    //   const token = await AsyncStorage.getItem("token");
    //   if (token) {
    //     const decoded = jwtDecode(token);
    //     setMyEmail(decoded?.email);
    //   }
    // };
    // getMyEmail();
  }, []);

  const CustomHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
        style={styles.headerGradient}
      />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View 
        style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.backButtonContainer}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#fff"
              onPress={() => router.back()}
              style={styles.backButton}
            />
          </View>
          
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../assets/images/adaptive-icon.png")}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {email || fullName || "Chat"}
              </Text>
              {otherUserTyping ? (
                <Animated.View style={styles.typingContainer}>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                  <Text style={styles.typingText}>typing...</Text>
                </Animated.View>
              ) : (
                <Text style={styles.statusText}>Online</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.iconButton}>
            <Ionicons name="videocam" size={20} color="#fff" />
          </View>
          <View style={styles.iconButton}>
            <Ionicons name="call" size={20} color="#fff" />
          </View>
          <View style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </View>
        </View>
      </Animated.View>
    </View>
  );

  const NotificationHeader = () => (
    <View style={styles.notificationHeaderContainer}>
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
        style={styles.headerGradient}
      />
      <View style={styles.notificationHeaderContent}>
        <Text style={styles.notificationTitle}>Notifications</Text>
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 300,
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
            headerStyle: styles.homeHeader,
            headerTitleStyle: styles.homeHeaderTitle,
          }}
        />
        
        <Stack.Screen
          name="forgotPassword"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        
        <Stack.Screen
          name="otpPage"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        
        <Stack.Screen
          name="chats/chatsPage"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerBackground: () => (
              <ImageBackground
                source={backgroundImage}
                style={styles.headerBackground}
                imageStyle={styles.headerBackgroundImage}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)']}
                  style={StyleSheet.absoluteFillObject}
                />
              </ImageBackground>
            ),
            header: () => <CustomHeader />,
          }}
        />

        <Stack.Screen
          name="payments/paymentPage"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        
        <Stack.Screen
          name="notifications/notification"
          options={{
            headerShown: true,
            headerBackground: () => (
              <ImageBackground
                source={backgroundImage}
                style={styles.headerBackground}
                imageStyle={styles.headerBackgroundImage}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.2)']}
                  style={StyleSheet.absoluteFillObject}
                />
              </ImageBackground>
            ),
            header: () => <NotificationHeader />,
            headerTransparent: true,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  backButton: {
    padding: 8,
  },
  
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  typingDots: {
    flexDirection: 'row',
    marginRight: 5,
  },
  
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    marginHorizontal: 1,
  },
  
  typingText: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  // Background Styles
  headerBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerBackgroundImage: {
    opacity: 0.8,
  },
  
  // Home Header Styles
  homeHeader: {
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  homeHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Notification Header Styles
  notificationHeaderContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
  notificationHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  
  notificationBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});