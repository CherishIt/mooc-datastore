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
                if (results.length ===0) {
                    res.send(results);
                    return;
                }
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
    
    
                res.send({density:_.sortBy(density,'date'),distribution:a});
                
            }
        });
    });
}