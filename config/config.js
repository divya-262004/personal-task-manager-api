const config = {
  port: process.env.PORT || 3000,

  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
  },
};

export default config;
