var path = require ('path');
var logger = require('morgan');
var expressLogger = require('express-logger');
var bodyParser = require('body-parser');

var mysql = require('mysql');
var pool = require ('./utility/DB')(mysql);

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var apiRouter = require ('./routes/api/index')(mysql, pool, io);
var appSocket = require ('./routes/appSocket') (mysql, pool);

var port = process.env.PORT || 3000;
app.set('env', 'development');


app.use('/static',express.static(path.join(__dirname,'public')));

switch(app.get('env')){
    case 'development' : 
        app.use(logger('dev'));
        break;
    case 'production' : 
        app.use(expressLogger({
            'path' : __dirname + '/log/requests.log'
        }));
        break;
}

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use ("/api", apiRouter);

app.use(function(req, res){
    res.type("text/html");
    res.status(404);
    res.send("404 - Not Found");
});

io.on ('connection', appSocket);

http.listen(port, function(req, res){
    console.log("Server Listening at port no. : " + port);
});