const authSrv = require('./auth.service');
const userSrv = require('../users/user.service');
const { issueJWT } = require('../../common/crypto/utils');
const sendMail = require('../../common/email/send');

module.exports = {
    loginAdmin: async function (req, res, next) {
        try {
            const DTO = await authSrv.loginLocal(req.body, 'admin');
            if (DTO) {
                const jwt = issueJWT(`${DTO.user.id}!@#$%^&*()-=1234567890-=${DTO.user.username}!@#$%^&*()-=1234567890-=${DTO.user.role}!@#$%^&*()-=1234567890-=${Date.now()}`);
                DTO.token = jwt.token;
                DTO.exprires = jwt.expires;
            }

            res.json(DTO);
        } catch (err) {
            next(err);
        }
    },
    login: async function (req, res, next) {
        try {
            const DTO = await authSrv.loginLocal(req.body, 'user');
            if (DTO) {
                const jwt = issueJWT(`${DTO.user.id}!@#$%^&*()-=1234567890-=${DTO.user.username}!@#$%^&*()-=1234567890-=${DTO.user.role}!@#$%^&*()-=1234567890-=${Date.now()}`);
                DTO.token = jwt.token;
                DTO.exprires = jwt.expires;
            }

            res.json(DTO);
        } catch (err) {
            next(err);
        }
    },
    logup: async function (req, res, next) {
        try {
            const DTO = await userSrv.create(req.body);
            
            const jwt = issueJWT(`${DTO.id}!@#$%^&*()-=1234567890-=${DTO.username}!@#$%^&*()-=1234567890-=${Date.now()}`);
            const info = {
                user: {
                    id: DTO.id,
                    username: DTO.username,
                    name: DTO.name,
                },
                token: jwt.token,
                expires: jwt.expires,
            };

            res.json(info)
        } catch (err) {
            next(err);
        }
    },
    forgetPass: async function (req, res, next) {
        try {
            const account = await userSrv.getUserByUsername(req.body.username || '_');
            const token = await authSrv.createTk(`reset-password--&@#---%$${account.id}--&@#---%$${Date.now()}`);
            const mailInfo = await sendMail({
                address: account.username,
                name: account.name,
            }, 'reset-pass', { token });
            res.json({mailInfo});
        } catch (error) {
            next(error);
        }
    }
};
