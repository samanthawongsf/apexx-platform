import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { api } from '../services/api';

export default function OptimizerScreen() {
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [availableAmount, setAvailableAmount] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('7');
  const [optimization, setOptimization] = useState(null);
  const [debtStrategy, setDebtStrategy] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState('allocation'); // 'allocation', 'avalanche', 'snowball'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const loanData = await api.getLoans();
      setLoans(loanData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimalAllocation = async () => {
    if (!availableAmount || parseFloat(availableAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid available amount');
      return;
    }

    setLoading(true);
    try {
      const result = await api.getOptimalAllocation(
        parseFloat(availableAmount),
        parseFloat(expectedReturn)
      );
      setOptimization(result);
      setActiveStrategy('allocation');
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate optimization');
    } finally {
      setLoading(false);
    }
  };

  const calculateDebtAvalanche = async () => {
    if (!availableAmount || parseFloat(availableAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid available amount');
      return;
    }

    if (loans.length === 0) {
      Alert.alert('Error', 'No loans found. Add loans first to get debt strategies.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.getDebtAvalanche(parseFloat(availableAmount));
      setDebtStrategy(result);
      setActiveStrategy('avalanche');
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate debt avalanche');
    } finally {
      setLoading(false);
    }
  };

  const calculateDebtSnowball = async () => {
    if (!availableAmount || parseFloat(availableAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid available amount');
      return;
    }

    if (loans.length === 0) {
      Alert.alert('Error', 'No loans found. Add loans first to get debt strategies.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.getDebtSnowball(parseFloat(availableAmount));
      setDebtStrategy(result);
      setActiveStrategy('snowball');
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate debt snowball');
    } finally {
      setLoading(false);
    }
  };

  const renderOptimalAllocation = () => {
    if (!optimization) return null;

    const getRecommendationColor = () => {
      switch (optimization.recommendation) {
        case 'debt_first': return '#FF5722';
        case 'balanced': return '#FF9800';
        case 'invest_all': return '#4CAF50';
        default: return '#2196F3';
      }
    };

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Optimal Allocation</Text>
        
        <View style={[styles.recommendationCard, { backgroundColor: getRecommendationColor() }]}>
          <Text style={styles.recommendationTitle}>
            {optimization.recommendation.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.recommendationMessage}>
            {optimization.message}
          </Text>
        </View>

        <View style={styles.allocationContainer}>
          <View style={styles.allocationItem}>
            <Text style={styles.allocationLabel}>Debt Payment</Text>
            <Text style={styles.allocationValue}>
              ${optimization.allocation.debtPayment.toLocaleString()}
            </Text>
          </View>
          <View style={styles.allocationItem}>
            <Text style={styles.allocationLabel}>Investment</Text>
            <Text style={styles.allocationValue}>
              ${optimization.allocation.investment.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.reasoningText}>{optimization.reasoning}</Text>

        {optimization.debtStrategy && (
          <View style={styles.debtStrategyContainer}>
            <Text style={styles.debtStrategyTitle}>Recommended Debt Payments:</Text>
            {optimization.debtStrategy.map((payment, index) => (
              <View key={index} style={styles.paymentItem}>
                <Text style={styles.paymentLoan}>{payment.loanName}</Text>
                <Text style={styles.paymentAmount}>
                  ${payment.totalPayment.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDebtStrategy = () => {
    if (!debtStrategy) return null;

    const strategyTitle = activeStrategy === 'avalanche' 
      ? 'Debt Avalanche Strategy' 
      : 'Debt Snowball Strategy';
    
    const strategyDescription = activeStrategy === 'avalanche'
      ? 'Pay minimums on all debts, then focus extra payments on the highest interest rate debt first.'
      : 'Pay minimums on all debts, then focus extra payments on the smallest balance debt first.';

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{strategyTitle}</Text>
        <Text style={styles.strategyDescription}>{strategyDescription}</Text>
        
        {debtStrategy.map((payment, index) => (
          <View key={index} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentLoanName}>{payment.loanName}</Text>
              <Text style={styles.paymentTotalAmount}>
                ${payment.totalPayment.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.paymentDetailItem}>
                <Text style={styles.paymentDetailLabel}>Minimum</Text>
                <Text style={styles.paymentDetailValue}>
                  ${payment.minimumPayment.toLocaleString()}
                </Text>
              </View>
              
              {payment.extraPayment > 0 && (
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Extra</Text>
                  <Text style={[styles.paymentDetailValue, { color: '#4CAF50' }]}>
                    ${payment.extraPayment.toLocaleString()}
                  </Text>
                </View>
              )}
              
              {payment.interestRate && (
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Interest Rate</Text>
                  <Text style={styles.paymentDetailValue}>
                    {payment.interestRate.toFixed(1)}%
                  </Text>
                </View>
              )}
              
              {payment.currentBalance && (
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Balance</Text>
                  <Text style={styles.paymentDetailValue}>
                    ${payment.currentBalance.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Optimizer</Text>
        <Text style={styles.subHeaderText}>Smart financial decisions</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financial Optimizer</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Available Monthly Amount ($)"
            value={availableAmount}
            onChangeText={setAvailableAmount}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Expected Investment Return (%)"
            value={expectedReturn}
            onChangeText={setExpectedReturn}
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.optimizerButton, { backgroundColor: '#2196F3' }]}
              onPress={calculateOptimalAllocation}
              disabled={loading}
            >
              <Text style={styles.optimizerButtonText}>
                Optimal Allocation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optimizerButton, { backgroundColor: '#FF5722' }]}
              onPress={calculateDebtAvalanche}
              disabled={loading}
            >
              <Text style={styles.optimizerButtonText}>
                Debt Avalanche
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optimizerButton, { backgroundColor: '#4CAF50' }]}
              onPress={calculateDebtSnowball}
              disabled={loading}
            >
              <Text style={styles.optimizerButtonText}>
                Debt Snowball
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeStrategy === 'allocation' && renderOptimalAllocation()}
        {(activeStrategy === 'avalanche' || activeStrategy === 'snowball') && renderDebtStrategy()}

        {loans.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Add loans in the Loans tab to unlock debt optimization strategies!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9C27B0',
    padding: 20,
    paddingTop: 50,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: '#E1BEE7',
    fontSize: 16,
    marginTop: 5,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  optimizerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    marginBottom: 10,
  },
  optimizerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recommendationCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  recommendationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendationMessage: {
    color: 'white',
    fontSize: 14,
  },
  allocationContainer: {
    marginBottom: 15,
  },
  allocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  allocationLabel: {
    fontSize: 16,
    color: '#333',
  },
  allocationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  reasoningText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  debtStrategyContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  debtStrategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  paymentLoan: {
    fontSize: 14,
    color: '#333',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  strategyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentLoanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  paymentDetailItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
    fontStyle: 'italic',
  },
});
