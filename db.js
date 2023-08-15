const mongoose = require('mongoose');
const mongoURI = 'mongodb://127.0.0.1:27017/inotebook?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.2'

const connectToMongo = async () => {
    await mongoose.connect(mongoURI, {});
};

module.exports = connectToMongo;
