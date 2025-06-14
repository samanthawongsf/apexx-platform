import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's IP address if testing on physical device
// For simulator, localhost works fine
const BASE_URL = 'http://localhost:3000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Something went wrong');
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  // Portfolio endpoints
  async getPortfolios() {
    return this.request('/portfolio');
  }

  async createPortfolio(name) {
    return this.request('/portfolio', {
      method: 'POST',
      body: { name },
    });
  }

  async addStock(portfolioId, stockData) {
    return this.request(`/portfolio/${portfolioId}/stocks`, {
      method: 'POST',
      body: stockData,
    });
  }

  async refreshPortfolio(portfolioId) {
    return this.request(`/portfolio/${portfolioId}/refresh`, {
      method: 'PUT',
    });
  }

  // Loan endpoints
  async getLoans() {
    return this.request('/loans');
  }

  async createLoan(loanData) {
    return this.request('/loans', {
      method: 'POST',
      body: loanData,
    });
  }

  async makePayment(loanId, amount) {
    return this.request(`/loans/${loanId}/payment`, {
      method: 'POST',
      body: { amount },
    });
  }

  async getLoanProjections(loanId, extraPayment = 0) {
    return this.request(`/loans/${loanId}/projections?extraPayment=${extraPayment}`);
  }

  // Optimizer endpoints
  async getOptimalAllocation(availableAmount, expectedReturn) {
    return this.request('/optimizer/allocation', {
      method: 'POST',
      body: { availableAmount, expectedReturn },
    });
  }
}

export const api = new ApiService();
