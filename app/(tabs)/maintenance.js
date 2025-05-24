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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { apiGet, apiPost, apiPostData } from '../serviceApi';
import { Animated } from 'react-native';


const RequestPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [severity, setSeverity] = useState('LOW');
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState('Personal');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = async () => {
    try {
      const res = await apiGet('/tenants/units');
      setProperties(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiGet('/maintenance/get-maintenance-categories');
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiPostData(
        { pageSize: 10, pageNumber },
        '/maintenance/get/my-maintenance-requests/tenant'
      );
      setRequests(res?.data.content || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        unitId: selectedProperty,
        maintenanceType,
        severity,
        description,
        categoryId: selectedCategory,
      };

      const response = await apiPost('/maintenance/tenant/request', payload);

      if (response?.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Maintenance request sent successfully',
        });
        setShowForm(false);
        fetchRequests();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to send request',
          text2: response?.data?.message || 'Unexpected response',
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to send request',
        text2: err?.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchCategories();
    fetchRequests();
  }, [pageNumber]);

  return (
   
      <View style={styles.container}>
        <TouchableOpacity style={styles.newRequestButton} onPress={() => setShowForm(true)}>
          <Text style={styles.newRequestButtonText}>New Request</Text>
        </TouchableOpacity>

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

        <ScrollView style={styles.scrollArea}>
          {requests
            .filter((r) => r.description.toLowerCase().includes(search.toLowerCase()))
            .map((req, idx) => (
              <View key={idx} style={styles.requestCardStyled}>
                <Text style={{ fontWeight: 'bold' }}>Req ID:{req.requestId}</Text>
                <Text >{req.unitName}-{req.propertyName}</Text>
                 <Text>{req.description}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={[styles.status, { backgroundColor: '#d1fadf', color: '#15803d' }]}>Completed</Text>
                  <Text style={[styles.severity, {
                    backgroundColor: req.severity === 'HIGH' ? '#fef2f2' : '#fff7ed',
                    color: req.severity === 'HIGH' ? '#b91c1c' : '#92400e'
                  }]}>{req.severity}</Text>
                </View>
                <Text style={styles.ownerName}>{req.ownerName}</Text>
              </View>
            ))}
        </ScrollView>

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={pageNumber <= 0}
            onPress={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
            style={styles.paginationButton}
          >
            <Text>Previous</Text>
          </TouchableOpacity>
          <Text>{`Page ${pageNumber + 1} of ${totalPages}`}</Text>
          <TouchableOpacity
            disabled={pageNumber + 1 >= totalPages}
            onPress={() => setPageNumber((prev) => prev + 1)}
            style={styles.paginationButton}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
<Modal visible={showForm} transparent animationType="fade">
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={100}
  >
    <ScrollView
      contentContainerStyle={styles.modalScrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View style={styles.modalContent}>
        <Text style={styles.modalTitle}>New Request</Text>

        <Text style={styles.label}>Unit</Text>
        <Picker
          selectedValue={selectedProperty}
          onValueChange={setSelectedProperty}
          style={styles.picker}
        >
          <Picker.Item label="Select Unit" value="" />
          {properties.map((prop) => (
            <Picker.Item
              key={prop.unitId}
              label={`${prop.unitName}-${prop.propertyName}`}
              value={prop.unitId}
            />
          ))}
        </Picker>

        <Text style={styles.label}>Category Type</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          style={styles.picker}
        >
          <Picker.Item label="Select Category Type" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>

        <Text style={styles.label}>Maintenance Type</Text>
        <Picker
          selectedValue={maintenanceType}
          onValueChange={setMaintenanceType}
          style={styles.picker}
        >
          <Picker.Item label="PERSONAL" value="Personal" />
          <Picker.Item label="PROPERTY" value="Property" />
        </Picker>

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

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue..."
        />

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
      </Animated.View>
    </ScrollView>
  </KeyboardAvoidingView>
</Modal>


        <Toast />
      </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 56,
    backgroundColor: '#ffffff',
  },
  newRequestButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalScrollContainer: {
  flexGrow: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: 16,
},
modalContent: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
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
  requestCardStyled: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  severity: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  assignee: {
    marginTop: 8,
    backgroundColor: '#374151',
    color: 'white',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationButton: {
    padding: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
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
