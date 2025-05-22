import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { apiGet, apiPost } from '../serviceApi'; 

const RequestPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      const res = await apiGet('/property/list'); 
      setProperties(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiGet('/category/list'); 
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiGet('/request/list'); 
      setRequests(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        propertyId: selectedProperty,
        categoryId: selectedCategory,
        severity,
        description,
      };
      await apiPost('/request/create', payload);
      Toast.show({
        type: 'success',
        text1: 'Maintenance request sent successfully',
      });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to send request',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchCategories();
    fetchRequests();
  }, []);

  return (
    <View style={styles.container}>
      {/* New Request Button */}
      <TouchableOpacity
        style={styles.newRequestButton}
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.newRequestButtonText}>New Request</Text>
      </TouchableOpacity>

      {/* Filter and Search */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Filter"
          value={filter}
          onChangeText={setFilter}
        />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Request List */}
      <ScrollView style={styles.scrollArea}>
        {requests
          .filter((r) =>
            r.description.toLowerCase().includes(search.toLowerCase())
          )
          .map((req, idx) => (
            <View key={idx} style={styles.requestCard}>
              <Text style={styles.requestTitle}>{req.description}</Text>
              <Text>Severity: {req.severity}</Text>
              <Text>Property: {req.propertyName}</Text>
              <Text>Category: {req.categoryName}</Text>
            </View>
          ))}
      </ScrollView>

      {/* New Request Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Request</Text>

          {/* Property Picker */}
          <Text style={styles.label}>Property</Text>
          <Picker
            selectedValue={selectedProperty}
            onValueChange={setSelectedProperty}
            style={styles.picker}
          >
            <Picker.Item label="Select Property" value="" />
            {properties.map((prop) => (
              <Picker.Item
                key={prop.unitId}
                label={prop.unitName}
                value={prop.propertyName}
              />
            ))}
          </Picker>

          {/* Category Picker */}
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={setSelectedCategory}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat) => (
              <Picker.Item
                key={cat.id}
                label={cat.name}
                value={cat.id}
              />
            ))}
          </Picker>

          {/* Severity Picker */}
          <Text style={styles.label}>Severity</Text>
          <Picker
            selectedValue={severity}
            onValueChange={setSeverity}
            style={styles.picker}
          >
            <Picker.Item label="LOW" value="LOW" />
            <Picker.Item label="MEDIUM" value="MEDIUM" />
            <Picker.Item label="HIGH" value="HIGH" />
          </Picker>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue..."
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  newRequestButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  newRequestButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderColor: '#d1d5db',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  scrollArea: {
    flex: 1,
  },
  requestCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
  },
  requestTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginTop: 64,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RequestPage;
