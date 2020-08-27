const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://csulzer:C0nrad11@gencluster-pnz8e.gcp.mongodb.net/restList2?retryWrites=true&w=majority', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
 });

