const MongoClient = require('mongodb').MongoClient;
const user =  '';
const password = '';
const host = '127.0.0.1'; // Use localhost
const port = 27017;
const dbName = 'nustshuttles';
const authMechanism = 'DEFAULT';

let DBurl;
if (user === '' || password === '') {
  DBurl = `mongodb://${host}:${port}/`;
} else {
  DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}?authMechanism=${authMechanism}`;
}

console.log('DB URL:', DBurl);

MongoClient.connect(DBurl, function(err, db) {
  if (err) {
    console.error('Failed to connect to the database.');
    console.error(err);
    return;
  }
  console.log("Database connected!");
  db.close();
});

