const express = require('express');
const app = express();
const schoolRoute = express.Router();

// School model
let School = require('../models/School');

// Add School
schoolRoute.route('/create').post((req, res, next) => {
  School.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get All Schools
schoolRoute.route('/').get((req, res) => {
  School.aggregate(
    [
      {
        $project: {
          _id: 1,
          unit: 1,
          schoolName: 1,
          schoolTaxCode: 1,
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    }
  );
});

// Get All Schools Activated
schoolRoute.route('/activatedSchools').get((req, res) => {
  School.find({ status: 1 }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get single School
schoolRoute.route('/read/:id').get((req, res) => {
  School.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Update School
schoolRoute.route('/update/:id').put((req, res, next) => {
  School.findByIdAndUpdate(
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
schoolRoute.route('/delete/:id').delete((req, res, next) => {
  School.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

// Push Module
schoolRoute.route('/push-module-edu/:id').put((req, res, next) => {
  School.findByIdAndUpdate(
    req.params.id,
    {
      $push: { modules: req.body.payload },
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

// Import Push Module
schoolRoute.route('/import-push-module-edu').post((req, res, next) => {
  School.updateOne(
    { id_moet: req.body.id_moet },
    { $push: { modules: req.body.payload } },
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

// Pull vnEdu module
schoolRoute.route('/pull-vnedu-module/:id').put((req, res, next) => {
  School.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        modules: {
          moduleName: req.body.moduleName,
          schoolYear: req.body.schoolYear,
        },
      },
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

// Pull module
schoolRoute.route('/pull-module/:id').put((req, res, next) => {
  School.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        modules: {
          moduleName: req.body.moduleName,
          fromDate_toDate: req.body.fromDate_toDate,
        },
      },
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

schoolRoute.route('/list-schools').get((req, res, next) => {
  School.aggregate(
    [
      {
        $group: {
          _id: {
            idSchool: '$_id',
            schoolName: '$schoolName',
            schoolTaxCode: '$schoolTaxCode',
            modules: '$modules.moduleName',
            unit: '$unit',
            id_moet: '$id_moet',
            id_vnedu: '$id_vnedu',
          },
        },
      },
      {
        $project: {
          '_id.idSchool': 1,
          '_id.schoolName': 1,
          '_id.schoolTaxCode': 1,
          '_id.modules': 1,
          '_id.unit': 1,
          '_id.id_moet': 1,
          '_id.id_vnedu': 1,
        },
      },
      {
        $sort: { '_id.unit.unitCode': 1 },
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

//
schoolRoute.route('/count-module-by-unit').post((req, res, next) => {
  School.aggregate(
    [
      // {
      //   $match: {
      //     'unit.unitCode': 'CPU',
      //   },
      // },
      {
        $group: {
          _id: {
            unitCode: '$unit.unitCode',
            schoolName: '$schoolName',
            modules: '$modules',
          },
        },
      },
      {
        $unwind: '$_id.modules',
      },
      {
        $group: {
          _id: {
            unitCode: '$_id.unitCode',
            // modules: '$_id.modules',
          },
          count_vnEdu_TK: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.modules.moduleName', 'SLLĐT'] },
                    { $eq: ['$_id.modules.loaiHD_SLL', 'Tái ký'] },
                    { $eq: ['$_id.modules.schoolYear', req.body.schoolYear] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          count_vnEdu_New: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.modules.moduleName', 'SLLĐT'] },
                    { $eq: ['$_id.modules.loaiHD_SLL', 'Mới'] },
                    { $eq: ['$_id.modules.schoolYear', req.body.schoolYear] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          count_vnEdu_QoE: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.modules.moduleName', 'vnEdu-QoE'] },
                    {
                      $eq: [
                        {
                          $substr: [
                            {
                              $arrayElemAt: ['$_id.modules.fromDate_toDate', 0],
                            },
                            6,
                            4,
                          ],
                        },
                        { $substr: [req.body.schoolYear, 7, 4] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          count_vnPortal: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.modules.moduleName', 'vnPortal'] },
                    {
                      $eq: [
                        {
                          $substr: [
                            {
                              $arrayElemAt: ['$_id.modules.fromDate_toDate', 0],
                            },
                            6,
                            4,
                          ],
                        },
                        { $substr: [req.body.schoolYear, 7, 4] },
                      ],
                    },
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

schoolRoute.route('/count-school-by-unit').get((req, res, next) => {
  School.aggregate(
    [
      {
        $group: {
          _id: {
            unitCode: '$unit.unitCode',
          },
          countC0: { $sum: { $cond: [{ $eq: ['$caphoc', 'MN/MG'] }, 1, 0] } },
          countC1: { $sum: { $cond: [{ $eq: ['$caphoc', 'TH'] }, 1, 0] } },
          countC2: { $sum: { $cond: [{ $eq: ['$caphoc', 'THCS'] }, 1, 0] } },
          countC3: { $sum: { $cond: [{ $eq: ['$caphoc', 'THPT'] }, 1, 0] } },
          countC23: {
            $sum: { $cond: [{ $eq: ['$caphoc', 'THCS và THPT'] }, 1, 0] },
          },
          count3cap: {
            $sum: { $cond: [{ $eq: ['$caphoc', '3 Cấp học'] }, 1, 0] },
          },
          countC12: {
            $sum: { $cond: [{ $eq: ['$caphoc', 'TH và THCS'] }, 1, 0] },
          },
          countNghe: { $sum: { $cond: [{ $eq: ['$caphoc', 'Nghề'] }, 1, 0] } },
          countKT: {
            $sum: { $cond: [{ $eq: ['$caphoc', 'Khuyết tật'] }, 1, 0] },
          },
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

module.exports = schoolRoute;
