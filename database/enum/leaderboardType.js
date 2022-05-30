module.exports = class LeaderboardType {
    static GLOBAL = 0;
    static LOCAL  = 1;

    /**
     * Ritorna tutti i tipi
     * @param {Number[]} excludes Esclude i numeri indicati
     * @returns {Number[]} Tutti i tipi supportati
     */
    static all(excludes=[]){
        let data = [
            LeaderboardType.GLOBAL,
            LeaderboardType.LOCAL
        ]
        for (const exc of excludes) {
            data.pop(exc);
        }
        return data;
    }

    /**
     * Ottiene tutti i tipi con il loro nome
     * @param {Number[]} excludes Esclude i numeri indicati
     * @returns {any[]} Tutti i tipi supportati
     */
    static map(excludes){
        let data = this.all(excludes);
        const names = ["GLOBAL", "LOCAL"]
        return data.map(item => {
            return {
                type: item,
                name: names[item]
            }
        })
    }
}
