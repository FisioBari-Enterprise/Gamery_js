let StaticFunctions = require("../../static") ;
let Words = require("../../database/game/word");
const GameRound = require("../../database/game/gameRound");
const { MaxWordForRound } = require('../../config');

module.exports = {
    saveWords,
    generateNewRound
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
        throw "Il gioco è già stato completato";
    }
    // Controllo del non completamento dell'ultimo round
    const rounds = await GameRound.find({game: game._id, word_insert: { $eq: null}, round: game.max_round - 1}).exec();
    if (rounds.length > 0) {
        throw "Non hai completato l'ultimo round"
    }
    // Genera il nuovo round
    const maxUsage = await GameRound.findOne({game: game._id}).sort('-word_usage').exec();
    const wordsLastUsage = await GameRound.find({game: game._id, word_usage: maxUsage.word_usage})
        .distinct('word')
        .populate('word')
        .exec();
    const allWords = wordsLastUsage.map(item => item.it);
    // Calcolo lunghezza e numero massimo di parole
    let nWords = (Math.trunc(game.max_round / 3) + 1) * 4;
    if (nWords > MaxWordForRound) {
        nWords = MaxWordForRound;
    }
    const maxLength = Math.trunc(nWords / 4) * 6;
    // Prende le nuove parole
    let newWords = await Words.aggregate([
        {
            $match: {
                it_length: { $lte: maxLength },
                it: { $nin: allWords }
            }
        },
        { $sample: { size: nWords }}
    ]).exec();
    let toAdd = [{words: newWords, word_usage: maxUsage}]
    // Se non ha raggiunto il numero di parole ne aggiunge
    if (nWords.length < MaxWordForRound) {
        newWords = await Words.aggregate([
            { $match: { it_length: { $lte: maxLength } } },
            { $sample: { size: MaxWordForRound - nWords }}
        ]).exec();
        toAdd.push({words: newWords, word_usage: maxUsage + 1});
    }
    // Carica le nuove parole nel prossimo round
    let newRounds = [];
    for (const add of toAdd) {
        for (const word of add.words) {
            newRounds.push({
                word: word._id,
                word_usage: add.word_usage,
                game: game._id,
                round: game.max_round + 1
            });
        }
    }
    await GameRound.insertMany(newRounds);
    // Aggiorna il campo round della partita
    game.max_round += 1;
    await game.save();
}
