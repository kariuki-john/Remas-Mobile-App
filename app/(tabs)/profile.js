import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { apiGet, apiPut } from '../serviceApi';

export default function ProfilePage() {
  const [id, setId] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animateImage = () => {
    scale.value = withTiming(1.1, { duration: 150 }, () => {
      scale.value = withTiming(1, { duration: 150 });
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet('/user/get-user-details');
        const user = response?.data;

        if (user) {
          setId(user.id);
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setIdNumber(user.idNumber || '');
          setEmail(user.email || '');
          setContactNumber(user.contactNumber || '');
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to load profile',
          text2: error.message || 'Something went wrong',
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const payload = {
      id,
      firstName,
      lastName,
      idNumber,
      email,
      contactNumber,
    };

    try {
      const response = await apiPut('/user/update', payload);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile was successfully updated.',
      });
      setEditMode(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.message || error.message || 'Could not update profile.',
      });
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Please allow access to your gallery.',
      });
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
      animateImage();
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9f9f9', padding: 20 }}>
      <View style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}>
        <Animated.Image
          source={imageUri ? { uri: imageUri } : require('../../assets/images/bank1.png')}
          style={[{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 10,
            backgroundColor: '#eee'
          }, animatedStyle]}
        />

        <TouchableOpacity onPress={pickImage}>
          <Text style={{ color: '#1e90ff', marginBottom: 20, fontWeight: '500' }}>
            Change Photo
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>My Profile</Text>

        {editMode ? (
          <View style={{ width: '100%' }}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>ID Number</Text>
            <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} keyboardType='numeric' />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType='email-address' />

            <Text style={styles.label}>Contact Number</Text>
            <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} keyboardType='phone-pad' />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditMode(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ width: '100%' }}>
            <View style={styles.infoCard}><Text style={styles.infoLabel}>Full Name:</Text><Text>{firstName} {lastName}</Text></View>
            <View style={styles.infoCard}><Text style={styles.infoLabel}>ID Number:</Text><Text>{idNumber}</Text></View>
            <View style={styles.infoCard}><Text style={styles.infoLabel}>Email:</Text><Text>{email}</Text></View>
            <View style={styles.infoCard}><Text style={styles.infoLabel}>Phone:</Text><Text>{contactNumber}</Text></View>

            <TouchableOpacity
              onPress={() => setEditMode(true)}
              style={styles.updateButton}>
              <Text style={styles.saveText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  label: {
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    color: '#333'
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fafafa'
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5
  }
};
