const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");

jest.setTimeout(60000)

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyOWYyZjMwNzVhMTQ5YjNhYmY0NGM4ZSIsImlhdCI6MTY1NDYwODExOSwiZXhwIjoxNjU0NjE1MzE5fQ.Ht5MnMd4YGKD8G_dLrK2TenaerbPgUgaOWALbEIpbV8"

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        done();
    });
    mongoose.connection.once('error', async () => {
        throw new Error("Error during connection to MongoDB");
    });
});

test('Ottenimento di tutti i country', () => {
    return request(app)
        .get('/api/country')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento country di dell\'utente ', () => {
    return request(app)
        .get('/api/country/client')
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
            expect(response.status).toBe(200)
        })
})

test('Rimuovo il country per l\'utente selezionato', () => {
    return request(app)
        .delete('/api/country/client')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

afterAll(async () => {
    await mongoose.connection.close();
});
