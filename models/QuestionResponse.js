var mongoose = require('mongoose');

var QuestionResponseSchema = new mongoose.Schema({
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
    quiz_question : {
        type : String,
        required: true
    },
    week_number : {
        type : Number,
        require : true
    },
    step_number : {
        type : Number,
        require : true
    },
    question_number : {
        type : Number,
        require : true
    },
    response : {
        type : Number,
        require : true
    },
    submitted_at : {
        type : Date,
        require : true
    },
    correct : {
        type : Boolean,
        require : true
    }
})

module.exports = mongoose.model('question_response', QuestionResponseSchema);