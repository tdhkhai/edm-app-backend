const express = require('express');
const app = express();
const invoiceRoute = express.Router();

// Invoice model
let Invoice = require('../models/Invoice');

// Add Invoice
invoiceRoute.route('/create').post((req, res, next) => {
  Invoice.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get All Invoices
invoiceRoute.route('/').get((req, res) => {
  Invoice.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json(data);
    }
  }).sort({ monthAction: -1 });
});

// Get All Invoices Activated
invoiceRoute.route('/activatedinvoices').get((req, res) => {
  Invoice.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get All Invoices By Date
invoiceRoute.route('/getinvoicesbydate').get((req, res) => {
  Invoice.find(
    { status: 1 },

    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    }
  );
});

// Get single Invoice
invoiceRoute.route('/read/:id').get((req, res) => {
  Invoice.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Update Invoice
invoiceRoute.route('/update/:id').put((req, res, next) => {
  Invoice.findByIdAndUpdate(
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
invoiceRoute.route('/delete/:id').delete((req, res, next) => {
  Invoice.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

// Sumary theo thang
invoiceRoute.route('/sumary-theo-thang').post((req, res, next) => {
  Invoice.aggregate(
    [
      // Tìm các khách hàng tạo theo tháng
      {
        $match: {
          incomeDate: new Date(req.body.month),
          typeOfIncome: req.body.toi,
        },
      },
      //
      {
        $group: {
          _id: '$unitCode',
          count: { $sum: 1 },
          totalIncome: { $sum: '$income' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    }
  );
});

// Sumary theo thang - AM
invoiceRoute.route('/sumary-theo-thang-am').post((req, res, next) => {
  Invoice.aggregate(
    [
      // Tìm các khách hàng tạo theo tháng
      {
        $match: {
          incomeDate: new Date(req.body.month),
          typeOfIncome: req.body.toi,
        },
      },
      //
      {
        $group: {
          _id: {
            unitCode: '$unitCode',
            userName: '$userName',
          },
          count: { $sum: 1 },
          totalIncome: { $sum: '$income' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    }
  );
});

// So lieu Site - AM
invoiceRoute.route('/so-lieu-site-am').post((req, res, next) => {
  Invoice.aggregate(
    [
      // Tìm các khách hàng tạo theo tháng
      {
        $facet: {
          // Dem so luong chuyen chinh thuc trong thang
          countGoliveinMonth: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                dateGolive: {
                  $gte: new Date(req.body.month),
                  $lte: new Date(req.body.eomonth),
                },
                dateDemo: {
                  $gte: new Date(req.body.month),
                  $lte: new Date(req.body.eomonth),
                },
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode', userName: '$userName' },
                countGoliveinMonth: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ],
          // Dem so luong chuyen chinh thuc cac thang
          countGolive: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                dateGolive: {
                  $gte: new Date(req.body.month),
                  $lte: new Date(req.body.eomonth),
                },
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode', userName: '$userName' },
                countGolive: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ],
          // Dem so luong chuyen chinh thuc trong thang
          countSiteCreated: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                monthAction: new Date(req.body.month),
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode', userName: '$userName' },
                countSiteCreated: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ], // Dem so luong Demo chua chuyen chinh thuc
          countDemoNotGoliveInMonth: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                status: 'Demo',
                monthAction: new Date(req.body.month),
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode', userName: '$userName' },
                countDemoNotGoliveInMonth: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ],
        },
      },
      // Ghep cac mang ket qua
      {
        $project: {
          all: {
            $concatArrays: [
              '$countGoliveinMonth',
              '$countGolive',
              '$countSiteCreated',
              '$countDemoNotGoliveInMonth',
            ],
          },
        },
      },
      // Tach thanh tung document
      {
        $unwind: '$all',
      },
      // Gom lai
      {
        $group: {
          _id: {
            unitCode: '$all._id.unitCode',
            userName: '$all._id.userName',
          },
          countGoliveinMonth: { $sum: '$all.countGoliveinMonth' },
          countGolive: { $sum: '$all.countGolive' },
          countSiteCreated: { $sum: '$all.countSiteCreated' },
          countDemoNotGoliveInMonth: { $sum: '$all.countDemoNotGoliveInMonth' },
        },
      },
      {
        $sort: {
          '_id.unitCode': 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    }
  );
});

// So lieu Site - Don vi
invoiceRoute.route('/so-lieu-site-don-vi').post((req, res, next) => {
  Invoice.aggregate(
    [
      // Tìm các khách hàng tạo theo tháng
      {
        $facet: {
          // Dem so luong chuyen chinh thuc trong thang
          countGoliveinMonth: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                dateGolive: {
                  $gte: new Date(req.body.month),
                  $lte: new Date(req.body.eomonth),
                },
                dateDemo: {
                  $gte: new Date(req.body.month),
                  $lte: new Date(req.body.eomonth),
                },
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode' },
                countGoliveinMonth: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ],
          // Dem so luong chuyen chinh thuc cac thang
          countGolive: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                dateGolive: {
                  $gte: new Date(req.body.month),
                  $lte: new Date(req.body.eomonth),
                },
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode' },
                countGolive: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ],
          // Dem so luong chuyen chinh thuc trong thang
          countSiteCreated: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                monthAction: new Date(req.body.month),
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode' },
                countSiteCreated: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ], // Dem so luong Demo chua chuyen chinh thuc
          countDemoNotGoliveInMonth: [
            {
              $match: {
                unitCode: { $exists: true },
                userName: { $exists: true },
                status: 'Demo',
                monthAction: new Date(req.body.month),
              },
            },
            {
              $group: {
                _id: { unitCode: '$unitCode' },
                countDemoNotGoliveInMonth: { $sum: 1 },
              },
            },
            {
              $sort: { '_id.unitCode': 1 },
            },
          ],
        },
      },
      // Ghep cac mang ket qua
      {
        $project: {
          all: {
            $concatArrays: [
              '$countGoliveinMonth',
              '$countGolive',
              '$countSiteCreated',
              '$countDemoNotGoliveInMonth',
            ],
          },
        },
      },
      // Tach thanh tung document
      {
        $unwind: '$all',
      },
      // Gom lai
      {
        $group: {
          _id: {
            unitCode: '$all._id.unitCode',
          },
          countGoliveinMonth: { $sum: '$all.countGoliveinMonth' },
          countGolive: { $sum: '$all.countGolive' },
          countSiteCreated: { $sum: '$all.countSiteCreated' },
          countDemoNotGoliveInMonth: { $sum: '$all.countDemoNotGoliveInMonth' },
        },
      },
      {
        $sort: {
          '_id.unitCode': 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    }
  );
});

// Count Site by Unit
invoiceRoute.route('/count-site-by-unit').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $facet: {
          countSiteAccumulated: [
            {
              $group: {
                _id: { unitCode: '$am.unitCode' },
                countDemoAccumulated: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Demo'] }, 1, 0],
                  },
                },
                countGoliveAccumulated: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Golive'] }, 1, 0],
                  },
                },
                countDeleteAccumulated: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Delete'] }, 1, 0],
                  },
                },
              },
            },
          ],
          countSitebyInMonth: [
            {
              $group: {
                _id: { unitCode: '$am.unitCode' },
                countDemoInMonth: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$dateDemo', new Date(req.body.month)] },
                          { $lte: ['$dateDemo', new Date(req.body.eomonth)] },
                          { $eq: ['$monthAction', new Date(req.body.month)] },
                          { $eq: ["$status", "Demo"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                countGoliveInMonth: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$monthAction', new Date(req.body.month)] },
                          { $gte: ['$dateGolive', new Date(req.body.month)] },
                          { $lte: ['$dateGolive', new Date(req.body.eomonth)] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                countGoliveInPast: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$dateGolive', new Date(req.body.month)] },
                          { $lte: ['$dateGolive', new Date(req.body.eomonth)] },
                          { $lt: ['$monthAction', new Date(req.body.month)] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          all: {
            $concatArrays: ['$countSiteAccumulated', '$countSitebyInMonth'],
          },
        },
      },
      {
        $unwind: '$all',
      },
      // Gom lai
      {
        $group: {
          _id: {
            unitCode: '$all._id.unitCode',
          },
          countDemoAccumulated: { $sum: '$all.countDemoAccumulated' },
          countGoliveAccumulated: { $sum: '$all.countGoliveAccumulated' },
          countDeleteAccumulated: { $sum: '$all.countDeleteAccumulated' },
          countDemoInMonth: { $sum: '$all.countDemoInMonth' },
          countGoliveInMonth: { $sum: '$all.countGoliveInMonth' },
          countGoliveInPast: { $sum: '$all.countGoliveInPast' },
        },
      },
      {
        $sort: {
          '_id.unitCode': 1,
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

// Count Site by AM
invoiceRoute.route('/count-site-by-am').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $group: {
          _id: { unitCode: '$am.unitCode', userName: '$am.userName' },
          countDemoInMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$dateDemo', new Date(req.body.month)] },
                    { $lte: ['$dateDemo', new Date(req.body.eomonth)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          countGoliveInMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$dateGolive', new Date(req.body.month)] },
                    { $lte: ['$dateGolive', new Date(req.body.eomonth)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          countGoliveInPast: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$dateGolive', new Date(req.body.month)] },
                    { $lte: ['$dateGolive', new Date(req.body.eomonth)] },
                    { $lte: ['$monthAction', new Date(req.body.month)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          '_id.unitCode': 1,
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

// Count cusomer
invoiceRoute.route('/count-customers').get((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $group: {
          _id: {
            year: { $dateToString: { date: '$monthAction', format: '%Y' } },
          },
          countAll: {
            $sum: 1,
          },
          countDemo: {
            $sum: { $cond: [{ $eq: ['$status', 'Demo'] }, 1, 0] },
          },
          countGolive: {
            $sum: { $cond: [{ $eq: ['$status', 'Golive'] }, 1, 0] },
          },
          countExtend: {
            $sum: { $cond: [{ $eq: ['$status', 'Bo sung'] }, 1, 0] },
          },
          countDelete: {
            $sum: { $cond: [{ $eq: ['$status', 'Delete'] }, 1, 0] },
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

// Count Customer Line Chart
invoiceRoute.route('/count-customers-line-chart').get((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $group: {
          _id: {
            year: { $dateToString: { date: '$monthAction', format: '%Y' } },
            month: { $dateToString: { date: '$monthAction', format: '%Y-%m' } },
          },
          countAll: {
            $sum: 1,
          },
          countDemo: {
            $sum: { $cond: [{ $eq: ['$status', 'Demo'] }, 1, 0] },
          },
          countGolive: {
            $sum: { $cond: [{ $eq: ['$status', 'Golive'] }, 1, 0] },
          },
          countExtend: {
            $sum: { $cond: [{ $eq: ['$status', 'Bo sung'] }, 1, 0] },
          },
          countDelete: {
            $sum: { $cond: [{ $eq: ['$status', 'Delete'] }, 1, 0] },
          },
        },
      },
      {
        $match: {
          '_id.year': '2020',
        },
      },
      {
        $sort: {
          '_id.month': 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    }
  );
});

// Count Customer Bar Chart
invoiceRoute.route('/count-customers-bar-chart').get((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $group: {
          _id: {
            year: { $dateToString: { date: '$monthAction', format: '%Y' } },
            month: { $dateToString: { date: '$monthAction', format: '%Y-%m' } },
            typeOfIncome: '$typeOfIncome',
          },
          sum: {
            $sum: '$income',
          },
        },
      },
      {
        $match: {
          '_id.year': '2020',
        },
      },
      {
        $sort: {
          '_id.month': 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    }
  );
});

// Doanh thu hàng tháng - Unit
invoiceRoute.route('/income-by-month').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $facet: {
          newIncome: [
            {
              $match: {
                incomeDate: new Date(req.body.dateIncome),
                typeOfIncome: 'Mới',
              },
            },
            {
              $group: {
                _id: {
                  unitCode: '$am.unitCode',
                },
                countNewIncome: {
                  $sum: 1,
                },
                sumNewIncome: {
                  $sum: '$income',
                },
              },
            },
          ],
          extIncome: [
            {
              $match: {
                incomeDate: new Date(req.body.dateIncome),
                typeOfIncome: 'GH',
              },
            },
            {
              $group: {
                _id: {
                  unitCode: '$am.unitCode',
                },
                sumExtIncome: {
                  $sum: '$income',
                },
                countExtIncome: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
      // Ghep cac mang ket qua
      {
        $project: {
          all: {
            $concatArrays: ['$newIncome', '$extIncome'],
          },
        },
      },
      // Tach thanh tung document
      {
        $unwind: '$all',
      },
      // Gom lai
      {
        $group: {
          _id: {
            unitCode: '$all._id.unitCode',
          },
          newIncome: { $sum: '$all.sumNewIncome' },
          extIncome: { $sum: '$all.sumExtIncome' },
          countNewIncome: { $sum: '$all.countNewIncome' },
          countExtIncome: { $sum: '$all.countExtIncome' },
        },
      },
      {
        $sort: {
          '_id.unitCode': 1,
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

// Doanh thu hàng tháng - AM
invoiceRoute.route('/income-by-month-am').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $facet: {
          newIncome: [
            {
              $match: {
                incomeDate: new Date(req.body.dateIncome),
                typeOfIncome: 'Mới',
              },
            },
            {
              $group: {
                _id: {
                  unitCode: '$am.unitCode',
                  userName: '$am.userName',
                },
                countNewIncome: {
                  $sum: 1,
                },
                sumNewIncome: {
                  $sum: '$income',
                },
              },
            },
          ],
          extIncome: [
            {
              $match: {
                incomeDate: new Date(req.body.dateIncome),
                typeOfIncome: 'GH',
              },
            },
            {
              $group: {
                _id: {
                  unitCode: '$am.unitCode',
                  userName: '$am.userName',
                },
                sumExtIncome: {
                  $sum: '$income',
                },
                countExtIncome: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
      // Ghep cac mang ket qua
      {
        $project: {
          all: {
            $concatArrays: ['$newIncome', '$extIncome'],
          },
        },
      },
      // Tach thanh tung document
      {
        $unwind: '$all',
      },
      // Gom lai
      {
        $group: {
          _id: {
            unitCode: '$all._id.unitCode',
            userName: '$all._id.userName',
          },
          newIncome: { $sum: '$all.sumNewIncome' },
          extIncome: { $sum: '$all.sumExtIncome' },
          countNewIncome: { $sum: '$all.countNewIncome' },
          countExtIncome: { $sum: '$all.countExtIncome' },
        },
      },
      {
        $sort: {
          '_id.unitCode': 1,
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

// Doanh thu năm
invoiceRoute.route('/income-by-year').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $addFields: {
          year: { $dateToString: { date: '$incomeDate', format: '%Y' } },
        },
      },
      {
        $match: {
          year: req.body.year,
        },
      },
      {
        $group: {
          _id: {
            unitCode: '$am.unitCode',
            month: { $dateToString: { date: '$incomeDate', format: '%m' } },
          },
          sumIncome: {
            $sum: '$income',
          },
        },
      },
      {
        $group: {
          _id: {
            unitCode: '$_id.unitCode',
          },

          income: { $push: { month: '$_id.month', sum: '$sumIncome' } },
        },
      },
      {
        $sort: { '_id.unitCode': 1 },
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

// List Invoice by Status
invoiceRoute.route('/list-invoice-by-status').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $addFields: {
          year: { $dateToString: { date: '$monthAction', format: '%Y' } },
        },
      },
      {
        $match: {
          status: req.body.status,
          year: req.body.year,
        },
      },
      {
        $sort: {
          monthAction: 1,
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

// List by CusTaxCode
invoiceRoute.route('/list-invoice-by-com-tax-code').post((req, res, next) => {
  Invoice.aggregate(
    [
      {
        $match: {
          comTaxCode: req.body.selectedComTaxCode,
        },
      },
      {
        $sort: {
          monthAction: 1,
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

// Thong ke theo loai KH
invoiceRoute
  .route('/statistics-by-customer-type-education')
  .post((req, res, next) => {
    Invoice.aggregate(
      [
        {
          $facet: {
            Demo: [
              {
                $match: {
                  status: 'Demo',
                  typeOfCustomer: 'Giáo dục',
                },
              },
              {
                $group: {
                  _id: {
                    unitCode: '$am.unitCode',
                  },
                  countDemo: {
                    $sum: 1,
                  },
                },
              },
              {
                $sort: {
                  '_id.unitCode': 1,
                },
              },
            ],
            Golive: [
              {
                $match: {
                  status: 'Golive',
                  typeOfCustomer: 'Giáo dục',
                },
              },
              {
                $group: {
                  _id: {
                    unitCode: '$am.unitCode',
                  },
                  countC0: {
                    $sum: {
                      $cond: [
                        { $eq: ['$detailTypeOfCustomer', 'Mầm non/Mẫu giáo'] },
                        1,
                        0,
                      ],
                    },
                  },
                  countC1: {
                    $sum: {
                      $cond: [
                        { $eq: ['$detailTypeOfCustomer', 'Tiểu học'] },
                        1,
                        0,
                      ],
                    },
                  },
                  countC2: {
                    $sum: {
                      $cond: [{ $eq: ['$detailTypeOfCustomer', 'THCS'] }, 1, 0],
                    },
                  },
                  countC3: {
                    $sum: {
                      $cond: [{ $eq: ['$detailTypeOfCustomer', 'THPT'] }, 1, 0],
                    },
                  },
                  countC23: {
                    $sum: {
                      $cond: [
                        { $eq: ['$detailTypeOfCustomer', 'THCS & THPT'] },
                        1,
                        0,
                      ],
                    },
                  },
                  countKhac: {
                    $sum: {
                      $cond: [{ $eq: ['$detailTypeOfCustomer', 'null'] }, 1, 0],
                    },
                  },
                },
              },
              {
                $sort: {
                  '_id.unitCode': 1,
                },
              },
            ],
          },
        },
        // Ghep cac mang ket qua
        {
          $project: {
            all: {
              $concatArrays: ['$Demo', '$Golive'],
            },
          },
        },
        // Tach thanh tung document
        {
          $unwind: '$all',
        },
        // Gom lai
        {
          $group: {
            _id: {
              unitCode: '$all._id.unitCode',
            },
            countDemo: { $sum: '$all.countDemo' },
            countC0: { $sum: '$all.countC0' },
            countC1: { $sum: '$all.countC1' },
            countC2: { $sum: '$all.countC2' },
            countC3: { $sum: '$all.countC3' },
            countC23: { $sum: '$all.countC23' },
            countKhac: { $sum: '$all.countKhac' },
          },
        },
        {
          $sort: {
            '_id.unitCode': 1,
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

// Get List Loại KH Giáo dục
invoiceRoute
  .route('/list-statistics-by-customer-type-education')
  .post((req, res, next) => {
    Invoice.aggregate(
      [
        {
          $match: {
            'am.unitCode': payload.unitCode,
            status: payload.status,
            typeOfCustomer: 'Giáo dục',
            detailTypeOfCustomer: payload.grade,
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

module.exports = invoiceRoute;
