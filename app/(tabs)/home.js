import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Animated,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { apiGet } from '../serviceApi';

const HomeScreen = () => {
  const [roomDetails, setRoomDetails] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(0);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (reset = false) => {
    try {
      setLoading(true);
      if (reset) {
        setPageNumber(0);
        setTransactions([]);
      }

      const unitResponse = await apiGet('/tenants/units');
      setRoomDetails(unitResponse?.data || []);

      const transactionResponse = await apiGet(
        `/tenants/transactions?pageSize=${pageSize}&pageNumber=${reset ? 0 : pageNumber}`
      );

      const newTransactions = transactionResponse?.data || [];

      setTransactions(prev =>
        reset ? newTransactions : [...prev, ...newTransactions]
      );

      setHasMore(newTransactions.length === pageSize);
      if (!reset) setPageNumber(prev => prev + 1);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return;
        }
        await fetchData();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setCheckingToken(false);
      }
    };

    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
  };

  const filteredTransactions = transactions.filter((t) =>
    t.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
    t.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
    t.property?.toLowerCase().includes(search.toLowerCase())
  );

  if (checkingToken) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" />
      ) : (
        <>
          {roomDetails.length > 0 ? (
            <Animated.View style={[styles.scrollContainer, { opacity: fadeAnim }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardScroll}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              >
                {roomDetails.map((unit, index) => (
                  <TouchableOpacity
                    key={unit.unitId || index}
                    onPress={() => router.push({
                      pathname: 'payments/payment',
                      params: {
                        unitId: unit.unitId, // ✅ Pass as number
                        unitName: unit.unitName,
                        propertyName: unit.propertyName,
                        propertyAddress: unit.propertyAddress,
                        paymentMonthStart: unit.paymentMonthStart,
                        paymentMonthEnd: unit.paymentMonthEnd,
                        requiredAmount: unit.requiredAmount,
                        amountPaid: unit.amountPaid,
                      }
                    })}
                  >
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>{unit.unitName}</Text>
                      <Text style={styles.cardText}>
                        🏠 <Text style={styles.label}>Property: </Text>
                        {unit.propertyName}
                      </Text>
                      <Text style={styles.cardText}>
                        📍 <Text style={styles.label}>Address: </Text>
                        {unit.propertyAddress}
                      </Text>
                      <Text style={styles.cardText}>
                        📅 <Text style={styles.label}>Term: </Text>
                        {unit.paymentMonthStart} - {unit.paymentMonthEnd}
                      </Text>
                      <Text style={styles.cardText}>
                        💰 <Text style={styles.label}>Total: </Text>
                        Kes {unit.requiredAmount}
                      </Text>
                      <Text style={styles.cardText}>
                        ✅ <Text style={styles.label}>Paid: </Text>
                        Kes {unit.amountPaid}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          ) : (
            <Text style={styles.noRoomText}>No room has been assigned to you.</Text>
          )}

          <View style={styles.transactionContainer}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, method, property..."
              value={search}
              onChangeText={setSearch}
            />
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <Animated.View style={[styles.transactionRow, { opacity: fadeAnim }]}>
                  <Text>🏦 <Text style={styles.label}>Channel:</Text> {item.paymentMethod}</Text>
                  <Text>💸 <Text style={styles.label}>Amount:</Text> Kes {item.amount}</Text>
                  <Text>🧾 <Text style={styles.label}>Trans ID:</Text> {item.transactionId}</Text>
                  <Text>📆 <Text style={styles.label}>Date:</Text> {item.date}</Text>
                  <Text>🏠 <Text style={styles.label}>Property:</Text> {item.property}</Text>
                </Animated.View>
              )}
              ListEmptyComponent={
                <Text style={styles.noRoomText}>No transactions found.</Text>
              }
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (!loading && hasMore) {
                  fetchData();
                }
              }}
              ListFooterComponent={
                hasMore ? (
                  <ActivityIndicator style={{ marginVertical: 10 }} color="#1976D2" />
                ) : null
              }
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    height: 250,
    marginBottom: 16,
  },
  cardScroll: {
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    width: 260,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0D47A1',
  },
  cardText: {
    marginVertical: 2,
    fontSize: 14,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  noRoomText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#777',
    fontWeight: '200',
    marginVertical: 20,
  },
  transactionContainer: {
    backgroundColor: '#90CAF9',
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0D47A1',
  },
  transactionRow: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    borderColor: '#bbb',
    borderWidth: 1,
  },
});

export default HomeScreen;
