/* eslint-disable no-param-reassign */
const AppError = require('../error/error');
const { httpStatus } = require('../error/http-status');

function schemaValidator(joiSchema, data) {
    const result = joiSchema.validate(data, {
        abortEarly: false,
    });

    const errors = result.error
        ? result.error.details.map((err) => {
              // Its doesn't nessesary to show error's type or context

              if (
                  err.type === 'string.pattern.base' &&
                  err.path.includes('password')
              ) {
                  err.message = 'Password too weak.';
              }

              //   delete err.type;
              //   delete err.context;
              return err;
          })
        : [];

    if (errors.length > 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid data from your request', true);
    }
}

module.exports.schemaValidator = schemaValidator;
