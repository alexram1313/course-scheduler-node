var express = require('express');
var app = express();
var fs  = require('fs');
var moment = require('moment');

var webapi = require('./webapi');
var retrieval = require('./api/retrieval/retrieval');

app.set('view engine', 'ejs');
app.set('views', 'templates');

app.use('/public', express.static('public'));

process.on('uncaughtException', function(err) {
  console.log("Error: " + err);
});

//Pages

app.get('/', function(req, res){
  retrieval.getSOCYearTermDept(function(data){
    res.render('main', {
      "title":'',
      "content":'',
      "termdropdown":data.yearTerm,
      "deptdropdown":data.dept,
      "addedCourses":webapi.utils.listAddedCourses()
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


//Web API Controller Commands
app.use('/webapi', webapi.router);

//TODO External API Commands

//Start Server
var server = app.listen(process.env.PORT || 8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("API listening at http://%s:%s", host, port)
});