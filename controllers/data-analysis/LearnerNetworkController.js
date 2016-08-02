var models = require('../../models');
var _ = require('lodash');
var dl = require('datalib');

module.exports = function (app, route) {

    app.get(route, function(req, res) {
        models.comment.find({
            course_code: req.params.course_code,
            run: req.params.run
        },{
            id:1,
            parent_id:1,
            author_id:1,
            likes:1,
            _id:0, 
            step:1, 
            timestamp:1
        }).lean().exec(function(err, results){
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
                    //console.log(r)
                    //console.log(original)
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
        });
    });
}