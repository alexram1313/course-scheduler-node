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
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout:'views/layouts/layout.ejs' });

app.use(cookieParser());
app.use('/public', express.static('public'));

process.on('uncaughtException', function (err) {
  console.log("Error: " + err);
});





//Real Pages
app.get('/', function (req, res) {
  res.render('pages/schedpage', {
          "title": '',
    });
});

app.get('/about', function (req, res) {
  res.render('pages/about', {
    "title": "About",
  });
});

app.get('/help', function (req, res) {
  var title = "Help";
  var content = "<p>Instructions to come.</p>";
  res.render('pages/stdpage', {
    "title": title,
    "content": content
  });
});


//Web API Controller Commands
app.use('/webapi', webapi);

//External API Commands
app.use('/api', api);


//Errors
app.use(function(req, res, next){
  res.status(404);

  res.format({
    html: function () {
      res.render('pages/stdpage',{
        'title':"Error 404",
        'content':'Whoops! Page not found. Sorry about that.'
      });
    },
    json: function () {
      res.json({ error: 'Not found' })
    },
    default: function () {
      res.type('txt').send('Not found')
    }
  })
});


app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('pages/stdpage',{
        'title':"Error "+err,
        'content':'An error occurred. Check the URL or click around.'
      });
});

//Start Server
var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("API listening at http://%s:%s", host, port)
});