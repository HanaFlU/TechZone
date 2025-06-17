const mongoose = require("mongoose");

module.exports.connect = () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log('MongoDB Connected!'));
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1);
    }
}