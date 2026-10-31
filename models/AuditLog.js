import { DataTypes } from "sequelize";
import sequelize from '../connection/database.js';

const AuditLog= sequelize.define(
    'AuditLog',
    {
        id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
    }
    }
)