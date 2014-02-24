
/**
 * Module dependencies.
 */
require('newrelic'); //app monitor
var express = require('express');
var truck = require('./routes/trucks');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/trucks', truck.findAll);
app.get('/trucks/location/:loc', truck.findByLoc);
app.get('/trucks/:id', truck.findById);
app.post('/trucks', truck.addTruck);
app.put('/trucks/:id', truck.updateTruck);
app.delete('/trucks/:id', truck.deleteTruck);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
