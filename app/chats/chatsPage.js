import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, KeyboardAvoidingView, Platform,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { apiGet, apiPost } from '../serviceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myEmail, setMyEmail] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const router = useRouter();
  const { receiveremail, fullName, conversationId ,email} = useLocalSearchParams();

  useEffect(() => {
    const getMyEmail = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setMyEmail(decoded?.email);
      }
    };
    getMyEmail();
  }, []);

  // Socket setup
  useEffect(() => {
    if (!receiveremail || !conversationId) return;

    const socket = io('http://remas-ke.co.ke:5050', {
      transports: ['websocket'],
      query: { username: receiveremail },
    });

    socketRef.current = socket;

    socket.emit('joinRoom', { conversationId });

    socket.on('newMessage', (message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('userTyping', ({ from }) => {
      if (from !== receiveremail) setOtherUserTyping(true);
    });

    socket.on('userStopTyping', ({ from }) => {
      if (from !== receiveremail) setOtherUserTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [receiveremail, conversationId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/messages/conversation-messages/${conversationId}`);
      if (res?.data && Array.isArray(res.data)) {
        const sortedMessages = res.data.sort(
          (a, b) => new Date(a.timeStamp) - new Date(b.timeStamp)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      Toast.show({ type: 'error', text1: 'Failed to load messages' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, []);

  const handleTyping = (text) => {
    setNewMessage(text);
    setIsTyping(text.length > 0);

    if (socketRef.current) {
      socketRef.current.emit('userTyping', {
        conversationId,
        from: email,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('userStopTyping', {
          conversationId,
          from: email,
        });
      }, 1000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const payload = {
        message: newMessage,
        targetUserEmail: email,
      };

      const res = await apiPost('/messages/send', payload);
      if (res.status === 200) {
        const messageData = {
          ...res.data,
          conversationId,
        };

        // Update UI instantly
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
        setIsTyping(false);

        // Emit via socket
        if (socketRef.current) {
          socketRef.current.emit('sendMessage', messageData);
        }

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to send message',
          text2: res.message || 'Server error',
        });
      }
    } catch (err) {
      console.error('Send message error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error sending message',
        text2: err.message || 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSender = item.receiveremail === receiveremail;
    const backgroundColor = isSender ? '#99d1f5' : '#eeeeee';

    return (
      <View
        style={{
          flexDirection: isSender ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          marginVertical: 6,
        }}
      >
        <Image
          source={require('../../assets/images/adaptive-icon.png')}
          style={{
            width: 35,
            height: 35,
            borderRadius: 20,
            marginHorizontal: 8,
          }}
        />
        <View
          style={{
            backgroundColor,
            padding: 10,
            borderRadius: 10,
            maxWidth: '70%',
          }}
        >
          <Text style={{ fontSize: 14 }}>{item.message}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 5,
            }}
          >
            <Text style={{ fontSize: 10, color: 'gray' }}>
              {item.timeStamp
                ? new Date(item.timeStamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '...'}
            </Text>
            {isSender && (
              <Text style={{ fontSize: 10, color: 'blue', marginLeft: 4 }}>
                ✓✓
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'white', paddingTop: 40 }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#99d1f5',
        alignItems: 'center',
        padding: 10,
      }}>
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
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {fullName || 'Chat'}
          </Text>
          {otherUserTyping && (
            <Text style={{ fontSize: 12, color: 'gray' }}>typing...</Text>
          )}
        </View>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 10,
          flexGrow: 1,
          justifyContent: 'flex-end'
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', padding: 20, color: 'gray' }}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : null
        }
      />

      {/* Input Field */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
      }}>
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
          onChangeText={handleTyping}
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
