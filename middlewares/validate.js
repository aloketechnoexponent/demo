const { errorResponse } = require('@helper');
const { validationResult } = require('express-validator');

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = this.myValidationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(422).send(errorResponse(errors.array()));
  };
};

exports.myValidationResult = validationResult.withDefaults({
  formatter: (error) => {
     return {
		param : error.param,
		message : error.msg,
		// value : error.value
    };
  }
});