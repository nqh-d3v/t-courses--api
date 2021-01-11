class AppError extends Error {
    constructor(statusCode, message, isOperation) {
        super();

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }

        this.statusCode = statusCode;
        this.message = message;
        this.isOperation = isOperation;
    }
}

module.exports = AppError;
