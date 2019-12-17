// This file contains all the schema definitions for all the collections in the database.
var mongoose = require( 'mongoose' );

// This is a Schema definition for User collection.
var userSchema = new mongoose.Schema({
	userId: {type: String, required: true},
  	firstName: String,
	lastName: String,
	email: String,
	address1: String,
	address2: String,
	city: String,
	state: String,
	zip: Number,
	country: String,
	salt: String,
	password: String
});
userSchema.index(
	{ userId: 1 }, 
	{ unique: true}
);

// This is a Schema definition for connections collection.
var connectionSchema = new mongoose.Schema({
	connectionId: {type: String, required: true},
	connectionName : String,
	connectionTopic : String,
	details : String,
	address : String,
	dateTime : String,
	hostedBy : String,
	going : Number,
	maybe : Number,
	imageName : String,
	hostUserId : String
});
connectionSchema.index(
	{ connectionId: 1},
	{ unique: true}
);

// This is a Schema definition for Userconnection collection.
var userConnectionSchema= new mongoose.Schema({
	connectionId: {type: String, required: true},
	userId: {type: String, required: true},
	rsvp: String
});
userConnectionSchema.index(
	{ userId: 1, connectionId: 1 }, 
	{ unique: true }
);

var UserConnectionModel = mongoose.model('userconnections', userConnectionSchema);
var UserModel = mongoose.model('users', userSchema);
var ConnectionModel = mongoose.model('connections', connectionSchema);



module.exports = {
	UserModel : UserModel,
	ConnectionModel : ConnectionModel,
	UserConnectionModel: UserConnectionModel
};