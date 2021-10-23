const express = require('express');
const app = express();
const datlichRoute = express.Router();

let Datlich = require('../models/Datlich');

datlichRoute.route('/create').post((req, res, next) => {
  Datlich.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All Datlichs
datlichRoute.route('/').get((req, res) => {
  Datlich.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All Datlichs Activated
datlichRoute.route('/activatedDatlichs').get((req, res) => {
  Datlich.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single Datlich
datlichRoute.route('/read/:id').get((req, res) => {
  Datlich.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update Datlich
datlichRoute.route('/update/:id').put((req, res, next) => {
  Datlich.findByIdAndUpdate(req.params.id, {
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
datlichRoute.route('/delete/:id').delete((req, res, next) => {
  Datlich.findByIdAndRemove(req.params.id, (error, data) => {
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
datlichRoute.route('/count-customers').get((req, res, next) => {
  Datlich.aggregate([
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
datlichRoute.route('/list-by-status').post((req, res, next) => {
  Datlich.aggregate([
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


module.exports = datlichRoute;