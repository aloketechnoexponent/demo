const convict = require('convict');
const dotenv = require('dotenv');
dotenv.config();
// Define a schema
const conf = convict({
    APP_NAME :{
        doc: "My app name",
        format: String,
        default: "My App",
        env: "APP_NAME",
    },
    ADMIN_EMAIL :{
        doc: "Admin Email",
        format: String,
        default: "YOUR EMAIL",
        env: "ADMIN_EMAIL",
    } ,
    FROM_MAIL :{
        doc: "Domain Email",
        format: String,
        default: "YOUR EMAIL",
        env: "FROM_MAIL",
    } ,
    JWT_PRIVATE_KEY :{
        doc: "JWT Key file",
        format: String,
        default: "YOUR KEY",
        env: "JWT_PRIVATE_KEY"
    } ,
    PER_PAGE:{
        doc: "Listing.",
        format: Number,
        default: 20,
        env: "PER_PAGE"
    },
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development", "test"],
        default: "development",
        env: "NODE_ENV"
    },
    MAIL_HOST: {
        doc: "SMTP HOST",
        format: String,
        default: "",
        env: "MAIL_HOST",
    },
    MAIL_SMTP_PORT: {
        doc: "SES mail with non ssl port",
        format: "port",
        default: 587,
        env: "PORT"
    },
    MAIL_USERNAME: {
        doc: "SES mail username",
        format: String,
        default: "YOUR SES MAIL USERNAME",
        env: "MAIL_USERNAME"
    },
    MAIL_PASSWORD: {
        doc: "The port to bind.",
        format: String,
        default: "YOUR PASSWORD",
        env: "MAIL_PASSWORD"
    },
    MAILGUN_API_KEY: {
        doc: "API key.",
        format: String,
        default: "YOUR API KEY",
        env: "MAILGUN_API_KEY"
    },
    S3_ACCESS_KEY_ID: {
        doc: "API key.",
        format: String,
        default: "",
        env: "S3_ACCESS_KEY_ID"
    },
    S3_SECRET_ACCESS_KEY: {
        doc: "Access key.",
        format: String,
        default: "",
        env: "S3_SECRET_ACCESS_KEY"
    },
    MAILGUN_DOMAIN: {
        doc: "Mail gun domain.",
        format: String,
        default: "YOUR DOMAIN",
        env: "MAILGUN_DOMAIN"
    },
    USER_FILES_PATH: {
        doc: "Files Upload path.",
        format: String,
        default: "uploads/user_images/",
        env: "USER_FILES_PATH"
    },
    UPLOAD_TEMP_PATH: {
        doc: "Files Upload path.",
        format: String,
        default: "temp/",
        env: "UPLOAD_TEMP_PATH"
    },
    S3_BUCKET: {
        doc: "Bucket Name",
        format: String,
        default: "YOUR BUCKET NAME",
        env: "S3_BUCKET"
    },
    ip: {
        doc: "The IP address to bind.",
        format: "ipaddress",
        default: "127.0.0.1",
        env: "IP_ADDRESS",
    },
    port: {
        doc: "The port to bind.",
        format: "port",
        default: 3002,
        env: "PORT"
    },
    PROXY_PORT: {
        doc: "The port to bind.",
        format: "port",
        default: 3000,
        env: "PROXY_PORT"
    }
});
//conf.loadFile([ './config.json']);
// Perform validation
conf.validate({strict: true});

module.exports = conf;