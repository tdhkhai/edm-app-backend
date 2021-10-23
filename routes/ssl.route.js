const express = require('express');
const app = express();
const sslRoute = express.Router();


let SSL = require('../models/SSL');


sslRoute.route('/create').post((req, res, next) => {
  SSL.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All SSLs
sslRoute.route('/').get((req, res) => {
  SSL.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All SSLs Activated
sslRoute.route('/activatedSSLs').get((req, res) => {
  SSL.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single SSL
sslRoute.route('/read/:id').get((req, res) => {
  SSL.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update SSL
sslRoute.route('/update/:id').put((req, res, next) => {
  SSL.findByIdAndUpdate(req.params.id, {
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

// Delete Invoice
sslRoute.route('/delete/:id').delete((req, res, next) => {
  SSL.findByIdAndRemove(req.params.id, (error, data) => {
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
sslRoute.route('/count-customers').get((req, res, next) => {
  SSL.aggregate([
    // Cách 1
    // {
    //   "$group": {
    //     "_id": {
    //       "year": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } },
    //       "status": "$status"
    //     },
    //     "count": { "$sum": 1 }
    //   },
    // },
    // {
    //   "$group": {
    //     "_id": "$_id.year",
    //     "counts": {
    //       "$push": {
    //         "k": "$_id.status",
    //         "v": "$count"
    //       }
    //     }
    //   }
    // },
    // {
    //   "$addFields": {
    //     "counts": {
    //       "$setUnion": [
    //         "$counts", [
    //           {
    //             "k": "group",
    //             "v": "$_id"
    //           }
    //         ]
    //       ]
    //     }
    //   }
    // },
    // {
    //   "$replaceRoot": {
    //     "newRoot": { "$arrayToObject": "$counts" }
    //   }
    // }

    // Cách 2:
    // {
    //   "$group": {
    //     "_id": {
    //       "year": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } },
    //       "status": "$status"
    //     },
    //     "count": { "$sum": 1 }
    //   },
    // },
    // {
    //   "$group": {
    //     "_id": "$_id.year",
    //     "count": { "$mergeObjects": { "$arrayToObject": [[["$_id.status", "$count"]]] } }
    //   }
    // }

    // Cách 3:
    {
      "$group": {
        "_id": {
          "year": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } },
        },
        "countAll": {
          "$sum": 1
        },
        "countNew": {
          "$sum": { "$cond": [{ $eq: ["$status", "1"] }, 1, 0] }
        },
        "countCanceled": {
          "$sum": { "$cond": [{ $eq: ["$status", "2"] }, 1, 0] }
        },
      },
    },
    {
      "$sort" : {
        "_id.year" : -1
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


sslRoute.route('/pushextendssl/:id').put((req, res, next) => {
  SSL.findByIdAndUpdate(
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

sslRoute.route('/pullextendssl/:id').put((req, res, next) => {
  SSL.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { extend: { _id: req.body._id } },
    },
    (error, data) => {
      if (error) {
        return next(error);
        console.log(error);
      } else {
        res.json(data);
        console.log('Data updated successfully');
      }
    }
  );
});


// List Expired
sslRoute.route('/list-expired').get((req, res, next) => {
  SSL.aggregate(
    [
      {
        $addFields: {
          dayExpired: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$status', '1'] },
                  then: { $dateToString: { date: '$expirationDate' } },
                },
                {
                  case: { $eq: ['$status', '2'] },
                  then: {
                    $dateToString: { date: { $last: '$extend.toDate' } },
                  },
                },
              ],
              default: 'none',
            },
          },
          daysRemainExpired: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$status', '1'] },
                  then: {
                    $round: [
                      {
                        $divide: [
                          { $subtract: ['$$NOW', '$expirationDate'] },
                          1000 * 60 * 60 * 24,
                        ],
                      },
                    ],
                  },
                },
                {
                  case: { $eq: ['$status', '2'] },
                  then: {
                    $round: [
                      {
                        $divide: [
                          { $subtract: ['$$NOW', { $last: '$extend.toDate' }] },
                          1000 * 60 * 60 * 24,
                        ],
                      },
                    ],
                  },
                },
              ],
              default: 'none',
            },
          },
        },
      },
      {
        $match: {
          daysRemainExpired: { $gte: -30 },
        },
      },
      {
        $project: {
          am: 1,
          comTaxCode: 1,
          comName: 1,
          status: 1,
          daysRemainExpired: 1,
          dayExpired: 1,
          domain: 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json(data);
      }
    }
  );
});

// List by Status
sslRoute.route('/list-by-status').post((req, res, next) => {
  SSL.aggregate([
    {
      "$addFields": {
        "year": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } 
        },
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


module.exports = sslRoute;