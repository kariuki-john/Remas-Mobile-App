import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { apiRegister } from './serviceApi';

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
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Permission Required',
        text2: 'Access to camera roll is required!',
      });
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
    const { firstName, lastName, contactNumber, idNumber, email } = formData;

    if (!firstName || !lastName || !contactNumber || !idNumber || !email) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'All fields are required.',
      });
      return;
    }

    if (!idImageUri) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Please upload an ID image.',
      });
      return;
    }

    try {
      const detailsData = new FormData();

      const imageNameParts = idImageUri.split('/');
      const imageName = imageNameParts[imageNameParts.length - 1];
      const imageType = imageName.endsWith('.png') ? 'image/png' : 'image/jpeg';

      detailsData.append('idPicture', {
        uri: idImageUri,
        type: imageType,
        name: imageName,
      });

      detailsData.append('userDtoString', JSON.stringify(formData));

      const response = await apiRegister('/user/all/register/tenant', detailsData, false);
      console.log('Register response:', response);

      if (response?.status === 200) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Success',
          text2: 'Account created successfully!',
        });

        setFormData({
          firstName: '',
          lastName: '',
          contactNumber: '',
          idNumber: '',
          email: '',
        });
        setIdImageUri(null);

        setTimeout(() => {
          router.replace('/otpPage');
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Registration Failed',
          text2: response?.message || 'Something went wrong.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: error?.message || 'Something went wrong.',
      });
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
          value={formData.lastName}
          onChangeText={(text) => handleChange('lastName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contacts"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={formData.contactNumber}
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

      <Toast/>
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
