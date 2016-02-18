var apiURL = '', debug = true;
    if(debug)
        apiURL = 'http://localhost:8080';

module.exports = {

    "facebook_api_key"      :     "873634589371873",
    "facebook_api_secret"   :     "07d199824fdd6573168fc2d8eaa9f807",
    "callback_url"          :     apiURL + "/auth/facebook/callback",

	// the database url to connect
	dbUrl : 'mongodb://autobot:autobot@ds061464.mongolab.com:61464/autobotdb'
};