(function() {
    'use strict';     
    angular.module('autobotService', []).factory('botService', AutobotService); 
    
    AutobotService.$inject = ['$http', '$log'];
        
    function AutobotService($http, $log) {
        var apiURL = '', debug = false;
        if(debug)
            apiURL = 'http://localhost:8080';

        return {
            get : function() {
                return $http.get(apiURL + '/api/twitterLink');
            },
            put : function(twitterLinkData) {
                //$log.debug(JSON.stringify(twitterLinkData, null, 4) + ' put:');
                return $http({ method: 'PUT', url: apiURL + '/api/twitterLink', params: {twitterLinkData: twitterLinkData}});
            },
            create : function(twitterLinkData) {  
                return $http({ method: 'POST', url: apiURL + '/api/twitterLink', params: {twitterLinkData: twitterLinkData}});
                //return $http.post(apiURL + '/api/twitterLink', {twitterLinkData: twitterLinkData});
            },
            delete : function(id) {
                return $http.delete(apiURL + '/api/twitterLink/' + id);
            }
        };
    }    
})();