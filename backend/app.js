const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/AuthRoutes');
const multiStepFormRoutes = require('./routes/MultiStepFormRoutes');
const feedRoutes = require('./routes/FeedRoutes');
require('dotenv').config();
const cors = require('cors');

const { Server } = require('ws');
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/api', authRoutes);
app.use('/api/multistepform', multiStepFormRoutes);
app.use('/api/feeds', feedRoutes);

const server = app.listen(process.env.PORT || 5000);

const wsServer =  new Server({server});

const clients = {};

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

wsServer.on('connection', function connection(ws) {
    console.log('connection received!');
    const userID = getUniqueID();
    clients[userID] = ws;
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
    ws.on('message', function(message, isBinary) {
        console.log('message rcvd');
        if (message) {
            for(key in clients) {
                clients[key].send(message , { binary: isBinary });
            }
        }
    })

});

mongoose
    .connect(process.env.DB_STRING)
    .then(() => {
        console.log('connected')
    })
    .catch(err => {
        //console.log(err);
    });

