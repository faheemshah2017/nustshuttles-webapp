const bcrypt = require('bcryptjs');

var user_model = {
    getDatatablesList: function (params, callback) {

        if(params.search){
            search_value = params.search.value;
        }
        else{
            search_value = '' 
        }
        if(search_value == ''){
            var query = {};
        }
        else{
            var query = {$or:[{role : new RegExp(search_value,'i')},{first_name : new RegExp(search_value,'i')},{last_name : new RegExp(search_value,'i')},{email : new RegExp(search_value,'i')}]}
        }
        var projection = {
            projection: {
                password: 0
            }
        }

        col_users.find(query).count(function (err, count) {
            if (err) throw err;

            col_users.find(query, projection).toArray(function (err, result) {
                if (err) throw err;

                var records = {
                    draw: params.draw,
                    recordsTotal: count,
                    recordsFiltered: count,
                    data: result
                };

                return callback(records);
            });
        });
    },
    addToken: function (email,token,callback) {

        var query = {
            email: email
        };

        col_users.updateOne(query, {$set: {token:token,token_date:new Date()}}, function (err, res) {
            if (err) {
                throw err;
            } 
            
            return callback(true);
        });
    },
    getUserByEmail: function (email, callback) {

        var query = {
            email: email
        };

        var projection = {
            projection: {
                password: 0
            }
        }
        col_users.findOne(query, projection,function (err, result) {
            if (err) throw err;

            return callback(result);
        });
    },
    verifyToken: function (token,callback) {

        var query = {token:token};

        col_users.find(query).count(function (err, count) {
            return callback(count>0);
        });
    },
    getUsers: function (callback) {

        var query = {};

        var projection = {
            projection: {
                password: 0
            }
        }

        col_users.find(query).count(function (err, count) {
            if (err) throw err;

            col_users.find(query, projection).toArray(function (err, result) {
                if (err) throw err;

                return callback(result);
            });
        });
    },
    getDetails: function (user_id, callback) {

        var query = {
            _id: new ObjectId(user_id)
        };

        var projection = {
            projection: {
                password: 0
            }
        }

        col_users.find(query).count(function (err, count) {
            if (err) throw err;

            col_users.find(query, projection).toArray(function (err, result) {
                if (err) throw err;

                return callback(result[0]);
            });
        });
    },
    addUser: function (user_data, password, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                user_data.password = hash;
                col_users.find({}).count(function (err, count) {
                    if (err) throw err;
                    if(count==0){
                        user_data.role = "manager";
                        user_data.active = true;
                    }
                    col_users.findOne({'email':user_data.email}, function(err, user) {
                        if (err) throw err;
                        if (!user) {
                            col_users.insertOne(user_data, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                } else {
                                    console.log("User Created");
                                    return callback(true);
                                }
                            });
                        }
                        else{
                            return callback(false,user_data.email);
                        }
                    });
                });
            });
        });
    },
    activateUser: function (row_id, data, callback) {

        var query = {
            _id: new ObjectId(row_id)
        };

        console.log(query)

        col_users.updateOne(query, {$set: data}, function (err, res) {
            if (err) {
                throw err;
            } 
            
            return callback(true);
        });
    },
    updatePassword: function (token, data, callback) {

        var query = {
            token: token
        };

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(data.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                data.password = hash;
                col_users.updateOne(query, {$set: data}, function (err, res) {
                    if (err) {
                        throw err;
                    } 
                    return callback(true);
                });
            });
        });
    },
    updateUser: function (row_id, data, callback) {

        var query = {
            _id: new ObjectId(row_id)
        };

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(data.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                data.password = hash;
                col_users.updateOne(query, {$set: data}, function (err, res) {
                    if (err) {
                        throw err;
                    } 
                    return callback(true);
                });
            });
        });
    },
    setAlertsCount: function (email,callback) {
        col_users.updateOne({email:email}, {$set: { alert_count: 0 }}, function (err, res) {
            if (err) {
                throw err;
            } 
            return callback();
        });
    },
    incAlertsCount: function () {
        col_users.updateMany({}, { $inc: { alert_count: 1 } }, function (err, res) {
            if (err) {
                throw err;
            } 
        });
    },
    deleteUser: function (row_id, callback) {

        var query = {
            _id: new ObjectId(row_id)
        };

        col_users.deleteOne(query, function(err, obj) {
            if (err) {
                throw err;
            } 
            
            return callback(true);
        });
    },
    deleteUserByEmail: function (email, callback) {

        var query = {
            email: email
        };

        col_users.deleteOne(query, function(err, obj) {
            if (err) {
                throw err;
            } 
            
            return callback(true);
        });
    },
    authUser: function (req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    },

    // authUser: function (req, res, callback) {
    //     passport.authenticate('local', function(err, user, info) {
    //         console.log(user,info)
    //         return callback(user,info);
    //     })(req, res);
    // },
};

module.exports = user_model;