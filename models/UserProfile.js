var UserConnection = require('./UserConnection');
var UserConnectionDB = require('./UserConnectionDB');

function UserProfile(userId){
	this.userId = userId;
	this.userConnectionsList = new Array();
}

UserProfile.prototype = (function(){

/*This function adds a connection with given connectionId and entered rsvp in userConnections for a user.
If the connection already exists it simply updates the rsvp 
*/
	async function addConnection(connectionId, rsvp){
		//if connection already exists update else add new userconnection.
		var vm = this;
		var updated = false ;
		//this.userConnectionsList.forEach(async function(obj,index){
		for(var i=0; i<this.userConnectionsList.length; i++){
			var obj = this.userConnectionsList[i];
		    if(obj.connectionId == connectionId){ //update existing
		    	await UserConnectionDB.updateRSVP(connectionId,vm.userId, rsvp); 
		    	var newObj = UserConnection(connectionId,rsvp);
		      	//vm.userConnectionsList.splice(index, 1, newObj);
		      	vm.userConnectionsList.splice(i, 1, newObj);
		      	updated = true;
		      	return;
		    }
		}
		//});
		if(!updated){ //add new
			await UserConnectionDB.addRSVP(connectionId,this.userId, rsvp);
	    	var newObj = UserConnection(connectionId,rsvp);
	    	this.userConnectionsList.push(newObj);
	 	}
	}

//This function removes a connection with given connectionId and entered from the userConnections for a user.
	async function removeConnection(connectionId){
		var vm = this;
		//this.userConnectionsList.forEach(async function(obj,index){
		for(var i=0; i<this.userConnectionsList.length; i++){
			var obj = this.userConnectionsList[i];
			if(obj.connectionId == connectionId){
				await UserConnectionDB.deleteRSVP(connectionId,vm.userId);
				vm.userConnectionsList.splice(i, 1);
			}
		}
		//});
	}

//This function updates a connection with given connectionId and entered from the userConnections for a user.
	function updateConnection(userConnection){
		this.userConnectionsList.forEach(function(obj,index){
			if(obj.connectionId == userConnection.connectionId){
				this.userConnectionsList.splice(index, 1, userConnection);
			}
		});
	}

	async function getConnections(){
		return await UserConnectionDB.getUserProfile(this.userId);;
	}

//This function removes all connections from the userConnections for a user.
	function emptyProfile(){
		this.userConnectionsList= new Array();
		//this.userId = null;
	}


	return{
		emptyProfile:emptyProfile,
		getConnections: getConnections,
		updateConnection: updateConnection,
		removeConnection: removeConnection,
		addConnection: addConnection,
		UserProfile: UserProfile
	};
})();


module.exports = UserProfile;