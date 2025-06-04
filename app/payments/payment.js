import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  Image
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet } from '../serviceApi';

function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [paymentPurpose, setPaymentPurpose] = useState('RENT');
  const [depositBalance, setDepositBalance] = useState(15000); // Dummy data
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const router = useRouter();
  const {
    unitName, unitId, propertyName, propertyAddress,
    paymentMonthStart, paymentMonthEnd, requiredAmount, amountPaid,
  } = useLocalSearchParams();

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'top', visibilityTime: 4000 });
  };

  const handleProceedToPayment = async () => {
    if (!unitId || !paymentPurpose) {
      showToast('error', 'Missing information', 'Please select payment type');
      return;
    }

    setLoading(true);
    try {
      const response = await apiGet(
        `/checkout/rent-deposit-payment-token/${unitId}/${paymentPurpose}`
      );

      if (response?.data) {
        const paymentUrl = `https://remas-ke.co.ke/checkout?token=${response.data}`;
        const supported = await Linking.canOpenURL(paymentUrl);

        if (supported) {
          await Linking.openURL(paymentUrl);
        } else {
          showToast('error', 'Cannot open browser', 'Please try again later');
        }
      } else {
        showToast('error', 'Payment failed', 'Could not get payment token');
      }
    } catch (err) {
      console.error("Payment error:", err);
      showToast('error', 'Payment error', 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Property Card */}
        <LinearGradient
          colors={['#6C63FF', '#8A7DFF']}
          style={styles.propertyCard}
        >
          <Text style={styles.propertyName}>{unitName}</Text>
          <Text style={styles.propertyAddress}>{propertyName}, {propertyAddress}</Text>

          <View style={styles.divider} />

          <View style={styles.propertyDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="date-range" size={18} color="#fff" />
              <Text style={styles.detailText}>{paymentMonthStart} - {paymentMonthEnd}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="attach-money" size={18} color="#fff" />
              <Text style={styles.detailText}>Total: Kes {requiredAmount}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.detailText}>Paid: Kes {amountPaid}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Deposit Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Your Deposit Balance</Text>
          <Text style={styles.balanceAmount}>Kes {depositBalance.toLocaleString()}</Text>
          <Text style={styles.balanceNote}>This amount will be refunded at the end of your lease</Text>
        </View>

        {/* Payment Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Type</Text>

          <View style={styles.paymentTypeContainer}>
            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                paymentPurpose === 'RENT' && styles.paymentTypeActive
              ]}
              onPress={() => setPaymentPurpose('RENT')}
            >
              <MaterialIcons
                name="home"
                size={24}
                color={paymentPurpose === 'RENT' ? '#6C63FF' : '#999'}
              />
              <Text style={[
                styles.paymentTypeText,
                paymentPurpose === 'RENT' && styles.paymentTypeTextActive
              ]}>
                Rent Payment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                paymentPurpose === 'DEPOSIT' && styles.paymentTypeActive
              ]}
              onPress={() => setPaymentPurpose('DEPOSIT')}
            >
              <MaterialIcons
                name="security"
                size={24}
                color={paymentPurpose === 'DEPOSIT' ? '#6C63FF' : '#999'}
              />
              <Text style={[
                styles.paymentTypeText,
                paymentPurpose === 'DEPOSIT' && styles.paymentTypeTextActive
              ]}>
                Deposit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Options (Optional - can be shown conditionally)
        {showPaymentOptions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity style={styles.methodButton}>
                <Image
                  source={require('../../assets/images/mpesa.png')}
                  style={styles.methodImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.methodButton}>
                <Image
                  source={require('../../assets/images/visa.png')}
                  style={styles.methodImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.methodButton}>
                <Image
                  source={require('../../assets/images/mastercard.png')}
                  style={styles.methodImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        )} */}
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={styles.proceedButton}
        onPress={handleProceedToPayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#6C63FF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  propertyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 12,
  },
  propertyDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  balanceNote: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  paymentTypeActive: {
    borderColor: '#6C63FF',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  paymentTypeText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  paymentTypeTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  methodButton: {
    padding: 8,
  },
  methodImage: {
    width: 60,
    height: 40,
  },
  proceedButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentPage;