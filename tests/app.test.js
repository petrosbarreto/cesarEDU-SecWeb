const request = require('supertest');
const { app, server } = require('../src/index');

afterAll(() => server.close());

describe('POST /api/user/search', () => {
  it('retorna 200 para entrada válida', async () => {
    const res = await request(app)
      .post('/api/user/search')
      .send({ name: 'João' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('João');
  });

  it('retorna 400 para campo name vazio', async () => {
    const res = await request(app)
      .post('/api/user/search')
      .send({ name: '' });
    expect(res.status).toBe(400);
  });

  it('sanitiza tentativa de XSS', async () => {
    const res = await request(app)
      .post('/api/user/search')
      .send({ name: '<script>alert(1)</script>' });
    expect(res.status).toBe(200);
    // script tags devem ser escapadas pelo .escape()
    expect(res.body.message).not.toContain('<script>');
  });
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
