module.exports = {
    '/' : require('./controllers/data-management/HomeController'),
    '/courses' : require('./controllers/data-management/CourseController'),
    '/upload/metadata' : require('./controllers/data-management/UploadMetadataController'),
    '/upload/enrolment' : require('./controllers/data-management/UploadEnrolmentController'),
    '/upload/step_activity' : require('./controllers/data-management/UploadStepActivityController'),
    '/upload/comment' : require('./controllers/data-management/UploadCommentController'),
    '/upload/all' : require('./controllers/data-management/UploadAllController'),
    '/courses/:course_code' : require('./controllers/data-analysis/CourseController'),
    '/courses/:course_code/run/:run/demographics' : require('./controllers/data-analysis/DemographicsController'),
    '/courses/:course_code/run/:run/enrolment' : require('./controllers/data-analysis/EnrolmentController'),
    '/courses/:course_code/run/:run/step_activity' : require('./controllers/data-analysis/StepActivityController'),
    '/courses/:course_code/run/:run/comment' : require('./controllers/data-analysis/CommentController'),
    '/courses/:course_code/run/:run/comment_dist' : require('./controllers/data-analysis/CommentDistributionController'),
    '/courses/:course_code/run/:run/comment_network' : require('./controllers/data-analysis/CommentNetworkController'),
    '/courses/:course_code/run/:run/learner_network' : require('./controllers/data-analysis/LearnerNetworkController'),
    '/courses/:course_code/run/:run/learner_network_metrics' : require('./controllers/data-analysis/LearnerNetworkMetricsController')
}