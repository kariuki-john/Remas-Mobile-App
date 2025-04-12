import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiGet } from '../serviceApi';

const MessagesPage = () => {
  const [conversations, setTenantsConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const totalUnreadMessages = conversations.reduce(
    (sum, convo) => sum + (convo.unreadMessages || 0),
    0
  );
  

  const fetchTenantsConversation = async () => {
    try {
      const response = await apiGet('/messages/get-all/conversations');
      setTenantsConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const searchSuggestedUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await apiGet('/user/all/suggest-user?email=' + searchQuery);
      const users = response.data || [];
  
      const formatted = users.map(user => ({
        id: user.id,
        otherPartyName: user.fullName || user.name || 'Unknown',
        otherPartyEmail: user.email || 'No email',
                 
      }));
  
      setSuggestedUsers(formatted);
      setTenantsConversations(formatted);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
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

  //start conversation page

  const renderTenantItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => continueConversation(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        elevation: 3,
      }}
    >
      {item.profileImage && (
        <Image
          source={{ uri: item.profileImage }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          {item.otherPartyName || 'Unknown'}
        </Text>
        <Text style={{ color: 'gray' }}>{item.otherPartyEmail || 'No email'}</Text>
      </View>
      {item.unreadMessages > 0 && (
        <View
          style={{
            backgroundColor: 'red',
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 2,
            minWidth: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
            {item.unreadMessages}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 15 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 20,
          paddingHorizontal: 15,
          height: 45,
          shadowOpacity: 0.2,
          elevation: 3,
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="Search for a tenant..."
          style={{ flex: 1 }}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchSuggestedUsers}
        />
        <Feather name="search" size={20} color="gray" onPress={searchSuggestedUsers} />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item, index) => item.otherPartyEmail || `tenant-${index}`}
        renderItem={renderTenantItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default MessagesPage;
