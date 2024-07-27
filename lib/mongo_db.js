const { MongoClient } = require('mongodb');
const assert = require('assert');

class Connection_live {
    static async connectToMongo(callback) {
        try {
            const user = encodeURIComponent(SysConfig.settings.liveDB.username);
            const password = encodeURIComponent(SysConfig.settings.liveDB.password);
            const hostname = encodeURIComponent(SysConfig.settings.liveDB.hostname);
            const host = SysConfig.settings.liveDB.host;
            const port = SysConfig.settings.liveDB.port;
            const dbName = SysConfig.settings.liveDB.dbName;
            const authMechanism = SysConfig.settings.liveDB.authMechanism;

            let DBurl = '';

            if (host === 'localhost' || host === '127.0.0.1') {
                if (user === '' || password === '') {
                    DBurl = `mongodb://${host}:${port}/`;
                } else {
                    DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
                }
            } else {
                if (user === '' || password === '') {
                    console.log('Authentication Failed, Username and Password is required.');
                    return;
                } else {
                    DBurl = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}&authSource=${dbName}`;
                }
            }

            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            };

            const client = new MongoClient(DBurl, options);
            await client.connect();
            console.log("Connected successfully to db server " + dbName);
            const connection = client.db(dbName);

            return callback(connection);
        } catch (err) {
            console.error('Failed to connect to MongoDB', err);
        }
    }
}

class Connection {
    static async connectToMongo(callback) {
        try {
            const user = encodeURIComponent(SysConfig.settings.db.username);
            const password = encodeURIComponent(SysConfig.settings.db.password);
            const host = SysConfig.settings.db.host;
            const port = SysConfig.settings.db.port;
            const dbName = SysConfig.settings.db.dbName;
            const authMechanism = SysConfig.settings.db.authMechanism;

            let DBurl = '';

            if (host === 'localhost' || host === '127.0.0.1') {
                if (user === '' || password === '') {
                    DBurl = `mongodb://${host}:${port}/`;
                } else {
                    DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
                }
            } else {
                if (user === '' || password === '') {
                    console.log('Authentication Failed, Username and Password is required.');
                    return;
                } else {
                    DBurl = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}&authSource=${dbName}`;
                }
            }

            DBurl = "mongodb://faheemshah:faheemmongodb@10.250.7.206:27017/?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin&appName=mongosh+2.2.4";
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            };

            const client = new MongoClient(DBurl, options);
            await client.connect();
            console.log("Connected successfully to db server " + dbName);
            const connection = client.db(dbName);

            return callback(connection);
        } catch (err) {
            console.error('Failed to connect to MongoDB', err);
        }
    }
}

module.exports = Connection;