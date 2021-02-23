const express = require('express');
const app = express();
const dausoRoute = express.Router();

// Dauso model
let Dauso = require('../models/Dauso');

// Add Dauso
dausoRoute.route('/create').post((req, res, next) => {
  Dauso.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All Dausos
dausoRoute.route('/').get((req, res) => {
  Dauso.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All Dausos Activated
dausoRoute.route('/activatedDausos').get((req, res) => {
  Dauso.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single Dauso
dausoRoute.route('/read/:id').get((req, res) => {
  Dauso.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update Dauso
dausoRoute.route('/update/:id').put((req, res, next) => {
  Dauso.findByIdAndUpdate(req.params.id, {
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
dausoRoute.route('/delete/:id').delete((req, res, next) => {
  Dauso.findByIdAndRemove(req.params.id, (error, data) => {
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
dausoRoute.route('/count-customers').get((req, res, next) => {
  Dauso.aggregate([
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

// List by Status
dausoRoute.route('/list-by-status').post((req, res, next) => {
  Dauso.aggregate([
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


module.exports = dausoRoute;