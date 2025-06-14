import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [loans, setLoans] = useState([]);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [portfolioData, loanData] = await Promise.all([
        api.getPortfolios(),
        api.getLoans(),
      ]);

      setPortfolios(portfolioData);
      setLoans(loanData);

      // Calculate net worth
      const totalPortfolioValue = portfolioData.reduce(
        (sum, portfolio) => sum + portfolio.totalValue,
        0
      );
      const totalDebt = loanData.reduce(
        (sum, loan) => sum + loan.currentBalance,
        0
      );
      setNetWorth(totalPortfolioValue - totalDebt);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPortfolioValue = () => {
    return portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  };

  const getTotalDebt = () => {
    return loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>Welcome back, {user?.firstName}!</Text>
          <Text style={styles.subHeaderText}>Here's your financial overview</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Net Worth</Text>
          <Text style={[styles.netWorthText, { color: netWorth >= 0 ? '#4CAF50' : '#F44336' }]}>
            ${netWorth.toLocaleString()}
          </Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Assets</Text>
            <Text style={styles.metricValue}>${getTotalPortfolioValue().toLocaleString()}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Debt</Text>
            <Text style={styles.metricValue}>-${getTotalDebt().toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio Summary</Text>
          {portfolios.length > 0 ? (
            portfolios.map((portfolio, index) => (
              <View key={index} style={styles.portfolioItem}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{portfolio.name}</Text>
                  <Text style={styles.metricValue}>${portfolio.totalValue.toLocaleString()}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Total Return</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: portfolio.performance.totalReturn >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    ${portfolio.performance.totalReturn.toLocaleString()} (
                    {portfolio.performance.totalReturnPercent.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No portfolios created yet</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Debt Overview</Text>
          {loans.length > 0 ? (
            loans.map((loan, index) => (
              <View key={index} style={styles.loanItem}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>
                    {loan.name} ({loan.type})
                  </Text>
                  <Text style={styles.metricValue}>${loan.currentBalance.toLocaleString()}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Interest Rate</Text>
                  <Text style={styles.metricValue}>{loan.interestRate.toFixed(1)}%</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No loans tracked yet</Text>
          )}
        </View>
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
    backgroundColor: '#2196F3',
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
  subHeaderText: {
    color: '#E3F2FD',
    fontSize: 16,
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
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
    marginBottom: 10,
    color: '#333',
  },
  netWorthText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#666',
    fontSize: 14,
  },
  metricValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  portfolioItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loanItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
