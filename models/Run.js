var mongoose = require('mongoose');

var RunSchema = new mongoose.Schema({
    course_code : {
        type : String,
        required: true
    },
    uni_name : {
        type : String,
        required: true
    },
    course_name : {
        type : String,
        required: true
    },
    run : {
        type : Number,
        required: true
    },
    start_date : {
        type : Date,
        required: true
    },
    end_date : {
        type : Date,
        required: true
    },
    duration_weeks : {
        type : Number,
        required: true
    }
})

module.exports = mongoose.model('run', RunSchema);