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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { apiPost, otpVerification } from './serviceApi';
import { encode } from './encryption'

export default function OtpPage() {
  const router = useRouter();
  const { forgotPassword } = useLocalSearchParams();
  const isReset = forgotPassword === 'true';

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { email, otp, newPassword } = formData;
  
    if (!email || !otp || !newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields',
      });
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
      });
      return;
    }
  
    try {
      setLoading(true);
  
      const endpoint = isReset ? '/user/all/reset-password' : '/user/all/activate';
      const encodedPassword = encode(newPassword);
  
      const response = await otpVerification(endpoint, {
        email,
        otp,
        newPassword: encodedPassword,
      });

      console.log("Sending OTP verification:");
console.log("Email:", email);
console.log("OTP:", otp);
console.log("Encoded password:", encodedPassword);

  
      if (response?.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.message || (isReset ? 'Password reset successfully' : 'Activated successfully'),
        });
        router.push('/login');
      } else {
        Toast.show({
          type: 'error',
          text1: isReset ? 'Reset Failed' : 'Activation Failed',
          text2: response?.message || 'Invalid OTP or password',
        });
      }
  
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong, try again.',
      });
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
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#888"
          value={formData.otp}
          onChangeText={(text) => handleChange('otp', text)}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="New Password"
            placeholderTextColor="#888"
            value={formData.newPassword}
            onChangeText={(text) => handleChange('newPassword', text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isReset ? 'RESET PASSWORD' : 'ACTIVATE'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button2} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>BACK TO LOGIN</Text>
        </TouchableOpacity>

        <Toast />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    backgroundColor: "#eeeeee",
    borderRadius: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#53A0C1",
    marginBottom: 30,
  },
  input: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: "#53A0C1",
    width: "90%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  button2: {
    backgroundColor: "#53A0C1",
    width: "90%",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
