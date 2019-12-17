var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', function(req,res){
	res.render('login');
});

router.post('/', urlencodedParser, [
		check('userName')
      .not().isEmpty()
			.isEmail()
      .trim()
      .escape()
      .normalizeEmail({gmail_remove_dots: false})
			.withMessage('Must be a valid username or email id.'),
		check('password')
			.not().isEmpty()
      .escape()
      .isLength({min: 8})
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
			.withMessage('Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 characters long.')
	], function(req,res){

		const errors = validationResult(req);
  		if (!errors.isEmpty()) {
  			var error = errors.array();
  			if(typeof error != 'undefined'){
  				var errorMap = new Map();
  				for(var i=0; i<error.length; i++){
  					errorMap.set(error[i].param,error[i].msg);
  				}
			  }
    		return res.render('login', {errorMap: errorMap});
  		}else{
        console.log('redirecting to profile..');
  			res.redirect(307,'/savedConnections?action=signIn'); //redirecting as a post request
        //validate username password from db
  			//if valid -> render savedConnections
  			//else -> render login.ejs with error
  		}

	
});

module.exports = {
	router: router
};

