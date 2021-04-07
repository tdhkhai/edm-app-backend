const express = require('express');
const app = express();
const schoolRoute = express.Router();

// School model
let School = require('../models/School');

// Add School
schoolRoute.route('/create').post((req, res, next) => {
  School.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All Schools
schoolRoute.route('/').get((req, res) => {
  School.aggregate([
    {
      "$project": {
        "_id": 1,
        "unit": 1,
        "schoolName": 1,
        "schoolTaxCode": 1,
      }
    }
  ], (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All Schools Activated
schoolRoute.route('/activatedSchools').get((req, res) => {
  School.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single School
schoolRoute.route('/read/:id').get((req, res) => {
  School.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update School
schoolRoute.route('/update/:id').put((req, res, next) => {
  School.findByIdAndUpdate(req.params.id, {
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
schoolRoute.route('/delete/:id').delete((req, res, next) => {
  School.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})

// Push Module
schoolRoute.route('/push-module-edu/:id').put((req, res, next) => {
  School.findByIdAndUpdate(
    req.params.id, {
    $push: { "modules": req.body.payload },
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

schoolRoute.route('/list-module-used-by-school').get((req, res, next) => {
  School.aggregate([
    {
      "$project": {
        "schoolName": 1,
        "modules": {
          "moduleName": 1
        },
      }
    },
    {
      "$group": {
        "_id": "$modules.moduleName",
        "dups": { "$addToSet": "$_id"}
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

module.exports = schoolRoute;