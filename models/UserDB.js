var User = require('./User');
var schemaModels = require('./schemaDefinitions');
var saltHashing = require('./saltHashing');
var usersMap = new Map();

//This function returns a map containing all the users from the database
async function getAllUsersFromDB(){
	var data;
	try{
		data = await schemaModels.UserModel.find({})
		data.forEach(function(obj){
			usersMap.set(obj.userId, obj);
		});
		return usersMap;
	}catch(err){
		console.log(err);
	}
}

//This function returns the salt from db for a user from the database
async function getSaltForUser(userName){
	var data;
	try{
		data = await schemaModels.UserModel.find({email:userName},{salt:1, _id: 0});
		if(data.length != 0)
			return data[0]._doc.salt;
	}catch(err){
		console.log(err);
	}
}

//This function returns the Last autoentered userId from the users collection in the database
var getLatestUserId = async function(){
	var data;
	try{
		data = await schemaModels.UserModel.find({},{userId:1, _id: 0}).sort({_id:-1}).limit(1);
	}catch(err){
		console.error(err);
	}
	return data;
}


module.exports = {
	//This function returns a map of all the users from the database
	getAllUsers :  async function(){
		await getAllUsersFromDB();
		return usersMap;
	}, 
	//This function returns a specific user with entered userId from the database
	getUser : async function(userId){
		await getAllUsersFromDB()
		return usersMap.get(userId);
	},
	//This function returns a record if it matches the userId and password enterend 
	findUserInDB: async function (userName, password){
		var data;
		try{
			var salt = await getSaltForUser(userName);
			if(typeof salt == 'undefined'){
				return;			
			}
			var hashedPassword = saltHashing.saltHashPassword(salt, password);
			data = await schemaModels.UserModel.find({email:userName, password:hashedPassword});
			return data;
		}catch(err){
			console.log(err);
		}
	},
	//This function saves a user object to the users collection in the database
	addUser: async function(user){
	return new Promise(function(resolve,reject){
		try{
			var ans =  schemaModels.UserModel(user);
			 ans.save(function (err) {
				if (err) reject(err);
				resolve(true);
			});
		}catch(err){
			console.error(err);
			reject(false) ;
		}
	});

	},
	getLatestUserId:getLatestUserId,
	getSaltForUser: getSaltForUser

}; 