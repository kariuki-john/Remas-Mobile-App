import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';



const ChatPage = () => {
    const messages = [
        { id: '1', text: 'Hello there, my name is James', time: '12:34 pm', sender: 'me' },
        { id: '2', text: 'Hello there, am guessing you know me', time: '12:34 pm', sender: 'other' },
        { id: '3', text: 'Yes I know you, am here to sell tea, healthy herbal tea.', time: '12:34 pm', sender: 'me' },
        { id: '4', text: 'Okayy...', time: '12:34 pm', sender: 'other' },
    ];

    const renderItem = ({ item }) => (
        <View style={{
            alignSelf: item.sender === 'me' ? 'flex-end' : 'flex-start',
            backgroundColor: item.sender === 'me' ? '#b3e5fc' : '#e0e0e0',
            padding: 10,
            borderRadius: 10,
            marginVertical: 4,
            maxWidth: '70%',
        }}>
            <Text>{item.text}</Text>
            <Text style={{ fontSize: 10, color: 'gray', alignSelf: 'flex-end' }}>{item.time}</Text>
        </View>
    );
    const router = useRouter();
    return (
        
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 40 }}>
            <View style={{ flexDirection: 'row',backgroundColor:'#99d1f5', alignItems: 'center', padding: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" onPress={()=>{
                    router.navigate('/messages')
                }} />
                <Image source={require('../../assets/images/adaptive-icon.png')} style={{ width: 50, height: 50, borderRadius: 20, marginLeft: 10 }} />
                <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: 'bold' }}>Jane Doe</Text>
                <Ionicons name="notifications" size={24} color="black" style={{ marginLeft: 'auto' }} />
                <View style={{ backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 10, top: 10 }}>
                    <Text style={{ color: 'white', fontSize: 12 }}>3</Text>
                </View>
            </View>
            
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 10 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#ddd' }}>
                <TextInput
                    style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, padding: 10 }}
                    placeholder="Message"
                />
                <TouchableOpacity style={{ marginLeft: 10 }}>
                    <Ionicons name="send" size={24} color="#99d1f5" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChatPage;
