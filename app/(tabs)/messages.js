import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Modal, ScrollView, Image,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiGet } from '../serviceApi';

const MessagesPage = () => {
  const [conversations, setTenantsConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const router = useRouter();

  const searchSuggestedUsers = async () => {
    try {
      const response = await apiGet('/user/all/suggest-user?email=' + searchQuery);
      console.log('Suggested users:', response.data);
      setSuggestedUsers(response.data || []);

      
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  }

  const fetchTenantsConversation = async () => {
    try {
      const response = await apiGet('/messages/get-all/conversations');
      setTenantsConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  useEffect(() => {
    fetchTenantsConversation();
  }, []);

  const filteredTenantsConversations = conversations.filter(
    (conversation) =>
      conversation.otherPartyName &&
      conversation.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  const continueConversation = (conversation) => {
    router.push({
      pathname: '/chats/chatsPage',
      params: {
        fullName: conversation.otherPartyName,
        email: conversation.otherPartyEmail,
        conversationId: conversation.id,
      },
    });
  };

  const startConversation = (suggestedUser) => {
    router.push({
      pathname: '/chats/chatsPage',
      params: {
        fullName: suggestedUser.fullName,
        email: suggestedUser.email,
      },
    });
  };

 //conversations page
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
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 15 }}>



      <FlatList
        data={conversations}
        keyExtractor={(item, index) => item.otherPartyEmail || `tenant-${index}`}
        renderItem={renderTenantItem}
      />

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#99d1f5',
          borderRadius: 30,
          width: 60,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            maxHeight: '80%'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>All Tenants</Text>
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
              <Feather name="search" size={20} color="gray" onPress={()=>{
                searchSuggestedUsers()
              }}/>
            </View>
            <ScrollView>
              {suggestedUsers.map((suggestedUser, index) => (
                <TouchableOpacity
                  key={suggestedUser.email || `modal-tenant-${index}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: '#ddd',
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    startConversation(suggestedUser);
                  }}
                >
                  {suggestedUser.profilePic && (
                    <Image
                      source={{ uri: suggestedUser.profilePic }}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                    />
                  )}
                  <Text>{suggestedUser.fullName || 'Unknown'}</Text> 
                  <Text>{suggestedUser.email || 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10, alignSelf: 'flex-end' }}
            >
              <Text style={{ color: '#99d1f5' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MessagesPage;
