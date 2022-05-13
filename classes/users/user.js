const UserModel = require('../../database/users/user');

class User {

    constructor(user) {
        this.user = user;
    }

    /**
     * Aggiunge un utente
     */
    async addUser(callback) {
        this.user = new UserModel({username: "Test"});
        this.user.save((err) => callback(err));
    }

    /**
     * Cerca l'utente in base all'id
     * @param id
     * @returns {Promise<void>}
     */
    async findById(id) {
        this.user = await UserModel.findOne({username: 'Test'}).exec();
    }

    serialize(user = null) {
        const serUser = user === null ? this.user : user;
        if (serUser === null){
            return {}
        }
        return {
            'username': serUser.username
        }
    }
}

module.exports = User
