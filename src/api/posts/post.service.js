const models = require('../../models');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

module.exports = {
    // --- for POST ---------------------------
    createPs: async function (authId, postDTO) {
        if (postDTO.content.trim() === '') {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Nội dung bài viết không được bỏ trống',
                true,
            );
        }
        const created = await models.post.create({authId, ...postDTO});
        return created;
    },
    allPs: async function (userRole, userId = 0, options = {}) {
        const sqlCmd = `SELECT P.id, P.auth_id, A.name, A.avatar, P.content, P.tags, P.created_at, RL.likes, MR.type, CM.comments FROM posts AS P
        JOIN ( SELECT users.id, users.name, users.avatar FROM users WHERE users.is_lock = 0 ) AS A ON A.id = P.auth_id
        LEFT JOIN ( SELECT comments.post_id, count(*) as 'comments' FROM comments GROUP BY comments.post_id ) AS CM ON CM.post_id = P.id
        LEFT JOIN ( SELECT reactions.post_id, count(*) as 'likes' FROM reactions GROUP BY reactions.post_id ) AS RL ON RL.post_id = P.id
        LEFT JOIN ( SELECT reactions.post_id, reactions.type FROM reactions WHERE reactions.user_id = ${userId} GROUP BY reactions.post_id ) AS MR ON MR.post_id = P.id
        ${userRole === 'user' ? `WHERE ${options.auth ? `P.auth_id = ${options.auth}` : 'P.is_lock = 0'}` : ''} ORDER BY P.updated_at DESC`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd;
    },
    infoPs: async function (postId = 0, userRole, userId) {
        const sqlCmd = `SELECT P.id, P.auth_id, A.name, A.avatar, P.content, P.tags, P.is_comment_lock AS 'isNotComment' ${userRole === 'admin' ? ', P.is_lock AS \'isLock\'' : ', MR.type'}, P.created_at, RL.likes, CM.comments FROM posts AS P
        JOIN ( SELECT users.id, users.name, users.avatar FROM users WHERE users.is_lock = 0 ) AS A ON A.id = P.auth_id
        LEFT JOIN ( SELECT comments.post_id, count(*) as 'comments' FROM comments GROUP BY comments.post_id ) AS CM ON CM.post_id = P.id
        LEFT JOIN ( SELECT reactions.post_id, count(*) as 'likes' FROM reactions GROUP BY reactions.post_id ) AS RL ON RL.post_id = P.id
        LEFT JOIN ( SELECT reactions.post_id, reactions.type FROM reactions WHERE reactions.user_id = ${userId} GROUP BY reactions.post_id ) AS MR ON MR.post_id = P.id
        WHERE P.id = ${postId} ${userRole === 'user' ? ` AND (P.is_lock = 0 OR P.auth_id = ${userId})` : ''}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd.length > 0 ? resultCmd[0] : null ;
    },
    updatePs: async function (id = 0, authId, updateDTO) {
        const updated = await models.post.findByPk(id);
        if (!updated) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Bài viết không tồn tại',
                true,
            );
        }
        if (updated.authId !== authId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                'Chỉ có tác giả mới có quyền chỉnh sửa bài viết',
                true,
            );
        }
        updated.content = updateDTO.content;
        updated.tags = updateDTO.tags;
        await updated.save();
        return updated;
    },
    toggleLockPs: async function (id = 0) {
        const locked = await models.post.findOne({ where: { id }});
        if (!locked) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Bài viết không tồn tại',
                true,
            );
        }
        locked.isLock = !locked.isLock;
        await locked.save();
        return locked;
    },
    toggleLockCmtPs: async function (id = 0, authId, userRole) {
        const query = userRole === 'admin' ? { id } : { id, authId };
        const locked = await models.post.findOne({ where: query });
        if (!locked) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Bài viết không tồn tại (hoặc bạn không là tác giả)',
                true,
            );
        }
        locked.isCommentLock = !locked.isCommentLock;
        await locked.save();
        return locked;
    },
    deletePs: async function (id = 0, authId) {
        const deleted = await models.post.findOne({ where: {id, authId}});
        if (!deleted) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Bài viết không tồn tại',
                true,
            );
        }
        await deleted.destroy();
        return deleted;
    },

    // --- for COMMENT -----------------------
    createCmt: async function (postId, userId, content) {
        const created = await models.comment.create({ postId, userId, content });
        return created;
    },
    allCmt: async function (postId = 0, userId, limit = 0) {
        const sqlCmd = `SELECT C.id, C.post_id AS 'post', C.user_id AS 'user', U.name, U.avatar, C.content FROM comments AS C
        JOIN ( SELECT users.id, users.name, users.avatar FROM users WHERE users.is_lock = 0 ) AS U ON U.id = C.user_id
        JOIN ( SELECT posts.id FROM posts WHERE posts.is_lock = 0 OR posts.auth_id = ${userId} ) AS P ON P.id = C.post_id
        WHERE C.post_id = ${postId} ORDER BY C.created_at DESC ${Number.isNaN(limit) || limit <= 0 ? '' : `LIMIT ${limit}`}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd;
    },
    updateCmt: async function (id = 0, userId = 0, content) {
        const updated = await models.comment.findOne({ where: {id, userId}});
        if (!updated) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Bình luận không tồn tại hoặc đã bị xóa',
                true,
            );
        }
        updated.content = content;
        await updated.save();
        return updated;
    },
    deleteCmt: async function (id = 0, userId = 0) {
        const deleted = await models.comment.findOne({ where: {id, userId}});
        if (!deleted) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Bình luận không tồn tại hoặc đã bị xóa',
                true,
            );
        }
        await deleted.destroy();
        return deleted;
    },

    // --- for REACTION ----------------------
    toggleRc: async function (postId, userId, type) {
        let reaction = await models.reaction.findOne({ where: {postId, userId} });
        if (reaction) {
            if (type === reaction.type) {
                await reaction.destroy();
            } else {
                reaction.type = type;
                await reaction.save();
            }
            return type === reaction.type ? null : reaction;
        }
        reaction = await models.reaction.create({ postId, userId, type });
        return reaction;
    },
    infoRc: async function (postId, type) {
        const sqlCmd = `SELECT U.id, U.name, U.avatar, R.type FROM users AS U
        JOIN ( 
            SELECT reactions.user_id, reactions.type FROM reactions
            JOIN ( SELECT posts.id FROM posts WHERE posts.id = ${postId} AND posts.is_lock = 0 ) AS P ON P.id = reactions.post_id
            ${type !== '*' ? `WHERE reactions.type = ${type}` : ''}
        ) AS R ON R.user_id = U.id
        WHERE U.is_lock = 0`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd;
    },


    // --- SUPPORT ---------------------------
    checkPostWithCommentId: async function (commentId) {
        const sqlCmd = `SELECT C.id, C.post_id FROM comments AS C
        JOIN ( SELECT posts.id FROM posts WHERE posts.is_lock = 0 ) AS P ON P.id = C.post_id
        WHERE C.id = ${commentId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd.length > 0 ? resultCmd[0] : null;
    },
};