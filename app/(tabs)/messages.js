import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, RefreshControl,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiGet, url } from '../serviceApi';
import { defaultProfileImage } from '../../assets/images/card.jpg'; // Make sure to have this in your assets

const MessagesPage = () => {
  const [conversations, setTenantsConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const totalUnreadMessages = conversations.reduce(
    (sum, convo) => sum + (convo.unreadMessages || 0),
    0
  );

  const fetchTenantsConversation = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/messages/get-all/conversations');
      setTenantsConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchSuggestedUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await apiGet('/user/all/suggest-user?email=' + searchQuery);
      const users = response.data || [];

      const formatted = users.map(user => ({
        id: user.id,
        otherPartyName: user.fullName || user.name || 'Unknown',
        otherPartyEmail: user.email || 'No email',
        profileImage: user.profileImage || null,
      }));

      setSuggestedUsers(formatted);
      setTenantsConversations(formatted);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTenantsConversation();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTenantsConversation();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchSuggestedUsers();
      } else {
        fetchTenantsConversation();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const continueConversation = (conversation) => {
    router.push({
      pathname: '/chats/chatsPage',
      params: {
        fullName: conversation.otherPartyName,
        email: conversation.otherPartyEmail,
        unreadMessages: conversation.unreadMessages,
        conversationId: conversation.id,
      },
    });
  };

  const renderTenantItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => continueConversation(item)}
      style={styles.conversationCard}
    >
      <Image
        source={item.profileImage ? 
          { uri: `${url}/property/all/get-file/${item.profileImage}` } : 
          defaultProfileImage}
        style={styles.profileImage}
        defaultSource={defaultProfileImage}
      />
      <View style={styles.textContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.otherPartyName || 'Unknown'}
        </Text>
        <Text style={styles.emailText} numberOfLines={1}>
          {item.otherPartyEmail || 'No email'}
        </Text>
      </View>
      {item.unreadMessages > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.unreadMessages > 9 ? '9+' : item.unreadMessages}
          </Text>
        </View>
      )}
      <Feather name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-square" size={60} color="#e1e1e1" />
      <Text style={styles.emptyText}>No conversations yet</Text>
      <Text style={styles.emptySubText}>Start a new conversation by searching above</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnreadMessages > 0 && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{totalUnreadMessages}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search for a tenant..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchSuggestedUsers}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6e3b6e" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item, index) => item.id || `tenant-${index}`}
          renderItem={renderTenantItem}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#6e3b6e']}
              tintColor="#6e3b6e"
            />
          }
          contentContainerStyle={conversations.length === 0 && styles.emptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  totalBadge: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    backgroundColor: '#ff3b30',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#888',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessagesPage;