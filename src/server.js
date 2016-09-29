import express from 'express'
import formidable from 'formidable'
import fs from 'fs'
import parseurl from 'parseurl'
import bodyParser from 'body-parser'
import session from 'express-session'
import * as user from './controllers/user'
import userProfile from './controllers/userProfile'
import interactions from './controllers/interactions'
import * as admin from './controllers/admin'
import credentials from './credentials'
import jwt from 'jsonwebtoken'
import expressJWT from 'express-jwt'

var app = express()


app.disable('X-Powerd-By')
app.use(require('cookie-parser')(credentials.cookieSecret))
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: credentials.cookieSecret,

}))
app.set('port', process.env.PORT || 8081)
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(expressJWT({secret: credentials.jwtSecret}).unless({
    path: ['/login',
        '/retrieve_password',
        '/activate_account',
        '/user/new',
        '/protected',
        /^\/test/i]}))
app.get('/', (req, res) => {
    if (!req.user) return res.redirect('/login');
    res.send("Welcome dude !!!");
})
app.get('/login', (req, res) => {
    res.send("login page");
})
app.post('/login', user.userLogin)
app.get('/user', user.viewAll)
app.put('/user', user.updateProfile)
app.post('/user/new', user.create)
app.post('/user/update', user.updateProfile)
app.get('/user/tags', user.tags)
app.post('/user/tags', user.addTag)
app.get('/register', user.renderForm)
app.get('/test/login/:login', user.checkLogin)
app.get('/test/email/:email', user.checkEmail)
app.post('/change_password', user.changePassword)
app.post('/retrieve_password', user.retrievePassword)
app.post('/activate_account', user.isVerified)
app.post('/delete', user.Delete)
app.post('/admin/userform/', admin.addFormItems)
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.redirect('/login');
    }
})
app.use((req, res) =>{
    res.type('text/html');
    res.status(404);
    res.send('Error 404');
})
app.use((err, req, res) =>{
    console.error(err.stack);
    res.status(500);
    res.send('Error 500');
})
app.listen(app.get('port'), () => {
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
})