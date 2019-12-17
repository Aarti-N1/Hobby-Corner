var UserConnection = require('./UserConnection');
var schemaModels = require('./schemaDefinitions');

var getUserProfile = async function (userId){
	var data;
	try{
		data = await schemaModels.UserConnectionModel.find({userId: userId})
		return convertConnectionFromDBToUserConnectionList(data);
	}catch(err){
		console.log(err);
	}
}

var addRSVP =async function (connectionId, userId, rsvp){
	await schemaModels.UserConnectionModel({
		userId:userId,
		connectionId: connectionId,
		rsvp: rsvp
	}).save(function (err) {
		if (err) return console.error(err);
	});
}

var updateRSVP = async function (connectionId, userId, rsvp){
	try{
		await schemaModels.UserConnectionModel.findOneAndUpdate(
		{$and:[{userId:userId}, {connectionId: connectionId}]},
		{rsvp: rsvp}, 
		{new:true, upsert: false ,useFindAndModify: false},
		function(err, doc){
			if(err)
				console.error(err);
		});	
	}catch(err){
		console.error(err);
	}
	
}

var deleteRSVP = async function(connectionId, userId){
	await schemaModels.UserConnectionModel.findOneAndRemove({
		$and:[{userId:userId}, {connectionId: connectionId}]
	})
	.then(function (response){
		console.log('RECORD REMOVED.. '+ response);
	})
	.catch(function(err){
		console.error(err);
	})
}

var getLatestConnectionId = async function(connectionId, userId){
	var data;
	try{
		data = await schemaModels.ConnectionModel.find({},{connectionId:1, _id: 0}).sort({_id:-1}).limit(1);
		//console.log('data'+ data);
	}catch(err){
		console.error(err);
	}
	return data;
}

var addConnection = async function(connection){
	return new Promise(function(resolve,reject){
		try{
			var ans =  schemaModels.ConnectionModel(connection);
			 ans.save(function (err) {
				if (err) reject(err);
				resolve(true);
			});
		}catch(err){
			console.error(err);
			reject(false) ;
		}
	});
}

var convertConnectionFromDBToUserConnectionList = function (data){
	var userConnectionList= new Array();
	data.forEach(function(obj){
			userConnectionList.push(UserConnection(obj.connectionId,obj.rsvp));
	});
	return userConnectionList;
}

var getRSVPCount = async function(connectionId, rsvp){
	return new Promise(function(resolve,reject){
		try{
			var ans = schemaModels.UserConnectionModel.find({$and:[{connectionId:connectionId},{rsvp:rsvp}]});
			ans.countDocuments(function(err, count){
				if(err)
					reject(0);
				//console.log('Sending count = '+ count);
				resolve(count);
			});
		}catch(err){
			console.error(err);
			reject(0);
		}
	});
	
}

module.exports = {
	getUserProfile:getUserProfile,
	addRSVP:addRSVP,
	updateRSVP:updateRSVP,
	deleteRSVP:deleteRSVP,
	convertConnectionFromDBToUserConnectionList :  convertConnectionFromDBToUserConnectionList,
	getLatestConnectionId: getLatestConnectionId,
	addConnection: addConnection,
	getRSVPCount: getRSVPCount
}; 