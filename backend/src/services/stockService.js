const axios = require('axios');

class StockService {
  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.baseUrl = 'https://www.alphavantage.co/query';
  }

  async getStockPrice(symbol) {
    try {
      // If no API key, return mock data for development
      if (!this.alphaVantageKey || this.alphaVantageKey === 'YOUR_ACTUAL_API_KEY_HERE') {
        return this.getMockPrice(symbol);
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.alphaVantageKey,
        },
      });

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error(`No price data available for ${symbol}`);
      }

      return parseFloat(quote['05. price']);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      // Return mock data as fallback
      return this.getMockPrice(symbol);
    }
  }

  getMockPrice(symbol) {
    // Mock prices for development
    const mockPrices = {
      'AAPL': 175.50,
      'GOOGL': 140.25,
      'MSFT': 380.75,
      'TSLA': 210.30,
      'AMZN': 145.80,
      'NVDA': 485.20,
      'SPY': 445.60,
    };
    
    return mockPrices[symbol] || Math.random() * 200 + 50; // Random price between 50-250
  }

  async getStockData(symbol, interval = 'daily') {
    try {
      if (!this.alphaVantageKey || this.alphaVantageKey === 'YOUR_ACTUAL_API_KEY_HERE') {
        return this.getMockData(symbol);
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          function: interval === 'daily' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval === 'daily' ? undefined : '5min',
          apikey: this.alphaVantageKey,
        },
      });

      const timeSeriesKey = interval === 'daily'
        ? 'Time Series (Daily)'
        : 'Time Series (5min)';
      const timeSeries = response.data[timeSeriesKey];

      if (!timeSeries) {
        throw new Error(`No data available for ${symbol}`);
      }

      const data = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));

      return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return this.getMockData(symbol);
    }
  }

  getMockData(symbol) {
    const basePrice = this.getMockPrice(symbol);
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 10;
      const price = basePrice + variation;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: price,
        high: price + Math.random() * 5,
        low: price - Math.random() * 5,
        close: price + (Math.random() - 0.5) * 3,
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });
    }
    
    return data;
  }
}

module.exports = new StockService();
