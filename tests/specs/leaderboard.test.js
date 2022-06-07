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

afterAll(async () => {
    await mongoose.connection.close();
});