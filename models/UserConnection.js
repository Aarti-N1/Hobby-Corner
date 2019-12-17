/*
This creates a UserConnection Object model 
*/
var UserConnection = function(connectionId, rsvp){
	var userConnectionModel = {
		connectionId : connectionId,
		rsvp: rsvp
	};
	return userConnectionModel;
}
module.exports = UserConnection;