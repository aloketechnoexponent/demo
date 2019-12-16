const config = require('@config');
const models = require('@models');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const jwt = require('jsonwebtoken');
const handlebars = require("handlebars");
const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const Op = models.Sequelize.Op;
const _ = require('lodash');
const randomstring = require("randomstring");
const moment = require("moment");
const dotenv = require('dotenv');
const mime = require('mime');
dotenv.config();
const s3 = new AWS.S3({
    accessKeyId: config.get("S3_ACCESS_KEY_ID"),
    secretAccessKey: config.get("S3_SECRET_ACCESS_KEY")
});
let auth = {
    auth: {
        api_key: config.get("MAILGUN_API_KEY"),
        domain:config.get("MAILGUN_DOMAIN")
    },
   // host: 'api.mailgun.net'
   // proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
};

const transporter =nodemailer.createTransport(mg(auth));


// const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST || config.get('MAIL_HOST'),
//     port: process.env.MAIL_SMTP_PORT || config.get('MAIL_SMTP_PORT'),
//     secure: true, // true for 465, false for other ports
//     auth: {
//         user: process.env.MAIL_USERNAME || config.get('MAIL_USERNAME'), // generated ethereal user
//         pass: process.env.MAIL_PASSWORD || config.get('MAIL_PASSWORD')  // generated ethereal password
//         //pass: new Buffer.from(config.MAIL_CONFIG.MAIL_PASSWORD,'base64').toString('ascii'),
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });



exports.errorResponse = (errors) => {
	return { 
		success : false, 
		errors: typeof(errors) == 'string' ? [{message : errors}]: errors
	}
}

exports.successResponse = (data) => {
    return { 
        success : true, 
        data: typeof(data) == 'string' ? {message : data} : data 
    }
}

exports.generateOTP = function(){
    let OTP = config.IS_LIVE == 1 ? Math.floor(1000 + Math.random() * 9000) : 1111;
    return OTP;
}

exports.sendMail = async(mailObj, templates) => {
   return  new  Promise((resolve,reject)=>{
       const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../helpers/"+templates+".hbs"), "utf8")
       const template = handlebars.compile(emailTemplateSource);
       const htmlToSend = template({URL: mailObj.url })
         transporter.sendMail({
            from:{name: 'Codex Fund System', address: config.get("FROM_MAIL")},
            // from:{name: 'Codex Fund System', address: 'brad@mg.codexfund.com'},
            // from: 'system@codexfund.com' ,
             // from: 'aloke@technoexponent.com' ,
            //from: config.APP_NAME+' <'+ config.ADMIN_EMAIL +'>',
            //from: config.APP_NAME+' <6590903@gmail.com>',
            to: mailObj.email || 'aloke@technoexponent.com',
            subject: mailObj.subject || 'test mail',
            // text:'Hi mail triggered'
           html: htmlToSend || 'Hi mail triggered'
        }).then((data)=>{
            console.log('mail sent', data);
             resolve( data);
        }).catch((ex) =>{ console.log(ex); reject('error'); });
    })

}

exports.generateAuthToken = (payload,expiresIn = 31536000) => {
    const token = jwt.sign(payload, config.get("JWT_PRIVATE_KEY"), { expiresIn });
    return token;
}


exports.generateFileName = (fileName, fileType='') => {
    let newFileName = '';
    if(fileType) newFileName += `${fileType}_`; 
    newFileName += Date.now() + '_' + randomstring.generate(10) + path.extname(fileName);
    return newFileName;
}

exports.uploadToS3 = (fileName, uploadFolder, deleteLocal = true) => {
    const filePath = config.get("UPLOAD_TEMP_PATH") + fileName;
    const uploadPath = `${uploadFolder}${fileName}`;
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, data) => {
                if (err) reject(err);
                const params = {
                    Bucket: config.get("S3_BUCKET"),
                    ACL: "public-read",
                    Key: uploadPath,
                    ContentType : mime.getType(fileName),
                    Body: new Buffer.from(data)
                };
                const options = {
                    partSize: 10 * 1024 * 1024
                };
                s3.upload(params, options, function (s3Err, data) {
                    if (s3Err) {
                        console.error(s3Err);
                        reject(s3Err);
                    } else {
                        if (deleteLocal) {
                            fs.unlink(filePath, function () {
                                console.log(`File uploaded successfully at ${data.Location}`);
                                resolve(data.Location);
                            });
                        }
                        else {
                            console.log(`File uploaded successfully at ${data.Location}`);
                            resolve(data.Location);
                        }
                    }
                });
            });
        }
        else reject("File Not Found");
    });
};

//Call By =>  helper.deleteFromS3('test.png','user_images');
exports.deleteFromS3 = function (fileName, uploadFolder) {
    const params = {
        Bucket: config.get("S3_BUCKET"),
        Key: `${uploadFolder}${fileName}`
    };
    s3.headObject(params, function (err, metadata) {
        if(err){
            console.error(err.code);
        } else {
            s3.deleteObject(params, function(err, data) {
                if(err) {
                    console.error(err, err.stack);
                } else console.log("File Deleted");
            });
        }
    });
};

exports.dateDiffInHour = function (date1, date2=new Date()){
    const now = moment(date2); //todays date
    const end = moment(date1); // another date
    let duration = moment.duration(now.diff(end));
  //  var days = duration.asDays();
   return parseInt( duration.asHours());

}



exports.sliceArray= (inputArray, perChunk=2)=>{
   return inputArray.reduce((all,one,i) => {
        const ch = Math.floor(i/perChunk);
        all[ch] = [].concat((all[ch]||[]),one);
        return all
    }, [])

}