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

test('Ottenimento ultima partita creata per l\'utente corrente', () => {
    return request(app)
        .get('/api/game')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})
/*
test('Creazione di una nuova partita', () => {
    return request(app)
        .post('/api/game')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento dell\'ultimo round dell\'ultima partita', () => {
    return request(app)
        .post('/api/game/round')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Creazione di una nuovo round', () => {
    return request(app)
        .post('/api/game/round')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})
*/
afterAll(async () => {
    await mongoose.connection.close();
});