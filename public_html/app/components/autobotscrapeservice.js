(function() {
    'use strict';     
    angular.module('autobotScrapeService', []).factory('botScrapeService', AutobotScrapeService); 
    
    AutobotScrapeService.$inject = ['$http', '$log'];
        
    function AutobotScrapeService($http, $log) {
        var apiURL = '', debug = false;
        if(debug)
            apiURL = 'http://localhost:8080';

        return {
            exportTweets : function(urlTweetsReplies) {
                return $http({ method: 'GET', url: apiURL + '/api/exportTweets', params: {urlText: urlTweetsReplies} });
            },
            
            exportTweetsReplies : function(urlTweetsReplies) {
                return $http({ method: 'GET', url: apiURL + '/api/exportTweetsReplies', params: {urlText: urlTweetsReplies} });
            },
            
            exportConversation : function(urlTweetsReplies) {
                return $http({ method: 'GET', url: apiURL + '/api/exportConversation', params: {urlText: urlTweetsReplies} });
            },
            
            scrapeTweets : function(urlTweets) {  
                return $http.post(apiURL + '/api/scrapeTweets', {urlText: urlTweets});
            },
            
            scrapeTweetsReplies : function(urlTweetsReplies) {  
                return $http.post(apiURL + '/api/scrapeTweetsReplies', {urlText: urlTweetsReplies});
            },
            
            scrapeFBPost : function(fbPageID) {  
                return $http.post(apiURL + '/api/scrapeFBPost', {fbName: fbPageID});
            }
        };
    }    
})();