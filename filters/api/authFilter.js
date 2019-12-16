const { body, oneOf } = require('express-validator');


exports.register = [
		body('name').trim().isLength({ min: 3 }).withMessage('Must be at least 3 chars long'),
  		// oneOf([
			// 	body('phone').exists().trim().not().isEmpty(),
			// 	body('email').exists().trim().not().isEmpty()
			// ],'Email or phone is required'),
  		body('phone').trim().not().isEmpty()
		.isLength({ min:8, max:16}).withMessage("Phone must have min 7 and max 15 digits").bail()
		.matches(/(^\+\d*$)/).withMessage("Invalid phone format"),
		body('email').trim().not().isEmpty()
			.isEmail().withMessage('Must be a valid Email'),
	  //  body('password').trim().not().isEmpty().isLength({ min: 6 }).withMessage(' Password must be 6 character'),

];

exports.login = [
		body('password').exists().trim().not().isEmpty().isLength({ min: 6 }).withMessage('Invalid Password'),
		body('email').exists().trim().not().isEmpty().isEmail().withMessage('Must be a valid Email')
		];
exports.sendVerificationLink = [
	body('email').exists().trim().not().isEmpty().isEmail().withMessage('Must be a valid Email')
];
exports.checkCredential = [
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