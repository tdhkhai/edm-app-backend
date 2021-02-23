const express = require('express');
const app = express();
const typeOfServiceRoute = express.Router();

// TypeOfService model
let TypeOfService = require('../models/TypeOfService');

// Add TypeOfService
typeOfServiceRoute.route('/create').post((req, res, next) => {
  TypeOfService.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All TypeOfServices
typeOfServiceRoute.route('/').get((req, res) => {
  TypeOfService.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All TypeOfServices Actived
typeOfServiceRoute.route('/typeOfServiceActived').get((req, res) => {
  TypeOfService.find({ "status": "true" }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single TypeOfService
typeOfServiceRoute.route('/read/:id').get((req, res) => {
  TypeOfService.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})


// Update TypeOfService
typeOfServiceRoute.route('/update/:id').put((req, res, next) => {
  TypeOfService.findByIdAndUpdate(req.params.id, {
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

// Delete TypeOfService
typeOfServiceRoute.route('/delete/:id').delete((req, res, next) => {
  TypeOfService.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})

module.exports = typeOfServiceRoute;