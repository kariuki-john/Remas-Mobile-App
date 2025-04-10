import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native';

export default function ProfilePage() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('+254700000000');
  const [dob, setDob] = useState(new Date('1990-01-01'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('Male');
  const [imageUri, setImageUri] = useState(null);

  const handleSave = () => {
    Alert.alert('Profile Saved', 'Your profile has been updated.');
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDob(selectedDate);
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
        <Image
          source={imageUri ? { uri: imageUri } : require('../../assets/images/bank1.png')}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 10,
            backgroundColor: '#eee'
          }}
        />
        <TouchableOpacity onPress={pickImage}>
          <Text style={{
            color: '#1e90ff',
            marginBottom: 20,
            fontWeight: '500'
          }}>Change Photo</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>My Profile</Text>

        <View style={{ width: '100%' }}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType='phone-pad'
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{dob.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode='date'
              display='default'
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Gender</Text>
          <View style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            marginBottom: 10,
            backgroundColor: '#fafafa'
          }}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}>
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 14,
            paddingHorizontal: 30,
            borderRadius: 10,
            marginTop: 25,
            width: '100%',
            alignItems: 'center',
          }}>
          <Text style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
          }}>Save Profile</Text>
        </TouchableOpacity>
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
  }
};
