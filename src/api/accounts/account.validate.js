/* eslint-disable no-param-reassign */
const Joi = require('@hapi/joi');
const { schemaValidator } = require('../../common/schema-validator/utils');

const newUserSchema = Joi.object({
    username: Joi.string()
        .min(4)
        .max(50)
        .regex(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/),
    password: Joi.string().min(7),
    name: Joi.string().min(6).max(255),
}).unknown(true);

module.exports = {
    validateAccountNew: function (req, res, next) {
        try {
            schemaValidator(newUserSchema, req.body);

            next();
        } catch (err) {
            next(err);
        }
    },
};
