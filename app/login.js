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
import { login } from './serviceApi';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const showToast = (type, text1, text2 = '') => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);
      console.log("API response received:", JSON.stringify(response));

      setLoading(false);

      if (response?.token || (response?.message && response.message.includes("successful"))) {
        showToast('success', 'Login Successful');
        setTimeout(() => {
          router.replace('/home');
        }, 100);
      } else {
        showToast('error', 'Login Failed', response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('error', 'Error', 'Something went wrong. Please try again later.');
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
        <View style={styles.input}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.input}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
          </TouchableOpacity>
        </View>


        <TouchableOpacity onPress={() => router.navigate('/forgotPassword')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate('/register')}>
          <Text style={styles.registerText}>Join the tenants community</Text>
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
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    backgroundColor: '#eeeeee',
    borderRadius: 50,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#53A0C1',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
    padding: 12,
    marginBottom: 12,
  },
  forgot: {
    alignSelf: 'flex-end',
    color: 'black',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#53A0C1',
    width: '90%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    color: '#53A0C1',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
