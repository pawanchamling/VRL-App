var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

//### for the file uploads
var multer = require('multer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


app.use(multer({dest:'./uploads/'})); //### for file upload


var path = require('path'),
    fs = require('fs');
	
 app.post('', function(req, res) {
   // files are now in the req.body object along with other form fields
   // files also get moved to the uploadDir specified
    console.log("trying to upload");
    console.log(req.body);
    console.log(req.files);
	var originalName = req.files.file.originalname;
    console.log( originalName);
   
   var tempPath = req.files.file.path,
        targetPath = path.resolve('public/data/' + originalName + '');
    if (path.extname(req.files.file.name).toLowerCase() === '.json') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
			
			res.send({
				path: 'data/' + originalName + ''
			});
			
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .json files are allowed!");
        });
    }
	
				
	
   
 })


/*

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

module.exports = app;
