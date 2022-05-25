const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");

jest.setTimeout(60000)

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        done();
    });
    mongoose.connection.once('error', async () => {
        throw new Error("Error during connection to MongoDB");
    });
});

test( 'Login con utente temporaneo', () => {
    const body = {'uuid': '6287945dc33c62058cf81ac7'}
    return request(app)
        .post('/api/client/login')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            
        });
})

afterAll(async () => {
    await mongoose.connection.close();
});
