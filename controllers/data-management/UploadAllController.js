var models = require('../../models');
var fs = require('fs');
var csv = require('fast-csv');
var multer = require('multer');

var upload = multer({dest: 'uploads/'})

module.exports = function (app, route) {

    var uploads = upload.fields([
        { name: 'metadata', maxCount: 1 }, 
        { name: 'enrolments', maxCount: 8 },
        { name: 'step_activity', maxCount: 1 }, 
        { name: 'comments', maxCount: 1 }, 
        { name: 'question_response', maxCount: 1 }, 
        { name: 'peer_review_assignments', maxCount: 1 }, 
        { name: 'peer_review_reviews', maxCount: 1 }
    ]);
    app.post(route, uploads, function(req, res) {
        //console.log(req.file.path);
        
        //metadata
        if (req.files['metadata']) {
            var metadata_stream = fs.createReadStream(req.files['metadata'][0].path);
            var metadata_items = [];
            var metadata_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'uni_name')
                        return;
                    var run = {
                        course_code : req.body.course_code,
                        uni_name : data[0],
                        course_name: data[1],
                        run: data[2],
                        start_date: data[3],
                        end_date: data[4],
                        duration_weeks: data[5]
                    }
                    metadata_items.push(run);
                    console.log(run);
                })
                .on("end", function(){
                    console.log(metadata_items.length)
                    models.run.collection.remove({course_code:req.body.course_code,run:metadata_items[0].run},function(err){
                        if (err) {
                            res.send(err);
                        } else {
                            models.run.collection.insert(metadata_items);
                            console.log("done");
                        }
                    })
                    
                });
        
            metadata_stream.pipe(metadata_csv);
        }
        //enrolment
        if (req.files['enrolments']) {
            var enrolment_stream = fs.createReadStream(req.files['enrolments'][0].path);
            models.enrolment.collection.remove({
                course_code: req.body.course_code, 
                run: req.body.run
            },function(err){
                if (err) {
                    console.log(err);
                }
            });
            var enrolment_items = [];
            var enrolment_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'learner_id')
                        return;
                    var enrolment = {
                        course_code : req.body.course_code,
                        run: req.body.run,
                        learner_id : data[0],
                        enrolled_at : new Date(data[1]),
                        unenrolled_at : data[2]? new Date(data[2]) : '',
                        role : data[3],
                        fully_participated_at : data[4] ? new Date(data[4]) : '',
                        purchased_statement_at : data[5] ? new Date(data[5]) : '',
                        gender : data[6],
                        country : data[7],
                        age_range : data[8],
                        highest_education_level : data[9],
                        employment_status : data[10],
                        employment_area : data[11]
                    }
                    enrolment_items.push(enrolment);
                    console.log(enrolment);
                })
                .on("end", function(){
                    console.log(metadata_items.length)
                    models.enrolment.collection.insert(enrolment_items);
                    console.log("done");
                });
        
            enrolment_stream.pipe(enrolment_csv);
        }
        //step_activity
        if (req.files['step_activity']) {
            var step_activity_stream = fs.createReadStream(req.files['step_activity'][0].path);
            models.step_activity.collection.remove({
                course_code: req.body.course_code, 
                run: req.body.run
            },function(err){
                if (err) {
                    console.log(err);
                }
            });
            var step_activity_items = [];
            var step_activity_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'learner_id')
                        return;
                    var step_activity = {
                        course_code : req.body.course_code,
                        run : req.body.run,
                        learner_id : data[0],
                        step: data[1],
                        week_number: parseInt(data[2]),
                        step_number: parseInt(data[3]),
                        first_visited_at: data[4],
                        last_completed_at: data[5]
                    }
                    step_activity_items.push(step_activity);
                    console.log(step_activity.learner_id);
                })
                .on("end", function(){
                    console.log(step_activity_items.length)
                    models.step_activity.collection.insert(step_activity_items);
                    console.log("done");
                });
        
            step_activity_stream.pipe(step_activity_csv);
        }
        //comments
        if (req.files['comments']) {
            var comments_stream = fs.createReadStream(req.files['comments'][0].path);
            models.comment.collection.remove({
                course_code: req.body.course_code, 
                run: req.body.run
            },function(err){
                if (err) {
                    console.log(err);
                }
            });
            var comments_items = [];
            var comments_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'id')
                        return;
                    var comments = {
                        course_code : req.body.course_code,
                        run : req.body.run,
                        id : data[0],
                        author_id: data[1],
                        parent_id: data[2],
                        step: data[3],
                        week_number: parseInt(data[4]),
                        step_number: parseInt(data[5]),
                        text: data[6],
                        timestamp: data[7],
                        moderated: data[8],
                        likes: parseInt(data[9])
                    }
                    comments_items.push(comments);
                    console.log(comments.id);
                })
                .on("end", function(){
                    console.log(comments_items.length)
                    models.comment.collection.insert(comments_items);
                    console.log("done");
                });
        
            comments_stream.pipe(comments_csv);
        }
        //question_response
        if (req.files['question_response']) {
            var question_response_stream = fs.createReadStream(req.files['question_response'][0].path);
            models.question_response.collection.remove({
                course_code: req.body.course_code, 
                run: req.body.run
            },function(err){
                if (err) {
                    console.log(err);
                }
            });
            var question_response_items = [];
            var question_response_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'learner_id')
                        return;
                    var question_response = {
                        course_code : req.body.course_code,
                        run : req.body.run,
                        learner_id : data[0],
                        quiz_question: data[1],
                        week_number: parseInt(data[2]),
                        step_number: parseInt(data[3]),
                        question_number: parseInt(data[4]),
                        response: parseInt(data[5]),
                        submitted_at: new Date(data[6]),
                        correct: data[7]==='true' // ...
                    }
                    question_response_items.push(question_response);
                    console.log(question_response.learner_id);
                })
                .on("end", function(){
                    console.log(question_response_items.length)
                    models.question_response.collection.insert(question_response_items);
                    console.log("done");
                });
        
            question_response_stream.pipe(question_response_csv);
        }
        //peer_review_assignments
        if (req.files['peer_review_assignments']) {
            var peer_review_assignment_stream = fs.createReadStream(req.files['peer_review_assignments'][0].path);
            models.peer_review_assignment.collection.remove({
                course_code: req.body.course_code, 
                run: req.body.run
            },function(err){
                if (err) {
                    console.log(err);
                }
            });
            var peer_review_assignment_items = [];
            var peer_review_assignment_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'id')
                        return;
                    var peer_review_assignment = {
                        course_code : req.body.course_code,
                        run : req.body.run,
                        id : data[0],
                        step: data[1],
                        step_number: parseInt(data[2]),
                        week_number: parseInt(data[3]),
                        author_id: data[4],
                        text: data[5],
                        first_viewed_at: new Date(data[6]),
                        submitted_at: new Date(data[7]),
                        moderated: data[8] ? new Date(data[8]) : '',
                        review_count: parseInt(data[9])
                    }
                    peer_review_assignment_items.push(peer_review_assignment);
                    console.log(peer_review_assignment.id);
                })
                .on("end", function(){
                    console.log(peer_review_assignment_items.length)
                    models.peer_review_assignment.collection.insert(peer_review_assignment_items);
                    console.log("done");
                });
        
            peer_review_assignment_stream.pipe(peer_review_assignment_csv);
        }
        //peer_review_reviews
        if (req.files['peer_review_reviews']) {
            var peer_review_reviews_stream = fs.createReadStream(req.files['peer_review_reviews'][0].path);
            models.peer_review_review.collection.remove({
                course_code: req.body.course_code, 
                run: req.body.run
            },function(err){
                if (err) {
                    console.log(err);
                }
            });
            var peer_review_reviews_items = [];
            var peer_review_reviews_csv = csv()
                .on("data", function(data){
                    if (data[0] === 'id')
                        return;
                    var peer_review_review = {
                        course_code : req.body.course_code,
                        run : req.body.run,
                        id : data[0],
                        step: data[1],
                        week_number: parseInt(data[2]),
                        step_number: parseInt(data[3]),
                        reviewer_id: data[4],
                        assignment_id: data[5],
                        guideline_one_feed_back: data[6],
                        guideline_two_feed_back: data[7],
                        guideline_three_feed_back: data[8],
                        created_at: new Date(data[9])
                    }
                    peer_review_reviews_items.push(peer_review_review);
                    console.log(peer_review_review.id);
                })
                .on("end", function(){
                    console.log(peer_review_reviews_items.length)
                    models.peer_review_review.collection.insert(peer_review_reviews_items);
                    console.log("done");
                });
        
            peer_review_reviews_stream.pipe(peer_review_reviews_csv);
        }
        
        res.send(req.files);
    })
}