const config = require('@config');
const models  = require('@models');
const helper = require('@helper');
const { successResponse , errorResponse } = require('@helper');
const Op = models.Sequelize.Op;
const _ = require('lodash');
const { myValidationResult } = require('@middlewares/validate');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
//const bcrypt = require('bcryptjs');
const bcrypt = require('bcrypt');

exports.sendOtp = async (user,byPhone=true) => {
    try {
        const otp = user.otp;
        if(byPhone){       
            await helper.sendMessage(user.phone,`Your ${config.APP_NAME} verification code is ${otp}`);
        }
        else {
            mailObj = {
                email : user.email,
                subject : `One Time Password | ${config.APP_NAME}`,
                body : `Your OTP is ${user.otp}`
            }
            await helper.sendMail(mailObj);
        }
        return true;
    } catch (ex) {
        return false; //Expecting the error to be only invalid number
    }
	
}
exports.verifyOtp = async (req,res) => {
	if(req.authUser.otp == req.body.otp && req.authUser.otp != null){

        if(req.authData.type == 'forgotPassword'){ // Verification during forgotPassword
            const salt = await bcrypt.genSalt(10);
            req.authUser.password = await bcrypt.hash('social@default', salt);
        } else if(req.authData.type == 'registration') { // Verification during registration
            req.authUser.status = 2; 
        }
        
        req.authUser.otp = null;
        req.authUser = await req.authUser.save();

		const token = helper.generateAuthToken({ id: req.authUser.id });
    	return res.header('X-Auth-Token', token).send(successResponse(req.authUser));
	} 
	else {
		return res.status(422).send(errorResponse('Incorrect OTP'));
	}
}
exports.resendOtp = async (req,res) => {

    const errors = myValidationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send(errorResponse(errors.array()));
    }

    const searchCondition = {};
    let registeredByPhone = false;

    if(req.body.email) searchCondition.email = req.body.email;
    else {
        registeredByPhone = true;
        searchCondition.phone = req.body.phone;
    }

    let model = await models.user.findOne({
        where : {
            [Op.and] : searchCondition
        }
    });

    if(!model){
        return res.status(422).send(errorResponse('Account does not exists'));
    }
   // else if(model.status == 0) return res.status(422).send(errorResponse('Account already exists'));

    if(registeredByPhone) model.phone = req.body.phone;
    else model.email = req.body.email;
    const otp = helper.generateOTP();

    //Other params to be saved
   // model.status = 3;
   // model.user_type = 2;
    model.otp = otp;

    const response = await exports.sendOtp(model,registeredByPhone);

    if(response) {
        model = await model.save();
        const token = helper.generateAuthToken({ id: model.id, type: 'resendOTP' }, 300);
        return res.status(200).header('X-Auth-Token', token).send(successResponse("OTP Sent Successfully"));
    } else {
        return res.status(422).send(errorResponse(`The number '${model.phone}' is not a valid phone number`));
    }
}
exports.updatePassword = async (req,res) => {
	req.body.old_password = req.body.old_password || 'fund@default';
	const validatePassword = await bcrypt.compare(req.body.old_password, req.authUser.password);
    if(!validatePassword) return res.status(422).send(errorResponse("Incorrect old password"));
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.new_password, salt);
    await models.user.update({ status: 1, password},{
    	where : {id : req.authUser.id}
    });
    return res.status(201).send(successResponse("Password Updated Successfully"));
}
exports.resetPassword = async (req,res) => {
    req.body.new_password = req.body.new_password || 'fund@default';
    const validatePassword = await bcrypt.compare(req.body.new_password, req.authUser.password);
    if(validatePassword) return res.status(422).send(errorResponse("You can not use the same password as previously set"));
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.new_password, salt);
    await models.user.update({ status: 1, password},{
        where : {id : req.authUser.id}
    });
    return res.status(201).send(successResponse("Password Updated Successfully"));
}
exports.mytest = async (req,res) => {
    res.send("get test data");
}
exports.forgotPassword = async (req,res) => {
    console.log("forgotPassword controller",req.body);
	// const errors = myValidationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(422).send(errorResponse(errors.array()));
    // }

    const searchCondition = {};
   // let byPhone = false;

    if(req.body.email) searchCondition.email = req.body.email;
    // else {
    //     byPhone = true;
    //     searchCondition.phone = req.body.phone;
    // }
    
    let model = await models.user.findOne({
        where : {
            [Op.and] : searchCondition,
           // status : 1
        }
    });
    
    if(!model) return res.status(422).send(errorResponse("Account doesn't exist"));
    if( model.status!=1) return res.status(422).send(errorResponse("Account Not Activated"));
    const token = helper.generateAuthToken({ id: model.id, type: 'forgotPassword' }, 300);
    let mailObj = {
        email : req.body.email,
        subject : `Reset Your Password | ${config.APP_NAME}`,
        url : `${ req.headers.host}/resetPassword?token=${token}`
    }
    let response = await helper.sendMail(mailObj, 'activation');
    if(response) {
        return res.header('X-Auth-Token', token).send(successResponse("Email Sent Successfully"));
    } else {
        return res.status(422).send(errorResponse(`Email-Id is not valid`));
    }    
}
exports.me =  async (req,res) => {
    const token = helper.generateAuthToken({ id: req.authUser.id });
    let response= successResponse(req.authUser);
    response.userImagePath=config.S3_BUCKET_URL+config.S3_USER_FILES_PATH;
    return res.header('X-Auth-Token', token).send(response);
}
exports.checkUserNameAvailable =  async (req,res) => {
    let userName = '@';
    userName += req.body.username.toLowerCase();
    let model = await models.user.findOne({
        where : {
            [Op.and] :{ username:userName, id:{[Op.ne]:req.authUser.id} }
        }
    });
    if(model)
    {
        res.status(422).send(errorResponse(`Username '${req.body.username}' already exist!`));
    }else{
        res.send(successResponse("Available"));
    }
}
exports.updateProfile = async (req,res) => {
    let model = await models.user.findByPk(req.authUser.id);
    model.name = req.body.name || model.name;
    model.country = req.body.country || model.country;
    model.city = req.body.city || model.city;
    model.street = req.body.street || model.street;
    model.suite = req.body.suite || model.suite;
    model.house = req.body.house || model.house;
    if(req.body.username){
        let userName = '@';
        userName += req.body.username.toLowerCase();
        let model = await models.user.findOne({
            where : {
                [Op.and] :{ username:userName, id:{[Op.ne]:req.authUser.id} }
            }
        });
        if(model)
        {
            req.body.username= model.username
        }else{
            req.body.username=userName
        }
    }
    //console.log('file',req.file);
   // console.log('profile_image',req.profile_image);
   // model.username = req.body.username?req.body.username.toLowerCase() : model.username;
    if (req.files && Object.keys(req.files).length > 0) {

        // console.log('files', req.files);
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let profileImage = req.files.profile_image;
        // let ext = profileImage.name.slice(profileImage.name.lastIndexOf('.'));
        // let fileName = randomstring.generate(30) + ext;

        let fileName= helper.generateFileName(profileImage.name ); //config.get("USER_FILES_PATH")'./temp'
        let saveTo = path.join(config.get("UPLOAD_TEMP_PATH"),fileName );
        // Use the mv() method to place the file somewhere on your server
        console.log('saveTo', saveTo);
        if(fileName && (fileName!=model.profile_image)){
            helper.deleteFromS3(model.profile_image, config.get("USER_FILES_PATH"));
        }
        profileImage.mv(saveTo, async function (err) {
            if (err)
                console.log(err);
               // return res.status(500).send(err);
            if(!err){


                helper.uploadToS3(fileName, config.get("USER_FILES_PATH"));
            }

        });
        model.profile_image  = fileName || model.profile_image;
        model = await model.save();
        return res.send(successResponse(model));
    }else{
        model = await model.save();
        return res.send(successResponse(model));
    }
    // model = await model.save();
    // return res.send(successResponse(model));


}
exports.changeStatus = async (req,res) => {
  // console.log( req.authUser.id);
  // console.log('password', req.body.password , req.authUser.password);
    if(req.body.password )
    {
        const validatePassword = await bcrypt.compare(req.body.password, req.authUser.password).catch((err)=>{
            console.log(err);
        });
        if(!validatePassword) return res.status(422).send(errorResponse("Incorrect  password"));
    }
    let msg="Account "
   if( req.body.status==="0") msg+="deactivated successfully";
   if( req.body.status==="1") msg+="activated successfully";
  await  models.user.update({status : parseInt(req.body.status)},{
        where : {   id : req.authUser.id }
    }).then((data)=>{
        return res.send(successResponse(msg));
    }).catch((err)=>{
       return res.status(422).send(errorResponse("Internal DB error"));
    });

}
exports.deleteUserPermanently = async (req,res) => {
    // console.log( req.authUser.id);
    // console.log('password', req.body.password , req.authUser.password);
    await  models.user.findAll( {
        where : {  status : 'D'}
    }).then((data)=>{

        data.forEach(function (user) {
            let deActivedTime=helper.dateDiffInHour(user.updatedAt)
            if(deActivedTime>47 && deActivedTime<48){
                if(user.email)
                {
                    let mailObj = {
                        email :  user.email,
                        subject : `Account deactivation warning | ${config.APP_NAME}`,
                        body : `Your account going to be delete permanently in an hour!  Please login an activate your account`
                    }
                     helper.sendMail(mailObj);
                }else if(user.phone){
                     helper.sendMessage(user.phone,`Your ${config.APP_NAME} account going to be delete permanently in an hour!Please login an activate your account`);
                }else{

                }

            }else if(deActivedTime>48){
                models.feed.findAll({
                    attributes:['file_name'],
                    where:{user_id:user.id}
                }).then((files)=>{
                    if(files.length)
                    {
                        files.forEach(function (file) {
                            helper.deleteFromS3(file, 'feed_image');
                        })
                    }

                })
               if(user.profile_image) helper.deleteFromS3(user.profile_image, 'user_images');
               if(user.cover_image) helper.deleteFromS3(user.cover_image, 'user_images');
                models.user.destroy({where: {id: user.id}});
            }else{
                console.log('deActivedTime'+user.id, deActivedTime);
            }

        })
      //  console.log(days, hours);
        // var duration = moment.duration(end.diff(data[0].updatedAt));
        // var hours = duration.asHours();
      //  return res.send(successResponse(data));
    }).catch((err)=>{
        console.log(err);
      //  return res.status(422).send(errorResponse("Internal server error"));
    });

}
exports.searchuser = async (req,res) => {
     const perPage=req.query.perPage ||config.PER_PAGE;
     let successResponse = {'status': 'success'}; // Reset response
    const page = +req.query.page || 1;
    const offset = (perPage * page) - perPage;
    const searchFilter = searchFilters(req.query.searchparams);
    var block_user_list=[];
    const checked_if_block=await models.block_user.findAll({
        where:{blocked_by : req.authUser.id}
    });
    checked_if_block.forEach(function(item){
        block_user_list.push(item.user_id);
    })
    const model = await models.user.findAndCountAll({
        attributes:['id', 'name', 'username', 'profile_image'],
        where : {
            status:1,
            [Op.or]: searchFilter,
            id: {[Op.notIn]:block_user_list}
        },
        offset: offset,
        limit: perPage,
    });

    let pagination = {};
    pagination.perPage = perPage;
    pagination.page = page;
    pagination.totalCount = model.count;
    pagination.pages = Math.ceil(model.count / perPage); 

    successResponse.data = model.rows;
    successResponse.userImagePath = `${config.S3_BUCKET_URL}${config.S3_USER_FILES_PATH}`;
    successResponse.pagination = pagination;
    
    return res.send(successResponse);
};
exports.detail = async (req,res )=> {
    const user_deatails= await models.user.findOne({
        where:{id:req.body.user_id},
        include:[{
            model:models.following,
            attributes:['status','allow_notification'],
            where:{follower_id : req.authUser.id},
            as:'followings_user',
            required: false,
        }]
    });
    if(user_deatails){
       let response= successResponse(user_deatails);
        response.userImagePath=config.S3_BUCKET_URL+config.S3_USER_FILES_PATH;
        return res.status(201).send(response);
    }
    else{
        return res.status(422).send(errorResponse("user is no longer exist"));
    }
  
}

function searchFilters(searchparams){
    let searchFilter = {}
    if(!searchparams){
        searchFilter.user_type=2
        //searchFilter.status=1
        return searchFilter
    };
    searchparams ? searchFilter.name ={[Op.like]: '%'+searchparams+'%'} : '';
    searchparams ? searchFilter.email = {[Op.like] : '%'+searchparams+'%'} : '';
    searchparams ? searchFilter.username = {[Op.like] : '%'+searchparams+'%'} : '';
    return searchFilter;
}
//======================CRON JOB==============================

// let job = new CronJob({
//    // cronTime: '0 */12 * * 0-6',
//     cronTime: '0 59 * * * 0-6',
//     onTick: function() {
//         console.log('CronJob', new Date());
//         /*
//          * Runs every 12 hours
//          *
//          */
//         exports.deleteUserPermanently();

//     },
//     onComplete: function () {
//         console.log("Finished cron job...");
//     },
//     start: true,
//     // timeZone: 'America/Los_Angeles'
// });

//console.log('cronjob status', job.running, new Date().getTimezoneOffset()/ -60);
// console.log('cronjob status', job.running, new Date());

//22.10.19 user details