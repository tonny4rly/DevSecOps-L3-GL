const request = require('supertest');
const app = require('../src/app');

describe('Test de l\'API', () => {
    it('devrait retourner la liste des étudiants', async () => {
        const res = await request(app).get('/api/students');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});