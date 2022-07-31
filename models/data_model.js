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
      _id: new ObjectId(id),
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
    var query = {};
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
  getAllDataBy: function (collection, key, value, callback) {
    var query = {};
    query[key] = value;

    collection.find(query).count(function (err, count) {
      if (err) throw err;

      collection.find(query).toArray(function (err, result) {
        if (err) throw err;

        return callback(result);
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
      _id: new ObjectId(row_id),
    };

    collection.updateOne(query, { $set: data }, function (err, res) {
      if (err) {
        throw err;
      }

      return callback(true);
    });
  },
  updateBy: function (collection, key, value, data, callback) {
    var query = {};
    query[key] = value;
    console.log(query);
    collection.updateOne(
      query,
      { $set: data },
      { upsert: true },
      function (err, res) {
        if (err) {
          throw err;
        }

        return callback(true);
      }
    );
  },
  delete: function (collection, row_id, callback) {
    var query = {
      _id: new ObjectId(row_id),
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
  },
  deleteAllBy: function (collection, key, value, callback) {
    var query = {
      key: value,
    };

    collection.deleteMany(query, function (err, obj) {
      if (err) {
        throw err;
      }

      return callback(true);
    });
  },
  deleteAllByQuery: function (collection, query, callback) {
    collection.deleteMany(query, function (err, obj) {
      if (err) {
        throw err;
      }

      return callback(true);
    });
  },
  // getSummary: function (collection, callback) {
  //   const agg = [
  //     {
  //       $lookup: {
  //         from: "shuttles",
  //         localField: "deviceId",
  //         foreignField: "deviceId",
  //         as: "result",
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: "$result",
  //       },
  //     },
  //     {
  //       $project: {
  //         date: {
  //           $toDate: "$datetime",
  //         },
  //         year: {
  //           $year: {
  //             $toDate: "$datetime",
  //           },
  //         },
  //         month: {
  //           $month: {
  //             $toDate: "$datetime",
  //           },
  //         },
  //         day: {
  //           $dayOfMonth: {
  //             $toDate: "$datetime",
  //           },
  //         },
  //         hour: {
  //           $hour: {
  //             $toDate: "$datetime",
  //           },
  //         },
  //         deviceId: 1,
  //         speed: 1,
  //         shuttleNumber: "$result.shuttleNumber",
  //       },
  //     },
  //     {
  //       $match: {
  //         year: 2022,
  //         month: 7,
  //         speed: {
  //           $gt: 5,
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: {
  //           device: "$deviceId",
  //           shuttleNumber: "$shuttleNumber",
  //           time: {
  //             $dateToString: {
  //               format: "%Y-%m-%d",
  //               date: "$date",
  //             },
  //           },
  //         },
  //         avg_speed: {
  //           $avg: "$speed",
  //         },
  //         top_speed: {
  //           $max: "$speed",
  //         },
  //       },
  //     },
  //   ];

  //   collection.aggregate(agg).toArray(function (err, result) {
  //     if (err) throw err;
  //     return callback(result);
  //   });
  // },
  
  getSummary: function (collection, date, callback) {
    const agg = [
      {
        $lookup: {
          from: "shuttles",
          localField: "deviceId",
          foreignField: "deviceId",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $project: {
          deviceId: 1,
          speed: 1,
          shuttleNumber: "$result.shuttleNumber",
          datetime:"$datetime"
        },
      },
      {
        $match: {
          datetime:{
            $gte: new Date(date),
          },
          speed: {
            $gte: 0,
          },
        },
      },
      {
        $group: {
          _id: {
            device: "$deviceId",
            shuttleNumber: "$shuttleNumber"
          },
          avg_speed: {
            $avg: "$speed",
          },
          top_speed: {
            $max: "$speed",
          },
        },
      },
    ];

    collection.aggregate(agg).toArray(function (err, result) {
      if (err) throw err;
      return callback(result);
    });
  },
  getDataByDate: function (collection,date, callback) {
    const agg = [
      {
        $lookup: {
          from: "shuttles",
          localField: "deviceId",
          foreignField: "deviceId",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $project: {
          date: {
            $toDate: "$datetime",
          },
          deviceId: 1,
          speed: 1,
          latitude: 1,
          longitude: 1,
          shuttleNumber: "$result.shuttleNumber",
        },
      },
      {
        $match: {
          date: {
            $gte: new Date(date),
          },
          speed: {
            $gt: 0,
          },
        },
      },
    ];

    collection.aggregate(agg).toArray(function (err, result) {
      if (err) throw err;
      return callback(result);
    });
  },

  getlatlngByDate: function (collection, date, callback) {
    const agg = {
      datetime: {
        $gte: new Date(date),
      },
      speed: {
        $gt: 0,
      },
    };
    collection.find(agg).toArray(function (err, result) {
      if (err) throw err;
      return callback(result);
    });
  },
};

module.exports = data_model;
