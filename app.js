var express = require('express');
var db = require('./models/db.js');

var app = express();
var session = require('express-session');

app.set('view engine', 'ejs');
app.use('/resources', express.static('resources'));
app.use(session({secret: 'aarti', resave: false, saveUninitialized: false}));

var connections = require("./routes/connections.js");
var profileView = require("./routes/profileView.js");
var newConnection = require("./routes/newConnection.js");
var login = require("./routes/login.js");
var userRegistration = require("./routes/userRegistration.js");
var userDB = require('./models/UserDB');
var manageMyConnections =  require("./routes/manageMyConnections.js");
var updateConnection =  require("./routes/updateConnection.js");


app.use('/connections',connections.router);
app.use('/savedConnections',profileView.router);
app.use('/newConnection',newConnection.router);
app.use('/login',login.router);
app.use('/userRegistration',userRegistration.router);
app.use('/manageMyConnections',manageMyConnections.router);
app.use('/updateConnection',updateConnection.router);

async function userName(req){
	var tempSessionVar = req.session;
	var username;
	if(typeof tempSessionVar.theUser !='undefined'){
		var userMap = await userDB.getAllUsers();
		var currentUser = userMap.get(req.session.theUser);
		username = currentUser.firstName;
	}
	return username;
}
app.get('/about', async function(req,res){

	res.render('about',{username:await userName(req)});
});

app.get('/contactUs', async function(req,res){
	res.render('contactUs',{username: await userName(req)});
});

app.get('/', async function(req,res){
	res.render('index',{username:await userName(req)});
});
app.get('/*',async function(req,res){
	res.render('index',{username:await userName(req)});
});

app.listen(8080,function(){
    console.log('app started')
    console.log('listening on port 8080')
});
