import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ScrollView, Modal
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { apiPost, apiGet } from '../serviceApi';

export default function PaymentPage() {
  const [paymentOption, setPaymentOption] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('RENT');
  const [loading, setLoading] = useState(false);
  const [paymentChannelId, setPaymentChannelId] = useState(null);

  const [airtelDetails, setAirtelDetails] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

  const router = useRouter();

  const {
    unitName, unitId, propertyName, propertyAddress,
    paymentMonthStart, paymentMonthEnd, requiredAmount, amountPaid,
  } = useLocalSearchParams();

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  const fetchPaymentOptions = async () => {
    try {
      const response = await apiGet(`/payment/getTenantUnitPaymentOptions?unitId=${unitId}`);
      const options = response?.data || [];

      const safaricomOption = options.find(opt => opt.channel === 'SAFARICOM' && opt.payOnline);
      const airtelOption = options.find(opt => opt.channel === 'AIRTEL');
      const bankOption = options.find(opt => opt.channel === 'BANK');

      if (safaricomOption) {
        setPaymentChannelId(safaricomOption.paymentChannelId);
        setPaymentOption('mpesa');
      } else if (airtelOption) {
        setPaymentOption('airtel');
        setPaymentChannelId(airtelOption.paymentChannelId);
      } else if (bankOption) {
        setPaymentOption('bank');
        setPaymentChannelId(bankOption.paymentChannelId);
      } else {
        showToast('error', 'No Available Payment Channels');
      }

      setAirtelDetails(airtelOption);
      setBankDetails(bankOption);

    } catch (err) {
      console.error('Failed to fetch payment options:', err);
      showToast('error', 'Error', 'Failed to load payment options');
    }
  };

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'top', visibilityTime: 5000 });
  };

  const handlePaymentOption = (option) => {
    setPaymentOption(option);
    if (option === 'bank') {
      showToast('info', 'Bank integration coming soon');
    }
  };

  const showTimedModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      clearForm();
    }, 3000);
  };

  const clearForm = () => {
    setPhoneNumber('');
    setAmount('');
    setPaymentPurpose('RENT');
  };

  const handleMpesaPay = async () => {
    if (!phoneNumber || !amount) {
      return showToast('error', 'Missing Info', 'Enter phone number and amount');
    }
    if (!paymentChannelId) {
      return showToast('error', 'Missing Channel', 'No payment channel available');
    }

    setLoading(true);
    try {
      const payload = {
        phoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(-9)}`,
        amount: Number(amount),
        paymentPurpose,
        unitId: Number(unitId),
        paymentChannelId,
      };

      const response = await apiPost('/tenants/make-payment', payload);
      console.log("Payment API Response:", response);

      if (response?.status === 200) {
        showTimedModal('success', response?.message || 'Payment request sent');
      } else {
        showTimedModal('error', response?.message || 'Payment cancelled or failed');
      }

    } catch (err) {
      console.error("Payment error:", err);
      showTimedModal('error', 'Failed to send payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Feather name="arrow-left-circle" size={28} color="black" style={styles.raisedIcon} onPress={() => router.back()} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.roomCard}>
          <Text style={styles.unitTitle}>{unitName}</Text>
          <Text style={styles.propertyInfo}>{propertyName}, {propertyAddress}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Term:</Text>
            <Text style={styles.value}>{paymentMonthStart} - {paymentMonthEnd}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total:</Text>
            <Text style={[styles.value, styles.money]}>Kes {requiredAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paid:</Text>
            <Text style={[styles.value, styles.moneyGreen]}>Kes {amountPaid}</Text>
          </View>
        </View>
      </ScrollView>

      <Text style={styles.paymentTitle}>Payment options (Use one)</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity onPress={() => handlePaymentOption('mpesa')} style={styles.radioOption}>
          <Image source={require('../../assets/images/mpesa.png')} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePaymentOption('airtel')} style={styles.radioOption}>
          <Image source={require('../../assets/images/airtelmoney.png')} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePaymentOption('bank')} style={styles.radioOption}>
          <Image source={require('../../assets/images/bank.png')} style={styles.image} />
        </TouchableOpacity>
      </View>

      {paymentOption === 'mpesa' && (
        <View style={styles.centered}>
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Picker
              selectedValue={paymentPurpose}
              onValueChange={(value) => setPaymentPurpose(value)}
              style={styles.input}
            >
              <Picker.Item label="RENT" value="RENT" />
              <Picker.Item label="DEPOSIT" value="DEPOSIT" />
            </Picker>
          </View>
        </View>
      )}

      {paymentOption === 'airtel' && airtelDetails && (
        <View style={styles.channelCard}>
          <Text style={styles.channelTitle}>Airtel Payment</Text>
          <Text style={styles.channelText}>Shortcode: <Text style={styles.channelValue}>{airtelDetails.shortCode || 'N/A'}</Text></Text>
          <Text style={styles.channelText}>Account Number: <Text style={styles.channelValue}>{airtelDetails.rentAccountNumber} or {airtelDetails.depositAccountNumber}</Text></Text>
          <Text style={styles.channelText}>Purpose: <Text style={styles.channelValue}>{paymentPurpose || 'RENT'} or DEPOSIT</Text></Text>
        </View>
      )}

      {paymentOption === 'mpesa' && (
        <TouchableOpacity
          style={[styles.payButton, loading && { backgroundColor: '#A5D6A7' }]}
          onPress={handleMpesaPay}
          disabled={loading}
        >
          <Text style={styles.payText}>{loading ? 'Processing...' : 'PAY'}</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{
            width: 250, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center'
          }}>
            <Feather
              name={modalType === 'success' ? 'check-circle' : 'x-circle'}
              size={40}
              color={modalType === 'success' ? '#4CAF50' : '#F44336'}
              style={{ marginBottom: 10 }}
            />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
              {modalType === 'success' ? 'Payment stkPush Sent' : 'Payment Cancelled'}
            </Text>
            <Text style={{ textAlign: 'center' }}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: 10,
    paddingTop: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
  },
  raisedIcon: {
    shadowColor: 'white',
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 1.5,
    shadowRadius: 13,
    padding: 5,
  },
  roomCard: {
    width: 320,
    backgroundColor: 'white',
    padding: 16,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  unitTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1565C0',
  },
  propertyInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  money: {
    color: '#E65100',
  },
  moneyGreen: {
    color: '#2E7D32',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 30,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 50,
    marginRight: 10,
    backgroundColor: '#E3F2FD',
    resizeMode: 'contain',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  formCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 30,
  },
  payText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  channelCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 30,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1565C0',
  },
  channelText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  channelValue: {
    fontWeight: '600',
    color: '#000',
  },
});
