var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var connectionDB = require('./../models/connectionDB');
var userDB = require('./../models/UserDB');

//Handles GET Requests
router.get('/', urlencodedParser, async function(req,res){
	//get all connections topicwise for current user
	var data = await connectionDB.getAllConnectionsForUser(req.session.theUser);
	//make data for table
	var dataForTable = await createDataForTable(data);
	var currentUser = await userDB.getUser(req.session.theUser);
	// render page
	res.render('manageMyConnections',{username:currentUser.firstName, dataForTable: dataForTable});
});

//Handles POST Requests
router.post('/', urlencodedParser, async function(req,res){
	if(Object.keys(req.query).length != 0 && req.query.action != undefined && (req.query.action=="update" || req.query.action=="delete")){ // if action parameter exists
		//Checking req parameter "viewConnections"
		if(req.body.viewConnections != undefined || req.body.viewConnections!= null){
			var viewConnectionsList = JSON.parse(req.body.viewConnections);
			if(viewConnectionsList.length == 0){
				res.redirect('/manageMyConnections');
			}else{
				if(req.query.action == 'update'){
					updateConnectionAction(req,res);
				}
				if(req.query.action == 'delete'){
					deleteConnectionAction(req,res);
				}			
			}
		}
	}
});

//This function updates the connection information for a requested connection.
async function updateConnectionAction(req,res){
	var dataObj = await connectionDB.getConnection(req.query.connectionId);
	var currentUser = await userDB.getUser(req.session.theUser);
	res.render('updateConnection',{username:currentUser.firstName, dataObj: dataObj});
}

//This function deletes a requested connection and all associated records from userConnections.
async function deleteConnectionAction(req,res){
	await connectionDB.deleteConnection(req.query.connectionId);
	//delete from current user
	for(var i =0; i<req.session.userConnectionsList.length;i++ ){
		if(req.session.userConnectionsList[i].connectionId == req.query.connectionId){
			req.session.userConnectionsList.splice(i, 1);
			req.session.userProfile.userConnectionsList.splice(i, 1); 
		}
	}

	req.session.successMsg = 'Record deleted successfully.';
	res.redirect('/manageMyConnections');
}

//This method creates the data in the format required to display the table on the manage my connections page
async function createDataForTable(connectionList){
	var dataForTable = new Array();
	for(var i=0;i<connectionList.length;i++){
		var connectionObj = connectionList[i];
		var dataObj = {
			connectionId: connectionObj.connectionId, 
			connectionName: connectionObj.connectionName,
			connectionTopic: connectionObj.connectionTopic};
		dataForTable.push(dataObj);
	}
	return dataForTable;
}


module.exports = {
	router: router
};
