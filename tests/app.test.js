const request = require('supertest');
const app = require('../src/app');
const e = require('express');

describe("GET /", () => {
    it("should return 'RAY is the best!'", async () => {
        const res = await request(app).get("/");

        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("RAY is the best!");
        //expect(1 + 1).toBe(3); //C'est un faux test pour vérifier que Jest fonctionne correctement
    });
});