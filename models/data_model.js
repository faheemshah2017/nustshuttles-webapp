var data_model = {
    getAll: function (collection, callback) {
        var query = {};

        collection.find(query).count(function (err, count) {
            if (err) throw err;

            collection.find(query).toArray(function (err, result) {
                if (err) throw err;

                return callback(result);
            });
        });
    },
    get: function (collection, id, callback) {
        var query = {
            _id: new ObjectId(id)
        };

        collection.find(query).count(function (err, count) {
            if (err) throw err;

            collection.findOne(query).toArray(function (err, result) {
                if (err) throw err;

                return callback(result);
            });
        });
    },
    getBy: function (collection, key, value, callback) {
        var query = {}
        query[key] = value;

        collection.find(query).count(function (err, count) {
            if (err) throw err;
            return callback(count);
        });
    },
    getDataBy: function (collection, key, value, callback) {
        var query = {};
        query[key] = value;

        collection.find(query).count(function (err, count) {
            if (err) throw err;

            collection.find(query).toArray(function (err, result) {
                if (err) throw err;

                return callback(result[0]);
            });
        });
    },
    add: function (collection, data, callback) {
        collection.insertOne(data, function (err, result) {
            if (err) {
                console.log(err);
                return callback(false);
            } else {
                return callback(true);
            }
        });
    },
    addAll: function (collection, data, callback) {
        collection.insertMany(data, function (err, result) {
            if (err) {
                console.log(err);
                return callback(false);
            } else {
                return callback(true);
            }
        });
    },
    update: function (collection, row_id, data, callback) {
        var query = {
            _id: new ObjectId(row_id)
        };

        collection.updateOne(query, { $set: data }, function (err, res) {
            if (err) {
                throw err;
            }

            return callback(true);
        });
    },
    updateBy: function (collection, key, value, data, callback) {

        var query = {}
        query[key] = value;
        console.log(query)
        collection.updateOne(query, { $set: data },{ upsert: true }, function (err, res) {
            if (err) {
                throw err;
            }

            return callback(true);
        });
    },
    delete: function (collection, row_id, callback) {

        var query = {
            _id: new ObjectId(row_id)
        };

        collection.deleteOne(query, function (err, obj) {
            if (err) {
                throw err;
            }

            return callback(true);
        });
    },
    deleteAll: function (collection, callback) {

        var query = {};

        collection.deleteMany(query, function (err, obj) {
            if (err) {
                throw err;
            }

            return callback(true);
        });
    }
};

module.exports = data_model;