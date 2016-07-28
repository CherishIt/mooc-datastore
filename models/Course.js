var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    code : {
        type : String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('course', CourseSchema);