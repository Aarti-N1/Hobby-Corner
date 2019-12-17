var express = require('express');
var router = express.Router();
var connectionDB = require('./../models/connectionDB');
var userDB = require('./../models/UserDB');
var UserConnectionDB = require('./../models/UserConnectionDB');

//Load all connections
var connectionsMap = new Map();
var connectionsArr = new Array();
var topics = new Array();
var nmap = new Map();

//Handles GET Requests
router.get('/', async function(req,res){
	connectionsMap= await connectionDB.getConnections();
	await segregateConnections(connectionsMap);
	var tempSessionVar = req.session;
	if(typeof tempSessionVar.theUser !='undefined'){
		var userMap = await userDB.getAllUsers();
		var currentUser = userMap.get(req.session.theUser);
		var username = currentUser.firstName;
	}
	if(Object.keys(req.query).length === 0){
		//render all connections
		res.render('connections',{topics: topics, nmap:nmap, username:username});
	}else{
		if(Object.keys(req.query).length === 0){
			//render all connections
			res.render('connections',{topics: topics, nmap:nmap, username:username});
		}else if(isValid(req.query.connectionId)){
			if(connectionsMap.has(req.query.connectionId)){
				//render with obj
				var data = await connectionDB.getConnection(req.query.connectionId);
				//Fetch Going and Maybe values for connection
				UserConnectionDB.getRSVPCount(req.query.connectionId,"yes").then(async function(going){
					UserConnectionDB.getRSVPCount(req.query.connectionId,"maybe").then(async function(maybe){
						data.going = going;
						data.maybe = maybe;
						res.render('connection', {data : data, username:username});
					},function(err){
						res.render('connection', {data : data, username:username});
					});
				},function(err){
					res.render('connection', {data : data, username:username});
				});
			}else{
				//render all connections
				res.render('connections',{topics: topics, nmap:nmap, username:username});
			}
		}else{
			//render all connections
			res.render('connections',{topics: topics, nmap:nmap, username:username});
		}
	}
});

//This function checks if a connection given is a valid one or not 
function isValid(connectionId){
	if(connectionId!=null && connectionId != undefined && connectionId.length > 3){
		var res = connectionId.substring(0, 3);
		if(res === "CON"){
			//isNaN returns true if the variable does NOT contain a valid number
			return !isNaN(connectionId.substring(4, connectionId.length));
		}else{
			return false;
		}
	}else{
		return false;
	}
}  

// This function groups connections records from the list based on the Topic
function getMapFromListGroupedByProperty(jsonObj, propertyName,withEmptyValues) {
	if (jsonObj == null || jsonObj == undefined) return null;
	if (withEmptyValues == null || withEmptyValues == undefined) withEmptyValues = false;
	var destMap = new Map();
	jsonObj.forEach(function(obj) {
		if (obj[propertyName] != undefined || obj[propertyName] != null) {
			if (!destMap.has(obj[propertyName])) destMap.set(obj[propertyName],new Array());
			if(!withEmptyValues) destMap.get(obj[propertyName]).push(obj);
		}
	});
	return destMap;
};

// This function groups connections records from the list based on the Topic
function segregateConnections(connectionsMap){
	var arr = new Array();
	var connectionsArr = connectionsMap.values();
	for(var ele of connectionsArr) 
  		arr.push(ele);
  	nmap = getMapFromListGroupedByProperty(arr, 'connectionTopic',false);
	topics = Array.from (nmap.keys());
}


module.exports = {
	router: router,
	isValid: isValid,
	getMapFromListGroupedByProperty: getMapFromListGroupedByProperty
};