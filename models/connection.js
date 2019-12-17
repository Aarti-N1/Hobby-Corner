/*
This creates a Connection Object model 
*/
var connection = function(connectionId, connectionName, connectionTopic, details, address, dateTime, hostedBy, going, maybe, imageName, hostUserId){
	var connectionModel = {
	connectionId:connectionId,
	connectionName : connectionName,
	connectionTopic : connectionTopic,
	details : details,
	address : address,
	dateTime : dateTime,
	hostedBy : hostedBy,
	going : going,
	maybe : maybe,
	imageName : imageName,
	hostUserId: hostUserId
	};
	return connectionModel;
};



module.exports = connection;