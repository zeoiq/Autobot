var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var appConfig = require('./app/config/appConfig'); 
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();
//var url = require('url');

//var mainPath = 'public_html';
var mainPath = 'public';
    
mongoose.connect(appConfig.dbUrl);


/*********************************************************************************************/

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: appConfig.facebook_api_key,
    clientSecret: appConfig.facebook_api_secret,
    callbackURL: appConfig.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        console.log(profile.id + ' FacebookStrategy : ' + JSON.stringify(profile, null, 4));
        //console.log(profile.emails[0].value + 'fb abc : ' + profile.name.givenName + ' ' + profile.name.familyName);
        return done(null, profile);
    });
  }
));

// Set Web UI location
app.use(express.static(__dirname + '/'+ mainPath)); 
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(passport.initialize());
app.use(passport.session());

require('./app/components/routes.js')(app);
require('./app/components/iisLogServices.js')(app);
require('./app/components/scrape.js')(app);

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

app.get('/abc', function(req, res){
    var user = req.user;
    //console.log(user.facebook.email + 'fb abc : ' + user);
    res.redirect('/');
});

app.get('/login', function(req, res){
    console.log('fb login : ' + req.user);
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/abc', failureRedirect: '/login' }),
  function(req, res) {
    //res.redirect('/');
    console.log('fb callback : ' + req.user);
});

/*********************************************************************************************/

app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '/'+ mainPath +'/', 'index.html'));
}); 

// Start the server
var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

//app.listen(process.env.PORT || 8080)//('8081')
//console.log('Magic happens on port 8081');
exports = module.exports = app; 	