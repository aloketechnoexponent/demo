const jwt = require('jsonwebtoken');
const config = require('@config');
const models = require('@models');
const helper = require('@helper');
const { errorResponse } = require('@helper');

module.exports = async function (req, res, next){
    let authorization = req.header('Authorization');
    if(!authorization) return res.status(401).send(errorResponse("Access Denied.No token provided"));

    try{
        authorization = authorization.split(" ");
        token = authorization[1];
        const decoded = jwt.verify(token, config.get("JWT_PRIVATE_KEY"));
        req.authData = decoded;       
        const authUser = await models.user.findByPk(decoded.id).catch((err)=>{console.log(err)});
        if(!authUser) return res.status(422).send(errorResponse("unable to find user"));
        req.authUser = authUser;    
        next();
    }
    catch(err){
        switch (err.name) {
            case 'TokenExpiredError':
                res.status(401).send(errorResponse("Token Expired"));
                break;
            case 'JsonWebTokenError':
                res.status(401).send(errorResponse("Invalid Token!"));
                break;
            default: 
                res.status(401).send(errorResponse("Unable to Process Token"));
                break;
        };
    }
}