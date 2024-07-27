const { MongoClient } = require('mongodb');
const assert = require('assert');
require('dotenv').config(); // Load environment variables from .env file

class Connection {
    static async connectToMongo(callback) {
        try {
            const DBurl = process.env.DB_URL;
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            };

            const client = new MongoClient(DBurl, options);
            await client.connect();
            console.log("Connected successfully to db server nustshuttles");
            const connection = client.db("nustshuttles");

            return callback(connection);
        } catch (err) {
            console.error('Failed to connect to MongoDB', err);
        }
    }
}

module.exports = Connection;
