const { body, oneOf } = require('express-validator');


exports.verifyOtp = [
	body('otp').exists().trim()
];

exports.updatePassword = [
	body('new_password').exists().trim().not().isEmpty().isLength({ min: 6 })
		.withMessage('Must be at least 6 chars long'),
	body('old_password').trim()
];
exports.followunfollow = [
	body('following_id').exists().trim().not().isEmpty()

];
exports.checkUserNameAvailable = [
	body('username').exists().trim('@').not().isEmpty().withMessage('Username should not be empty').isLength({ min: 3 })
		.withMessage('Must be at least 3 chars long'),

];

// exports.forgotPassword = [
//   		oneOf([
// 				body('phone').exists().trim().not().isEmpty(),
// 				body('email').exists().trim().not().isEmpty()
// 			],'Email or phone is required'),
//   		body('phone').trim().if((value, { req }) => req.body.phone)
// 		.isLength({ min:8, max:16}).withMessage("Phone must have min 7 and max 15 digits").bail()
// 		.matches(/(^\+\d*$)/).withMessage("Invalid phone format"),
// 		body('email').trim().if((value, { req }) => req.body.email)
// 			.isEmail().withMessage('Must be a valid Email'),
// 		];
exports.forgotPassword = [
	body('email').exists().trim().not().isEmpty().isEmail().withMessage('Must be a valid Email')
];
exports.resetPassword = [
	body('new_password').exists().trim().not().isEmpty().isLength({ min: 6 })
		.withMessage('Must be at least 6 chars long')
];
exports.updateProfile = [
	body('bio').trim(),
	body('location').trim(),
	body('username').trim('@'),
	body('external_link').trim(),
	body('date_of_birth').trim().if((value, { req }) => req.body.date_of_birth).isISO8601({format: 'YYYY-MM-DD'}).withMessage('Needs to be a valid date with format YYYY-MM-DD'),
	body('name').trim().if((value, { req }) => req.body.name).isLength({ min: 3 })
		.withMessage('Must be at least 3 chars long'),
	body('allow_push_notifications').trim().if((value, { req }) => req.body.allow_push_notifications).isIn(['0','1']).withMessage('Must be either 1 or 0'),
	body('allow_email_notifications').trim().if((value, { req }) => req.body.allow_email_notifications).isIn(['0','1']).withMessage('Must be either 1 or 0')
];

exports.changeStatus = [
	body('status').exists().trim().not().isEmpty()
		.withMessage('status should not be empty').isIn(['0','1','2','3']).withMessage('Status must be 0-3'),

];
exports.resendOtp = [
	oneOf([
		body('phone').exists().trim().not().isEmpty(),
		body('email').exists().trim().not().isEmpty()
	],'Email or phone is required'),
	body('phone').trim().if((value, { req }) => req.body.phone)
		.isLength({ min:8, max:16}).withMessage("Phone must have min 7 and max 15 digits").bail()
		.matches(/(^\+\d*$)/).withMessage("Invalid phone format"),
	body('email').trim().if((value, { req }) => req.body.email)
		.isEmail().withMessage('Must be a valid Email')
];
exports.createRoom = [
	body('otherUser').exists().trim().not().isEmpty()

];