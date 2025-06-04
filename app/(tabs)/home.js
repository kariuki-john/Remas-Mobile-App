import React, { useEffect, useState, useRef } from "react";
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
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { apiGet, apiPost } from "../serviceApi";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const HomeScreen = () => {
  const [roomDetails, setRoomDetails] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(0);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [name, setName] = useState("");

  const fetchData = async (reset = false) => {
    setName(await AsyncStorage.getItem("name"));

    try {
      setLoading(true);
      if (reset) {
        setPageNumber(0);
        setTransactions([]);
      }

      const unitResponse = await apiGet("/tenants/units");
      setRoomDetails(unitResponse?.data || []);

      const data = {
        pageNumber: pageNumber,
        pageSize: pageSize
      }

      const transactionResponse = await apiPost(
        `/tenants/transactions`, data
      );

      const newTransactions = transactionResponse?.data?.content || [];
      setTransactions((prev) =>
        reset ? newTransactions : [...prev, ...newTransactions]
      );
      setHasMore(newTransactions.length === pageSize);
      if (!reset) setPageNumber((prev) => prev + 1);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        await fetchData();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Initialization error:", error);
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

  const filteredTransactions = transactions.filter(
    (t) =>
      t.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      t.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
      t.property?.toLowerCase().includes(search.toLowerCase())
  );

  if (checkingToken) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const renderPropertyCard = ({ item, index }) => (
    <TouchableOpacity
      key={item.unitId || index}
      onPress={() =>
        router.push({
          pathname: "payments/payment",
          params: {
            unitId: item.unitId,
            unitName: item.unitName,
            propertyName: item.propertyName,
            propertyAddress: item.propertyAddress,
            paymentMonthStart: item.paymentMonthStart,
            paymentMonthEnd: item.paymentMonthEnd,
            requiredAmount: item.requiredAmount,
            amountPaid: item.amountPaid,
          },
        })
      }
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={['#6C63FF', '#8A7DFF']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.unitName}</Text>
          <Ionicons name="home" size={24} color="white" />
        </View>
        
        <View style={styles.cardRow}>
          <MaterialIcons name="location-on" size={16} color="white" />
          <Text style={styles.cardText}>{item.propertyName}</Text>
        </View>
        
        <View style={styles.cardRow}>
          <MaterialIcons name="place" size={16} color="white" />
          <Text style={styles.cardText} numberOfLines={1}>{item.propertyAddress}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Term</Text>
            <Text style={styles.footerValue}>
              {item.paymentMonthStart} - {item.paymentMonthEnd}
            </Text>
          </View>
          
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerValue}>Kes {item.requiredAmount}</Text>
          </View>
          
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Paid</Text>
            <Text style={styles.footerValue}>Kes {item.amountPaid}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }) => (
    <Animated.View style={[styles.transactionCard, { opacity: fadeAnim }]}>
      <View style={styles.transactionHeader}>
        <FontAwesome name="money" size={18} color="#6C63FF" />
        <Text style={styles.transactionMethod}>{item.paymentMethod}</Text>
        <Text style={styles.transactionAmount}>Kes {item.amount}</Text>
      </View>
      
      <View style={styles.transactionRow}>
        <MaterialIcons name="receipt" size={16} color="#666" />
        <Text style={styles.transactionId}>{item.transactionId}</Text>
      </View>
      
      <View style={styles.transactionRow}>
        <MaterialIcons name="calendar-today" size={16} color="#666" />
        <Text style={styles.transactionDate}>{item.timeStamp}</Text>
      </View>
      
      {item.propertyName && (
        <View style={styles.transactionRow}>
          <Ionicons name="business" size={16} color="#666" />
          <Text style={styles.transactionProperty}>{item.propertyName}</Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hello {name}</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{roomDetails.length} Units</Text>
          </View>
        </View>

        {/* Property Cards */}
        {roomDetails.length > 0 ? (
          <View style={styles.sectionContainer}>
            <FlatList
              horizontal
              data={roomDetails}
              renderItem={renderPropertyCard}
              keyExtractor={(item, index) => item.unitId || index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propertyList}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No properties assigned</Text>
          </View>
        )}

        {/* Transactions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/transactions")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {filteredTransactions.length > 0 ? (
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ListFooterComponent={
                hasMore && (
                  <TouchableOpacity 
                    style={styles.loadMoreButton}
                    onPress={() => fetchData()}
                  >
                    <Text style={styles.loadMoreText}>Load More</Text>
                  </TouchableOpacity>
                )
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {search ? "No matching transactions" : "No transactions yet"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  headerBadge: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllText: {
    color: "#6C63FF",
    fontWeight: "500",
  },
  propertyList: {
    paddingBottom: 8,
  },
  cardContainer: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "white",
    marginLeft: 8,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerItem: {
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionMethod: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6C63FF",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  transactionId: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  transactionProperty: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  loadMoreButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    marginTop: 8,
  },
  loadMoreText: {
    color: "#6C63FF",
    fontWeight: "600",
  },
});

export default HomeScreen;