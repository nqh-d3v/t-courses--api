const crypto = require('crypto');
const models = require('../../models');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

const genCodeAccess = function() {
    let result = '';
    const characters = 'A1qBw2eerCt3yDu4iEo5pFa6sGd7fHg8hIj9kJl0K!L@M#N$O%P^Q&R*S(T)UV_W=X+YZ';
    const charactersLength = characters.length;
    for ( let i = 0; i < 25; i+=1 ) {
       result += i % 7 === 6 ? '-' : characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
module.exports = {
    // ==================== LINK ============================================
    newLink: async (courseId, userId, status, role = 'member') => {
        const newLink = await models.link.create({ courseId, userId, status, role });
        return newLink;
    },
    updateLink: async (courseId, userId, options) => {
        const updated = await models.link.findOne({ where: { courseId, userId } });
        updated.status = options.status ? options.status : updated.status;
        updated.role = options.role ? options.role : updated.status;
        await updated.save();
        return updated;
    },
    deleteLink: async function (courseId, userId) {
        const deleted = await models.link.destroy({ where: { courseId, userId }});
        return deleted;
    },
    // ==================== COURSE ==========================================
    create: async function (courseDTO, isPrivate = false) {
        const cAccess = isPrivate ? genCodeAccess() : ''
        const newCourse = await models.course.create({codeAccess: cAccess, ...courseDTO});
        newCourse.dataValues.isPrivate = isPrivate;
        delete newCourse.dataValues.codeAccess;
        return newCourse;
    },
    getAll: async function (userId, role, options) {
        console.log(options, options.search);
        // Get all of cousrses which user joined
        const sqlCmd = `SELECT C.id, C.name, C.description, C.price, M.mems , C.is_active, C.is_lock, L.role FROM courses AS C
        LEFT JOIN ( SELECT links.course_id, count(*) as 'mems' FROM links WHERE links.role = 'member' GROUP BY links.course_id) AS M ON M.course_id = C.id
        ${options.all ? 'LEFT' : ''} JOIN ( SELECT links.course_id, links.user_id, links.role FROM links WHERE links.user_id = ${role === 'user' ? userId : 0} AND links.status != 'black' GROUP BY links.course_id) AS L ON L.course_id = C.id
        WHERE C.is_active = 1 AND C.is_lock = 0 OR L.role = 'admin' OR 'admin' = '${role}' ${options.search && options.search !== '' ? `AND C.name LIKE '${options.search}%'` : ''}`;
        const result = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        console.log(sqlCmd);
        return result;
    },
    getInfo: async function (userId, role, courseId) {
        // Get info of cousrse which user joined or all for admin
        const sqlCmd = `SELECT C.id, C.name, C.description, C.price, C.code_access, LS.ls AS 'lessions', A.adms, M.mems, C.is_active, C.is_lock, L.role FROM courses AS C
        LEFT JOIN ( SELECT links.course_id, count(*) as 'adms' FROM links WHERE links.role = 'admin' GROUP BY links.course_id) AS A ON A.course_id = C.id
        LEFT JOIN ( SELECT links.course_id, count(*) as 'mems' FROM links WHERE links.role = 'member' GROUP BY links.course_id) AS M ON M.course_id = C.id
        LEFT JOIN ( SELECT links.course_id, links.user_id, links.role FROM links WHERE links.user_id = ${userId} AND links.status != 'black' GROUP BY links.course_id) AS L ON L.course_id = C.id
        LEFT JOIN ( SELECT lessions.course_id, count(*) as ls FROM lessions GROUP BY lessions.course_id) AS LS ON LS.course_id = C.id
        WHERE C.id = ${courseId} ${role === 'user' ? `AND ((C.is_active = 1 AND C.is_lock = 0) OR L.role = 'admin')` : ''}`;
        const result = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        const resultCmd = result.length > 0 ? result[0] : null;
        if (!resultCmd) throw new AppError(
            httpStatus.NOT_FOUND,
            'Không tìm thấy thông tin khóa học',
            true,
        );
        return resultCmd;
    },
    getInfoByCodeAccess: async function (codeAccess) {
        const info = await models.course.findOne({ where: { codeAccess }});
        return info;
    },
    createTokenAccess: function (iv, codeAccess) {
        const key = process.env.COURSE_KEY_SECRET || '5999c27946ab4f1a48a7a405ffc710f5cf0ba817992a1ce6bc3733b0eb8f5f1d';
        const keyBuffer = Buffer.from(key, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(keyBuffer), iv);
        let encrypted = cipher.update(codeAccess);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    },
    getTokenAccess: async function (iv, token) {
        const key = process.env.COURSE_KEY_SECRET || '5999c27946ab4f1a48a7a405ffc710f5cf0ba817992a1ce6bc3733b0eb8f5f1d';
        const keyBuffer = Buffer.from(key, 'hex');
        const encryptedText = Buffer.from(token, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(keyBuffer), iv);
        let decrypted;
        try {
            decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
        } catch (error) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Mã truy cập của bạn không hợp lệ!',
                true,
            )
        }
        const data = decrypted.toString();
        console.log(data);
        const infoCourse = await models.course.findOne({ where:{
            codeAccess: data.includes('@') ? data.split('@')[0] : '32_chars________________________',
            isActive: true,
            isLock: false,
        }});
        if (!infoCourse) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Không tìm thấy khóa học nào phù hợp với mã truy cập của bạn.',
                true,
            );
        }
        return {
            id: infoCourse.id,
            role: data.split('@')[1],
        };
    },
    update: async function (userId, courseId, updateDTO) {
        const sqlCmd = `SELECT C.id FROM courses AS C
        JOIN ( SELECT links.course_id, links.user_id FROM links WHERE links.role IN ('admin', 'editor') AND links.status = 'accepted' GROUP BY links.course_id) AS L ON L.course_id = C.id
        JOIN (SELECT users.id, users.name, users.avatar FROM users WHERE users.id = ${userId}) AS U ON U.id = L.user_id
        WHERE C.id = ${courseId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        if (resultCmd.length === 0) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Khóa học này không tồn tại (hoặc đã bị khóa)',
                true,
            )
        }
        const updated = await models.course.findByPk(resultCmd[0].id);
        updated.name = updateDTO.name;
        updated.description = updateDTO.description;
        await updated.save();
        return 1;
    },
    delete: async function (userId, courseId) {
        const sqlCmd = `SELECT C.id FROM courses AS C
        JOIN ( SELECT links.course_id, links.user_id FROM links WHERE links.role IN ('admin', 'editor') AND links.status = 'accepted' GROUP BY links.course_id) AS L ON L.course_id = C.id
        JOIN (SELECT users.id, users.name, users.avatar FROM users WHERE users.id = ${userId}) AS U ON U.id = L.user_id
        WHERE C.id = ${courseId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        console.log(userId);
        if (resultCmd.length === 0) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Khóa học này không tồn tại (hoặc đã bị khóa)',
                true,
            )
        }
        const deleted = await models.course.destroy({ where: { id: resultCmd[0].id }});
        return deleted[0];
    },
	active: async function (id) {
		const actived = await models.course.findByPk(id);
		if (!actived || actived.isActive) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				'Khóa học không tồn tại (hoặc đã được kích hoạt)',
				true,
			);
		}
		actived.isActive = true;
		await actived.save();
		delete actived.dataValues.codeAccess;
		return actived;
	},
	toggleLock: async function (id) {
		const locked = await models.course.findByPk(id);
		if (!locked) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				'Khóa học không tồn tại',
				true,
			);
        }
        if (!locked.isActive) locked.isActive = true;
		locked.isLock = !locked.isLock;
		await locked.save();
		delete locked.dataValues.codeAccess;
		return locked;
	},

    // =================== LESSION ==========================================
    createLs: async function (courseId, lessionDTO) {
        const newLs = await models.lession.create({courseId, ...lessionDTO});
        return newLs;
    },
    allLsOfCourse: async function (courseId) {
        const allLs = await models.lession.findAll({ attributes: ['id', 'name'], where: {courseId} });
        return allLs;
    },
    infoLs: async function (lessionId) {
        const infoLs = await models.lession.findByPk(lessionId);
        return infoLs;
    },
    updateLs: async function (lessionId, updateDTO) {
        const updated = await models.lession.findByPk(lessionId);
        updated.name = updateDTO.name;
        updated.content = updateDTO.content;
        await updated.save();
        return updated;
    },
    deleteLs: async function (lessionId) {
        const deleted = await models.lession.destroy({ where: { id: lessionId } });
        return deleted;
    },

    // =================== EXERCISE ========================================
    createEx: async function (lessionId, exerciseDTO) {
        const newDTO = await models.exercise.create({lessionId, ...exerciseDTO});
        delete newDTO.dataValues.content;
        return newDTO;
    },
    infoEx: async function (exerciseId, userId) {
        const sqlCmd = `SELECT exercises.id, exercises.lession_id, exercises.name, exercises.content, exercises.is_have_deadline AS 'isHaveDeadline', exercises.deadline ${userId ? `, S.content AS 'SC', S.other AS 'SO', S.SA` : ''} FROM exercises
        ${userId ? `LEFT JOIN ( SELECT submits.exercise_id AS 'EID', submits.content, submits.other, submits.created_at AS 'SA' FROM submits WHERE submits.user_id = ${userId} ) AS S ON S.EID = exercises.id` : ''}
        WHERE exercises.id = ${exerciseId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd.length > 0 ? resultCmd[0] : null;
    },
    allExOfLs: async function (lessionId) {
        const allDTO = await models.exercise.findAll({ where: {lessionId} });
        return allDTO;
    },
    updateEx: async function (exerciseId, exerciseDTO) {
        const updated = await models.exercise.findByPk(exerciseId);
        updated.name = exerciseDTO.name;
        updated.content = exerciseDTO.content;
        updated.deadline = exerciseDTO.isHaveDeadline ? exerciseDTO.deadline : updated.deadline;
        updated.isHaveDeadline = exerciseDTO.isHaveDeadline;
        await updated.save();
        return updated;
    },
    deleteEx: async function (exerciseId) {
        const deleted = await models.exercise.destroy({ where: { id: exerciseId } });
        return deleted.length > 0 ? deleted[0] : null;
    },

    // ================== SUBMIT ===========================================
    allSbOfEx: async function (courseId, exerciseId) {
        // 9 - 6
        const sqlCmd = `SELECT submits.exercise_id AS 'e_id', submits.user_id AS 'u_id', submits.id, MEM.name, submits.content, submits.other, submits.score, submits.comment, submits.marked_by AS 'm_id', MEN.name as 'm_name' FROM submits
        JOIN (
            SELECT users.id, users.name, L.role FROM users
            JOIN ( SELECT links.role, links.user_id FROM links WHERE links.course_id = ${courseId} AND links.status = 'accepted' ) AS L ON L.user_id = users.id
            WHERE L.role = 'member'
        ) AS MEM ON MEM.id = submits.user_id
        LEFT JOIN (
            SELECT users.id, users.name, L.role FROM users
            JOIN ( SELECT links.role, links.user_id FROM links WHERE links.course_id = ${courseId} AND links.status = 'accepted' ) AS L ON L.user_id = users.id
            WHERE L.role != 'member'
        ) AS MEN ON MEN.id = submits.marked_by
        WHERE submits.exercise_id = ${exerciseId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd;
    },
    createSb: async function (userId, exerciseId, submitDTO) {
        const newDTO = await models.submit.create({userId, exerciseId, ...submitDTO});
        return newDTO;
    },
    infoSb: async function (exerciseId, userId) {
        const info = await models.submit.findOne({ where: { userId, exerciseId } });
        return info;
    },
    updateSb: async function (submitId, updateDTO) {
        const updated = await models.submit.findByPk(submitId);
        if (!updated) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Không tìm thấy thông tin nộp bài của bạn!',
                true,
            );
        }
        if (Date.now() - Date.parse(updated.createdAt) > 60*1000*15) {
            throw new AppError(
                httpStatus.METHOD_NOT_ALLOWED,
                'Đã quá thời gian chỉnh sửa (15 phút sau khi nộp bài)',
                true,
            )
        }
        updated.content = updateDTO.content;
        updated.other = updateDTO.other;
        await updated.save();
        return updated;
    },
    markSb: async function (exerciseId, memberId, markContent, mentorId) {
        const updated = await models.submit.findOne({ where: { exerciseId, userId: memberId, score: -1 }});
        if (!updated) {
            throw new AppError(
                httpStatus.METHOD_NOT_ALLOWED,
                'Không tìm thấy thông tin nộp bài người này hoặc bài này đã được chấm!',
                true,
            );
        }
        updated.comment = markContent.comment || '';
        updated.score = markContent.score || 0;
        updated.markedBy = mentorId;
        await updated.save();
        return updated;
    },
    deleteSb: async function (submitId, userId) {
        const destroyed = await models.submit.findOne({ where: { id: submitId, userId}});
        if (!destroyed) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Không tìm thấy thông tin nộp bài của bạn!',
                true,
            );
        }
        if (Date.now() - Date.parse(destroyed.createdAt) > 60*1000*15) {
            throw new AppError(
                httpStatus.METHOD_NOT_ALLOWED,
                'Đã quá thời gian xóa (15 phút sau khi nộp bài)',
                true,
            )
        }
        await destroyed.destroy();
        return destroyed;
    },
    

    // Support 
    getUserInCourse: async function (userId, userRole, courseId) {
        const sqlCmd = `SELECT C.id AS 'courseId', U.id AS 'userId', U.created_at AS 'createdAccountAt', L.role, L.status FROM courses AS C
        JOIN ( SELECT links.course_id, links.user_id, links.status, links.role FROM links) AS L ON L.course_id = C.id
        JOIN (SELECT users.id, users.created_at FROM users WHERE users.id = ${userId} AND users.is_lock = 0) AS U ON U.id = L.user_id
        WHERE C.id = ${courseId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd.length > 0 ? resultCmd[0] : null;
    },
    getInfoById: async function (courseId) {
        const info = await models.course.findByPk(courseId);
        return info;
    },
    searchCourse: async function (userId, search = '') {
        // Get all of cousrses which user joined
        const sqlCmd = `SELECT C.name, C.description, C.price, M.mems FROM courses AS C
        LEFT JOIN ( SELECT links.course_id, count(*) AS 'mems' FROM links GROUP BY links.course_id ) AS M ON M.course_id = C.id
        LEFT JOIN ( SELECT links.course_id, links.user_id FROM links WHERE links.user_id = ${userId} GROUP BY links.course_id ) AS L ON L.course_id = C.id
        WHERE C.is_active = 1 AND C.is_lock = 0 AND ( C.name LIKE '% ${search} %' OR C.description LIKE '% ${search} %')
        ORDER BY C.mems DESC`;
        const result = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return result;
    },
    getLessionById: async function (lessionId) {
        const info = await models.lession.findByPk(lessionId);
        return info;
    },
    getFullExerciseInfoById: async function (exerciseId) {
        const sqlCmd = `SELECT exercises.lession_id, LC.course, LC.lession, exercises.is_have_deadline AS 'isHaveDeadline', exercises.deadline FROM exercises
        JOIN (
            SELECT lessions.id AS 'lession', lessions.course_id, C.id AS 'course' FROM lessions
            JOIN ( SELECT courses.id, courses.is_active, courses.is_lock FROM courses ) AS C ON C.id = lessions.course_id
        ) AS LC ON LC.lession = exercises.lession_id
        WHERE exercises.id = ${exerciseId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd.length > 0 ? resultCmd[0] : null;
    },
    getFullSubmitInfoById: async function (submitId, userId) {
        const sqlCmd = `SELECT S.exercise_id AS 'exercise', S.content, S.other, S.created_at AS 'createdAt', E.course, E.lession, E.isHaveDeadline, E.deadline FROM submits AS S
        JOIN (
            SELECT exercises.id, exercises.lession_id, exercises.is_have_deadline AS 'isHaveDeadline', exercises.deadline, LC.course, LC.lession FROM exercises
            JOIN (
                SELECT lessions.id AS 'lession', lessions.course_id, C.id AS 'course' FROM lessions
                JOIN ( SELECT courses.id, courses.is_active, courses.is_lock FROM courses WHERE courses.is_active = 1 AND courses.is_lock = 0 ) AS C ON C.id = lessions.course_id
            ) AS LC ON LC.lession = exercises.lession_id
        ) AS E ON S.exercise_id = E.id
        WHERE S.id =${submitId} AND S.user_id = ${userId}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd.length > 0 ? resultCmd[0] : null;
    },
    getAccountsOfCourse: async function (courseId, role) {
        const sqlCmd = `SELECT L.id, L.name, L.avatar, L.role, L.status FROM courses
        JOIN (
            SELECT links.course_id, links.user_id as 'id', links.role, links.status, U.name AS'name', U.avatar AS 'avatar' FROM links
            JOIN ( SELECT users.id, users.name, users.avatar FROM users WHERE users.is_lock = 0 ) AS U ON U.id = links.user_id
        ) AS L ON L.course_id = courses.id
        WHERE courses.id = ${courseId} ${role ? `AND L.role = '${role}'` : ''}`;
        const resultCmd = await models.sequelize.query(sqlCmd, {
            type: models.sequelize.QueryTypes.SELECT,
        });
        return resultCmd;
    }
};
 