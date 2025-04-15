import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { apiPostPublic } from './serviceApi';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleRequestOTP = async () => {
    if (!email) {
      showToast('error', 'Validation Error', 'Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email');
      return;
    }

    try {
      setLoading(true);
      const response = await apiPostPublic(
        `/user/all/forgot-password?email=${encodeURIComponent(email)}`,
        {}
      );

      if (response?.status === 200) {
        showToast('success', 'OTP Sent', 'Check your email for the OTP.');

        setTimeout(() => {
          router.push({
            pathname: '/otpPage',
            params: {
              forgotPassword: 'true',
              email: email, // send email along for prefill
            },
          });
        }, 1000);
      } else {
        showToast('error', 'Failed', response?.message || 'Could not request OTP');
      }
    } catch (error) {
      showToast('error', 'Network Error', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require("../assets/images/login.png")} style={styles.image}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/removedbackground.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>REMAS</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>REQUEST OTP</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 5,
    backgroundColor: '#eeeeee',
    borderRadius: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#53A0C1',
    marginBottom: 10,
  },
  input: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  button: {
    backgroundColor: '#53A0C1',
    width: '90%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
