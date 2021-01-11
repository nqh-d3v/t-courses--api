const express = require('express');
const path = require('path');
const logger = require('morgan');
const config = require('config');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const db = require('./src/models');
const passportAuth = require('./src/api/auth/passport.strategy')();
const api = require('./src/api');
const swaggerDocs = require('./docs/openapi.json');
const errorManagement = require('./src/common/error/errorHandler');
const AppError = require('./src/common/error/error');
const { httpStatus } = require('./src/common/error/http-status');

/**
 * -------------- GENERAL SETUP ----------------
 */

require('dotenv').config();


// Configures and sync models to the database
db.sequelize.sync(config.get('db_sync'));

const app = express();
// console.log(config.get('cors'));
app.use(cors('*')); // CORS
app.use(logger('dev')); // Logger
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), config.static));
app.set('Cache-Control', 'max-age=3000');

// This will initialize the passport object on every request
app.use(passportAuth.initialize());

/**
 * -------------- ROUTES ----------------
 */


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Swagger documents
app.use('/api/v1', api); // Root

/**
 * -------------- ERROR HANDLER ----------------
 */

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(new AppError(httpStatus.NOT_FOUND, 'Not found.', true));
});

// Error handler
app.use(function (err, req, res) {
    let message;
    let status;

    errorManagement.handleError(err);

    if (err.name === 'SequelizeUniqueConstraintError') {
        message = err.errors[0].message;
        status = httpStatus.UNPROCESSABLE_ENTITY;
    } else {
        message = err.message;
        status =
            err.statusCode === undefined
                ? httpStatus.INTERNAL_SERVER_ERROR
                : err.statusCode;
    }

    res.status(status).json({
        statusCode: status,
        message,
    });
});

process.on('uncaughtException', (err) => {
    errorManagement.handleError(err);
    if (!errorManagement.isTrustedError(err)) process.exit(1);
});

module.exports = app;
