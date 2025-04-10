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
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiPost } from './serviceApi';

export default function RegisterScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    idNumber: '',
    email: '',
    
  });

  const [idImageUri, setIdImageUri] = useState(null);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setIdImageUri(pickerResult.assets[0].uri);
    }
  };


  const handleRegister = async () => {
    const { firstName, lastName, contactNumber, idNumber, email} = formData;

    if (!firstName || !lastName || !contactNumber || !idNumber || !email) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    try {
      const detailsData = new FormData();
      
      // Fix 1: Correctly format the image file for upload
      const imageNameParts = idImageUri.split('/');
      const imageName = imageNameParts[imageNameParts.length - 1];
      const imageType = imageName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      detailsData.append('idPicture', {
        uri: idImageUri,
        type: imageType,
        name: imageName,
      });
     
      detailsData.append('userDtoString', JSON.stringify(formData));
      const response = await apiPost('/user/all/register/tenant', detailsData)

      if (response?.success) {
        setTimeout(() => {
          router.replace('/otpPage');
        }, 100);
      } else if (response?.message && response.message.includes("successful")) {
        console.log("Success message found, navigating now");
        Alert.alert("Registration Successful", response?.message );
        setTimeout(() => {
          router.replace('/otpPage');
        }, 100)
      }
      else {
        Alert.alert("Registration Failed", response?.message || "Unknown error");
      }
    } catch (error) {
      Alert.alert("Error", "Could not complete registration.");
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
          placeholder="First Name"
          placeholderTextColor="#888"
          value={formData.firstName}
          onChangeText={(text) => handleChange('firstName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={formData.secondName}
          onChangeText={(text) => handleChange('lastName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contacts"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={formData.contact}
          onChangeText={(text) => handleChange('contactNumber', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="ID Number"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={formData.idNumber}
          onChangeText={(text) => handleChange('idNumber', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.uploadText}>
            {idImageUri ? "ID Uploaded ✅" : "Upload ID"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate('/login')}>
          <Text style={styles.footerLink}>Am a member of the community</Text>
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
    height: "90%",
  },
  logo: {
    width: 80,
    height: 90,    
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#53A0C1",
    marginBottom: 10,
  },
  input: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  uploadText: {
    color: '#1e90ff',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: "#53A0C1",
    width: "90%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerLink: {
    color: "#53A0C1",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
