 const jwt =require("jsonwebtoken");

const config = require('./../../config.json');
 let models = require('../../models');
const frontendController={
    landing : function (req, res) {
        res.render('index', {
            config: config,
            title: 'Fund Manager',
            web_assets: config.SITE_ASSET_URL
        });
    },
    activateAccount : function (req, res, next) {
        var userAgent=req.headers['user-agent'];
        const  token= req.query.token;
        if (token) {
            jwt.verify(token, config.JWT_PRIVATE_KEY, function(err, decoded) {
                //console.log('Decoded:', decoded)
                if (err) {
                    switch (err.name) {
                        case 'TokenExpiredError':
                            res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Link Expired!" });
                            // res.status(400).json({
                            //     error: true,
                            //     errors:[{message: "Link Expired!"}]
                            // });
                            break;
                        case 'JsonWebTokenError':
                            res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Invalid Token!" });
                            // res.status(400).json({
                            //     error: true,
                            //     errors:[{message: "Invalid Token!"}]
                            // });
                            break;
                        default:
                            res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Unable to Process Token!" });
                            // res.status(400).json({
                            //     error: true,
                            //     errors:[{message: "Unable to Process Token"}]
                            // });
                            break;
                    }
                } else {
                    models.user.findOne({
                        where: {
                            id: decoded.id
                        }
                    }).then(function (user) {
                        if (user) {
                            user.status=1;
                            user.save();
                            //if(user.otp){

                                //res.redirect(config.SITE_URL+'signup-individual/step3?token='+token);
                                res.redirect(`${config.SITE_URL}?login/token=${token}`);

                            // }else{
                            //     res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Account already verified! Now you can login.<a href='"+config.SITE_URL+'login'+"'>Login Now</a> " });
                            // }

                            // req.user = obj;
                            // next();
                            // return null;
                        } else {
                            res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Invalid user" });
                            // return  res.status(400).json({
                            //     error: true,
                            //     errors:[{message: "Invalid user"}]
                            // });
                        }
                    }).catch((err)=>{
                        res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Invalid user" });
                    })
                }
            });
        } else {
            res.render('custom_error', {layout: 'admin/layouts/main.ejs', msgz : "Missing authorisation token" });
            // res.status(400).json({
            //     error: true,
            //     errors:[{ message: "Missing authorisation token"}]
            // });
        }

    },

}
module.exports=frontendController;


// exports.terms = function (req, res) {
//     res.render('terms', {
//         config: config,
//         title: 'Terms and Conditions',
//         web_assets: config.SITE_ASSET_URL
//     });
// };
//
// exports.privacy = function (req, res) {
//     res.render('privacy', {
//         config: config,
//         title: 'Privacy Policy',
//         web_assets: config.SITE_ASSET_URL
//     });
// };
//
// exports.eula = function (req, res) {
//     res.render('eula', {
//         config: config,
//         title: 'End User License Agreement',
//         web_assets: config.SITE_ASSET_URL
//     });
// };
//
// exports.test = function (req, res) {
//     const path = 'uploads/chatvideos/a.mp4';
//     const stat = fs.statSync(path);
//     const fileSize = stat.size;
//     const range = req.headers.range;
//     if (range) {
//         const parts = range.replace(/bytes=/, "").split("-")
//         const start = parseInt(parts[0], 10)
//         const end = parts[1]
//             ? parseInt(parts[1], 10)
//             : fileSize - 1
//         const chunksize = (end - start) + 1
//         const file = fs.createReadStream(path, {start, end})
//         const head = {
//             'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//             'Accept-Ranges': 'bytes',
//             'Content-Length': chunksize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(206, head);
//         file.pipe(res);
//     } else {
//         const head = {
//             'Content-Length': fileSize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(200, head)
//         fs.createReadStream(path).pipe(res)
//     }
// };