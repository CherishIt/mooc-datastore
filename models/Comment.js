var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    course_code : {
        type : String,
        required : true
    },
    run : {
        type : String,
        required : true
    },
    id : {
        type : String,
        required : true,
        unique : true
    },
    author_id : {
        type : String,
        required: true
    },
    parent_id : String,
    step : {
        type : Number,
        required : true
    },
    week_number : {
        type: Number,
        required : true
    },
    step_number : {
        type: Number,
        required : true
    },
    text : String,
    timestamp : {
        type : Date,
        required: true
    },
    moderated : String,
    likes : {
        type: Number,
        required : true
    }
})

module.exports = mongoose.model('comment', CommentSchema);