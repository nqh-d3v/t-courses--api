/* eslint-disable no-param-reassign */
const Joi = require('@hapi/joi');
const { schemaValidator } = require('../../common/schema-validator/utils');

const newCourseSchema = Joi.object({
    name: Joi.string().min(5).max(100).required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).default(0),
    isPrivate: Joi.bool().default(false),
}).unknown(true);
const updateUserRoleSchema = Joi.object({
    user: Joi.number().min(0).required(),
    role: Joi.string().valid('admin', 'mentor', 'member').required(),
}).unknown(true);
const courseSchema = Joi.object({
    name: Joi.string().min(5).max(100).required(),
    description: Joi.string().required(),
}).unknown(true);
const inviteCourseSchema = Joi.object({
    userId: Joi.number().min(1).required(),
}).unknown(true);

const lessionSchema = Joi.object({
    name: Joi.string().default('Nonamed').required(),
    content: Joi.string().required(),
}).unknown(true);

const exerciseSchema = Joi.object({
    name: Joi.string().default('Nonamed').required(),
    content: Joi.string().required(),
    deadline: Joi.date().min(new Date()),
    isHaveDeadline: Joi.bool().default(true),
}).unknown(true);

const submitSchema = Joi.object({
    content: Joi.string().required(),
}).unknown(true);
const markSchema = Joi.object({
    comment: Joi.string().default(''),
    score: Joi.number().min(0).max(10).required(),
    uid: Joi.number().min(0).required(),
}).unknown(true);

module.exports = {
    validateNewCourse: function (req, res, next) {
        try {
            schemaValidator(newCourseSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateCourse: function (req, res, next) {
        try {
            schemaValidator(courseSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateCourseInvite: function (req, res, next) {
        try {
            schemaValidator(inviteCourseSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
    validateChangeUserRole: function (req, res, next) {
        try {
            schemaValidator(updateUserRoleSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },

    // -- lession
    validateLession: function (req, res, next) {
        try {
            schemaValidator(lessionSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },

    // -- Exercise
    validateExercise: function (req, res, next) {
        try {
            schemaValidator(exerciseSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },

    // -- Submit
    validateSubmit: function (req, res, next) {
        try {
            schemaValidator(submitSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },

    // -- Mark
    validateMark: function (req, res, next) {
        try {
            schemaValidator(markSchema, req.body);
            next();
        } catch (err) {
            next(err);
        }
    },
};
