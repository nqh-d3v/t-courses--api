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

function validateEmail(email) {
    // eslint-disable-next-line no-useless-escape
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = function () {

    // For ALL ==================================
    const strategyJWT = new StrategyJWT(params, async (payload, done) => {
        try {
            const dataToken = payload.sub.split('!@#$%^&*()-=1234567890-=');
            const info = validateEmail(dataToken[1])
                ? await models.user.findByPk(dataToken[0])
                : await models.admin.findByPk(dataToken[0]);
            
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
                // config.session,
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
                    if (user.role === 'user' && !user.isActive) {
                        throw new AppError(
                            httpStatus.FORBIDDEN,
                            'This account hasn’t been activated yet.',
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
