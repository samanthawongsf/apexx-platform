const request = require('supertest');
const app = require('../src/server');

describe('Apexx API', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Apexx API is running');
  });

  it('should handle 404 for unknown routes', async () => {
    await request(app)
      .get('/unknown-route')
      .expect(404);
  });
});
