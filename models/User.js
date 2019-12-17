/*
This creates a User Object model 
*/
var User = function(userId, firstName, lastName, email, address1, address2, city, state, zip, country, salt, password){
	var userModel = {
		userId: userId,
		firstName:firstName,
		lastName:lastName,
		email:email,
		address1:address1,
		address2:address2,
		city:city,
		state:state,
		zip:zip,
		country:country,
		salt: salt,
		password: password
	};
	return userModel;
}

module.exports = User;