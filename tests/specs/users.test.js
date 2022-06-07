const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const Token = require("../../classes/token");
const SessionModel = require('../../database/users/session');
const UserModel = require('../../database/users/user');
const CredentialsModel = require('../../database/users/credentials');

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


test('Registrazione con utente temporaneo', () => {
    return request(app)
        .get('/api/client/register/temporary')
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.status).toBe(200);
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
            expect(response.status).toBe(201);
        });
})

test('Errore per registrazione utente (email non valida)', () => {
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
            expect(response.body.error).toBe('email: cannot be empty')
        })
})

test('Errore per registrazione utente (username già presente)', () => {
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
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('username: username already used')
        })
})

test('registrazione utente', () => {
    const body = {
        'uuid': uuid,
        'username': 'postman_1',
        'email': 'postman_1@gamery.com',
        'password': 'postman123'
    }
    return request(app)
        .post('/api/client/register')
        .set('Accept', 'application/json')
        .send(body)
        .then(response => {
            expect(response.status).toBe(201)
            expect(Object.keys(response.body.data).includes('access')).toBe(true)
            expect(Object.keys(response.body.data).includes('uuid')).toBe(true)
        })
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
    return request(app)
        .get('/api/client')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Ottenimento info utente non autorizzato', async () => {
    return request(app)
        .get('/api/client')
        .then(response => {
            expect(response.status).toBe(401)
        })
})

test('Ottenimento utente tramite un id', () => {
    return request(app)
        .get('/api/client/' + uuid)
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

afterAll(async () => {
    // Rimuove le sessioni di test
    await SessionModel.deleteMany({token: token, ipAddress: 'test_user'})
    await UserModel.deleteOne({uuid: uuid});
    await CredentialsModel.deleteOne({email: 'postman_1@gamery.com'});
    console.log("Deleted session");
    await mongoose.connection.close();
});
