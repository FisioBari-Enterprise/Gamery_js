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
        Token.createToken(userId, 'test_country', (err, tokenUser) => {
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

test('Rimuovo il country per l\'utente selezionato', () => {
    return request(app)
        .delete('/api/country/client')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Cambio del country per l\'utente che ha fatto la richiesta', () => {

    let body = {
        "code": "it"
    }
    return request(app)
        .put('/api/country/client')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .send(body)
        .then(response => {
            expect(response.body.data.country.code).toBe("it");
        })
})

test('Ottenimento country dell\'utente', () => {
    return request(app)
        .get('/api/country/client')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(Object.keys(response.body.data).includes('_id')).toBe(true)
            expect(Object.keys(response.body.data).includes('code')).toBe(true)
            expect(Object.keys(response.body.data).includes('name')).toBe(true)
            expect(Object.keys(response.body.data).includes('createdAt')).toBe(true)
            expect(Object.keys(response.body.data).includes('updatedAt')).toBe(true)
        })
})



afterAll(async () => {
    await SessionModel.deleteMany({token: token, ipAddress: 'test_country'})
    console.log("Deleted session");
    await mongoose.connection.close();
});
