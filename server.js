var express = require('express');
var engine = require('ejs-locals');
var app = express();
var fs = require('fs');
var moment = require('moment');

var cookieParser = require('cookie-parser');

var webapi = require('./webapi').router;
var api    = require('./api');

//Housekeeping
app.engine('ejs', engine);
app.set('views',__dirname + '/templates');
app.set('view engine', 'ejs');
app.set('views', 'templates');
app.set('view options', { layout:'templates/layout.ejs' });

app.use(cookieParser());
app.use('/public', express.static('public'));

process.on('uncaughtException', function (err) {
  console.log("Error: " + err);
});

//Pages
app.get('/', function (req, res) {
  res.render('schedpage', {
          "title": '',
    });
});

app.get('/about', function (req, res) {
  var title = "About";
  var content = "<p>Born out of a poor anteater's frustration with scheduling courses, David Legg, along with his partner in crime Alex I. Ramirez, have developed ZotScheduler - Course Scheduler.</p><p>ZotScheduler is a tool that, based on what you want, gives you the possible class combinations you'll like without having to deal with clunky WebSOC.</p>";
  res.render('stdpage', {
    "title": title,
    "content": content
  });
});

app.get('/help', function (req, res) {
  var title = "Help";
  var content = "<p>Instructions to come.</p>";
  res.render('stdpage', {
    "title": title,
    "content": content
  });
});


//Web API Controller Commands
app.use('/webapi', webapi);

//External API Commands
app.use('/api', api);

//Start Server
var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("API listening at http://%s:%s", host, port)
});