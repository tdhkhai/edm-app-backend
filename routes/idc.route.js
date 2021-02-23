const express = require('express');
const app = express();
const idcRoute = express.Router();

// IDC model
let IDC = require('../models/IDC');

// Add IDC
idcRoute.route('/create').post((req, res, next) => {
  IDC.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All IDCs
idcRoute.route('/').get((req, res) => {
  IDC.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All IDCs Activated
idcRoute.route('/activatedIDCs').get((req, res) => {
  IDC.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single IDC
idcRoute.route('/read/:id').get((req, res) => {
  IDC.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update IDC
idcRoute.route('/update/:id').put((req, res, next) => {
  IDC.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {
      res.json(data)
      console.log('Data updated successfully')
    }
  })
})

// Push Extend IDC
idcRoute.route('/pushextendidc/:id').put((req, res, next) => {
  IDC.findByIdAndUpdate(
    req.params.id, {
    $set: { status: req.body.status },
    $push: { "extend": req.body.extend },
    safe: true, upsert: true, new: true
  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {
      res.json(data)
      console.log('Data updated successfully')
    }
  })
})

// Pull Extend IDC
idcRoute.route('/pullextendidc/:id').put((req, res, next) => {
  IDC.findByIdAndUpdate(
    req.params.id, {
    $pull: { "extend": { _id: req.body._id } },

  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {
      res.json(data)
      console.log('Data updated successfully')
    }
  })
})

// Update Status IDC
idcRoute.route('/updatestatus/:id').put((req, res, next) => {
  IDC.findByIdAndUpdate(
    req.params.id, {
    $set: req.body,
  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {
      res.json(data)
      console.log('Data updated successfully')
    }
  })
})


// Delete Invoice
idcRoute.route('/delete/:id').delete((req, res, next) => {
  IDC.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})

// Count cusomer
idcRoute.route('/count-customers').get((req, res, next) => {
  IDC.aggregate([
    {
      $facet: {
        "count1": [
          {
            "$addFields": {
              "year": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } },
              "daysRemainExpired": {
                "$switch": {
                  "branches": [
                    {
                      "case": { "$eq": ["$status", "1"] },
                      "then": { $round: [{ $divide: [{ $subtract: ["$$NOW", "$expirationDate"] }, 1000 * 60 * 60 * 24] }] }
                    }, {
                      "case": { "$eq": ["$status", "2"] },
                      "then": { $round: [{ $divide: [{ $subtract: ["$$NOW", { $last: "$extend.toDate" }] }, 1000 * 60 * 60 * 24] }] }
                    }
                  ],
                  "default": "none"
                }
              }
            },
          },
          {
            "$group": {
              "_id": { "year": "$year" },
              "countNew": {
                "$sum": 1
              },
              "countCanceled": {
                "$sum": { "$cond": [{ $eq: ["$status", "3"] }, 1, 0] }
              },
              "countNeedExtend": {
                "$sum": { "$cond": [{ $gt: ["$daysRemainExpired", "30"] }, 1, 0] }
              }
            },
          },
          {
            "$sort": {
              "_id.year": -1
            }
          }
        ],
        "count2": [
          {
            "$addFields": {
              "yearExtend": {
                "$switch": {
                  "branches": [
                    {
                      "case": { "$eq": ["$status", "2"] },
                      "then": { "$dateToString": { "date": { $last: "$extend.fromDate" }, "format": "%Y" } },
                    }
                  ],
                  "default": "none"
                }
              },
            }
          },
          {
            "$group": {
              "_id": { "year": "$yearExtend" },
              "countExtend": {
                "$sum": 1
              },
            },
          },
        ]
      },
    },
    // Ghep cac mang ket qua
    {
      $project: {
        all: {
          $concatArrays: ["$count1", "$count2"]
        }
      }
    },
    // Tach thanh tung document
    {
      $unwind: "$all"
    },
    // Gom lai
    {
      $group: {
        "_id": {
          "year": "$all._id.year",
        },
        "countNew": { "$sum": "$all.countNew" },
        "countCanceled": { "$sum": "$all.countCanceled" },
        "countNeedExtend": { "$sum": "$all.countNeedExtend" },
        "countExtend": { "$sum": "$all.countExtend" },
      },
    },
    // Loại bỏ cái none
    {
      $match: {
        "_id.year": {
          "$ne": "none"
        }
      }
    },
    {
      $sort: {
        "_id.year": -1
      }
    }
  ], (error, data) => {
    if (error) {

      return next(error);
    } else {
      res.status(200).json(data)
    }
  })
})

// List by Status
idcRoute.route('/list-by-status').post((req, res, next) => {
  IDC.aggregate([
    {
      "$addFields": {
        "year": {
          "$switch": {
            "branches": [
              {
                "case": { "$eq": ["$status", "1"] },
                "then": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } },
              }, {
                "case": { "$eq": ["$status", "2"] },
                "then": { "$dateToString": { "date": { $last: "$extend.fromDate" }, "format": "%Y" } },
              }
            ],
            "default": "none"
          }
        },
        "dateExpired": {
          "$switch": {
            "branches": [
              {
                "case": { "$eq": ["$status", "1"] },
                "then": "$expirationDate"
              }, {
                "case": { "$eq": ["$status", "2"] },
                "then": { $last: "$extend.toDate" }
              }
            ],
            "default": "none"
          }
        }
      },
    },
    {
      "$match": {
        "status": req.body.status,
        "year": req.body.year,
      }
    },
  ], (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json(data)
    }
  })
})

// List Expired
idcRoute.route('/list-expired').get((req, res, next) => {
  IDC.aggregate([
    {
      "$addFields": {
        "dayExpired": {
          "$switch": {
            "branches": [
              {
                "case": { "$eq": ["$status", "1"] },
                "then": { "$dateToString": { "date": "$registrationDate" } },
              }, {
                "case": { "$eq": ["$status", "2"] },
                "then": { "$dateToString": { "date": { $last: "$extend.toDate" } } },
              }
            ],
            "default": "none"
          }
        },
        "daysRemainExpired": {
          "$switch": {
            "branches": [
              {
                "case": { "$eq": ["$status", "1"] },
                "then": { $round: [{ $divide: [{ $subtract: ["$$NOW", "$expirationDate"] }, 1000 * 60 * 60 * 24] }] }
              }, {
                "case": { "$eq": ["$status", "2"] },
                "then": { $round: [{ $divide: [{ $subtract: ["$$NOW", { $last: "$extend.toDate" }] }, 1000 * 60 * 60 * 24] }] }
              }
            ],
            "default": "none"
          }
        }
      },
    },
    {
      "$match": {
        "daysRemainExpired": { "$gte": -30 }
      }
    },
    {
      "$project": {
        "am": 1,
        "comTaxCode": 1,
        "comName": 1,
        "status": 1,
        "daysRemainExpired": 1,
        "dayExpired": 1
      }
    }
  ], (error, data) => {
    if (error) {

      return next(error);
    } else {
      res.status(200).json(data)
    }
  })
})


module.exports = idcRoute;