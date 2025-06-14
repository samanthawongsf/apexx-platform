import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function PortfolioScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Portfolio</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Portfolio Management Coming Soon!</Text>
        <Text style={styles.description}>
          Here you'll be able to:
          {'\n'}• Create and manage portfolios
          {'\n'}• Add stocks and track performance
          {'\n'}• View charts and analytics
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 50 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  comingSoon: { fontSize: 18, color: '#666', marginBottom: 20, fontWeight: 'bold' },
  description: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24 },
});
