import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function OptimizerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Optimizer</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Financial Optimizer Coming Soon!</Text>
        <Text style={styles.description}>
          Here you'll be able to:
          {'\n'}• Get debt vs investment recommendations
          {'\n'}• Compare debt payoff strategies
          {'\n'}• Optimize your financial decisions
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#9C27B0', padding: 20, paddingTop: 50 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  comingSoon: { fontSize: 18, color: '#666', marginBottom: 20, fontWeight: 'bold' },
  description: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24 },
});
