var express = require('express');
var router = express.Router();
var profileView = require('./profileView')
var bodyParser = require('body-parser');
var UserConnectionDB = require('./../models/UserConnectionDB');
var connection = require('./../models/connection');
var connections = require('./connections');
var connectionDB = require('./../models/connectionDB');
var userDB = require('./../models/UserDB');
const { check, validationResult } = require('express-validator');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Handles POST Requests
router.post('/',urlencodedParser, [
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
			var dataObj = await connectionDB.getConnection(req.body.connectionId);
			var currentUser = await userDB.getUser(req.session.theUser);
			res.render('updateConnection',{errorMap: errorMap, username:currentUser.firstName, dataObj: dataObj});
  		}else{
			try{
				connectionDB.updateConnection(req.body.connectionId,req.body.details,req.body.address,req.body.datetimepick).then(async function(result){
					//If record is updated successfully render My connections
					res.redirect('/manageMyConnections');
				},function(err){
					//If record is error render My connections
					res.redirect('/manageMyConnections');
				});
			}catch(err){
				console.error(err);
			}
		}
});

module.exports = {
	router: router
};