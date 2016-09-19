import express from 'express';

var app = express();

app.set('port', process.env.PORT || 8081);

app.get('/', function(req, res){
    res.send('Express Works');
});

app.listen(app.get('port'), function(){
    console.log('Express started press Ctrl-C to terminate');
});