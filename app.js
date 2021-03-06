'use strict';

// Module dependencies.
var express = require('express'),
    jwt = require('express-jwt'),
    path = require('path'),
    fs = require('fs'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler');

var app = module.exports = exports.app = express();

app.locals.siteName = "TruckTrackerAPI";




//enable cors
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

// intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

// Connect to database
require('./config/db');
app.use(express.static(__dirname + '/public'));


// Bootstrap models
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

var env = process.env.NODE_ENV || 'development';

if ('development' == env) {
    app.use(morgan('dev'));
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.set('view options', {
        pretty: true
    });
}

if ('test' == env) {
    app.use(morgan('test'));
    app.set('view options', {
        pretty: true
    });
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
}

if ('production' == env) {
    //Authentication
    var jwtCheck = jwt({
        secret: new Buffer('vUjHiVUDPtf-JyyGQEz3v8QIT2GUAxCk4T5oNDgIONgdN8reqlvuv1VjSBarpu_B', 'base64'),
        audience: 'pKB1djQqdSxS8ZK7PyA5ECr7aIw38HnG'
    });

    app.use(jwtCheck);
    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.send(401, 'Invalid Token');
        }
    });

    app.use(morgan());
     app.use(errorhandler({
        dumpExceptions: false,
        showStack: false
    }));
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(methodOverride());
app.use(bodyParser());

// Bootstrap routes/api
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
    console.log('adding route: '+file);
  require(routesPath + '/' + file)(app);
});



// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});