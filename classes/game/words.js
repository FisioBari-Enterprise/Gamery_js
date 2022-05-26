let StaticFunctions = require("../../static") ;
const ObjectId = require('mongoose').Types.ObjectId;
let Words = require("../../database/game/word");
const GameRound = require("../../database/game/gameRound");
const { MaxWordForRound } = require('../../config');

module.exports = {
    saveWords,
    generateNewRound,
    timeForRound
}

/**
 * Salva la lista di parole
 * @param { Response } res Risposta da inviare
 * @param { * } words Oggetto contente it ed en come campi
 */
async function saveWords(res, words) {
    //Controllo del body
    if (words == null) {
        return StaticFunctions.sendError(res, 'Words not found');
    }
    if(Object.prototype.toString.call(words) !== '[object Array]') {
        return StaticFunctions.sendError(res, 'Words have to be an array');
    }
    //Controllo sui campi di ogni elemento presente in words
    const keys = [
        { name: 'it', type: 'string' },
        { name: 'en', type: 'string' },
    ];
    for(let i = 0; i < words.length; i++) {
        const item = words[i];
        for (let y = 0; y < keys.length; y++) {
            const key = keys[y];
            if (typeof  item[key.name] !== key.type) {
                return StaticFunctions.sendError(res, 'One or more word haven\'t correct fields');
            }
        }
    }
    //Inserisce tutte le parole
    const allWords = await Words.find().lean().exec();
    let i = 1;
    for (const word of words) {
        const index = allWords.findIndex(item => item.it === word.it && item.en === word.en);
        if (index === -1) {
            const newWord = new Words({
                it: word.it,
                it_length: word.it.length,
                en: word.en,
                en_length: word.en.length,
            });
            await newWord.save()
        }
        console.log(`Complete ${i} / ${words.length}`);
        i += 1;
    }
    StaticFunctions.sendSuccess(res, true);
}

/**
 * Genera un nuovo round in base alle parole che sono già state usate
 * @param { * } game Modello del gioco di riferimento
 * @return {Promise<void>}
 */
async function generateNewRound(game) {
    // Controllo conclusione della partita
    if (game.complete ) {
        throw "Game already completed";
    }
    // Controllo del non completamento dell'ultimo round
    const rounds = await GameRound.find({game: new ObjectId(game._id), word_insert: { $eq: null }, round: game.max_round}).exec();
    if (rounds.length > 0) {
        throw "You haven't completed last round"
    }
    
    //Ottengo le n parole da inserire all'interno del round
    const nWord = Math.trunc(((game.max_round / 3) + 1) * 4)
    const maxLength = Math.trunc(nWord / 4) * 6;
    let words = await Words.aggregate([
        {
            $match: {
                en_length: { $lte: maxLength }
            }
        },
        { $sample: { size: nWord }}
    ]).exec();

    //Creazione round
    let round = new GameRound({
        game: game._id,
        round: game.max_round + 1,
        words: []
    })
    for(const word of words){
        round.words.push({
            word: word._id
        })
    } 

    await round.save();

    // Aggiorna il campo round della partita
    game.max_round += 1;
    game.memorize_time_for_round = timeForRound(words, false);
    game.writing_time_for_round = timeForRound(words);
    await game.save();
}

/**
 * Ottiene il numero di secondi assegnati per inserire o ricordare le parole
 * @param {[*]} words Lista delle parole
 * @param {boolean} insert Indica se calcolare il tempo per l'inserimento o per la memorizzazione
 * @returns {number} Tempo calcolato
 */
function timeForRound(words, insert=true) {
    let tot = 0;
    for (const word of words) {
        if (word.en_length == null) {
            throw "Length not found for word " + word.en;
        }
        const base = insert ? 4 : 3;
        const molt = Math.trunc(word.en_length / 5) + 1;
        tot += base * molt;
    }
    return tot;
}
