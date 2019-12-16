const { body, oneOf } = require('express-validator');

exports.create = [
		body('name').exists().trim().withMessage('Name is required').bail(),
		body('email').exists().trim().withMessage('Email is required').bail()
			.isEmail().withMessage('Must be a valid Email'),
		body('message').exists().trim().withMessage('Message is required')
	];