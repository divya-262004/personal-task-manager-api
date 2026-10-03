import { DataTypes } from "sequelize";
import sequelize from "../connection/database.js";

const User=sequelize.define(
    "User",
    {
        username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },

            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },

            password: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            tableName: "User",
            timestamps: true
        }
);

export default User;