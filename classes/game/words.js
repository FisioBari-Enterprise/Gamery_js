let StaticFunctions = require("../../static") ;
let Words = require("../../database/game/word");

/**
 * Salva la lista di parole
 * @param { Response } res Risposta da inviare
 * @param { * } words Oggetto contente it ed en come campi
 */
export async function saveWords(res, words) {
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
    for (const word of req.body.words) {
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
    }
    StaticFunctions.sendSuccess(res, true);
}
