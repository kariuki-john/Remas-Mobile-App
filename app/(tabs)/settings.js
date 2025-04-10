import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';


export default function ComingSoonPage() {
  const router = useRouter();

 

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <View style={{
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }}>
        
      </View>

           <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
      }}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={{
            width: 120,
            height: 120,
            marginBottom: 30,
            borderRadius: 20,
            resizeMode: 'contain',
          }}
        />

        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          marginBottom: 15,
        }}>
          Page Coming Soon
        </Text>

        <Text style={{
          fontSize: 16,
          color: '#666',
          textAlign: 'center',
          marginBottom: 30,
          lineHeight: 24
        }}>
          This page is currently under development. 🚧{"\n"}
          We're working hard to launch it soon!
        </Text>

        <TouchableOpacity style={{
          backgroundColor: '#99d1f5',
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 8,
        }} onPress={() => {
          router.navigate('/home');
        }}>
          <Text style={{
            color: 'black',
            fontWeight: '600',
            fontSize: 16
          }}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
