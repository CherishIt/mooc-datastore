var mongoose = require('mongoose');

var EnrolmentSchema = new mongoose.Schema({
    course_code : {
        type : String,
        required : true
    },
    run : {
        type : String,
        required : true
    },
    learner_id : {
        type : String,
        required: true
    },
    enrolled_at : {
        type : Date,
        required: true
    },
    unenrolled_at : {
        type : Date
    }
})

module.exports = mongoose.model('enrolment', EnrolmentSchema);