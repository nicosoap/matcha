import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
import user from './controllers/user';
import userProfile from './controllers/userProfile';
import interactions from './controllers/interations';

var app = express();

app.disable('X-Powerd-By');

var credentials = require('./credentials.js');

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: credentials.cookieSecret,

}));

app.set('port', process.env.PORT || 8081);
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res){
    if(req.session.isLogedIn){
        res.send('You are signed-in !');
    } else {
        res.redirect('/login');
    }
});

app.post('/login', function(req, res) {
    console.log(req.body);
    if(req.body.login && req.body.password) {
        user.authenticate(req.body.login, req.body.password, function (err, ret) {
            if (err) {
                console.error(err);
                res.send('You are not signed in.');
            } else if (ret) {
                res.send('You are signed-in');
            } else {
                res.send('You are not signed in.');
            }
        });
    }
    console.log("Authentication finished");
});

app.get('/user', function(req, res){

});

app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.send('Error 404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.send('Error 500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});