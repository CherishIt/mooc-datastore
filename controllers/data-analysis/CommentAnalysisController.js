var models = require('../../models');
var _ = require('lodash');
var sentiment = require('sentiment');

module.exports = function(app, route) {

  app.get(route, function(req, res) {

    var match = {
      course_code: req.params.course_code,
      run: req.params.run
    }
    if (req.query.step) {
      match.step = req.query.step;
    }
    if (req.query.week) {
      match.week_number = req.query.week;
    }

    var pre = Date.now();
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
      console.log('Comment Number',results.length, Date.now()-pre)

      var t0 = Date.now();

      var weeks = Object.keys(_.groupBy(results,'week_number'));
      var steps = Object.keys(_.groupBy(results,'step'))
      var t1 = Date.now();
      console.log('Meta', t1-t0);

      var string = '';
      // put all text into a string
      results.forEach(function(n){
        string += "," + n.text
      })
      var t2 = Date.now();
      console.log('Merge texts', t2-t1);

      //var sent = sentiment(string);

      var words = wordcloud(string);
      var t3 = Date.now();
      console.log('Split words', t3-t2);

      var count = {};
      //var array = _.sortBy(_.toPairs(_.countBy(words)),1)
      words.forEach(function(e){
        count[e] = (count[e]||0) + 1;
      })
      var t4 = Date.now();
      console.log('Count words' , t4-t3);

      var array = _.toPairs(count);
      var t5 = Date.now();
      console.log('Object to Array', t5-t4);

      array = _.sortBy(array,1); 
      var t6 = Date.now();
      console.log('Sort array',t6-t5);

      if (array.length > 500) {
        array = array.slice(array.length-500,array.length-1)
      }
      array = array.filter(function(n){
        return ignore.indexOf(n[0]) < 0;
      });
      array.reverse()
      var t7 = Date.now();
      console.log('slice&reverse&filter', t7-t6);

      console.log(array.length);
      res.send({
        //sent: sent,
        weeks: weeks,
        steps: steps,
        freq: array
      });
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