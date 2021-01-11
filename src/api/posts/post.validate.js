/* eslint-disable no-param-reassign */
const Joi = require('@hapi/joi');
const { schemaValidator } = require('../../common/schema-validator/utils');

const contentSchema = Joi.object({
    content: Joi.string().required(),
}).unknown(true);
const reactionSchema = Joi.object({
    type: Joi.string().default('like').valid('like'),
}).unknown(true);

module.exports = {
    validateContent: function (req, res, next) {
        try {
            schemaValidator(contentSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateReaction: function (req, res, next) {
        try {
            schemaValidator(reactionSchema, req.query);
            next();
        } catch (err) {
            next(err);
        }
    },
};
