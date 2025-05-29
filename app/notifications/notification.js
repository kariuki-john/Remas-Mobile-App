import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { apiPost} from '../serviceApi';
import eventEmitter from '../eventEmitter';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiPost('/bills-notifications/all-unread-notifications', {
        pageNumber: 0,
        pageSize: 50,
      });
      
      console.log('Notifications response:', JSON.stringify(response?.data));
      const notificationsWithIndex = (response?.data?.content || []).map((notification, index) => ({
        ...notification,
        clientId: `notification-${index}` 
      }));
      
      setNotifications(notificationsWithIndex);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  const createNotificationKey = (notification) => {
    return `${notification.message}-${notification.timeStamp}`;
  };

  const markAsRead = async (notification) => {
    const notificationKey = createNotificationKey(notification);
    const identifier = notification.refId;  
  
    // Check if identifier is invalid
    if (!identifier || identifier <= 0) {
      
      return;
    }
  
    try {
     
      await apiPost(`/bills-notifications/notification/read/{notificationId}`);
     
  
      // Remove the notification from the state (if needed)
      setNotifications(prevNotifications => 
        prevNotifications.filter(item => createNotificationKey(item) !== notificationKey)
      );
  
      // Emit event to update the unread badge
      eventEmitter.emit('updateUnreadBadge');
      console.log('Successfully marked notification as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const renderNotificationItem = ({ item }) => {
    return (
      <View style={styles.notificationItem}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.theme || 'Notification'}</Text>
          <Text style={styles.notificationBody}>{item.message || 'No message'}</Text>
          <Text style={styles.notificationTime}>
            {item.timeStamp || 'Unknown time'}
          </Text>
          <Text style={styles.notificationSender}>
            From: {item.senderEmail || 'Unknown sender'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.markReadButton}
          onPress={() => {
            markAsRead(item);
          }}
        >
          <Text style={styles.markReadText}>Mark as read</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const keyExtractor = (item) => item.clientId || createNotificationKey(item);

  return (
    <View style={styles.container}>
           
      {loading ? (
        <View style={styles.centered}>
          <Text>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text>No new notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    marginTop: 60,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#99d1f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllReadButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  markAllReadText: {
    color: '#333',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  notificationSender: {
    fontSize: 12,
    color: '#888',
  },
  markReadButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  markReadText: {
    color: '#666',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;