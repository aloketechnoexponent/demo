'use strict';
const express = require('express');
const api_router = express.Router();
const auth_api_router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('@config');
const models = require('@models');
const auth = require('@middlewares/auth');
const { validate } = require('@middlewares/validate');
//const upload = require('@middlewares/upload');
// route middleware to verify a token
//var multer  = require('multer')
//var upload = multer()
auth_api_router.use(auth);


module.exports = function(app) {
	/*------------------ Controllers Declarations ---------------------------*/
    const testCont = require('@controllers/api/testController');
    const authCont = require('@controllers/api/authController');
    const userCont = require('@controllers/api/userController');
    /*---------------------- Filters Declarations ---------------------------*/
   // const testFltr = require('@filters/api/testFilter');
    const authFltr = require('@filters/api/authFilter');
    const userFltr = require('@filters/api/userFilter');
    /*--------------- Unauthorised Routes Start Here -------------------------*/
	app.use('/api', api_router);

	//Test Controller
	api_router.all('/test', testCont.index); // validate(testFltr.index) notificationTest ,
	api_router.post('/test/user-by-token', testCont.findUserByToken);
	api_router.post('/test/token', testCont.generateToken);
	api_router.post('/mailgun/message', testCont.mailgunWebhook );

	//AuthController
	api_router.post('/auth/register', validate(authFltr.register) , authCont.register);
	api_router.post('/auth/login', validate(authFltr.login) , authCont.login);
	api_router.put('/auth/verification-link', validate(authFltr.sendVerificationLink) , authCont.sendVerificationLink);
	//api_router.post('/auth/check', authFltr.checkCredential , authCont.checkCredential);
	
	//UserController
	api_router.post('/user/forgot-password', validate(userFltr.forgotPassword), userCont.forgotPassword);
	api_router.post('/user/mytest',userCont.mytest);

    /*--------------- Authorised Routes Start Here -------------------------*/


	//UserController

	auth_api_router.post('/user/update-password', validate(userFltr.updatePassword), userCont.updatePassword);
	auth_api_router.post('/user/reset-password', validate(userFltr.resetPassword), userCont.resetPassword);
	auth_api_router.get('/user/me', userCont.me);
	//auth_api_router.get('/user/search', userCont.searchuser);
	//auth_api_router.put('/user/images', userCont.updateImages);
	auth_api_router.patch('/user/profile',validate(userFltr.updateProfile), userCont.updateProfile);
	auth_api_router.put('/user/changeStatus',validate(userFltr.changeStatus), userCont.changeStatus);
	auth_api_router.post('/user/detail', userCont.detail);



	app.use('/api', auth_api_router);
	
};
