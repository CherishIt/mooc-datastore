var mongoose = require('mongoose');

var PeerReviewAssignmentSchema = new mongoose.Schema({
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
        required: true
    },
    step : {
        type : String,
        required: true
    },
    step_number : {
        type : Number,
        require : true
    },
    week_number : {
        type : Number,
        require : true
    },
    author_id : {
        type : String,
        require : true
    },
    text : {
        type : String,
        require : true
    },
    first_viewed_at : {
        type : Date,
        require : true
    },
    submitted_at : {
        type : Date,
        require : true
    },
    moderated : {
        type : Date,
        require : true
    },
    review_count : {
        type : Number,
        require : true
    }
})

module.exports = mongoose.model('peer_review_assignment', PeerReviewAssignmentSchema);