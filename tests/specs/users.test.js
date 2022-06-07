const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const Token = require("../../classes/token");
const SessionModel = require('../../database/users/session');

jest.setTimeout(60000)

const userId = '629f2f3075a149b3abf44c8e';
let token = '';
let uuid = '';

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        // Prende il token di accesso per i test
        Token.createToken(userId, 'test_user', (err, tokenUser) => {
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


/*test('Registrazione con utente temporaneo', () => {
    return request(app)
        .get('/api/client/register/temporary')
        .set('Accept', 'application/json')
        .then(response => {
            expect(Object.keys(response.body.data).includes('access')).toBe(true)
            expect(Object.keys(response.body.data).includes('uuid')).toBe(true)
            // Salva il uuid per eliminarlo
            uuid = response.body.data.uuid;
        });
})

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
})*/

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
            expect(response.status).toBe(201)
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
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})

    return expect(res.status).toBe(200)
})

test('Ottenimento info utente non autorizzato', async () => {
    const res = await request(app)
        .get('/api/client')

    return expect(res.status).toBe(401)
})

test('Ottenimento utente tramite un id', () => {
    return request(app)
        .get('/api/client/62948c597e80f38444338830')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

afterAll(async () => {
    // Rimuove le sessioni di test
    await SessionModel.deleteMany({token: token, ipAddress: 'test_user'})
    console.log("Deleted session");
    await mongoose.connection.close();
});
