var express  = require('express'),
    flash    = require('connect-flash'),
    cons     = require('consolidate'),
    http     = require('http'),
    path     = require('path');

process.on('error', function() {
  console.log("KEEP CALM AND QUERY ON!");
});

var config   = require('./config');
var db       = new (require('./datastore'))(config);
var app      = express();
var sessions = new express.session.MemoryStore(); // Must change for cluster-safe

app.configure(function() {
  // Templating
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', { pretty: true });
  app.locals({
    title:     config.title  || '',
    pagetitle: config.title  || '',
    prefix:    config.prefix || ''
  });
  // Standard stuff
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // Sessions
  app.use(express.cookieParser(config.secret));
  app.use(express.session({ store: sessions, secret: config.secret, key: 'express.sid' }));
  // Flash messages
  app.use(flash());
  // Route serving
  app.use(app.router);
  app.use(express['static'](path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

// http://madhums.me/2012/07/19/breaking-down-app-js-file-nodejs-express-mongoose/
require('./controllers')(app, db, config.prefix);

http.createServer(app).listen(config.port || 3000, config.listen || '0.0.0.0', function() {
  console.log("Project " + config.title + " server listening on " + (config.listen || '0.0.0.0') + ":" + (config.port || 3000));
});

db.crawl();
