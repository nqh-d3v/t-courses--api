function ErrorHandler() {
    this.handleError = async (err) => {
        console.log(err);
        await this.sendMailToAdminIfCritical(err);
    };

    this.isTrustedError = (error) => {
        return error.isOperational;
    };

    this.sendMailToAdminIfCritical = async (err) => {
        // TODO
        return 0;
    };
}

module.exports = new ErrorHandler();
