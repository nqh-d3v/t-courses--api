/* eslint-disable no-param-reassign */
const Joi = require('@hapi/joi');
const { schemaValidator } = require('../../common/schema-validator/utils');

const loginAdminSchema = Joi.object({
    username: Joi.string().min(0).max(255).required(),
    password: Joi.string().min(0).max(255).required(),
}).unknown(true);
const loginSchema = Joi.object({
    username: Joi.string().min(0).max(255).email().required(),
    password: Joi.string().min(0).max(255).required(),
}).unknown(true);
const optionSchema = Joi.object({
    username: Joi.string().email().required(),
}).unknown(true);
const logupSchema = Joi.object({
    username: Joi.string().min(5).max(50).email().required(),
    password: Joi.string().min(8).max(255).required(),
    name: Joi.string().min(2).max(255).required(),
}).unknown(true);


module.exports = {
    validateAdminLogin: function (req, res, next) {
        try {
            schemaValidator(loginAdminSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateLogin: function (req, res, next) {
        try {
            schemaValidator(loginSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateLogup: function (req, res, next) {
        try {
            schemaValidator(logupSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateOptions: function (req, res, next) {
        try {
            schemaValidator(optionSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
};
