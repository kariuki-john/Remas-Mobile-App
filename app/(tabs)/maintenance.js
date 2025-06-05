import React, { useEffect, useState } from "react";
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
  Platform,
  FlatList,
  Image,
  Linking
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { apiGet, apiPost, apiPostData } from "../serviceApi";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const MaintenancePage = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [severity, setSeverity] = useState("LOW");
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState("Personal");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [technicianModalVisible, setTechnicianModalVisible] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [requestId, setRequestId] = useState('');

  // Fetch data functions
  const fetchProperties = async () => {
    try {
      const res = await apiGet("/tenants/units");
      setProperties(res?.data || []);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to load properties" });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiGet("/maintenance/get-maintenance-categories");
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to load categories" });
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiPostData(
        { pageSize: 10, pageNumber },
        "/maintenance/get/my-maintenance-requests/tenant"
      );
      setRequests(res?.data.content || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to load requests" });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      var getData = {
        pageNumber: pageNumber,
        pageSize: pageSize,
        requestId: requestId
      }
      const res = await apiPost("/maintenance/user/technician-requests/applications", getData);
      setTechnicians(res?.data?.content || []);
    } catch (err) {
      console.error("Error fetching technicians", err);
      Toast.show({ type: "error", text1: "Failed to load technicians" });
    }
  };

  // Handle actions
  const handleCardPress = async (req) => {
    setSelectedRequest(req);
    setRequestId(req.requestId);
    await fetchTechnicians();
    setTechnicianModalVisible(true);
  };

  const assignTechnician = async (technician) => {
    try {
      const payload = {
        requestId: selectedRequest.requestId,
        technicianId: technician.id,
      };
      const res = await apiPost("/maintenance/user/assign-technician", payload);
      if (res?.status === 200) {
        Toast.show({ type: "success", text1: "Technician assigned successfully" });
        setTechnicianModalVisible(false);
        fetchRequests();
      } else {
        Toast.show({ type: "error", text1: "Failed to assign technician" });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Error assigning technician" });
    }
  };

  const handleSave = async () => {
    if (!selectedProperty || !selectedCategory || !description) {
      Toast.show({ type: "error", text1: "Please fill all required fields" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        unitId: selectedProperty,
        maintenanceType,
        severity,
        description,
        categoryId: selectedCategory,
      };

      const response = await apiPost("/maintenance/tenant/request", payload);

      if (response?.status === 200) {
        Toast.show({ type: "success", text1: "Request submitted successfully" });
        setShowForm(false);
        fetchRequests();
        resetForm();
      } else {
        Toast.show({ type: "error", text1: "Failed to submit request" });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Error submitting request" });
    } finally {
      setLoading(false);
    }
  };

  const getTechDetails = async (technician) => {
    const email = technician.techEmail
    try {
      const tokenResults = await apiGet(`/user/tech-token/${email}`)

      if (tokenResults?.data) {
        const token = tokenResults.data;
        const techUrl = `https://remas-ke.co.ke/technician-details?token=${token}`;
        const supported = await Linking.canOpenURL(techUrl);

        if (supported) {
          await Linking.openURL(techUrl);
        } else {
          showToast('error', 'Cannot open browser', 'Please try again later');
        }
      } else {
        showToast('error', 'Tech fetch failed', 'Could not get tech token');
      }
    } catch (error) {
      console.log("There was an error:", error);

    }
  }

  const resetForm = () => {
    setSelectedProperty(null);
    setSelectedCategory(null);
    setDescription("");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  useEffect(() => {
    fetchProperties();
    fetchCategories();
    fetchRequests();
  }, [pageNumber]);

  // Render components
  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestId}>Request #{item.requestId}</Text>
        <View style={[
          styles.severityBadge,
          item.severity === "HIGH" ? styles.highSeverity :
            item.severity === "MEDIUM" ? styles.mediumSeverity : styles.lowSeverity
        ]}>
          <Text style={styles.severityText}>{item.severity}</Text>
        </View>
      </View>

      <Text style={styles.propertyText}>{item.unitName} - {item.propertyName}</Text>
      <Text style={styles.descriptionText}>{item.description}</Text>

      <View style={styles.requestFooter}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status || "PENDING"}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTechnicianItem = ({ item }) => (
    <View style={styles.technicianCard}>
      <View style={styles.technicianInfo}>
        <FontAwesome name="user-circle" size={40} color="#6C63FF" />
        <View style={styles.technicianDetails}>
          <Text style={styles.technicianName}>{item.fullName}</Text>
          <Text style={styles.technicianSpecialty}>{item.techEmail || "General Maintenance"}</Text>
        </View>
      </View>

      <View style={styles.technicianActions}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => getTechDetails(item)}
        >
          <Text style={styles.detailButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => assignTechnician(item)}
        >
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6C63FF', '#8A7DFF']}
        style={styles.header}
      >
<<<<<<< HEAD
        <Text style={styles.headerTitle}>Requests</Text>
=======
        <Text style={styles.headerTitle}>Maintenance Requests</Text>
>>>>>>> b6d9ba08d8d697f0992df421ef01d88185eca7ca
        <TouchableOpacity
          style={styles.newRequestButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.newRequestButtonText}>New Request</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Requests List */}
      <FlatList
        data={requests.filter(r =>
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.requestId.includes(search)
        )}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.requestId}
        contentContainerStyle={styles.listContent}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={onRefresh}
        //     colors={['#6C63FF']}
        //   />
        // }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/images/bank.png')}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>No maintenance requests yet</Text>
            <Text style={styles.emptySubtext}>Create your first request by clicking above</Text>
          </View>
        }
      />

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, pageNumber <= 0 && styles.disabledButton]}
          onPress={() => setPageNumber(prev => Math.max(prev - 1, 0))}
          disabled={pageNumber <= 0}
        >
          <Ionicons name="chevron-back" size={20} color={pageNumber <= 0 ? "#ccc" : "#6C63FF"} />
          <Text style={[styles.paginationText, pageNumber <= 0 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>Page {pageNumber + 1} of {totalPages}</Text>

        <TouchableOpacity
          style={[styles.paginationButton, pageNumber + 1 >= totalPages && styles.disabledButton]}
          onPress={() => setPageNumber(prev => prev + 1)}
          disabled={pageNumber + 1 >= totalPages}
        >
          <Text style={[styles.paginationText, pageNumber + 1 >= totalPages && styles.disabledText]}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color={pageNumber + 1 >= totalPages ? "#ccc" : "#6C63FF"} />
        </TouchableOpacity>
      </View>

      {/* New Request Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Maintenance Request</Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Property Unit *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedProperty}
                    onValueChange={setSelectedProperty}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select your unit" value={null} />
                    {properties.map((prop) => (
                      <Picker.Item
                        key={prop.unitId}
                        label={`${prop.unitName} - ${prop.propertyName}`}
                        value={prop.unitId}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={setSelectedCategory}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select category" value={null} />
                    {categories.map((cat) => (
                      <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={maintenanceType}
                    onValueChange={setMaintenanceType}
                    style={styles.picker}
                  >
                    <Picker.Item label="Personal" value="Personal" />
                    <Picker.Item label="Property" value="Property" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Severity</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={severity}
                    onValueChange={setSeverity}
                    style={styles.picker}
                  >
                    <Picker.Item label="Low" value="LOW" />
                    <Picker.Item label="Medium" value="MEDIUM" />
                    <Picker.Item label="High" value="HIGH" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Technician Selection Modal */}
      <Modal visible={technicianModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.technicianModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Technician</Text>
              <TouchableOpacity onPress={() => setTechnicianModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Select a technician for Request #{selectedRequest?.requestId}</Text>

            <FlatList
              data={technicians}
              renderItem={renderTechnicianItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.technicianList}
              ListEmptyComponent={
                <View style={styles.emptyTechnicianContainer}>
                  <MaterialIcons name="handyman" size={48} color="#ccc" />
                  <Text style={styles.emptyTechnicianText}>No available technicians</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Technician Detail Modal */}
      <Modal visible={!!selectedTechnician} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.detailModal]}>
            {selectedTechnician && (
              <>
                <View style={styles.technicianProfile}>
                  <FontAwesome name="user-circle" size={80} color="#6C63FF" />
                  <Text style={styles.technicianName}>{selectedTechnician.fullName}</Text>
                  <Text style={styles.technicianTitle}>{selectedTechnician.specialty || "Maintenance Technician"}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Contact Information</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="mail" size={20} color="#666" />
                    <Text style={styles.detailText}>{selectedTechnician.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="call" size={20} color="#666" />
                    <Text style={styles.detailText}>{selectedTechnician.phoneNumber || "Not provided"}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Skills & Experience</Text>
                  <Text style={styles.detailText}>
                    {selectedTechnician.experience || "No experience information"}
                  </Text>
                  <View style={styles.skillsContainer}>
                    {(selectedTechnician.skills || []).map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => {
                    assignTechnician(selectedTechnician);
                    setSelectedTechnician(null);
                  }}
                >
                  <Text style={styles.assignButtonText}>Assign This Technician</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedTechnician(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: '#f8f9fa',
<<<<<<< HEAD
=======
    marginTop: 20
>>>>>>> b6d9ba08d8d697f0992df421ef01d88185eca7ca
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  newRequestButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    margin: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highSeverity: {
    backgroundColor: '#fee2e2',
  },
  mediumSeverity: {
    backgroundColor: '#fef3c7',
  },
  lowSeverity: {
    backgroundColor: '#dcfce7',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    marginHorizontal: 5,
    color: '#6C63FF',
    fontWeight: '500',
  },
  disabledText: {
    color: '#ccc',
  },
  pageText: {
    color: '#666',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
    fontSize: 14,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  technicianModal: {
    maxHeight: '80%',
  },
  technicianList: {
    paddingBottom: 20,
  },
  technicianCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  technicianDetails: {
    marginLeft: 12,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  technicianSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  technicianActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  detailButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  assignButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyTechnicianContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTechnicianText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  detailModal: {
    maxHeight: '90%',
  },
  technicianProfile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  technicianTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#4f46e5',
  },
  closeButton: {
    padding: 12,
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
});

export default MaintenancePage;