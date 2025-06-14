import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function LoansScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Loans</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Loan Management Coming Soon!</Text>
        <Text style={styles.description}>
          Here you'll be able to:
          {'\n'}• Track multiple loans
          {'\n'}• Make payments and see projections
          {'\n'}• Compare payoff strategies
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF9800', padding: 20, paddingTop: 50 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  comingSoon: { fontSize: 18, color: '#666', marginBottom: 20, fontWeight: 'bold' },
  description: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24 },
});
