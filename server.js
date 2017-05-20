var express = require('express');
var app = express();
var fs  = require('fs');
var moment = require('moment');
// var routes = require('./routes');

var retrieval = require('./util/retrieval');

app.set('view engine', 'ejs');
app.set('views', 'templates');

app.use('/public', express.static('public'));

process.on('uncaughtException', function(err) {
  console.log("Error: " + err);
});

// app.use('/', routes);

/*
fs.readFile('coursecache.json', 'utf8', function (err, data) {
    if (err) throw err;
    var courses = JSON.parse(data);
    
  });
*/
//Time: moment(courses.updatetime)

//Pages

app.get('/', function(req, res){
  retrieval.getSOCDropDowns(function(data){
    res.render('main', {
      "title":'',
      "content":'',
      "termdropdown":data.yearTerm,
      "deptdropdown":data.dept
    });
  });
});

app.get('/about', function(req, res) {
  var title = "About";
  var content = "<p>ZotScheduler is a tool that generates class schedules for students. Eventually, this about page will be more interesting. Developed by David Legg and Alex I. Ramirez.</p>";
  res.render('main', {
    "title":title,
    "content":content
  });
});

app.get('/help', function(req, res) {
  var title = "Help";
  var content = "<p>Instructions to come.</p>";
  res.render('main', {
    "title":title,
    "content":content
  });
});


//Controller API Commands
app.get('/retrieval/courselistdrop/:term/:dept', function(req, res){
  retrieval.getCourseListingDropDown(req.params.term, req.params.dept, function(data){
    res.send(data.data);
  });
});


var server = app.listen(process.env.PORT || 8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("API listening at http://%s:%s", host, port)
});