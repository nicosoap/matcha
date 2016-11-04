// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   server.js                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <opichou@student.42.fr>            +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/01 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import express from 'express'
import chalk from 'chalk'
import bodyParser from 'body-parser'
import session from 'express-session'
import * as user from './controllers/user'
import * as tags from './controllers/tags'
import * as picture from './controllers/picture'
// import * as interactions from './controllers/interactions'
import * as admin from './controllers/admin'
import credentials from './credentials'
import expressJWT from 'express-jwt'
import multer from 'multer'
import socketIo from 'socket.io'
import http from 'http'
import socketioJwt from 'socketio-jwt'
import config from './config.json'
import cors from 'cors'
import * as display from './controllers/display'

let corsOptions = {
    origin: '',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = require('express')();
const server = http.createServer(app)
const io = socketIo(server)
const interactions =  require('./controllers/interactions')(io)
const chat = require('./controllers/chat')(io)

const upload = multer({ dest: `${__dirname}/public/images` })

app.disable('x-powered-by')
app.use(cors())
app.use(require('cookie-parser')(credentials.cookieSecret))
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: credentials.cookieSecret,
}))
app.set('port', process.env.PORT || config.port || 8080)
app.use('/images', express.static(__dirname + '/public/images'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(expressJWT({secret: credentials.jwtSecret}).unless({
    path: ['/login',
        '/retrieve_password',
        '/user/new',
        '/protected',
        '/public',
        /^\/admin\/userform/i,
        /^\/images\//i,
        /^\/test/i]}))

io.use(socketioJwt.authorize({
    secret: credentials.jwtSecret,
    handshake: true
}));

//--ROUTES--/ />

app.get('/', (req, res) => {
    res.send("Welcome dude !!!");
})
app.post('/login', user.userLogin)
app.get('/i', cors(corsOptions), display.me)
app.get('/whoami', cors(corsOptions), display.me)
app.get('/user', cors(corsOptions), display.All)
app.get('/user/:userId', cors(corsOptions), display.One)
app.post('/user/locate', cors(corsOptions), user.locate)
app.put('/user', user.updateProfile)
app.post('/chat', cors(corsOptions), chat.chat)
app.get('/chats', cors(corsOptions), chat.chats)
app.post('/image', cors(corsOptions), upload.single('picture'), picture.uploadPicture)
app.post('/image/delete', picture.deleteOne)
app.post('/user/new', cors(corsOptions), user.create)
app.post('/user/update', cors(corsOptions), user.updateProfile)
app.get('/tags', tags.tags)
app.post('/tags', tags.addTag)
app.get('/test/login/:login', user.checkLogin)
app.get('/test/email/:email', user.checkEmail)
app.get('/account/register', user.renderForm)
app.post('/account/change_password', user.changePassword)
app.post('/account/retrieve_password', user.retrievePassword)
app.get('/activate_account', cors(corsOptions), user.isVerified)
app.post('/account/reactivate', user.reactivate)
app.post('/account/delete', user.Delete)
app.post('/admin/form/',cors(corsOptions), admin.addFormItems)
app.get('/admin/userform', cors(corsOptions), admin.getUserForm)
app.get('/config', cors(corsOptions), admin.getParams)
app.get('/admin/appConfig', cors(corsOptions), admin.getAppConfig)
app.get('/like/:userId', cors(corsOptions), interactions.like)
app.get('/dislike/:userId', cors(corsOptions), interactions.dislike)
app.get('/block/:userId', cors(corsOptions), interactions.block)
//--ROUTES--/ />

function now(){
    const currentDate = new Date();
    return currentDate.getDate() + "/"+ ("0" + (currentDate.getMonth() + 1)).slice(-2)
        + "/" + currentDate.getFullYear() + " @ "
        + currentDate.getHours() + ":"
        + currentDate.getMinutes() + ":" + currentDate.getSeconds()
}

io.on('connection', socket => {
    interactions.connect(socket.decoded_token.username, socket.id)
    console.log(chalk.bgGreen(socket.decoded_token.username, 'connected on', now()))
    socket.on('message', body => {
        socket.emit('message', {
            body,
            from: socket.decoded_token.username,
            read: false
        })
    })
    socket.on('like', body => {
        socket.broadcast.emit('like', {
            body,
            from: socket.decoded_token.username,
            read: false
        })
    })
    socket.on('match', body => {
        socket.broadcast.emit('match', {
            body,
            from: socket.decoded_token.username,
            read: false
        })
    })
    socket.on('visit', body => {
        socket.emit('visit', {
            body,
            from: socket.decoded_token.username,
            read: false
        })
    })
    socket.on('disconnect', () => {
        interactions.disconnect(socket.decoded_token.username, socket.id)
        console.log(chalk.bgRed(socket.decoded_token.username, 'disconnected on', now()))
    })
});

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.send({success: false, error: err.name})
    }
})
app.use((req, res) =>{
    res.type('text/html')
    res.status(404)
    res.send('Error 404 Page')
})
app.use((err, req, res) =>{
    console.error(err.stack)
    res.status(500)
    res.send('Error 500 Page')
})
server.listen(app.get('port'), () => {
    console.log(" ")
    console.log("                         ******       ******")
    console.log("                       **********   **********")
    console.log("                     ************* *************")
    console.log("                    *****************************")
    console.log("                    *****************************")
    console.log("                    *****************************")
    console.log("                     ***************************")
    console.log("                       ***********************")
    console.log("                         *******************")
    console.log("                           ***************")
    console.log("                             ***********")
    console.log("                               *******")
    console.log("                                 ***")
    console.log("                                  *")
    console.log("                     ")
    console.log("                      M A T C H A   S E R V E R")
    console.log(" ")
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
})