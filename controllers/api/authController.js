const config = require('@config');
const models  = require('@models');
const helper = require('@helper');
const { successResponse, errorResponse } = require('@helper');
const Op = models.Sequelize.Op;
const userController = require('@controllers/api/userController');

const _ = require('lodash');
//const bcrypt = require('bcryptjs');
const bcrypt = require('bcrypt');
const { myValidationResult } = require('@middlewares/validate');

exports.register = async (req,res) => {
	// const errors = myValidationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(422).send(errorResponse(errors.array()));
    // }
    const searchCondition = {};
    let registeredByPhone = false;

    if(req.body.email) searchCondition.email = req.body.email;
    // else {
    // 	registeredByPhone = true;
    // 	searchCondition.phone = req.body.phone;
    // }
    //
    let model = await models.user.findOne({
    	where : {
    		[Op.and] : searchCondition
    	}
    });

    if(!model){
    	model =  models.user.build();
    }
    else if(model.status == 1) return res.status(422).send(errorResponse('Account already exists'));

    model.phone = req.body.phone;
    model.email = req.body.email;

    //const otp = helper.generateOTP();

    //Other params to be saved
    model.name = req.body.name;
    model.status = 3;
    model.step_completed = req.body.step;
    model.user_type = 2;
    model.fund_name = req.body.fund_name || null;
    model.country = req.body.country || null;
   // model.otp = otp;
   // const usernames= await helper.generateUsernames(model);
    //const response = await userController.sendOtp(model,registeredByPhone);
   const token = await helper.generateAuthToken({ id: model.id, type: 'registration' });
//let msg="User registered successfully"//${req.protocol}
     if(req.body.password) {

         let mailObj = {
             email : req.body.email,
             subject : `Account activation | ${config.APP_NAME}`,
             url  : `https://${ req.hostname}:${config.get("PROXY_PORT")}/activation?token=${token}`
         }
         let response = await helper.sendMail(mailObj,  'activation');
         // console.log(response);
         const salt = await bcrypt.genSalt(10);
         model.password = await bcrypt.hash(req.body.password , salt);
        // save user token
    //msg="Activation mail sent successfully";

    }
     model = await model.save();
    return res.header('X-Auth-Token', token).status(201).send(successResponse(req.body));
}
exports.login = async (req,res) => {
    let model = await models.user.findOne({
        where : {
            email : req.body.email
            // [Op.or] : [
            //     { phone: req.body.login_credential },
            //     { email : req.body.login_credential }
            // ],
           // status : 1
        }
    });
    if(!model) return res.status(422).send(errorResponse("User not registered"));
    const validatePassword = await bcrypt.compare(req.body.password, model.password);
    if(!validatePassword) return res.status(422).send(errorResponse("The email and password you entered didn't match our record. Please double check and try again!"));
    const token = helper.generateAuthToken({ id: model.id });
    if(model.status!=1) return res.status(403).header('X-Auth-Token', token).send(Object.assign({},errorResponse("User not activated"),{data:model} ));
    let response=successResponse(model);
    response.userImagePath=config.S3_BUCKET_URL+config.S3_USER_FILES_PATH;
    return res.header('X-Auth-Token', token).send({...response,token:token});
}
exports.checkCredential = async (req,res) => {
    const errors = myValidationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send(errorResponse(errors.array()));
    }

    const searchCondition = {};
    let loginByPhone = false;

    if(req.body.email) searchCondition.email = req.body.email;
    else {
        loginByPhone = true;
        searchCondition.phone = req.body.phone;
    }
    
    let model = await models.user.findOne({
        where : {
            [Op.and] : searchCondition,
            status : 1
        }
    });
    
    if(!model) return res.send(successResponse("Account available"));
    else return res.status(422).send(errorResponse("Account already exists"));
}
exports.sendVerificationLink = async  (req, res) =>{
    //console.log('userID', req.user.id);

        // console.log('id', req.user.id);
      const user= await models.user.findOne({
            where: {
                email: req.body.email,
               // id:{[Op.ne]:  req.authUser.id },
               // status :{$ne:0 }
            }
        });
               //console.log(user);
            // return res.send(user)
            if ( user.email==req.body.email) {

                    //  console.log('sdsadas',updateData)
                    let token = await helper.generateAuthToken({ id: user.id, type: 'resend link' }, 200);
                    let mailObj = {
                        email : user.email,
                        subject : `Account activation | ${config.APP_NAME}`,
                        url : `https://${ req.hostname}:${process.env.PORT}/activation?token=${token}`
                    };
                    let response = await helper.sendMail(mailObj,  'activation');
                    return res.send(successResponse(user));


            } else {
                // If user not exist then insert
                return res.status(401).send(errorResponse('Email ID already in use'));
            }


}
