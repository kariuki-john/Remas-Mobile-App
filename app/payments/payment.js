// ...imports remain the same
export default function PaymentPage() {
  const [paymentOption, setPaymentOption] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('RENT');
  const [loading, setLoading] = useState(false);
  const [paymentChannelId, setPaymentChannelId] = useState(null);

  const router = useRouter();

  const {
    unitName,
    unitId,
    propertyName,
    propertyAddress,
    paymentMonthStart,
    paymentMonthEnd,
    requiredAmount,
    amountPaid,
  } = useLocalSearchParams();

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  const fetchPaymentOptions = async () => {
    try {
      const response = await apiGet(`/payment/getTenantUnitPaymentOptions?unitId=${unitId}`);
      console.log("Available payment channels:", response);

      const options = response?.data || [];

      const safaricomOption = options.find(
        opt => opt.channel === 'SAFARICOM' && opt.payOnline === true
      );
      const airtelOption = options.find(opt => opt.channel === 'AIRTEL');
      const bankOption = options.find(opt => opt.channel === 'BANK');

      if (safaricomOption) {
        setPaymentChannelId(safaricomOption.paymentChannelId);
        setPaymentOption('mpesa');
      } else if (airtelOption) {
        setPaymentChannelId(airtelOption.paymentChannelId);
        setPaymentOption('airtel');
      } else if (bankOption) {
        setPaymentChannelId(bankOption.paymentChannelId);
        setPaymentOption('bank');
      } else {
        showToast('error', 'No Available Payment Channels');
      }
    } catch (err) {
      console.error('Failed to fetch payment options:', err);
      showToast('error', 'Error', 'Failed to load payment options');
    }
  };

  const showToast = (type, text1, text2 = '') => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 5000,
    });
  };

  const handlePaymentOption = (option) => {
    if (option === 'airtel' || option === 'bank') {
      showToast('info', 'Coming Soon', 'Payment integration not yet available');
    }
    setPaymentOption(option);
  };

  const handleMpesaPay = async () => {
    if (!phoneNumber || !amount) {
      showToast('error', 'Missing Info', 'Enter phone number and amount');
      return;
    }

    if (!paymentChannelId) {
      showToast('error', 'Missing Channel', 'No payment channel available');
      return;
    }

    setLoading(true);
    const numericUnitId = Number(unitId);

    try {
      const payload = {
        phoneNumber,
        amount,
        paymentPurpose,
        unitId: numericUnitId,
        paymentChannelId
      };

      console.log("Sending payload:", payload);
      const response = await apiPost('/tenants/make-payment', payload);
      console.log("Payment response:", response);

      if (response.success || response.status === 'success') {
        showToast('success', 'Success', response.message || 'Payment request sent');
      } else {
        showToast('error', 'Payment Failed', response.message || 'Something went wrong');
      }
    } catch (err) {
      console.error("Payment error:", err);
      showToast('error', 'Error', 'Failed to send payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Feather
        name="arrow-left-circle"
        size={28}
        color="black"
        style={styles.raisedIcon}
        onPress={() => router.back()}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.roomCard}>
          <Text style={styles.unitTitle}>{unitName}</Text>
          <Text style={styles.propertyInfo}>
            {propertyName}, {propertyAddress}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Term:</Text>
            <Text style={styles.value}>
              {paymentMonthStart} - {paymentMonthEnd}
            </Text>
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

      <TouchableOpacity
        style={[styles.payButton, loading && { backgroundColor: '#A5D6A7' }]}
        onPress={handleMpesaPay}
        disabled={loading}
      >
        <Text style={styles.payText}>{loading ? 'Processing...' : 'PAY'}</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}
