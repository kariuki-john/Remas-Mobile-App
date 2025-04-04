import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Image, FlatList, TouchableOpacity } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function ChatScreen() {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter()

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch("");
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 20,
          paddingHorizontal: 15,
          height: 45,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          elevation: 3,
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="Search for a person..."
          style={{ flex: 1, fontSize: 16, paddingVertical: 5 }}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Feather name="search" size={20} color="gray" />
      </View>

      {/* Chat List */}
      <ScrollView>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 5,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            elevation: 3,
            marginBottom: 10,
            width: '100%'
          }}
          onPress={() => {
            router.navigate('chats/chatsPage') 
          }}
        >
          <Image
            source={require('../../assets/images/adaptive-icon.png')}
            style={{ width: 70, height: 70, borderRadius: 25, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>John Doe</Text>
            <Text style={{ color: "gray" }}>johndoe@gmail.com</Text>
            <Text numberOfLines={1} style={{ color: "black" }}>
              This is my first message
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "red",
              borderRadius: 15,
              width: 25,
              height: 25,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>2</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 5,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            elevation: 3,
            marginBottom: 10,
            width: '100%'
          }}
        >
          <Image
            source={require('../../assets/images/adaptive-icon.png')}
            style={{ width: 70, height: 70, borderRadius: 25, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>John Doe</Text>
            <Text style={{ color: "gray" }}>johndoe@gmail.com</Text>
            <Text numberOfLines={1} style={{ color: "black" }}>
              This is my first message
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "red",
              borderRadius: 15,
              width: 25,
              height: 25,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>1</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>


    </View>
  );
}
