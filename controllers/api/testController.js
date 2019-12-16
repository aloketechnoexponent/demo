const config = require('@config');
const models  = require('@models');
const helper = require('@helper');
const moment = require('moment');
const Op = models.Sequelize.Op;
const { errorResponse , successResponse } = require('@helper');

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const _ = require('lodash');
const jwt = require('jsonwebtoken');

exports.index = async (req, res) => {
	console.log('Testing...', req.path );

    let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImZvcmdvdFBhc3N3b3JkIiwiaWF0IjoxNTc0NzYzNzAxLCJleHAiOjE1NzQ3NjQwMDF9.O-FjKIR_Hlwwq3mIX-3Oo0Cl2kuZtkM0aq-akyexB-s';

	// await helper.sendMessage('+919632271621','Hi this is a test message').catch((ex) => { const flag = 1});
	// const user = await models.user.findByPk(2);
	// console.log(helper.generateUsername(user));
	// console.log('Testing ended...');
	//console.log(req.body);
	//console.log(helper.generateUsername2({name:"aloke sarkar"}));
    //let testdata =await 	helper.generateUsernames({id:100,name:"aloke sarkar"});
        //console.log('testdata', testdata)
   // let dt = moment('2019-01-11').format();
   // let date = "11/01/2019";
   // var newdate = date.split("/").reverse().join("-");
  //  let time =await moment.tz( newdate , "America/New_York").format('YYYY-MM-DD HH:mm:ssZ');
    //console.log('test', `${req.protocol}://${ req.hostname}:${config.get("PROXY_PORT")}`)
   let mailObj = {
        email :  'aloke@technoexponent.com', //debanjan@technoexponent.com//subhadip@technoexponent.com//shankha@technoexponent.com//system@codexfund.com
        subject : `One Time Password | ${config.APP_NAME}`,
        url :`${req.protocol}://${ req.hostname}:${config.get("PROXY_PORT")}/activation?token=${token}`
//          body : `<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Title</title><link href="https://fonts.googleapis.com/css?family=Poppins:400,500,600&display=swap" rel="stylesheet"><style>body{margin:0 !important;padding:0 !important;font-family:\'Poppins\',sans-serif}</style></head><body cz-shortcut-listen="true"><div style="width:770px;margin:auto;border:1px solid #e9e6e8;"><table style="height: 113px;background-color: #692c83;margin: 0;width:100%;"><tbody><tr><td style="width:25px;"></td><td style="vertical-align: center;font-size: 30px; font-weight: bold; font-style: normal; font-stretch: normal; line-height:109px; letter-spacing: normal; color: #ffffff;text-align: center;">Welcome to ${config.APP_NAME}</td><td style="width:25px;"></td></tr></tbody></table><div style="height:25px"></div><table style="margin: 0;width:100%;"><tbody><tr><td style="width:33px;"></td><td><p style=" margin: 0; font-size: 20px; font-weight: 500; line-height: 34px;">Hi ,</p><div style="height:20px"></div><div style="height:10px"></div><p style="color: #535353; margin: 0; font-size: 25px;">To verify your e-mail address with ${config.APP_NAME}, please visit this page: <a href="${config.APP_URL}activation?token=${token}">${ config.APP_URL}activation?token=${token}</a>  </p><div style="height:20px"></div></td><td style="width:33px;"></td></tr><tr><td></td><td><p style="color: #535353; margin: 0; font-size: 25px;">Regards,</p><table style="margin: 0;width:100%;"></td></tr></tbody></table><div style="height:30px;"></div><tbody><tr><td style="width:33px;"></td><td> <a href="{SITE_LINK}"> <img style="width: 160px; display: block;" src="http://template1.teexponent.com/commission-tech/html/assets/images/logo.png"></a> <span style="color: #9086a3; font-size: 13px; display: inline-block; line-height: 50px;"> © 2018-2019 ${config.APP_NAME}. All Rights Reserved.</span></td><td style="width:33px;"></td></tr></tbody></table><div style="height:100px;"></div></div>
// </body></html>`
    }
    await helper.sendMail(mailObj, 'activation');
	    return res.send({"test":req.hostname, test2: req.headers.host});
}
exports.notificationTest = async (req, res) => {
  let  message = {

          title: '$GOOG up 1.43% on the day',
          body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',

  };
    helper.sendNotification2([124,150],JSON.stringify({'username':'aloke'}),JSON.stringify(message)).then((data)=>{
        res.send(data)
    }).catch((err)=>{
        res.status(401).send(err);
    })
}
exports.generateToken = async(req, res) => {
	let model = null;
	if(req.body.id){
		model = await models.user.findByPk(req.body.id);
	} else if(req.body.email) {
		model = await models.user.findOne({ where : { email : req.body.email }});
	} else if(req.body.phone) {
		model = await models.user.findOne({ where : { phone : req.body.phone }});
	}
	if(model)
		return res.send(successResponse({
			token : helper.generateAuthToken({ id: model.id }),
			req : req.body
		}));
	else
		return res.send(errorResponse('User not found'));
}
exports.findUserByToken = async(req, res) => {
	try {
		const decoded = jwt.verify(req.body.token, config.JWT_PRIVATE_KEY);
		const authUser = await models.user.findByPk(decoded.id);
		const data = {
			decoded,
			authUser
		};
		return res.send(successResponse(data));
	}
	catch (ex){
		return res.send(errorResponse(ex));
	}
}
exports.uploadFile = async(req, res) =>{

 //   var upload = multer({ storage: storage }).single('file');
},
    exports.following_each_other = async (req, res)=>{
	const perPage=20;
    var  model;
    const followings_ids=[];
    const page = +req.query.page || 1;
    const offset = (perPage * page) - perPage;
    const already_following=await models.following.findAll({
        where : {follower_id : req.authUser.id}
    });
    already_following.forEach(function(item){
        followings_ids.push(item.following_id);
    })
    const following_each_other=await models.following.findAll({
		where : {follower_id : {[Op.in]:followings_ids}, following_id: req.authUser.id},
	});
	const following_each_other_ids=[];
	following_each_other.forEach(function(item){
        following_each_other_ids.push(item.follower_id);
    })
    model = await models.user.findAndCountAll({
          attributes: ['id', 'name', 'username', 'profile_image'],
          where: {id: {[Op.in]:following_each_other_ids},
       
        },
        order: [
        ['count_followers', 'DESC'],
        ],
        offset: offset,
        limit: perPage
    });
  console.log(model);
    let resData = {};

    resData.model = model.rows;
    resData.itemCounter = offset ? offset + 1 : 1;
    resData.current = page;
    resData.pages = Math.ceil(model.count / perPage);

   return res.status(200).send(successResponse(resData));
}
exports.mailgunWebhook = async (req, res)=>{
//console.log('mailgun',req.body);
res.send(req.body);
}