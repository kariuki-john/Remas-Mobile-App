import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { apiGet, apiPost } from "../serviceApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";


const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode token manually:", err);
    return null;
  }
};

const MessageBubble = React.memo(({ message }) => {
  const isSender = message.yourMessage;
  const bubbleStyle = {
    backgroundColor: isSender ? "#7b70ff" : "#eeeeee",
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  };

  return (
    <View style={{ flexDirection: isSender ? "row-reverse" : "row", alignItems: "flex-end", marginVertical: 6 }}>
      <Image
        source={require("../../assets/images/adaptive-icon.png")}
        style={{ width: 35, height: 35, borderRadius: 20, marginHorizontal: 8 }}
      />
      <View style={bubbleStyle}>
        <Text style={{ fontSize: 14, color: isSender ? "white" : "black" }}>{message.message}</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 5 }}>
          <Text style={{ fontSize: 10, color: isSender ? "rgba(255,255,255,0.7)" : "gray" }}>
            {message.timeStamp ? new Date(message.timeStamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "..."}
          </Text>
          {isSender && <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>✓✓</Text>}
        </View>
      </View>
    </View>
  );
});

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  const { conversationId, email: otherUserEmail } = useLocalSearchParams();

  // Helper function to scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const getEmail = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded = decodeJWT(token);
        const extractedEmail = decoded?.email || decoded?.sub;
        if (extractedEmail) {
          setEmail(extractedEmail);
          console.log("Decoded email:", extractedEmail);
        }
      }
    };
    getEmail();
  }, []);

  useEffect(() => {
    if (!email || !conversationId) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io("wss://www.remas-ke.co.ke:5055", {
      transports: ["websocket"],
      query: { username: email },
    });

    socketRef.current = socket;

    console.log("Joining room with email:", email);
    socket.emit("joinRoom", { email });

    socket.on(email + otherUserEmail, (message) => {
      console.log("Raw message received:", message);

      try {
        const parsed = typeof message === "string" ? JSON.parse(message) : message;
        if (parsed && parsed.message && !messages.some((m) => m.id === parsed.id)) {
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages, parsed];
            // Scroll to bottom after state update
            setTimeout(() => scrollToBottom(), 50);
            return newMessages;
          });
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    });

    socket.on("userTyping", ({ from }) => {
      if (from !== email) setOtherUserTyping(true);
    });

    socket.on("userStopTyping", ({ from }) => {
      if (from !== email) setOtherUserTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [email, conversationId, messages]);

 useEffect(() => {
  if (!socketRef.current) return;

  const handleNewMessage = (data) => {
    console.log('New Message received:', data);

    Toast.show({
      type: 'success',
      text1: 'New Message',
      text2: `From ${data.otherUserEmail} • ${data.newMessage}`,
      position: 'top',
      visibilityTime: 4000,
    });
  };

  const eventName = email + otherUserEmail;
  socketRef.current.on(eventName, handleNewMessage);

  return () => {
    socketRef.current.off(eventName, handleNewMessage);
  };
}, [email, otherUserEmail]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/messages/conversation-messages/${conversationId}`);
      if (res?.data && Array.isArray(res.data)) {
        const sorted = res.data.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
        setMessages(sorted);
        // Scroll to bottom after fetching messages
        setTimeout(() => scrollToBottom(), 200);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      Toast.show({ type: "error", text1: "Failed to load messages" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, []);

  const handleTyping = (text) => {
    setNewMessage(text);

    if (socketRef.current) {
      socketRef.current.emit("userTyping", { conversationId, from: email });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("userStopTyping", { conversationId, from: email });
      }, 1000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const payload = { message: newMessage, targetUserEmail: otherUserEmail };
      const res = await apiPost("/messages/send", payload);
      if (res.status === 200) {
        const messageData = { ...res.data, conversationId };

        setNewMessage("");
        socketRef.current?.emit("sendMessage", messageData);
        
        // Scroll to bottom after sending message
        setTimeout(() => scrollToBottom(), 50);
      } else {
        Toast.show({ type: "error", text1: "Failed to send message", text2: res.message || "Server error" });
      }
    } catch (err) {
      console.error("Send message error:", err);
      Toast.show({ type: "error", text1: "Error sending message", text2: err.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const renderMessageItem = ({ item }) => <MessageBubble message={item} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "white", paddingTop: 5 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item.id}-${item.timeStamp}-${index}`}
        renderItem={renderMessageItem}
        contentContainerStyle={{ padding: 10, flexGrow: 1, justifyContent: "flex-end" }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onContentSizeChange={() => scrollToBottom()}
        onLayout={() => scrollToBottom()}
        ListEmptyComponent={!loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ textAlign: "center", padding: 20, color: "gray" }}>No messages yet. Start the conversation!</Text>
          </View>
        ) : null}
      />

      {otherUserTyping && <Text style={{ paddingHorizontal: 15, color: "gray" }}>Typing...</Text>}

      <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderColor: "#ddd" }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: "#f9f9f9" }}
          placeholder="Message"
          value={newMessage}
          onChangeText={handleTyping}
        />
        <TouchableOpacity onPress={sendMessage} disabled={loading} style={{ marginLeft: 10 }}>
          <Ionicons name="send" size={24} color={loading ? "#ccc" : "#7b70ff"} />
        </TouchableOpacity>
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default ChatPage;