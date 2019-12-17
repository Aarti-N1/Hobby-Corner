var express = require('express');
var router = express.Router();
var profileView = require('./profileView')
var bodyParser = require('body-parser');
var UserConnectionDB = require('./../models/UserConnectionDB');
var connection = require('./../models/connection');
var connections = require('./connections');
var connectionDB = require('./../models/connectionDB');
const { check, validationResult } = require('express-validator');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var topics = new Array();
var nmap = new Map();

//Handles GET Requests
router.get('/', async function(req,res){
	//if no session create one with random user and render form
	var tempSessionVar = req.session;
	if(!tempSessionVar.theUser){
		res.render('login');
	}else{
		//fetch topic names
		var connectionsMap= await connectionDB.getConnections();
		segregateConnections(connectionsMap);
		res.render('newConnection',{username:await profileView.userName(req), topics:topics});
	}
});

//Handles POST Requests
router.post('/',urlencodedParser, [
		check('topic')
      		.exists()
			.isAlpha()
			.trim()
			.escape()
			.withMessage('Must be a character input without spaces.'),
		check('name')
			.exists()
      		.matches(/^[a-zA-Z\d\-_,\s]+$/i)
      		.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),
		check('details')
			.exists()
			.matches(/^[a-zA-Z\d\-_,.\s]+$/i)
			.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),
		check('address')
			.exists()
			.matches(/^[a-zA-Z\d\-_,#;.\s]+$/i)
			.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),		
		check('address2')
			.optional({checkFalsy:true})
			.matches(/^[a-zA-Z\d\-_,#;.\s]+$/i)
			.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),
		check('city')
			.exists()
      		.matches(/^[a-zA-Z ]+$/i)
      		.trim()
			.escape()
			.withMessage('Must be a character input.'),		
		check('state')
			.exists()
      		.matches(/^[a-zA-Z ]+$/i)
      		.trim()
			.escape()
			.withMessage('Must be a character input.'),
		check('zip')
			.exists()
      		.isInt()
      		.isLength({min: 5})
      		.trim()
			.escape()
			.withMessage('Must be a numeric input with a minimum length of 5.'),
		check('datetimepick')
			.exists()
			.matches(/^[a-zA-Z\d\-_,:\s]+$/i)
			.trim()
			.escape()
 			.withMessage('This field is required. Select value from date time picker.')
	],async function (req, res) { 
	const errors = validationResult(req);
  		if (!errors.isEmpty()) {
  			var error = errors.array();
  			if(typeof error != 'undefined'){
  				var errorMap = new Map();
  				for(var i=0; i<error.length; i++){
  					errorMap.set(error[i].param,error[i].msg);
  				}
			  }
			//fetch topic names
			var connectionsMap= await connectionDB.getConnections();
			segregateConnections(connectionsMap);
			res.render('newConnection',{errorMap: errorMap, username:await profileView.userName(req), topics:topics});

    		//return res.render('login', {errorMap: errorMap});
  		}else{
			try{
				//fetch latest connection id
				var conId = await UserConnectionDB.getLatestConnectionId();
				var val =  parseInt((conId[0].connectionId).substring(3), 10);
				//increment it
				var newConnectionId = "CON"+(val+1);
				//get host username
				var userName = await profileView.userName(req);
				// create obj to store in db
				var newConnectionObj = connection(
					newConnectionId, 
					req.body.name,
					req.body.topic,
					req.body.details,
					req.body.address+ ', '+ req.body.address2 +', '+ req.body.city + ', '+ req.body.state + ', '+ req.body.zip,
					req.body.datetimepick,
					userName,
					0,
					0,
					"defaultProfile.jpg",
					req.session.theUser
					);
				UserConnectionDB.addConnection(newConnectionObj).then(async function(result){
						var connectionsMap= await connectionDB.getConnections();
						segregateConnections(connectionsMap);
						res.render('connections',{topics: topics, nmap:nmap, username:userName});					
				},function(err){
					res.render('index',{username:userName});
				});
			}catch(err){
				console.error(err);
			}
		}
});

// This function groups connections records from the list based on the Topic
function segregateConnections(connectionsMap){
	var arr = new Array();
	var connectionsArr = connectionsMap.values();
	for(var ele of connectionsArr) 
  		arr.push(ele);
  	nmap = connections.getMapFromListGroupedByProperty(arr, 'connectionTopic',false);
	topics = Array.from (nmap.keys());
}

module.exports = {
	router: router
};