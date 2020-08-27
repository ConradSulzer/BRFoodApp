const mongoose = require('mongoose');

const masterListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    meals: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    genre: [],
    image: {
        type: String,
        trim: true
    }, 
    lat: {
        type: String,
        required: true,
        trim: true
    },
    long: {
        type: String,
        required: true,
        trim: true
    },
    phoneOrder: Boolean,
    onlineOrder: Boolean,
    delivery: Boolean,
    pickup: Boolean,
    apps: Boolean,
    distance: String,
    patio: Boolean,
    imageBuffer: String
});

const MasterList = mongoose.model('masterList', masterListSchema);

module.exports = MasterList;