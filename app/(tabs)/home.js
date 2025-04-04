import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';


const HomeScreen = () => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://161.97.69.205:6790/remas/api/v1/tenants/units')
      .then((response) => response.json())
      .then((data) => setRoomDetails(data))
      .catch((error) => console.error(error));

    fetch('http://161.97.69.205:6790/remas/api/v1/tenants/transactions')
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ backgroundColor: "#E3F2FD", padding: 20, flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {roomDetails && (
            <View style={{ height: 250,margin:5, marginBottom:5 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{ flexDirection: "row" }} 
              >
                <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 15, margin: 10, justifyContent: "space-around", height: 200, width: 250 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>Room {roomDetails.roomNumber}</Text>
                  <Text>Room Name: {roomDetails.property}</Text>
                  <Text>Payment term:</Text>
                  <Text>{roomDetails.startDate} - {roomDetails.endDate}</Text>
                  <Text>Total: Kes {roomDetails.totalAmount}</Text>
                  <Text>Paid: Kes {roomDetails.paidAmount}</Text>
                </View>

                <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 15, margin: 10, justifyContent: "space-around", height: 200, width: 250 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>Room {roomDetails.roomNumber}</Text>
                  <Text>Room Name: {roomDetails.property}</Text>
                  <Text>Payment term:</Text>
                  <Text>{roomDetails.startDate} - {roomDetails.endDate}</Text>
                  <Text>Total: Kes {roomDetails.totalAmount}</Text>
                  <Text>Paid: Kes {roomDetails.paidAmount}</Text>
                </View>
              </ScrollView>
            </View>
          )}
          <View style={{ backgroundColor: '#90CAF9', padding: 10, borderRadius: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Transactions</Text>
            <FlatList
              data={transactions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                  <Text>Channel{item.paymentMethod}</Text>
                  <Text> Amount{item.amount}</Text>
                  <Text>Trans ID{item.transactionId}</Text>
                  <Text>Date{item.date}</Text>
                  <Text>Property{item.property}</Text>
                </View>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default HomeScreen;
