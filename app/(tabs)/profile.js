import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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
  const [loading, setLoading] = useState(false);

  const scale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cardTranslateY.value }],
      opacity: headerOpacity.value,
    };
  });

  const animateImage = () => {
    scale.value = withSpring(1.1, { damping: 8 }, () => {
      scale.value = withSpring(1, { damping: 8 });
    });
  };

  useEffect(() => {
    // Animate on mount
    headerOpacity.value = withTiming(1, { duration: 800 });
    cardTranslateY.value = withTiming(0, { duration: 800 });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    const payload = {
      id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      idNumber: idNumber.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
    };

    try {
      setLoading(true);
      const response = await apiPut('/user/update', payload);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated! 🎉',
        text2: 'Your changes have been saved successfully.',
      });
      setEditMode(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.message || error.message || 'Could not update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permission Required',
        text2: 'Please allow access to your photo library.',
      });
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
      animateImage();
    }
  };

  const renderInfoCard = (icon, label, value) => (
    <Animated.View style={[styles.infoCard, animatedCardStyle]}>
      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#7b70ff" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderInput = (label, value, onChangeText, icon, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#7b70ff" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7b70ff" />
      <View style={styles.container}>
        {/* Header Section */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your personal information</Text>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Picture Section */}
          <Animated.View style={[styles.profileSection, animatedCardStyle]}>
            <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
              <Animated.Image
                source={imageUri ? { uri: imageUri } : require('../../assets/images/bank1.png')}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Profile Content */}
          <Animated.View style={[styles.contentCard, animatedCardStyle]}>
            {editMode ? (
              <View style={styles.editForm}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="create-outline" size={18} color="#7b70ff" /> Edit Profile
                </Text>

                {renderInput('First Name', firstName, setFirstName, 'person-outline')}
                {renderInput('Last Name', lastName, setLastName, 'person-outline')}
                {renderInput('ID Number', idNumber, setIdNumber, 'card-outline', 'numeric')}
                {renderInput('Email', email, setEmail, 'mail-outline', 'email-address')}
                {renderInput('Phone Number', contactNumber, setContactNumber, 'call-outline', 'phone-pad')}

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    onPress={handleSave} 
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    disabled={loading}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                    <Text style={styles.buttonText}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setEditMode(false)} 
                    style={styles.cancelButton}
                    disabled={loading}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#666" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.viewMode}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="information-circle-outline" size={18} color="#7b70ff" /> Profile Information
                </Text>

                {renderInfoCard('person', 'Full Name', `${firstName} ${lastName}`)}
                {renderInfoCard('card', 'ID Number', idNumber)}
                {renderInfoCard('mail', 'Email Address', email)}
                {renderInfoCard('call', 'Phone Number', contactNumber)}

                <TouchableOpacity
                  onPress={() => setEditMode(true)}
                  style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#7b70ff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: '#eee',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#7b70ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(123, 112, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7b70ff',
  },
  changePhotoText: {
    color: '#7b70ff',
    fontWeight: '600',
    fontSize: 14,
  },
  contentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  editForm: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: '#7b70ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  viewMode: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7b70ff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(123, 112, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#7b70ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
};