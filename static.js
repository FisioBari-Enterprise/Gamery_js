/**
 * Funzioni statiche utili in tutto il codice
 */
class StaticFunctions {
    /**
     * Invia una risposta di errore
     * @param {Response} res La risposta da inviare
     * @param {String} error Errore da inoltrare
     * @param {number} code Codice dell'errore
     */
    static sendError(res, error, code=400) {
        return res.status(code).json({error: error});
    }

    /**
     * Invia una risposta
     * @param {Response} res Risposta da inviare
     * @param {*} data Dati da inviare nella risposta
     * @param {number} code Codice della risposta
     */
    static sendSuccess(res, data, code=200) {
        return res.status(code).json({data: data});
    }

    /**
     * Manda l'errore come HTML
     * @param {Response} res Risposta
     * @param {String} data Risultato da scrivere
     * @param {Boolean} isError Indica se si tratta di un errore oppure no
     * @param {String | null} backLink Link per tornare alla pagina precedente se necessario
     */
    static sendResultHTML(res, data, isError=true, backLink=null) {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Gamery error</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
                    rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous">
            </head>
            <body>
            <!--Reset Password-->
                <div class="container p-5">
                  <h2 class="font-weight-bold mt-3" style="color: ${isError ? 'red' : 'forestgreen'}">${isError ? 'Error' : 'Success'}</h2>
                    <hr>
                  <p>${data}</p>
                  ${backLink != null ? `<a href="${backLink}">Go back</a>` : ''}
                  </div>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
                        integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.min.js"
                        integrity="sha384-Atwg2Pkwv9vp0ygtn1JAojH0nYbwNJLPhwyoVbhoPwBhjQPR5VtM2+xf0Uwh9KtT" crossorigin="anonymous"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            </body>
            </html>
        `);
    }

    /**
     * Invia la pagina HTML
     * @param {Response} res Risposta da inviare
     * @param {String | null} passwordError Errore nel inserimento della password
     * @param {String | null} passwordConfirmError Errore nel inserimento della conferma della password
     */
    static sendPasswordResetHTML(res, passwordError=null, passwordConfirmError=null) {
        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Gamery change password</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
                    rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous">
            </head>
            <body>
                <div class="container p-5">
                    <h2 class="font-weight-bold mt-3">Password Reset</h2>
                    <hr>
                    <p>Please enter your new password.</p>
                    <form method="POST">
                        <!--Input-->
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password">
                            ${passwordError != null ? `<div id="passwordError" style="color: red" class="form-text">${passwordError}</div>` : ''}
                        </div>
                        <div class="mb-3">
                            <label for="passwordConfirm" class="form-label">Password confirm</label>
                            <input type="password" class="form-control" id="passwordConfirm" name="passwordConfirm">
                            ${passwordConfirmError != null ? `<div id="passwordError" style="color: red" class="form-text">${passwordConfirmError}</div>` : ''}
                        </div>
                        <button class="btn btn-primary" type="submit">Reset password</button>
                    </form>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
                        integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.min.js"
                        integrity="sha384-Atwg2Pkwv9vp0ygtn1JAojH0nYbwNJLPhwyoVbhoPwBhjQPR5VtM2+xf0Uwh9KtT" crossorigin="anonymous"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            </body>
            </html>
        `);
    }
}

module.exports = StaticFunctions
