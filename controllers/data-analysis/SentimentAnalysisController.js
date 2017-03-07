var models = require('../../models');
var _ = require('lodash');
var sentiment = require('sentiment');

module.exports = function(app, route) {

  app.get(route, function(req, res) {

    var match = {
      course_code: req.params.course_code,
      run: req.params.run
    }
    if (req.query.keyword) {
      match.text = new RegExp(req.query.keyword)
    };

    models.comment.find(match, {
      _id: 0,
      week_number: 1,
      step_number: 1,
      step: 1,
      text: 1
    }).lean().sort({
      week_number: 1,
      step_number: 1
    }).exec(function(err, results) {
      if (err) {
        console.log(err);
        res.send(err);
        return;
      }

      var by = 'step'
      if (req.query.by === 'week')
        by = 'week_number';
      console.log('by:'+by +'\nkeyword:'+req.query.keyword)
      var grouped = _.groupBy(results,by);
      console.log('grouped!');
      var metrics = {};
      var pos_list = [];
      var neg_list = [];
      _.forEach(grouped,function(value, key){
        var sent = value.map(function(n){
          return sentiment(n.text);
        });
        metrics[key] = {
          total:0,
          positive:0,
          negative:0,
          neutral:0,
          score:0,
          pos_list:[],
          neg_list:[]
        };
        sent.forEach(function(n){
          //console.log(metrics[key])
          metrics[key].total ++;
          metrics[key].score += n.score;
          metrics[key].pos_list = metrics[key].pos_list.concat(n.positive);
          metrics[key].neg_list = metrics[key].neg_list.concat(n.negative);
          pos_list = pos_list.concat(n.positive);
          neg_list = neg_list.concat(n.negative);
          if (n.score>0)
            metrics[key].positive++;
          if (n.score<0)
            metrics[key].negative++;
          if (n.score===0)
            metrics[key].neutral++
        });
        console.log(key + ': ' + metrics[key].total);
        metrics[key].pos_list = _.countBy(metrics[key].pos_list);
        metrics[key].neg_list = _.countBy(metrics[key].neg_list);
      })
      pos_list = _.countBy(pos_list);
      neg_list = _.countBy(neg_list);
      console.log('response sent');
      res.send({pos_list:pos_list,neg_list:neg_list,metrics: metrics});
    })
  });

  // common stop words to filter
  var stop_words = //['','and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if'];
  ["","m",,"a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "t", "aren't", "can't", "ve", "t", "didn't", "doesn't", "don't", "hasn't", "d", "he'll", "he's", "how'd", "ll", "s", "i'd", "i'll", "i'm", "i've", "isn", "it's", "ve", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "re", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've"]

  // fake list to filter in reflect on current result
  var fake_list = ["hi","very","everyone","more"]

  var ignore = stop_words.concat(fake_list);

  function mergeSentence(data) {
    var string = '';
    results.forEach(function(n) {
      string += n.text + ' ';
    });
  }

  function wordcloud(data) {
    var index = [];
    var words = data.replace(/[&\/\\#,+()$~%.'":*?\-<>{}!]/g, ' ')
    //.replace(/[.,?!;()"'-]/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      // .filter(function(n){
      //   return ignore.indexOf(n) < 0;
      // });
    return words;
  }
}