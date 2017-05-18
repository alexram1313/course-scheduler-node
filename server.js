var express = require('express');
var app = express();
// var routes = require('./routes');

app.set('view engine', 'ejs');


process.on('uncaughtException', function(err) {
  console.log("Error: " + err);
});

// app.use('/', routes);

app.get('/', function(req, res){
  res.send("derp");
});

app.get('/about', function(req, res) {
  var title = "About";
  var content = "<p>ZotScheduler is a tool that generates class schedules for students. Eventually, this about page will be more interesting. Developed by David Legg and Alex I. Ramirez.</p>";
    res.render('templates/main', {
      title:title,
      content:content
    });
});



var server = app.listen(process.env.PORT || 8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("API listening at http://%s:%s", host, port)
});