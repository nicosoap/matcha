import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
import * as user from './controllers/user';
import userProfile from './controllers/userProfile';
import interactions from './controllers/interactions';
import credentials from './credentials';
import jwt from 'jsonwebtoken';
import expressJWT from 'express-jwt';

var app = express();


app.disable('X-Powerd-By');

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

app.use(expressJWT({secret: credentials.jwtSecret}).unless({path: ['/login', /^\/test/i]}));

app.get('/', function(req, res){
    if(req.session.isLogedIn){
        res.send('You are signed-in !');
    } else {
        res.redirect('/login');
    }
});

app.get('/user', function(req, res){

});

app.get("/test/login/:login", async (req, res, next) => {
    try {
        let test = await user.checkLogin(req.params.login);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(test));
    } catch(err) { next(err)}
});

app.get("/test/email/:email", async (req, res, next) => {
    try {
        let test = await user.checkEmail(req.params.email);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(test));
    } catch(err) { next(err)}
});

app.post('/login', async function(req, res) {
    await user.authenticate(req.body.login, req.body.password, req.body.token, req.body.fingerprint, function (err, ret) {
            if (err || ret.auth.fingerprint == false) {
                console.log("Error: " + err + ", auth: " + ret.auth.success + ", fingerprint: " + ret.auth.fingerprint);
                console.error(err);
                res.redirect('/login');
            } else {
                console.log("Error: " + err + ", auth: " + ret.auth.success + ", fingerprint: " + ret.auth.fingerprint);
                res.status(200).json(ret);
            }
    });
    console.log("Authentication finished");
});

app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.send('Error 404');
});

app.use(function(err, req, res){
    console.error(err.stack);
    res.status(500);
    res.send('Error 500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});