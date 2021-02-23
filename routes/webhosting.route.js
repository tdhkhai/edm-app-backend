const express = require('express');
const app = express();
const webhostingRoute = express.Router();

// Webhosting model
let Webhosting = require('../models/Webhosting');

// Add Webhosting
webhostingRoute.route('/create').post((req, res, next) => {
  Webhosting.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All Domains
webhostingRoute.route('/').get((req, res) => {
  Webhosting.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All Domains Activated
webhostingRoute.route('/activatedwebhostings').get((req, res) => {
  Webhosting.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single Webhosting
webhostingRoute.route('/read/:id').get((req, res) => {
  Webhosting.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update Webhosting
webhostingRoute.route('/update/:id').put((req, res, next) => {
  Webhosting.findByIdAndUpdate(req.params.id, {
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

// Push Extend Webhosting
webhostingRoute.route('/pushextendwebhosting/:id').put((req, res, next) => {
  Webhosting.findByIdAndUpdate(
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

// Pull Extend Webhosting
webhostingRoute.route('/pullextendwebhosting/:id').put((req, res, next) => {
  Webhosting.findByIdAndUpdate(
    req.params.id, {
    $pull: { "extend": { _id : req.body._id } },

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

// Update Status Webhosting
webhostingRoute.route('/updatestatus/:id').put((req, res, next) => {
  Webhosting.findByIdAndUpdate(
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
webhostingRoute.route('/delete/:id').delete((req, res, next) => {
  Webhosting.findByIdAndRemove(req.params.id, (error, data) => {
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
webhostingRoute.route('/count-customers').get((req, res, next) => {
  Webhosting.aggregate([
    {
      "$group": {
        "_id": {
          "year": { "$dateToString": { "date": "$registrationDate", "format": "%Y" } },
        },
        "countAll": {
          "$sum": 1
        },
        "countActived": {
          "$sum": { "$cond": [{ $eq: ["$status", "1"] }, 1, 0] }
        },
        "countExtend": {
          "$sum": { "$cond": [{ $eq: ["$status", "2"] }, 1, 0] }
        },
        "countCanceled": {
          "$sum": { "$cond": [{ $eq: ["$status", "3"] }, 1, 0] }
        },
        "countNeedExtend": {
          "$sum": { "$cond": [{ $eq: ["$status", "3"] }, 1, 0] }
        }
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

module.exports = webhostingRoute;