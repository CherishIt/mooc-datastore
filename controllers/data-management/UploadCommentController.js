var models = require('../../models');
var fs = require('fs');
var csv = require('fast-csv');
var multer = require('multer');

var upload = multer({dest: 'uploads/'})

module.exports = function (app, route) {

    app.post(route, upload.single('csv'), function(req, res) {
        console.log(req.file.path);
        
        var stream = fs.createReadStream(req.file.path);

        var items = []
    
        var csvStream = csv()
            .on("data", function(data){
                var comment = {
                    course_code : req.body.course_code,
                    run : req.body.run,
                    id : data[0],
                    author_id: data[1],
                    parent_id: data[2],
                    step: data[3],
                    week_number: data[4],
                    step_number: data[5],
                    text: data[6],
                    timestamp: data[7],
                    moderated: data[8],
                    likes: data[9]
                }
                items.push(comment);
                console.log(comment.id);
            })
            .on("end", function(){
                console.log(items.length)
                models.comment.collection.insert(items);
                console.log("done");
            });
    
        stream.pipe(csvStream);
        
        res.send(req.files);
    })
}