var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { check, validationResult } = require('express-validator');
var saltHashing = require('./../models/saltHashing');
var userDB = require('./../models/UserDB');
var user = require('./../models/User');

//Handles GET Requests
router.get('/', function(req,res){
	var tempSessionVar = req.session;
	if(tempSessionVar.theUser){
		req.session.destroy();
	}
	res.render('userRegistration');
});

//Handles POST Requests
router.post('/',urlencodedParser, [
		check('userName')
      		.exists()
			.isEmail()
			.normalizeEmail({gmail_remove_dots: false})
 		    .trim()
      		.escape()
			.withMessage('Must be a valid username or email id.'),
		check('password')
			.exists()
      		.isLength({min: 8})
      		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
			.escape()
			.withMessage('Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 characters long.'),
		check('confirmPassword')
			.exists()
      		.isLength({min: 8})
      		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
      		.escape()
      		.withMessage('Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 characters long.')
      		.custom((value,{req, loc, path}) => {
	            if (value !== req.body.password) {
	                // trow error if passwords do not match
	                throw new Error("Passwords don't match");
	            } else {
	                return value;
	            }
        	}),
		check('firstName')
			.exists()
      		.matches(/^[a-zA-Z\d\-_,\s]+$/i)
      		.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),
		check('lastName')
			.exists()
      		.matches(/^[a-zA-Z\d\-_,\s]+$/i)
      		.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),
		check('address')
			.exists()
			.matches(/^[a-zA-Z\d\-_,#;.\s]+$/i)
			.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),		
		check('address2')
			.optional({checkFalsy:true})
			.matches(/^[a-zA-Z\d\-_,#;.\s]+$/i)
			.trim()
			.escape()
			.withMessage('This field may be alpha numeric with spaces, underscore and hyphen.'),
		check('city')
			.exists()
      		.matches(/^[a-zA-Z ]+$/i)
      		.trim()
			.escape()
			.withMessage('Must be a character input.'),		
		check('state')
			.exists()
      		.matches(/^[a-zA-Z ]+$/i)
      		.trim()
			.escape()
			.withMessage('Must be a character input.'),
		check('country')
			.exists()
      		.matches(/^[a-zA-Z ]+$/i)
      		.trim()
			.escape()
			.withMessage('Must be a character input.'),
		check('zip')
			.exists()
      		.isInt()
      		.isLength({min: 5})
      		.trim()
			.escape()
			.withMessage('Must be a numeric input with a minimum length of 5.')
	],async function (req, res) { 

		//create user in db
		//redirect to login with successful message.
		
		const errors = validationResult(req);
  		if (!errors.isEmpty()) {
  			console.log('in ERROR..');
  			var error = errors.array();
  			if(typeof error != 'undefined'){
  				var errorMap = new Map();
  				for(var i=0; i<error.length; i++){
  					errorMap.set(error[i].param,error[i].msg);
  				}
			  }
    		return res.render('userRegistration', {errorMap: errorMap});
  		}else{
        	//check if user already exists in DB
        	var isUserPresent = await userDB.getSaltForUser(req.body.userName);
			if(typeof isUserPresent != 'undefined'){
				//if yes redirect userRegistration with error.
				return res.render('userRegistration', {errorMsg: "This UserName/Email is already present, try with a different email id."});
        	}else{
        		//else hash pasword, create auto generated userId and save record to db
        		var salt = saltHashing.genRandomString(16);
        		var hashedPassword = saltHashing.saltHashPassword(salt,req.body.password);
        		//fetch latest userId from DB
				var userId = await userDB.getLatestUserId();
				var val =  parseInt((userId[0].userId).substring(4), 10);
				//increment it
				var newUserId = "user"+(val+1);
        		// create obj to store in db
				var newUserObj = user(
					newUserId, 
					req.body.firstName,
					req.body.lastName,
					req.body.userName,
					req.body.address,
					req.body.address2,
					req.body.city,
					req.body.state,
					req.body.zip,
					req.body.country,
					salt,
					hashedPassword
				);
				userDB.addUser(newUserObj).then(async function(result){
					//if record saved successfully show login with success message
					res.render('login',{successMsg: 'User Registered Successfully. Please login.'});					
				},function(err){
	       			//if record not saved successfully show userRegistration with error msg
					res.render('userRegistration', {errorMsg: "User could not be added due to internal error. Please try again."});
				});    		
  			}
  		}
});

module.exports = {
	router: router
};
