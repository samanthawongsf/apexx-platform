import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { api } from '../services/api';

export default function PortfolioScreen() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  // Form states
  const [portfolioName, setPortfolioName] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockShares, setStockShares] = useState('');
  const [stockPrice, setStockPrice] = useState('');

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const data = await api.getPortfolios();
      setPortfolios(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async () => {
    if (!portfolioName.trim()) {
      Alert.alert('Error', 'Please enter a portfolio name');
      return;
    }

    try {
      await api.createPortfolio(portfolioName);
      setPortfolioName('');
      setShowAddPortfolio(false);
      loadPortfolios();
    } catch (error) {
      Alert.alert('Error', 'Failed to create portfolio');
    }
  };

  const addStock = async () => {
    if (!stockSymbol.trim() || !stockShares || !stockPrice) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await api.addStock(selectedPortfolio._id, {
        symbol: stockSymbol.toUpperCase(),
        shares: parseFloat(stockShares),
        price: parseFloat(stockPrice),
      });
      
      setStockSymbol('');
      setStockShares('');
      setStockPrice('');
      setShowAddStock(false);
      setSelectedPortfolio(null);
      loadPortfolios();
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock');
    }
  };

  const refreshPortfolio = async (portfolioId) => {
    try {
      await api.refreshPortfolio(portfolioId);
      loadPortfolios();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh portfolio');
    }
  };

  const renderHolding = (holding) => {
    const currentValue = holding.shares * holding.currentPrice;
    const costBasis = holding.shares * holding.averageCost;
    const change = currentValue - costBasis;
    const changePercent = costBasis > 0 ? (change / costBasis) * 100 : 0;

    return (
      <View key={holding.symbol} style={styles.holdingRow}>
        <View style={styles.holdingInfo}>
          <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
          <Text style={styles.holdingDetails}>
            {holding.shares} shares @ ${holding.averageCost.toFixed(2)}
          </Text>
        </View>
        <View style={styles.holdingValueContainer}>
          <Text style={styles.holdingValue}>${currentValue.toLocaleString()}</Text>
          <Text style={[styles.holdingChange, { color: change >= 0 ? '#4CAF50' : '#F44336' }]}>
            ${change.toFixed(2)} ({changePercent.toFixed(1)}%)
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Portfolio</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddPortfolio(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPortfolios} />
        }
      >
        {portfolios.map((portfolio) => (
          <View key={portfolio._id} style={styles.card}>
            <View style={styles.portfolioHeader}>
              <View>
                <Text style={styles.portfolioName}>{portfolio.name}</Text>
                <Text style={styles.portfolioDetails}>
                  {portfolio.holdings.length} holdings
                </Text>
              </View>
              <View style={styles.portfolioValueContainer}>
                <Text style={styles.portfolioValue}>
                  ${portfolio.totalValue.toLocaleString()}
                </Text>
                <Text style={[
                  styles.portfolioReturn,
                  { color: portfolio.performance.totalReturn >= 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {portfolio.performance.totalReturn >= 0 ? '+' : ''}
                  ${portfolio.performance.totalReturn.toFixed(2)} (
                  {portfolio.performance.totalReturnPercent.toFixed(1)}%)
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={() => {
                  setSelectedPortfolio(portfolio);
                  setShowAddStock(true);
                }}
              >
                <Text style={styles.actionButtonText}>Add Stock</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => refreshPortfolio(portfolio._id)}
              >
                <Text style={styles.actionButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {portfolio.holdings.map(renderHolding)}
          </View>
        ))}

        {portfolios.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              No portfolios yet. Create your first portfolio to get started!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Portfolio Modal */}
      <Modal visible={showAddPortfolio} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Portfolio</Text>
            <TextInput
              style={styles.input}
              placeholder="Portfolio Name"
              value={portfolioName}
              onChangeText={setPortfolioName}
            />
            <TouchableOpacity style={styles.button} onPress={createPortfolio}>
              <Text style={styles.buttonText}>Create Portfolio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddPortfolio(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Stock Modal */}
      <Modal visible={showAddStock} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            <TextInput
              style={styles.input}
              placeholder="Stock Symbol (e.g., AAPL)"
              value={stockSymbol}
              onChangeText={setStockSymbol}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Shares"
              value={stockShares}
              onChangeText={setStockShares}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Purchase Price per Share"
              value={stockPrice}
              onChangeText={setStockPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={addStock}>
              <Text style={styles.buttonText}>Add Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddStock(false);
                setSelectedPortfolio(null);
                setStockSymbol('');
                setStockShares('');
                setStockPrice('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    backgroundColor: '#4CAF50',
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
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  portfolioName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  portfolioDetails: {
    color: '#666',
    fontSize: 14,
  },
  portfolioValueContainer: {
    alignItems: 'flex-end',
  },
  portfolioValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  portfolioReturn: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
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
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  holdingDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  holdingValueContainer: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  holdingChange: {
    fontSize: 12,
    marginTop: 2,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
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
});
