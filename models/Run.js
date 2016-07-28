var mongoose = require('mongoose');

var RunSchema = new mongoose.Schema({
    course_code : String,
    number : {
        type : Number,
        required: true
    },
    start_date : {
        type : Date
    },
    end_date : {
        type : Date
    }
})

module.exports = mongoose.model('run', RunSchema);