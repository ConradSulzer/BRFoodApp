const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL_TWO, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
 });

