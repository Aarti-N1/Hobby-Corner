var connection = require('./connection');
var schemaModels = require('./schemaDefinitions');

var connectionsMap = new Map();

//This function gets all connections from the database
async function getAllConnectionsFromDB(){
	var data;
	try{
		data = await schemaModels.ConnectionModel.find({});
		connectionsMap.clear();
		data.forEach(function(obj){
			connectionsMap.set(obj.connectionId, obj);
		});
		return connectionsMap;
	}catch(err){
		console.log(err);
	}
}

//This function returns a map containing all connections from the database
function getConnections(){
	getAllConnectionsFromDB();
	return connectionsMap;
};

//This function returns a connection object with the requested connectionId from the database
function getConnection(connectionId){
	return connectionsMap.get(connectionId);
};

//This function returns all connection objects created by a userId from the database
var getAllConnectionsForUser = async function (userId){
	var data;
	try{
		data = await schemaModels.ConnectionModel.find({hostUserId: userId});
		return data;
	}catch(err){
		console.log(err);
	}
}

//This function updates the connection record with id as connectionId in the database
var updateConnection = async function (connectionId, details, address, dateTime){
	try{
		await schemaModels.ConnectionModel.findOneAndUpdate(
		{connectionId:connectionId},
		{
			details:details,
			address:address,
			dateTime:dateTime
		}, 
		{new:true, upsert: false ,useFindAndModify: false},
		function(err, doc){
			if(err)
				console.error(err);
		});	
	}catch(err){
		console.error(err);
	}
	
}

//This function deletes the connection record with id as connectionId from the database
var deleteConnection = async function(connectionId){
	await schemaModels.ConnectionModel.findOneAndRemove({connectionId: connectionId})
	.then(async function (response){
		await schemaModels.UserConnectionModel.deleteMany({connectionId: connectionId}, 
			function (err) {
  				if(err) console.log(err);
  					console.log("Successful deletion");
			})
	})
	.catch(function(err){
		console.error(err);
	})

}

module.exports = {
	getConnections : async function(){
		await getAllConnectionsFromDB();
		return connectionsMap;
	}, 
	getConnection : async function(connectionId){
		await getAllConnectionsFromDB();
		//console.log('Getting connection Object... '+  connectionsMap.get(connectionId));
		return connectionsMap.get(connectionId);
	},
	getAllConnectionsForUser: getAllConnectionsForUser,
	updateConnection:updateConnection,
	deleteConnection:deleteConnection
}; 