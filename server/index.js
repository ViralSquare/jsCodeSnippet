const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const color = require('colors');
const cors = require('cors');
// add alias
require('module-alias/register');
// add env
dotenv.config({ path: '../backend/config/config.env' });
//add firebase to verify phone auth for mobile app
const admin = require('firebase-admin');
const { protectRoute } = require('@middleware/auth');
const api = require('api');
const errorHandler = require('@middleware/errorhandler.js');
const connetDB = require('./config/db.js');

const serviceAccount = './firebase/vschatapp-8a21d-firebase-adminsdk-epi8z-92f517eb68.json';
const app = express();

const allowedOrigins = ['https://testnet.flote.app:4200', 'https://api.testnet.flote.app', 'http://localhost:4200'];
app.use(cors({
    origin(origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (!allowedOrigins.includes(origin)) {
            const msg = 'The CORS policy for this site does not '
                + 'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
// use middleware
app.use(morgan('dev'));
app.use(express.json());
// routes
app.use('/api/v1/auth', protectRoute, api);// protected Routes,
app.use('/api/v1/firebase', api); // Public Routes
app.use(errorHandler);
// firebase admin initializing
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// connection to the database
connetDB.sequelize.authenticate().then((response) => {
    console.log(response);
}).catch((error) => {
    console.log(error);
});
// define the port of connection
const port = process.env.PORT || 5000;

const server = app.listen(
    port,
    console.log(
        `Server is running in ${process.env.NODE_ENV} on port ${process.env.PORT} `
            .yellow.bold,
    ),
);
process.on('unhandledRejection', (err, promisee) => {
    server.close(() => process.exit(1));
});
