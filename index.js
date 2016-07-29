var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var multer = require('multer');
var fs = require('fs');
var cors = require('cors');
var _ = require('lodash');
var nunjucks  = require('nunjucks');

require('./utils')

var dataReduction = require('data-reduction');
var dl = require('datalib');
var _ = require('lodash');
var alasql = require('alasql');

var upload = multer({dest: 'uploads/'})

var csv = require('fast-csv');

var app = express();

nunjucks.configure('templates', {
  autoescape : true,
  express : app
});

var models = require('./models/index');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


var routes = require('./routes')
_.forEach(routes, function(controller, route) {
    controller(app, route);
});

/*app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname,'static/index.html'));
});

app.get('/courses', function(req, res){
    res.sendFile(path.join(__dirname,'static/addCourse.html'));
});

app.post('/courses', function(req,res){
    //res.send(req.body);
    var course = new models.course({name: req.body.name});
    course.save(function(err, data){
        if (err) {
            console.log(err);
        } else {
            console.log("Saved.", data)
        }
    });
});*/

app.get('/comment/learner_network', function(req, res) {
    models.comment.find({},{id:1,parent_id:1,author_id:1,likes:1,_id:0, step:1, timestamp:1}).lean().exec(function(err, results){
        if (err) {
            res.send(err);
        } else {
            var map = _.keyBy(results, 'id');

            var top = req.query.top ? req.query.top : 10;//only network of top learners.
            var nodes_id = [];
            var nodes = [];
            var links = [];
            //filter all replies
            var replies = _.filter(results, function(n){
                return n.parent_id !== '';
            })

            var linksMap = {};
            replies.forEach(function(r){
                var original = map[r.parent_id.toString()];
                console.log(r)
                console.log(original)
                //1. push all author_id to nodes
                nodes_id.push(r.author_id);
                nodes_id.push(original.author_id);
                if (linksMap[r.author_id] === original.author_id || linksMap[original.author_id] === r.author_id){
                    return;
                }
                linksMap[r.author_id] = original.author_id;
                //2. build connection between author_id and push to links
                links.push({source:r.author_id, target:original.author_id,timestamp:r.timestamp});
            })

            //each node with reply count
            var totalReplies = dl.groupby('target').count().execute(links);
            // sort by reply and get top ones
            var topN = totalReplies.sort(function(a,b){
                return b.count - a.count;
            }).slice(0,top);

            //top nodes and ajacencies
            var topNodes = [];
            topN.forEach(function(n){
                topNodes.push(n.target);
            })

            // links about top nodes
            var topLinks = _.filter(links, function(n){
                return topNodes.indexOf(n.source) >= 0 || topNodes.indexOf(n.target) >= 0;
            })

            // add ajacent nodes
            topLinks.forEach(function(n){
                if (topNodes.indexOf(n.source) < 0 )
                    topNodes.push(n.source);
            });

            // updata toplinks to include ajacents' links.
            topLinks = _.filter(links, function(n){
                return topNodes.indexOf(n.source) >= 0 || topNodes.indexOf(n.target) >= 0;
            })

            var topNodeComments = _.filter(results, function(n){
                return topNodes.indexOf(n.author_id)>=0;
            });

            var nodeWithCentrality = _.filter(totalReplies, function(n){
                return topNodes.indexOf(n.target) >= 0;
            })


            var nodes_id = Array.from(new Set(nodes_id));

            console.log(nodes_id.length);
            console.log(links.length);

            /*for (var i = 0; i < results.length; i++) {
                var date = new Date(results[i].timestamp);
                results[i].week = date.getWeek();
                results[i].day = date.getDay();
            }
            var byweek = dl.groupby('week').execute(results);*/
            //res.send({nodes:nodes_id,links:links});
            res.send({nodes:nodeWithCentrality, links: topLinks});
        }
    })
});

app.get('/comment/learner_network/metrics', function(req, res) {
    models.comment.find({},{id:1,parent_id:1,author_id:1,likes:1,_id:0, step:1, timestamp:1}).lean().exec(function(err, results){
        if (err) {
            res.send(err);
        } else {
            for (var i = 0; i < results.length; i++) {
                var date = new Date(results[i].timestamp);
                results[i].date = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                results[i].timestamp = results[i].date.getTime();
            }

            var map = _.keyBy(results, 'id');

            var byDate = dl.groupby('timestamp').execute(results);
            byDate.forEach(function(e){
                e.links = [];
                e.linksMap = {};
                e.values.forEach(function(n){
                    if (!n.parent_id)
                        return;
                    var original = map[n.parent_id.toString()];

                    //eliminate duplicate links
                    if (e.linksMap[n.author_id] !== original.author_id && e.linksMap[original.author_id] !== n.author_id)
                        e.links.push({source:n.author_id, target:original.author_id});
                    e.linksMap[n.author_id] = original.author_id;
                })
            });

            for (var i = 0; i < byDate.length; i++) {
                if (i>0) {
                    byDate[i].values = byDate[i-1].values.concat(byDate[i].values);
                    byDate[i].links = byDate[i-1].links.concat(byDate[i].links);

                    //eliminate duplicate links.
                    
                    /*var a = _.uniqWith(byDate[i].links, function(m,n){
                        return m.source === n.target && m.target === n.source || m.source===n.source && m.target ===n.target;
                    })
                    byDate[i].links = a;*/
                    byDate[i].linksMap = _.merge(byDate[i-1].linksMap,byDate[i].linksMap)
                }
                for (var j = 0; j < byDate[i].links.length; j++) {
                    byDate[i].links[j];
                };
                var authors = dl.groupby('author_id').count().execute(byDate[i].values);
                var n = byDate[i].nodeCount = authors.length;
                var l = byDate[i].linkCount = byDate[i].links.length;
                byDate[i].density = l/(n*(n-1)/2);

                byDate[i].r = 0;
                _.keys(byDate[i].linksMap).forEach(function(n){
                    var m = byDate[i].linksMap;
                    if (m[m[n]] === n)
                        byDate[i].r++;
                });
            }

            var connectionCount = []
            byDate[byDate.length-1].links.forEach(function(n){
                connectionCount.push(n.source);
                connectionCount.push(n.target);
            });
            //console.log(connectionCount.length + "!!!!")
            var a = _.countBy(connectionCount);
            var a = _.values(a);
            var a = _.countBy(a);
            var num = _.sum(_.values(a));
            var zeroNum = byDate[byDate.length-1].nodeCount - num;

            var a = _.toPairs(a);
            /*for (var i = 0; i < a.length; i++) {
                a[i] = {connection: parseInt(a[i][0]), count:a[i][1]};
            };*/
            a.unshift([0,zeroNum]);

            console.log(a)

            var density = []
            byDate.forEach(function(n){
                density.push({
                    date: n.timestamp,
                    density: n.density,
                    reciprocity: n.r,
                    node: n.nodeCount,
                    link: n.linkCount,
                    pLink: n.nodeCount * n.nodeCount / 2
                })
            })


            //var byAuthor = dl.


            res.send({density:density,distribution:a});
            
        }
    });
});

app.get('/courses/:course_code/:run/comment/comment_network', function(req, res) {
    models.comment.find({
        course_code: req.params.course_code,
        run: req.params.run,
    },{
        id:1,
        parent_id:1,
        likes:1,
        _id:0, 
        step:1, 
        timestamp:1
    }).sort({timestamp:-1}).lean().exec(function(err, results){
        if (err) {
            res.send(err);
        } else {
            for (var i = 0; i < results.length; i++) {
                var date = new Date(results[i].timestamp);
                results[i].week = date.getWeek();
                results[i].day = date.getDay();
            }
            var byWeek = dl.groupby('week').execute(results);
            res.send(byWeek);
        }
    })
});

app.get('/comment/withreply', function(req, res) {
    models.comment.find().lean().exec(function(err, results){
        if (err) {
            res.send(err);
        } else {
            /*var withreply = reduction(results, {
                aggregate: {
                    dimensions: [{
                        column: 'parent_id'
                    }],
                    measures: [{
                        outColumn: 'no_of_replies',
                        operator: 'count'
                    }]
                }
            });*/
            //var data = JSON.stringify(results)
            var count_reply = dl.groupby('parent_id').count().execute(results);
            var count_reply_num = dl.groupby('count').summarize([
                {name:'*', ops:['count'], as: ['number']}
                ]).execute(count_reply);
            //var r = results.slice(1,10);
            //var withreply = alasql('SELECT parent_id, COUNT(*) AS count FROM ? GROUP BY parent_id ',[r])
            //console.log(withreply.length);
            //console.log(r[0].step);
            res.send(count_reply_num);
            //res.send(r);


            //wordcloud
            function mergeSentence(data){
                var string = '';
                results.forEach(function(n){
                    string += n.text + ' ';
                });
            }

            function wordcloud(data){
                var index = [];
                var words = data.replace(/[.,?!;()"'-]/g, " ")
                                .replace(/\s+/g, " ")
                                .toLowerCase()
                                .split(" ");
            }
        }
    });
})

app.get('/comment', function(req, res) {
    models.comment.aggregate([
    //{$project: {parent_id:1, step:1, step_number:{$substr:['$step',2,-1]}, week_number:{$substr:['$step',0,1]}}},
    //{$match: { parent_id: {$eq: ''}}},
    {$group: { _id: '$step', comments: {$sum: 1}}},
    {$sort: {_id: 1}}],//, step_number:'$step_number', week_number:'$week_number'}}, 
    //{$sort: {week_number:1, step_number:1}}],
    function(err, results){
        if (err) {
            res.send(err);
        } else {
            console.log(results.length);

            models.comment.aggregate([
            { $match: { parent_id: {$ne: ''}}},
            { $group: { _id: '$step', replies: {$sum: 1}}},
            { $sort: {_id: 1}}], 
            function(err, results2){
                if (err) {
                    res.send(err);
                } else {
                    console.log(results.length);
                    res.send([results,results2]);
                }
            });     
        }
    });
});

// app.get('/enrolment', function(req, res) {
//     models.enrolment.find({}, function(err, results){
//         if (err) {
//             res.send(err);
//         } else {
//             console.log(results.length);
//             res.send(results);
//         }
//     });
// });

// app.get('/step_activity', function(req, res) {
//     /*models.step_activity.find({}, function(err, results){
//         if (err) {
//             res.send(err);
//         } else {
//             console.log(results.length);
//             res.send(results);
//         }
//     });
//     models.step_activity.aggregate([
//     {
//         $match:{
//             last_completed_at: { $ne : ''}
//         }
//     },
//     {
//         $group:{
//             _id: '$step',
//             week_number: {$min: '$week_number'},
//             step_number: {$min: '$step_number'},
//             number: { $sum: 1 }
//         }
//     },
//     {
//         $sort:{
//             week_number: 1,
//             step_number: 1
//         }
//     }], 
//     function(err, results){
//         if (err) {
//             res.send(err);
//         } else {
//             console.log(results.length);
//             models.step_activity.aggregate([
//             {
//                 $group:{
//                     _id: '$step',
//                     week_number: {$min: '$week_number'},
//                     step_number: {$min: '$step_number'},
//                     number: { $sum: 1 }
//                 }
//             },
//             {
//                 $sort:{
//                     week_number: 1,
//                     step_number: 1
//                 }
//             }], 
//             function(err, results2){
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     console.log(results.length);
//                     res.send([results, results2]);
//                 }
//             });
//         }
//     });
// });

/*app.post('/upload/step_activity', upload.single('csv'), function(req, res) {
    console.log(req.file.path);
    
    var stream = fs.createReadStream(req.file.path);

    var csvStream = csv()
        .on("data", function(data){
            var step_activity = new models.step_activity({
                course_name : "Language",
                learner_id : data[0],
                step: data[1],
                week_number: data[2],
                step_number: data[3],
                first_visited_at: data[4],
                last_completed_at: data[5]
            })
            step_activity.save(function(err, data){
                if (err) {
                    console.log(err);
                } else {
                    //console.log("Saved.", data)
                    //delete step_activity;
                }
            });
            //console.log(data);
        })
        .on("end", function(){
            console.log("done");
        });

    stream.pipe(csvStream);

    res.send(req.files);
})

app.post('/upload/enrolment', upload.single('csv'), function(req, res) {
    console.log(req.file.path);
    
    var stream = fs.createReadStream(req.file.path);

    var csvStream = csv()
        .on("data", function(data){
            var enrolment = new models.enrolment({
                course_name : "Language",
                learner_id : data[0],
                enrolled_at : data[1],
                unenrolled_at : data[2]
            })
            enrolment.save(function(err, data){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Saved.", data)
                }
            });
            console.log(data);
        })
        .on("end", function(){
            console.log("done");
        });

    stream.pipe(csvStream);


    /*var form = new formidable.IncomingForm();
    
    form.on('file', function(field, file) {
        //console.log(file);
        console.log("\n!!!!")
        csv.parse()
    });

    form.parse(req, function(err, fields, files){
        console.log(req);
        console.log(files);
    })
    

    res.send(req.files);
})*/

mongoose.connect('mongodb://localhost/uploadcsv');
mongoose.connection.once('open', function(){

    app.listen(3000, function() {
        console.log('Listening on port 3000');
    });

    //app.post() 

});


