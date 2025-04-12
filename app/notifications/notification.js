import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { apiGet } from '../serviceApi';
import { useRouter } from 'expo-router';

const Notification = () => {
  const [selectedType, setSelectedType] = useState('unread');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (selectedType) {
        case 'bill':
          endpoint = '/bills-notifications/display-notifications';
          break;
        case 'general':
          endpoint = '/bills-notifications/all-notifications';
          break;
        default:
          endpoint = '/bills-notifications/all-unread-notifications';
      }

      const response = await apiGet(endpoint);
      setNotifications(response || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedType]);

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.title}>{item.title || 'Notification'}</Text>
      <Text style={styles.message}>{item.message || item.content || 'No content'}</Text>
      <Text style={styles.date}>
        {new Date(item.date || item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'unread' && styles.activeToggle]}
          onPress={() => setSelectedType('unread')}
        >
          <Text style={styles.toggleText}>Unread</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'bill' && styles.activeToggle]}
          onPress={() => setSelectedType('bill')}
        >
          <Text style={styles.toggleText}>Bill</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'general' && styles.activeToggle]}
          onPress={() => setSelectedType('general')}
        >
          <Text style={styles.toggleText}>General</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#99d1f5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderNotification}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No notifications to show.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E3F2FD',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
    flexWrap: 'wrap',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: '#99d1f5',
  },
  toggleText: {
    fontSize: 16,
    color: '#333',
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});

export default Notification;
