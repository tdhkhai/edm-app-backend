const express = require('express');
const app = express();
const xinxeRoute = express.Router();

// Xinxe model
let Xinxe = require('../models/Xinxe');

// Add Xinxe
xinxeRoute.route('/create').post((req, res, next) => {
  Xinxe.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Get All Xinxes
xinxeRoute.route('/').get((req, res) => {
  Xinxe.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get All Xinxes Activated
xinxeRoute.route('/activatedXinxes').get((req, res) => {
  Xinxe.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single Xinxe
xinxeRoute.route('/read/:id').get((req, res) => {
  Xinxe.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Update Xinxe
xinxeRoute.route('/update/:id').put((req, res, next) => {
  Xinxe.findByIdAndUpdate(req.params.id, {
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
xinxeRoute.route('/delete/:id').delete((req, res, next) => {
  Xinxe.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})


module.exports = xinxeRoute;