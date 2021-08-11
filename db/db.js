const Sequelize = require('sequelize');
require('dotenv').config();
// connection
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABSE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    port: process.env.DATABASE_PORT,
    dialectOptions: {},
});
module.exports = {
    sequelize,
};
