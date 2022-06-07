const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");

jest.setTimeout(60000)

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyOTRmM2NkMDY2NmRjZWVhMTVhMWQxZSIsImlhdCI6MTY1NDYyMzc1MSwiZXhwIjoxNjU0NjMwOTUxfQ.YCECmpenM67lup1Rmx4RIUnSiuSwko6WSBeLpJN2a00"

beforeAll((done) => {
    mongoose.connection.once('open', async () => {

        done();
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
    await mongoose.connection.close();
});
