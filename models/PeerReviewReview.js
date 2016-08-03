var mongoose = require('mongoose');

var PeerReviewReviewSchema = new mongoose.Schema({
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
    week_number : {
        type : Number,
        require : true
    },
    step_number : {
        type : Number,
        require : true
    },
    reviewer_id : {
        type : String,
        require : true
    },
    assignment_id : {
        type : String,
        require : true
    },
    guideline_one_feedback : {
        type : String,
        require : true
    },
    guideline_two_feedback : {
        type : String,
        require : true
    },
    guideline_three_feedback : {
        type : String,
        require : true
    },
    created_at : {
        type : Date,
        require : true
    }
})

module.exports = mongoose.model('peer_review_review', PeerReviewReviewSchema);