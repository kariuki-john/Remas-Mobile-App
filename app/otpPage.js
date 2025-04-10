import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiPost } from './serviceApi';

export default function OtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!otp || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      const response = await apiPost('/verify-otp', {
        otp,
        newPassword: password,
      });

      if (response?.success) {
        Alert.alert('Success', 'Your password has been reset');
        router.push('/login');
      } else {
        Alert.alert('Failed', response.message || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong, try again.');
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
          placeholder="Enter OTP"
          placeholderTextColor="#888"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleActivate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ACTIVATE</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.button2} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>BACK TO LOGIN</Text>
        </TouchableOpacity>
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
