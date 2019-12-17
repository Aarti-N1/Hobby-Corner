var express = require('express');
var router = express.Router();
var userDB = require('./../models/UserDB');
var userProfile = require('./../models/UserProfile');
var userConnection = require('./../models/UserConnection');
var connectionDB = require('./../models/connectionDB');
var connections = require('./connections');
var bodyParser = require('body-parser');
var UserConnectionDB = require('./../models/UserConnectionDB');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.all('/', urlencodedParser, async function(req,res){
	var tempSessionVar = req.session;
	//If the action is Sign In a new user will be created
	// action signIn -> validate from db 
	if(req.query.action == 'signIn'){
		//if valid -> create session & continue
		if(req.body.userName != undefined &&  req.body.password != undefined){
			if(await addUserInSession(req, req.body.userName, req.body.password)){
				return renderSavedConnectionsPage(req, res);
			}else{
				//else  -> redirect to login
				return redirectToLogin(req, res, true);
			}
		}else{
			//else  -> redirect to login
			return redirectToLogin(req, res, true);
		}
	}
	var isSessionUserValidBoolean = await isSessionUserValid(req);
	if(isSessionUserValidBoolean){
		if(Object.keys(req.query).length != 0 && req.query.action != undefined){ // if action parameter exists
			if(validateAction(req.query.action)){ //if action is valid
				//If action is Signout
				if(req.query.action == 'signout'){
					//destroy session and redirect to index.
					req.session.destroy();
					res.render('index');
				}else if(req.query.action == 'save' || req.query.action == 'updateRSVP' || req.query.action == 'updateProfile' || req.query.action == 'delete'){
					//Checking req parameter "viewConnections"
					if(req.body.viewConnections != undefined || req.body.viewConnections!= null){
						var viewConnectionsList = JSON.parse(req.body.viewConnections);
						if(viewConnectionsList.length == 0){
							//if list is 0
							var currentUser = await userDB.getUser(req.session.theUser);
							res.render('savedConnections',{username:currentUser.firstName});
						}else{
							//check if list contains requested connection id 
							if(viewConnectionsList.includes(req.query.connectionId)){
								if(req.query.action == 'save'){
									saveAction(req,res);
								}
								if(req.query.action == 'updateProfile'){
									updateProfileAction(req,res);									
								}	
								if(req.query.action == 'delete'){
									deleteAction(req,res);
								}
							}else{
								renderSavedConnectionsPage(req,res);
							}
						}
					}else{
						//if "viewConnections" parameter doesnt exist
						renderSavedConnectionsPage(req,res);
					}
				}else{
					//if action is different from the list
					renderSavedConnectionsPage(req,res);
				}
			}else{ //action invalid
				//render savedconnections
				renderSavedConnectionsPage(req,res);
			}
		}else{ //action parameter is null or undefined
			renderSavedConnectionsPage(req,res);
		}
	}else{
		//else (that is session is invalid) -> redirect to login 
		redirectToLogin(req, res, false);		
	}
});

//This function redirects the user to the Login page and shows appropriate errors if any
function redirectToLogin(req, res, showError){
	if(showError)
		res.render('login',{errorMsg:"Either username or password are incorrect. Please try again."});
	else
		res.render('login');
}

//This function adds a user to session along with all the connections in users profile
async function addUserInSession(req, userName, password){
	if(req.session.theUser !=undefined && (req.session.theUser).length>0){
		return true;
	}
	var newUser =await userDB.findUserInDB(userName, password);
	if(newUser != undefined && newUser.length != 0){
		req.session.theUser = newUser[0].userId;
		var newUserProfile = new userProfile(newUser[0].userId);
		newUserProfile.userConnectionsList = await newUserProfile.getConnections(); 
		var newuserConnectionsList = await newUserProfile.getConnections();
		req.session.userConnectionsList  = newuserConnectionsList;
		req.session.userProfile = newUserProfile;	
		return true;
	}else{
		return false;
	}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
//This function adds a connection to users profile.
async function saveAction(req,res){
	if(req.query.rsvp == 'yes' || req.query.rsvp == 'no' || req.query.rsvp == 'maybe'){
		var currentUserProfile = new userProfile(req.session.userProfile.userId);
		currentUserProfile.userConnectionsList =req.session.userProfile.userConnectionsList;
		await currentUserProfile.addConnection(req.query.connectionId, req.query.rsvp);
		//req.session.userConnectionsList  = await currentUserProfile.getConnections();
		req.session.userConnectionsList  =currentUserProfile.userConnectionsList;
		req.session.userProfile= currentUserProfile;
	}
	var currentUser = await userDB.getUser(req.session.theUser);
	var dataForTable = await createDataForTable(req.session.userConnectionsList );
	res.render('savedConnections',{username:currentUser.firstName, dataForTable: dataForTable });
}

// This function updates a connection from users profile
async function updateProfileAction(req,res){
	var currentUserProfile =  new userProfile(req.session.userProfile.userId);
	currentUserProfile.userConnectionsList =req.session.userProfile.userConnectionsList;
	var connectionsArr = await currentUserProfile.getConnections();
	var connectionFound = false;
	var data;
	connectionsArr.forEach(async function(obj,index){
		if(obj.connectionId == req.query.connectionId){
			data = await connectionDB.getConnection(req.query.connectionId);
			//res.render('connection', {data : data});
			connectionFound= true;
		}
	});
	var currentUser = await userDB.getUser(req.session.theUser);
	if(connectionFound){
		//Fetching Going and Maybe count
		UserConnectionDB.getRSVPCount(req.query.connectionId,"yes").then(async function(going){
			UserConnectionDB.getRSVPCount(req.query.connectionId,"maybe").then(async function(maybe){
				data.going = going;
				data.maybe = maybe;
				res.render('connection', {data : data, username:currentUser.firstName});
				},function(err){
					res.render('connection', {data : data, username:currentUser.firstName});
					});
				},function(err){
					res.render('connection', {data : data, username:currentUser.firstName});
				});
//		res.render('connection', {data : data, username:currentUser.firstName});
	}else{
			var dataForTable = await createDataForTable(req.session.userConnectionsList );
			res.render('savedConnections',{username:currentUser.firstName, dataForTable: dataForTable});
	}		
}

//This function deletes a connection from users profile
async function deleteAction(req,res){
	if(connections.isValid(req.query.connectionId)){
		var currentUserProfile =  new userProfile(req.session.userProfile.userId);
		currentUserProfile.userConnectionsList =req.session.userProfile.userConnectionsList;
		await currentUserProfile.removeConnection(req.query.connectionId);
		req.session.userConnectionsList  = await currentUserProfile.getConnections();
		req.session.userProfile= currentUserProfile;
	}
	var currentUser = await userDB.getUser(req.session.theUser);
	var dataForTable = await createDataForTable(req.session.userConnectionsList );
	res.render('savedConnections',{username:currentUser.firstName, dataForTable: dataForTable});
}

//This function formats the data as required for saved connections page and renders the page
async function renderSavedConnectionsPage(req,res){
	var allUsersMap = await userDB.getAllUsers();
	var currentUser = allUsersMap.get(req.session.theUser);
	var dataForTable = await createDataForTable(req.session.userConnectionsList );
	res.render('savedConnections',{username:currentUser.firstName, dataForTable: dataForTable});
}

//This function checks if the action is a valid acion. Returns true if action is valid and false otherwise
function validateAction(action){
	var actionArray = ['save', 'updateProfile', 'updateRSVP', 'delete', 'signout'];
	if(actionArray.includes(action)){
		return true;
	}
	return false;
}

//This function checks if the user in the session is valid
async function isSessionUserValid(req){
	var sessionVar = req.session;
	if(sessionVar.theUser){
		var usersMap = await userDB.getAllUsers();
		return usersMap.has(sessionVar.theUser);
	}
	return false;
}

//This function formats the data as required for saved connections page
async function createDataForTable(userConnectionList){
	var dataForTable = new Array();
	//await userConnectionList.forEach(async function(obj){
	for(var i=0;i<userConnectionList.length;i++){
		var obj = userConnectionList[i];
		var connectionObj = await connectionDB.getConnection(obj.connectionId);
		var dataObj = {
			connectionId: connectionObj.connectionId, 
			connectionName: connectionObj.connectionName,
			connectionTopic: connectionObj.connectionTopic,
			rsvp: obj.rsvp.charAt(0).toUpperCase() + (obj.rsvp.substring(1)).toLowerCase() };
		dataForTable.push(dataObj);
	}
	//);
	return dataForTable;
}

//This function finds the userName of the user in the session from the userId
async function userName(req){
	var tempSessionVar = req.session;
	var username;
	if(typeof tempSessionVar != 'undefined' && typeof tempSessionVar.theUser !='undefined'){
		var userMap = await userDB.getAllUsers();
		var currentUser = userMap.get(req.session.theUser);
		username = currentUser.firstName;
	}
	return username;
}



module.exports = {
	router:router,
	isSessionUserValid: isSessionUserValid,
	validateAction: validateAction,
	userName: userName
};