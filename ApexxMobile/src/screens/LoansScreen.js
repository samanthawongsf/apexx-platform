import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Picker,
} from 'react-native';
import { api } from '../services/api';

const loanTypes = [
  { value: 'student', label: 'Student Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'personal', label: 'Personal Loan' },
];

export default function LoansScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showProjections, setShowProjections] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [projectionData, setProjectionData] = useState(null);

  // Form states
  const [loanForm, setLoanForm] = useState({
    name: '',
    type: 'student',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    termMonths: '',
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [extraPayment, setExtraPayment] = useState('0');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const data = await api.getLoans();
      setLoans(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const createLoan = async () => {
    const requiredFields = ['name', 'originalAmount', 'currentBalance', 'interestRate', 'minimumPayment', 'termMonths'];
    const missingFields = requiredFields.filter(field => !loanForm[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const loanData = {
        ...loanForm,
        originalAmount: parseFloat(loanForm.originalAmount),
        currentBalance: parseFloat(loanForm.currentBalance),
        interestRate: parseFloat(loanForm.interestRate),
        minimumPayment: parseFloat(loanForm.minimumPayment),
        termMonths: parseInt(loanForm.termMonths),
      };

      await api.createLoan(loanData);
      setLoanForm({
        name: '',
        type: 'student',
        originalAmount: '',
        currentBalance: '',
        interestRate: '',
        minimumPayment: '',
        termMonths: '',
      });
      setShowAddLoan(false);
      loadLoans();
    } catch (error) {
      Alert.alert('Error', 'Failed to create loan');
    }
  };

  const makePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    try {
      await api.makePayment(selectedLoan._id, parseFloat(paymentAmount));
      setPaymentAmount('');
      setShowPayment(false);
      setSelectedLoan(null);
      loadLoans();
      Alert.alert('Success', 'Payment recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const loadProjections = async (loan) => {
    try {
      const projections = await api.getLoanProjections(loan._id, parseFloat(extraPayment));
      setProjectionData(projections);
      setSelectedLoan(loan);
      setShowProjections(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load projections');
    }
  };

  const getTotalDebt = () => {
    return loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  };

  const getMonthlyPayments = () => {
    return loans.reduce((sum, loan) => sum + loan.minimumPayment, 0);
  };

  const renderLoan = (loan) => (
    <View key={loan._id} style={styles.card}>
      <View style={styles.loanHeader}>
        <View>
          <Text style={styles.loanName}>{loan.name}</Text>
          <Text style={styles.loanType}>{loan.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.loanBalance}>${loan.currentBalance.toLocaleString()}</Text>
      </View>
      
      <View style={styles.loanDetail}>
        <Text style={styles.detailLabel}>Interest Rate</Text>
        <Text style={styles.detailValue}>{loan.interestRate.toFixed(1)}%</Text>
      </View>
      
      <View style={styles.loanDetail}>
        <Text style={styles.detailLabel}>Minimum Payment</Text>
        <Text style={styles.detailValue}>${loan.minimumPayment.toLocaleString()}</Text>
      </View>
      
      <View style={styles.loanDetail}>
        <Text style={styles.detailLabel}>Remaining Term</Text>
        <Text style={styles.detailValue}>{loan.remainingMonths} months</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            setSelectedLoan(loan);
            setPaymentAmount(loan.minimumPayment.toString());
            setShowPayment(true);
          }}
        >
          <Text style={styles.actionButtonText}>Make Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => loadProjections(loan)}
        >
          <Text style={styles.actionButtonText}>View Projections</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Loans</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddLoan(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLoans} />
        }
      >
        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Debt Summary</Text>
          <View style={styles.loanDetail}>
            <Text style={styles.detailLabel}>Total Debt</Text>
            <Text style={styles.detailValue}>${getTotalDebt().toLocaleString()}</Text>
          </View>
          <View style={styles.loanDetail}>
            <Text style={styles.detailLabel}>Monthly Payments</Text>
            <Text style={styles.detailValue}>${getMonthlyPayments().toLocaleString()}</Text>
          </View>
          <View style={styles.loanDetail}>
            <Text style={styles.detailLabel}>Active Loans</Text>
            <Text style={styles.detailValue}>{loans.length}</Text>
          </View>
        </View>

        {loans.map(renderLoan)}

        {loans.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              No loans tracked yet. Add your first loan to get started!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Loan Modal */}
      <Modal visible={showAddLoan} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add New Loan</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Loan Name"
                value={loanForm.name}
                onChangeText={(text) => setLoanForm({...loanForm, name: text})}
              />

              <Text style={styles.inputLabel}>Loan Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={loanForm.type}
                  onValueChange={(value) => setLoanForm({...loanForm, type: value})}
                  style={styles.picker}
                >
                  {loanTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Original Amount"
                value={loanForm.originalAmount}
                onChangeText={(text) => setLoanForm({...loanForm, originalAmount: text})}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Current Balance"
                value={loanForm.currentBalance}
                onChangeText={(text) => setLoanForm({...loanForm, currentBalance: text})}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Interest Rate (%)"
                value={loanForm.interestRate}
                onChangeText={(text) => setLoanForm({...loanForm, interestRate: text})}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Minimum Payment"
                value={loanForm.minimumPayment}
                onChangeText={(text) => setLoanForm({...loanForm, minimumPayment: text})}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Term (months)"
                value={loanForm.termMonths}
                onChangeText={(text) => setLoanForm({...loanForm, termMonths: text})}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.button} onPress={createLoan}>
                <Text style={styles.buttonText}>Add Loan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddLoan(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPayment} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Make Payment</Text>
            {selectedLoan && (
              <>
                <Text style={styles.modalSubtitle}>{selectedLoan.name}</Text>
                <Text style={styles.modalInfo}>
                  Current Balance: ${selectedLoan.currentBalance.toLocaleString()}
                </Text>
              </>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Payment Amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
            />
            
            <TouchableOpacity style={styles.button} onPress={makePayment}>
              <Text style={styles.buttonText}>Record Payment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPayment(false);
                setSelectedLoan(null);
                setPaymentAmount('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Projections Modal */}
      <Modal visible={showProjections} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Loan Projections</Text>
              {selectedLoan && (
                <Text style={styles.modalSubtitle}>{selectedLoan.name}</Text>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Extra Monthly Payment"
                value={extraPayment}
                onChangeText={setExtraPayment}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2196F3' }]}
                onPress={() => selectedLoan && loadProjections(selectedLoan)}
              >
                <Text style={styles.buttonText}>Update Projections</Text>
              </TouchableOpacity>

              {projectionData && (
                <View style={styles.projectionResults}>
                  <View style={styles.loanDetail}>
                    <Text style={styles.detailLabel}>Months to Payoff</Text>
                    <Text style={styles.detailValue}>{projectionData.monthsToPayoff}</Text>
                  </View>
                  <View style={styles.loanDetail}>
                    <Text style={styles.detailLabel}>Total Interest</Text>
                    <Text style={styles.detailValue}>${projectionData.totalInterest.toLocaleString()}</Text>
                  </View>
                  <View style={styles.loanDetail}>
                    <Text style={styles.detailLabel}>Total Payments</Text>
                    <Text style={styles.detailValue}>${projectionData.totalPayments.toLocaleString()}</Text>
                  </View>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowProjections(false);
                  setSelectedLoan(null);
                  setProjectionData(null);
                  setExtraPayment('0');
                }}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  loanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loanType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  loanBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  loanDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalInfo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  projectionResults: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
});
