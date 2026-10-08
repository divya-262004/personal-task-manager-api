const config=require('./config.js').default;

module.exports= {
  development: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port || 5432,
    dialect: 'postgres',
  },
};
