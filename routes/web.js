'use strict';
const express = require('express');
const web_router = express.Router();
//const expressLayouts = require('express-ejs-layouts');
const config = require('@config');
const models = require('@models');
const frontCont = require('@controllers/web/frontendController');
module.exports = function(app) {
    web_router.get('/', frontCont.landing);
  //  web_router.use(expressLayouts);
    web_router.get('/share/*?:id', function (req, res, next) {
       // console.log('req', req);
        var userAgent=req.headers['user-agent'];
        //let requestSegments = req.path.split('.com/');
        if((userAgent.indexOf('iPhone')!=-1)||(userAgent.indexOf('iPad')!=-1)||(userAgent.indexOf('Android')!=-1)) {
           // res.redirect('joy-tell:/'+requestSegments+'?id='+req.query.id);
            res.redirect('joy-tell://share/?id='+req.query.id);
        }

        else{
            res.redirect(config.APP_URL);
        }
    });

    web_router.get('/activation',  frontCont.activateAccount);
    app.use('/', web_router);
}

// exports.renderMetaData = (req, res, next) => {
//     let campaignId = req.params.id;
//     campaignService.campaignById(campaignId, req, res, next, (campaign) => {
//         var imageLink = '';
//         if (campaign.coverImage) {
//             imageLink = config.mailer.appUrl + '/api/showFile/' + campaign.coverImage;
//         } else {
//             imageLink = config.mailer.appUrl + config.campaignDefaultImages[campaign.campaignType];
//         }
//         console.log(imageLink);
//         var locals = {
//             campaignTitle: campaign.campaignTitle,
//             description: campaign.description,
//             campaignUrl: config.mailer.appUrl + '/campaign-details/' + campaign._id,
//             campaignImage: imageLink
//         };
//         res.render('meta-data', locals);
//     });
// }