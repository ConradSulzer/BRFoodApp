const express = require('express');
require('dotenv').config();
require('../db/mongoose');
const MasterList = require('./models/restList')
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const public = path.join(__dirname, '../' + 'public');

app.use(express.static(public));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(public + '/index.html')
});

app.get('/restList', async (req, res) => {
    const restArray = await MasterList.find({})
    res.send(restArray);
});

app.listen(PORT, () => {
    console.log('Server runnig on port', PORT);    
});