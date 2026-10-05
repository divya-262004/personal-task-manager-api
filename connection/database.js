import {Sequelize} from 'sequelize';
import config from '../config/config.js';

const sequelize=new Sequelize(

    config.database.name,
    config.database.user,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: 'postgres',
    },
);

export default sequelize;
