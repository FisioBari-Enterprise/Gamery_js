const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");

jest.setTimeout(60000)

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyOTRmM2NkMDY2NmRjZWVhMTVhMWQxZSIsImlhdCI6MTY1NDYxNjE0MywiZXhwIjoxNjU0NjIzMzQzfQ.qRl5ZyXs_cKAdTOOLk5NOqwpBB1A0scP_y8AQpGkY_A"

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        done();
    });
    mongoose.connection.once('error', async () => {
        throw new Error("Error during connection to MongoDB");
    });
});

test('Ottenimento della classifica globale', () => {
    return request(app)
        .get('/api/leaderboard')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento di una classifica locale', () => {
    return request(app)
        .get('/api/leaderboard?type=1&country=it')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento posizione in classifica globale dell\'utente', () => {
    return request(app)
        .get('/api/leaderboard/client')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento posizione in classifica locale dell\'utente', () => {
    return request(app)
        .get('/api/leaderboard/client?type=1&country=it')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento dei tipi di leaderboard supportati dalle API', () => {
    return request(app)
        .get('/api/leaderboard/type')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

afterAll(async () => {
    await mongoose.connection.close();
});