module.exports = {
    '/' : require('./controllers/data-management/HomeController'),
    '/courses' : require('./controllers/data-management/CourseController'),
    '/upload/metadata' : require('./controllers/data-management/RunController'),
    '/upload/enrolment' : require('./controllers/data-management/UploadEnrolmentController'),
    '/upload/step_activity' : require('./controllers/data-management/UploadStepActivityController'),
    '/upload/comment' : require('./controllers/data-management/UploadCommentController'),
    '/courses/:course_code/:run/enrolment' : require('./controllers/data-analysis/EnrolmentController')
}