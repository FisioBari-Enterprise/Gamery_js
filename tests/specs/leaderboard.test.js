const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const Token = require("../../classes/token");
const SessionModel = require('../../database/users/session');

jest.setTimeout(60000)

const userId = '629f2f3075a149b3abf44c8e';
let token = '';

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        // Prende il token di accesso per i test
        Token.createToken(userId, 'test_leaderboard', (err, tokenUser) => {
            if (err != null) {
                throw new Error("Errore durante la crezione della sessione");
            }
            token = tokenUser
            done();
        })
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
    await SessionModel.deleteMany({token: token, ipAddress: 'test_leaderboard'})
    console.log("Deleted session");
    await mongoose.connection.close();
});
