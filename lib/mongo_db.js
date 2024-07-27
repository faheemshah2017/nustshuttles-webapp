class Connection_live {
    static connectToMongo(callback) {

        const user = encodeURIComponent(SysConfig.settings.liveDB.username);
        const password = encodeURIComponent(SysConfig.settings.liveDB.password);
        const hostname = encodeURIComponent(SysConfig.settings.liveDB.hostname);

        const host = SysConfig.settings.liveDB.host;
        const port = SysConfig.settings.liveDB.port;

        const dbName = SysConfig.settings.liveDB.dbName;

        const authMechanism = SysConfig.settings.liveDB.authMechanism;

        var DBurl = '';

        if (host == 'localhost' || host == '127.0.0.1') {
            //DBurl = `mongodb://${host}:${port}/`;
            if (user == '' || password == '') {
                DBurl = `mongodb://${host}:${port}/`;
            } else {
                DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
            }
        } else {
            if (user == '' || password == '') {
                console.log('Authentication Failed, Username and Password is required.');
            } else {
                DBurl = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}&authSource=${dbName}`;
            }
        }

        const options = SysConfig.settings.liveDB.options;

        // const client = new MongoClient(DBurl, options);

        const { MongoClient, ServerApiVersion } = require('mongodb');
        const uri = `mongodb+srv://${user}:${password}@${hostname}/?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        client.connect(err => {
            
            if (err) throw err;
            assert.equal(null, err);
            console.log("Connected successfully to db server " + dbName);
            var connection = client.db(SysConfig.settings.liveDB.dbName);

            return callback(connection);
        });
    }
}

class Connection {
    static connectToMongo(callback) {
        
        const user = encodeURIComponent(SysConfig.settings.db.username);
        const password = encodeURIComponent(SysConfig.settings.db.password);

        const host = SysConfig.settings.db.host;
        const port = SysConfig.settings.db.port;

        const dbName = SysConfig.settings.db.dbName;

        const authMechanism = SysConfig.settings.db.authMechanism;

        var DBurl = '';

        if(host == 'localhost' || host == '127.0.0.1') {
            //DBurl = `mongodb://${host}:${port}/`;
            if (user == '' || password == '') {
                DBurl = `mongodb://${host}:${port}/`;
            } else {
                DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
            }
        } else {
            if(user == '' || password == '') {
                console.log('Authentication Failed, Username and Password is required.');
            } else {
                DBurl = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}&authSource=${dbName}`;                
            }
        }
        
        const options = SysConfig.settings.db.options;

        const client = new MongoClient(DBurl, options);
	console.log(DBurl)

        client.connect(function (err) {
            if (err) throw err;
            assert.equal(null, err);
            console.log("Connected successfully to db server " + dbName);
            var connection = client.db(SysConfig.settings.db.dbName);

            return callback(connection);
        });
    }
}

module.exports = Connection
