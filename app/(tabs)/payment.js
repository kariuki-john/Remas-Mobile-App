import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { FlatList } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';

const PaymentPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');

    const handlePayment = () => {
        if (!phoneNumber || !amount) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        Alert.alert('Payment Initiated', `Phone: ${phoneNumber}\nAmount: Kes ${amount}`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#E3F2FD', padding: 20 }}>
            <ScrollView horizontal={true} style={{height:'70%'}}>
                <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10,margin:10, height:'80%',justifyContent:'space-around' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Room 1</Text>
                    <Text>Karura Heights, Kirigiti</Text>
                    <Text>Payment term: <Text style={{ fontWeight: 'bold' }}>May 01, 2025 - May 31, 2025</Text></Text>
                    <Text>Total: <Text style={{ fontWeight: 'bold' }}>Kes 10000</Text></Text>
                    <Text>Paid: <Text style={{ fontWeight: 'bold' }}>Kes 10000</Text></Text>
                </View>

                <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, margin: 10,height:'80%',justifyContent:'space-around' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Room 1</Text>
                    <Text>Karura Heights, Kirigiti</Text>
                    <Text>Payment term: <Text style={{ fontWeight: 'bold' }}>May 01, 2025 - May 31, 2025</Text></Text>
                    <Text>Total: <Text style={{ fontWeight: 'bold' }}>Kes 10000</Text></Text>
                    <Text>Paid: <Text style={{ fontWeight: 'bold' }}>Kes 10000</Text></Text>
                </View>
            </ScrollView>

            <Text style={{ textAlign: 'center', marginBottom: 10 }}>Payment options (Use one)</Text>

            <ScrollView>
                <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 15 }}>
                    <Image source={require('../../assets/images/mpesa.png')} style={{ width: 130, height: 70, resizeMode: 'contain', marginBottom: 10 }} />
                    <TextInput
                        placeholder='Phone number'
                        keyboardType='phone-pad'
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }}
                    />
                    <TextInput
                        placeholder='Amount'
                        keyboardType='numeric'
                        value={amount}
                        onChangeText={setAmount}
                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }}
                    />
                    <TouchableOpacity onPress={handlePayment} style={{ backgroundColor: '#64B5F6', padding: 10, borderRadius: 5, width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 16 }}>PAY</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}>
                    <Image source={require('../../assets/images/mpesa.png')} style={{ width: 130, height: 70, resizeMode: 'contain', marginBottom: 10 }} />
                    <TextInput
                        placeholder='Phone number'
                        keyboardType='phone-pad'
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }}
                    />
                    <TextInput
                        placeholder='Amount'
                        keyboardType='numeric'
                        value={amount}
                        onChangeText={setAmount}
                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }}
                    />
                    <TouchableOpacity onPress={handlePayment} style={{ backgroundColor: '#64B5F6', padding: 10, borderRadius: 5, width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 16 }}>PAY</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default PaymentPage;
