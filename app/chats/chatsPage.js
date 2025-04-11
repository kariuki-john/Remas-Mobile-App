import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { apiGet, apiPost } from '../serviceApi';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const flatListRef = useRef(null);
  const router = useRouter();

  const { email, fullName, conversationId } = useLocalSearchParams();
  useEffect(() => {
    console.log("Chat params:", { email, fullName, conversationId });
    
    if (!email) {
      console.error("Missing recipient email parameter");
      Toast.show({ 
        type: 'error', 
        text1: 'Missing recipient email',
        text2: 'Please return to contacts and try again'
      });
    }
  }, [email, fullName, conversationId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/messages/conversation-messages/${conversationId}`);
      console.log("API Response:", JSON.stringify(res));
      
      if (res?.data && Array.isArray(res.data)) {
        const reversedMessages = [...res.data].reverse();
        console.log(`Setting ${reversedMessages.length} messages`);
        setMessages(reversedMessages);
      } else {
        console.log("Invalid data format received:", res);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      Toast.show({ type: 'error', text1: 'Failed to load messages' });
    } finally {
      setLoading(false);
    }
  };


  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      setLoading(true);
      const payload = {
        text: newMessage,
        recipientEmail: email, 
      };
      console.log("Sending message with payload:", payload);
      console.log("Recipient email value:", email);
      
      const res = await apiPost('/messages/send', payload);
      console.log("Send message response:", res);
  
      if (res.success || res.status === 'success') {
        setNewMessage('');
        fetchMessages();
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Failed to send message',
          text2: res.message || 'Server error' 
        });
      }
    } catch (err) {
      console.error('Send message error:', err);
      Toast.show({ 
        type: 'error', 
        text1: 'Error sending message',
        text2: err.message || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ conversation }) => {
    console.log("Rendering item:", conversation);    
    if (!item || !conversation.conversationId) {
      console.warn("Invalid message item:", conversation);
      return null;
    }
    
    const isMe = item.otherPartyEmail === email;
    return (
      <View
        style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor: isMe ? '#b3e5fc' : '#e0e0e0',
          padding: 10,
          borderRadius: 10,
          marginVertical: 4,
          maxWidth: '70%',
        }}
      >
        <Text>{conversation.conversationId}</Text>
        <Text style={{ fontSize: 10, color: 'gray', alignSelf: 'flex-end' }}>
          {conversation.timeStamp ? new Date(conversation.timeStamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) : 'Unknown time'}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'white', paddingTop: 40 }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#99d1f5',
          alignItems: 'center',
          padding: 10,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          onPress={() => router.back()}
        />
        <Image
          source={require('../../assets/images/adaptive-icon.png')}
          style={{ width: 50, height: 50, borderRadius: 20, marginLeft: 10 }}
        />
        <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: 'bold' }}>
          {fullName || 'Chat'}
        </Text>
      </View>

      {loading && (
      <View style={{ padding: 10, alignItems: 'center' }}>
        <Text style={{ textAlign: 'center', color: 'gray' }}>Loading messages...</Text>
      </View>
    )}

<FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(conversation, index) => conversationId?.toString() || index.toString()}
  renderItem={renderItem}
  contentContainerStyle={{ padding: 10, flexGrow: 1 }}
  onContentSizeChange={() =>
    messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: true })
  }
  ListEmptyComponent={
    !loading ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{textAlign: 'center', padding: 20, color: 'gray'}}>
          No messages yet. Start the conversation!
        </Text>
      </View>
    ) : null
  }
/>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderTopWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
            backgroundColor: '#f9f9f9',
          }}
          placeholder="Message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={loading}
          style={{ marginLeft: 10 }}
        >
          <Ionicons
            name="send"
            size={24}
            color={loading ? '#ccc' : '#99d1f5'}
          />
        </TouchableOpacity>
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default ChatPage;
