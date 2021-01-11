/* eslint-disable no-param-reassign */
const Joi = require('@hapi/joi');
const { schemaValidator } = require('../../common/schema-validator/utils');

const createSchema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(8).max(100).required(),
    name: Joi.string().min(6).max(255),
}).unknown(true);
const updateInfoSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
}).unknown(true);
const updatePasswordSchema = Joi.object({
    oldPwd: Joi.string().min(0).max(100).required(),
    newPwd: Joi.string().min(8).max(100).required(),
}).unknown(true);

module.exports = {
    validateCreate: function (req, res, next) {
        try {
            schemaValidator(createSchema, req.body);

            next();
        } catch (err) {
            next(err);
        }
    },
    validateUpdateInfo: function (req, res, next) {
        try {
            schemaValidator(updateInfoSchema, req.body);

            next();
        } catch (err) {
            next(err);
        }
    },
    validateUpdatePassword: function (req, res, next) {
        try {
            schemaValidator(updatePasswordSchema, req.body);

            next();
        } catch (err) {
            next(err);
        }
    },
};
