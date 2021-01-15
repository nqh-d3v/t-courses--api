const authSrv = require('./auth.service');
const accountCtl = require('../accounts/account.service');
const { issueJWT } = require('../../common/crypto/utils');
// const sendMail = require('../../common/email/send');

module.exports = {
    loginLocal: async function (req, res, next) {
        try {
            const DTO = await authSrv.validLocal(req.body);
            if (DTO) {
                const jwt = issueJWT([DTO.account.id, DTO.account.username, DTO.account.role, Date.now()].join('@~@'));
                DTO.token = jwt.token;
                DTO.exprires = jwt.expires;
            }

            res.json(DTO);
        } catch (err) {
            next(err);
        }
    },
    createAccount: async function (req, res, next) {
        try {
            const DTO = await accountCtl.create(req.body);
            
            const jwt = issueJWT([DTO.id, DTO.username, DTO.role, Date.now()].join('@~@'));
            const info = {
                account: {
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
};
