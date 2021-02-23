const express = require('express');
const app = express();
const unitRoute = express.Router();

// Employee model
let Unit = require('../models/Unit');

// Add Employee
unitRoute.route('/create').post((req, res, next) => {
  Unit.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All Employees
unitRoute.route('/').get((req, res) => {
  Unit.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All Employees Activated
unitRoute.route('/activatedunit').get((req, res) => {
  Unit.find({status: 1},(error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single employee
unitRoute.route('/read/:id').get((req, res) => {
  Unit.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})


// Update employee
unitRoute.route('/update/:id').put((req, res, next) => {
  Unit.findByIdAndUpdate(req.params.id, {
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

// Delete employee
unitRoute.route('/delete/:id').delete((req, res, next) => {
  Unit.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})

module.exports = unitRoute;