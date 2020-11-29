const config = { 
    database: 'paper_trading',
    username: 'root',
    password: '',
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        // acquire: 30000,
        idle: 10000,
    },
    privateKey: "$$$papertrading$$$",
};

module.exports = config;
