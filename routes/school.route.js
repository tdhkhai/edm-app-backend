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
          },
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
schoolRoute.route('/count-module-by-unit').get((req, res, next) => {
  School.aggregate(
    [
      {
        $group: {
          _id: {
            unit: '$unit.unitCode',
            moduleName: '$modules.moduleName',
          },
        },
      },
      {
        $unwind: '$_id.moduleName',
      },
      {
        $group: {
          _id: {
            unit: '$_id.unit',
            moduleName: '$modules.moduleName',
          },
          count_vnEdu: { $sum: { $cond: [{ $eq: ['$_id.moduleName', 'SLLĐT'] }, 1, 0] } },
          count_vnEdu_QoE: { $sum: { $cond: [{ $eq: ['$_id.moduleName', 'vnEdu-QoE'] }, 1, 0] } },
          count_vnPortal: { $sum: { $cond: [{ $eq: ['$_id.moduleName', 'vnPortal'] }, 1, 0] } },
          count_vnEdu_FMS: { $sum: { $cond: [{ $eq: ['$_id.moduleName', 'vnEdu-FMS'] }, 1, 0] } },
          count_ioffice: { $sum: { $cond: [{ $eq: ['$_id.moduleName', 'VNPT iOffice'] }, 1, 0] } },
          count_elearning: { $sum: { $cond: [{ $eq: ['$_id.moduleName', 'VNPT Elearning'] }, 1, 0] } },
        },
      },
      {
        $sort: { '_id.unit': 1 },
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
