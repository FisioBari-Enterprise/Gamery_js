const {UpdateOnLoad} = require('./config');
const app = require("./app");
const {Leaderboard} = require("./classes/leaderboard/leaderboard");
const cron = require("node-cron");

app.listen(process.env.PORT || 3000, async () => {
    console.log("Server listening on port " + 3000);
    // Primo aggiornamento della classifica
    if (UpdateOnLoad != null && UpdateOnLoad === 'true') {
        await Leaderboard.update();
        console.log("Classifica aggiornata con successo");
    }
    // Viene eseguita la funzione di update della classifica ogni ora
    cron.schedule('0 */1 * * *', async () => {
        await Leaderboard.update();
        console.log("Classifica aggiornata con successo");
    });
});
