
var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

describe('REST API Testing', function() {
  var url = 'http://localhost:3000';

  describe('GET /courses', function() {
    it('should return a list of all courses and runs', function(done) {
      request(url)
        .get('/courses')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          done();
        })
    });
  });

  describe('GET /courses/DYRP', function() {
    it('should return the aggregated information of course DYRP', function(done) {
      request(url)
        .get('/courses/DYRP')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.have.property('runs');
          res.body.should.have.property('enrolment');
          res.body.should.have.property('comment');
          res.body.should.have.property('step_activity');
          res.body.should.have.property('question_response');
          res.body.should.have.property('peer_review_assignment');
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/enrolment', function() {
    it('should return the enrolment metrics of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/enrolment')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Array();
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/step_activity', function() {
    it('should return the step_activity metrics of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/step_activity')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Array();
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/demographics', function() {
    it('should return the demographics metrics of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/demographics')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('gender');
          res.body.should.have.property('age_range');
          res.body.should.have.property('highest_education_level');
          res.body.should.have.property('employment_status');
          res.body.should.have.property('employment_area');
          res.body.should.have.property('country');
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/comment', function() {
    it('should return the comment overview of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/comment')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Array();
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/comment_dist', function() {
    it('should return the comment distribution of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/comment_dist')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Array();
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/comment_analysis', function() {
    it('should return the comment wordcloud of comment DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/comment_analysis')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('weeks');
          res.body.should.have.property('steps');
          res.body.should.have.property('freq');
          done();
        })
    });
    it('could be filtered by week', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/comment_analysis?week=1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('weeks');
          res.body.should.have.property('steps');
          res.body.should.have.property('freq');
          done();
        })
    });
    it('could be filtered by step', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/comment_analysis?step=1.1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('weeks');
          res.body.should.have.property('steps');
          res.body.should.have.property('freq');
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/sentiment_analysis', function() {
    it('should return the sentiment_analysis of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/sentiment_analysis')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('pos_list');
          res.body.should.have.property('neg_list');
          res.body.should.have.property('metrics');
          done();
        })
    });
    it('could decide whether to group by week or step', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/sentiment_analysis?by=step')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('pos_list');
          res.body.should.have.property('neg_list');
          res.body.should.have.property('metrics');
          done();
        })
    });
    it('could filter by keyword', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/sentiment_analysis?keywork=course')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('pos_list');
          res.body.should.have.property('neg_list');
          res.body.should.have.property('metrics');
          done();
        })
    });
  });
  
  describe('GET /courses/DYRP/run/1/comment_network', function() {
    it('should return the comment network of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/comment_network')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Array();
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/learner_network', function() {
    it('should return the learner network of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/learner_network')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('nodes');
          res.body.should.have.property('links');
          done();
        })
    });
    it('could decide how many top users are included', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/learner_network?top=5')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('nodes');
          res.body.should.have.property('links');
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/learner_network_metrics', function() {
    it('should return the learner network metrics of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/learner_network_metrics')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          done();
        })
    });
  });

  describe('GET /courses/DYRP/run/1/question_response', function() {
    it('should return the quiz results of course DYRP run 1', function(done) {
      request(url)
        .get('/courses/DYRP/run/1/question_response')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.be.an.Object();
          res.body.should.have.property('all');
          res.body.should.have.property('first');
          res.body.should.have.property('last');
          done();
        })
    });
  });
});