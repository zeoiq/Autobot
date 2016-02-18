(function() {
    'use strict';     
    angular.module('iisLogService', []).factory('botIISLogService', IISLogService); 
    
    IISLogService.$inject = ['$http', '$log'];
        
    function IISLogService($http, $log) {
        var apiURL = '', debug = true;
        if(debug)
            apiURL = 'http://localhost:8080';

        return {
            getIISLogStatus : function() {
                return $http.get(apiURL + '/api/iisLogStatus');
            },
            getIISLogErrorStatus : function() {
                return $http.get(apiURL + '/api/iisLogErrorStatus');
            },
            getIISLogNoOfHitsAPI : function() {
                return $http.get(apiURL + '/api/iisLogNoOfHitsAPI');
            },
            getIISLogNoOfHitsAPICIP : function(apiLink) {
                $log.debug('-->' + apiLink);
                return $http({ method: 'GET', url: apiURL + '/api/iisLogNoOfHitsAPICIP', params: {apiLink: apiLink}});
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