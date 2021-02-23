let express = require('express'),
   path = require('path'),
   mongoose = require('mongoose'),
   cors = require('cors'),
   bodyParser = require('body-parser'),
   dbConfig = require('./database/db');
createError = require('http-errors');
// Connecting with mongo db
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
   useNewUrlParser: true,
   useFindAndModify: false,
}).then(() => {
   console.log('Database sucessfully connected')
},
   error => {
      console.log('Database could not connected: ' + error)
   }
)

// Setting up port with express js
const unitRoute = require('./routes/unit.route')
const userRoute = require('./routes/user.route')
const typeOfServiceRoute = require('./routes/typeofservice.route')
const serviceRoute = require('./routes/service.route')
const invoiceRoute = require('./routes/invoice.route')
const dausoRoute = require('./routes/dauso.route')
const idcRoute = require('./routes/idc.route')
const domainRoute = require('./routes/domain.route')
const webhostingRoute = require('./routes/webhosting.route')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(cors());
app.use(function (req, res, next) {
   //Enabling CORS
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
   next();
});
app.use(express.static(path.join(__dirname, 'dist/JIRA-v2')));
app.use('/', express.static(path.join(__dirname, 'dist/JIRA-v2')));
// Set up URL
app.use('/api/units/', unitRoute)
app.use('/api/users/', userRoute)
app.use('/api/typeofservices/', typeOfServiceRoute)
app.use('/api/services/', serviceRoute)
app.use('/api/invoices/', invoiceRoute)
app.use('/api/dau-so/', dausoRoute)
app.use('/api/idc/', idcRoute)
app.use('/api/domain/', domainRoute)
app.use('/api/webhosting/', webhostingRoute)

// Create port
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
   console.log('Connected to port ' + port)
})

// Find 404 and hand over to error handler
app.use((req, res, next) => {
   next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
   console.error(err.message); // Log error message in our server's console
   if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
   res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
});