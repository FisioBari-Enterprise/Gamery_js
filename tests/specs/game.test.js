const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const {response} = require("express");
const Token = require("../../classes/token");
const SessionModel = require('../../database/users/session');
const SingleGameModel = require('../../database/game/singleGame');
const GameRoundModel = require('../../database/game/gameRound');

jest.setTimeout(60000)

const userId = '629f2f3075a149b3abf44c8e';
let token = '';
let gameId = '';

beforeAll((done) => {
    mongoose.connection.once('open', async () => {
        // Prende il token di accesso per i test
        Token.createToken(userId, 'test_game', (err, tokenUser) => {
            if (err != null) {
                throw new Error("Errore durante la creazione della sessione");
            }
            token = tokenUser
            done();
        })
    });
    mongoose.connection.once('error', async () => {
        throw new Error("Error during connection to MongoDB");
    });
});

test('Creazione di una nuova partita', () => {
    return request(app)
        .post('/api/game')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(Object.keys(response.body.data).includes('game')).toBe(true)
            expect(Object.keys(response.body.data).includes('round')).toBe(true)
            expect(Object.keys(response.body.data).includes('points')).toBe(true)
            expect(Object.keys(response.body.data).includes('complete')).toBe(true)
            expect(Object.keys(response.body.data).includes('words')).toBe(true)
            // Salva il game id
            gameId = response.body.data.game._id;
        })
})

test('Errore creazione di una nuova partita prima della conclusione della precedente', () => {
    return request(app)
        .post('/api/game')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(400)
        })
})

test('Ottenimento ultima partita creata per l\'utente corrente', () => {
    return request(app)
        .get('/api/game')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.status).toBe(200)
        })
})

test('Errore nella creazione di una nuovo round prima della termine dell\'ultimo', () => {
    return request(app)
        .post('/api/game/round')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(response.error.text).toEqual("{\"error\":\"You haven\'t completed last round\"}")
        })
})

test('Ottenimento dell\'ultimo round dell\'ultima partita', () => {
    return request(app)
        .get('/api/game/round')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .then(response => {
            expect(Object.keys(response.body.data).includes('_id')).toBe(true)
            expect(Object.keys(response.body.data).includes('game')).toBe(true)
            expect(Object.keys(response.body.data).includes('round')).toBe(true)
            expect(Object.keys(response.body.data).includes('points')).toBe(true)
            expect(Object.keys(response.body.data).includes('complete')).toBe(true)
            expect(Object.keys(response.body.data).includes('words')).toBe(true)
            expect(Object.keys(response.body.data).includes('createdAt')).toBe(true)
            expect(Object.keys(response.body.data).includes('updatedAt')).toBe(true)
        })
})

test('Tentativo fallito di inserimento di parole per l\'ultimo round', () => {
    let body = {
        'words' : ["wide", "fight"],
        'gameTime' : 13
    };

    return request(app)
        .put('/api/game/round')
        .set({'Accept': 'application/json', 'Authorization': `Bearer ${token}`})
        .send(body)
        .then(response => {
            expect(Object.keys(response.body.data).includes('_id')).toBe(true)
            expect(Object.keys(response.body.data).includes('game')).toBe(true)
            expect(Object.keys(response.body.data).includes('round')).toBe(true)
            expect(Object.keys(response.body.data).includes('points')).toBe(true)
            expect(Object.keys(response.body.data).includes('complete')).toBe(true)
            expect(Object.keys(response.body.data).includes('words')).toBe(true)
            expect(Object.keys(response.body.data).includes('createdAt')).toBe(true)
            expect(Object.keys(response.body.data).includes('updatedAt')).toBe(true)

        })

})



afterAll(async () => {
    await SessionModel.deleteMany({token: token, ipAddress: 'test_game'})
    await GameRoundModel.deleteMany({game: gameId})
    await SingleGameModel.deleteMany({_id: new ObjectId(gameId)})
    console.log("Deleted session");
    await mongoose.connection.close();
});
