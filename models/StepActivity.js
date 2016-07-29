var mongoose = require('mongoose');

var StepActivitySchema = new mongoose.Schema({
    course_code : {
        type : String,
        required : true
    },
    run : {
        type : Number,
        required : true
    },
    learner_id : {
        type : String,
        required: true
    },
    step : {
        type : String,
        required: true
    },
    week_number : {
        type : Number,
        required: true
    },
    step_number : {
        type : Number,
        required: true
    },
    first_visited_at : {
        type : Date,
        required: true
    },
    last_completed_at :{
        type: Date
    }
})

module.exports = mongoose.model('step_activity', StepActivitySchema);