const config = {
    // app:
    port: process.env.PORT || 1580,
    host: process.env.HOST || "localhost",
    appName: process.env.APP_NAME || "E-Commerce",
    isProd: process.env.NODE_ENV || "DEVELOPMENT_ECOMMERCE_APP_0398",
    baseUrl: process.env.BASE_URL || "http://localhost:1500",
    // db:
    dbHost: process.env.DB_HOST || "cluster0.qsmhejc.mongodb.net",
    dbName: process.env.DB_DATABASE || "Project_ECOMMERCE_CV",
    dbUser: process.env.DB_USERNAME || "sayantan648",
    dbPass: process.env.DB_PASSWORD || "dYA7dsdYLE24peEN",
    // auth:
    jwtSecret: process.env.JWT_SECRET || "MyS3cr3tK3Y",
    jwt_expiresin: process.env.JWT_EXPIRES_IN || "1d",
    saltRounds: process.env.SALT_ROUND || 10,
    // refresh_token_secret:
    //   process.env.REFRESH_TOKEN_SECRET || "VmVyeVBvd2VyZnVsbFNlY3JldA==",
    // refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || "2d", // 2 days
    mailUser: process.env.MAIL_USERNAME || "sayan0301off@gmail.com",
    mailPass: process.env.MAIL_PASSWORD || "whug tmvi xyvd vqhj"
}

export default config