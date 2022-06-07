const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const {response} = require("express");

jest.setTimeout(60000)

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyOWYyZjMwNzVhMTQ5YjNhYmY0NGM4ZSIsImlhdCI6MTY1NDYwODExOSwiZXhwIjoxNjU0NjE1MzE5fQ.Ht5MnMd4YGKD8G_dLrK2TenaerbPgUgaOWALbEIpbV8"
let uuid = ""

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        done();
    });
    mongoose.connection.once('error', async () => {
        throw new Error("Error during connection to MongoDB");
    });
});


test('Registrazione con utente temporaneo', () => {
    return request(app)
        .get('/api/client/register/temporary')
        .set('Accept', 'application/json')
        .then(response => {
            console.log(response.body.data)
            expect(response.body.data.contains("access"))
        });
})
/*
test('Login con utente temporaneo', () => {
    const body = {'uuid': uuid}
    return request(app)
        .post('/api/client/login')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.status).toBe(200);
        });
})

test('Errore nel login con utente temporaneo', () => {
    const body = {}
    return request(app)
        .post('/api/client/login')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.status).toBe(400);
        });
})

test('registrazione utente', () => {
    const body = {
        'uuid': uuid,
        'username': 'postman',
        'email': 'postman@gamery.com',
        'password': 'postman123'
    }
    return request(app)
        .post('/api/client/register')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            console.log(response)
            expect(response.status).toBe(200)
            token = response._body.data.access
        })
})

test('Errore per registrazione utente', () => {
    const body = {
        'uuid': uuid,
        'username': 'postman',
        'email': '',
        'password': 'postman123'
    }
    return request(app)
        .post('/api/client/register')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.status).toBe(400)
        })
})


test('Login con credenziali', () => {
    const body = {
        'usernameEmail':'postman',
        'password':'postman123'
    }
    return request(app)
        .post('/api/client/login')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.status).toBe(200)
            token = response.body.access
        })
})

test('Errore nel login con credenziali', () => {
    const body = {
        'usernameEmail':'postman123',
        'password':'postman123'
    }
    return request(app)
        .post('/api/client/login')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.body.error).toBe("usernameEmail: username or email not valid")
        })
})

test('Errore nel login con credenziali vuote', () => {
    const body = {
        'usernameEmail':'',
        'password':''
    }
    return request(app)
        .post('/api/client/login')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.body.error).toBe("usernameEmail: cannot be empty")
        })
})

test('Ottenimento info utente', async () => {
    const res = await request(app)
        .get('/api/client')
        .set({'Authorization': `Bearer ${token}`})

    return expect(res.status).toBe(200)
})

test('Ottenimento info utente non autorizzato', async () => {
    const res = await request(app)
        .get('/api/client')

    return expect(res.status).toBe(401)
})*/

afterAll(async () => {
    await mongoose.connection.close();
});
