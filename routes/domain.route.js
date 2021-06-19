const express = require('express');
const app = express();
const domainRoute = express.Router();

// Domain model
let Domain = require('../models/Domain');

// Add Domain
domainRoute.route('/create').post((req, res, next) => {
  Domain.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get All Domains
domainRoute.route('/').get((req, res) => {
  Domain.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get All Domains Activated
domainRoute.route('/activateddomains').get((req, res) => {
  Domain.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get single Domain
domainRoute.route('/read/:id').get((req, res) => {
  Domain.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Update Domain
domainRoute.route('/update/:id').put((req, res, next) => {
  Domain.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
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

// Push Extend IDC
domainRoute.route('/pushextenddomain/:id').put((req, res, next) => {
  Domain.findByIdAndUpdate(
    req.params.id,
    {
      $set: { status: req.body.status },
      $push: { extend: req.body.extend },
      safe: true,
      upsert: true,
      new: true,
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

// Pull Extend Domain
domainRoute.route('/pullextenddomain/:id').put((req, res, next) => {
  Domain.findByIdAndUpdate(
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

// Update Status Domain
domainRoute.route('/updatestatus/:id').put((req, res, next) => {
  Domain.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
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

// Delete Invoice
domainRoute.route('/delete/:id').delete((req, res, next) => {
  Domain.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

// Count cusomer
domainRoute.route('/count-customers').get((req, res, next) => {
  Domain.aggregate(
    [
      {
        $addFields: {
          daysRemainExpired: {
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
      },
      {
        $group: {
          _id: {
            year: {
              $dateToString: { date: '$registrationDate', format: '%Y' },
            },
          },
          countAll: {
            $sum: 1,
          },
          countNew: {
            $sum: { $cond: [{ $eq: ['$status', '1'] }, 1, 0] },
          },
          countExtend: {
            $sum: { $cond: [{ $eq: ['$status', '2'] }, 1, 0] },
          },
          countCanceled: {
            $sum: { $cond: [{ $eq: ['$status', '3'] }, 1, 0] },
          },
          countCusExpired: {
            $sum: { $cond: [{ $lte: ['$daysRemainExpired', '30'] }, 1, 0] },
          },
        },
      },
      {
        $sort: {
          '_id.year': -1,
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
domainRoute.route('/list-by-status').post((req, res, next) => {
  Domain.aggregate(
    [
      {
        $addFields: {
          year: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$status', '1'] },
                  then: {
                    $dateToString: { date: '$registrationDate', format: '%Y' },
                  },
                },
                {
                  case: { $eq: ['$status', '2'] },
                  then: {
                    $dateToString: {
                      date: { $last: '$extend.fromDate' },
                      format: '%Y',
                    },
                  },
                },
              ],
              default: 'none',
            },
          },
          dateExpired: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$status', '1'] },
                  then: '$expirationDate',
                },
                {
                  case: { $eq: ['$status', '2'] },
                  then: { $last: '$extend.toDate' },
                },
              ],
              default: 'none',
            },
          },
        },
      },
      {
        $match: {
          status: req.body.status,
          year: req.body.year,
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

// List Expired
domainRoute.route('/list-expired').get((req, res, next) => {
  Domain.aggregate(
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

module.exports = domainRoute;
