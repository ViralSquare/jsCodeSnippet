
const admin = require('firebase-admin');
const ErrorHandler = require('utils/errorHandler.js');
const models = require('models');
const uploadProfile = require('services/s3');
const db = require('services/db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
// verifying the firebase jwt and register the user
const verifyFirebaseTokenAndRegister = async (req, res, next) => {
    try {
        const { token } = req.body;
        admin.auth().verifyIdToken(token).then(async (decodedToken) => {
            const uuid = await uuidv4();
            const userData = await db.saveFireBaseUserData(decodedToken, uuid);
            const jwtToken = await models.user.getSignedJwtToken(userData.id);
            res.status(200).json({
                success: true,
                user_id: decodedToken.user_id,
                phone_number: decodedToken.phone_number,
                firebase: decodedToken.firebase,
                jwtToken,
                userData,
            });
        })
            .catch((error) => next(new ErrorHandler(error, 401)));
    } catch (error) {
        next(error);
    }
};

// updating the verified phone number user
const updateUser = async (req, res, next) => {
    try {
        const {
            name, bio, upfile, content_type,
        } = req.body;

        const token = req.headers.authorization.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        await uploadProfile.uploadProfilePicture(upfile, content_type).then(async (result) => {
            const userData = await db.register(name, result, bio, decoded.id);
            res.status(200).json({
                success: true,
                userData,
                message: 'User registration completed',
            });
        }).catch((err) => next(new ErrorHandler(err, 400)));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateUser,
    verifyFirebaseTokenAndRegister,
};
