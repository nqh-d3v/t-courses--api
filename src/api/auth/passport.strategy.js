const passport = require('passport');
const passportJWT = require('passport-jwt');

const models = require('../../models');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

const { ExtractJwt } = passportJWT;
const StrategyJWT = passportJWT.Strategy;
const params = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

module.exports = function () {

    // For ALL ==================================
    const strategyJWT = new StrategyJWT(params, async (payload, done) => {
        try {
            const info = await models.account.findByPk(payload.sub.split('@~@')[0]);
            
            if (info) {
                return done(null, {
                    id: info.id,
                    role: info.role,
                    isActive: info.isActive,
                });
            }

            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    });

    passport.use(strategyJWT);

    return {

        initialize: function () {
            return passport.initialize();
        },

        authenticateJWT: function (req, res, next) {
            return passport.authenticate(
                'jwt',
                (err, user, info) => {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return next(
                            new AppError(
                                httpStatus.UNAUTHORIZED,
                                'Invalid Credentials.',
                                true,
                            ),
                        );
                    }
                    if (!user.isActive) {
                        throw new AppError(
                            httpStatus.METHOD_NOT_ALLOWED,
                            'This account hasn’t been activated yet.',
                            true,
                        );
                    }
                    if (user.isLock) {
                        throw new AppError(
                            httpStatus.FORBIDDEN,
                            'This account has been locked yet.',
                            true,
                        );
                    }
                    req.user = user;
                    return next();
                },
            )(req, res, next);
        },
    };
};
