angular.module('autobotSearch', ['ngRoute', 'autobotController', 'fbController', 'autobotService', 'autobotScrapeService', 'myCurrentTime'])
        .config(AbotConfig);
    
AbotConfig.$inject = ['$mdThemingProvider', '$routeProvider'];
    
function AbotConfig($mdThemingProvider, $routeProvider) {
  //$mdThemingProvider.theme("customTheme").primaryPalette("blue").accentPalette("green");
  $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('blue-grey');
    
  $routeProvider.
    when('/main', {
        templateUrl: 'view/main.html',
        controller: 'botController'
    }).
    when('/fb', {
        templateUrl: 'view/fb.html',
        controller: 'botFBController'
    }).
    otherwise({
        redirectTo: '/main'
    });
}
;(function() {
    'use strict';    
    angular.module('autobotController', ['ngMaterial', 'ngMessages', 'timer'])
            .controller('botController', AutobotController);

    AutobotController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', 'botService', 'botScrapeService'];

    function AutobotController($scope, $http, $timeout, $log, $interval, $location, botService, botScrapeService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;

        /***********************************************************************************************************/

        $scope.userState = 1;
        $scope.states = ('0 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

        $scope.intervals = 1000;
        $scope.countdownTimer = $scope.userState * 60;

        $scope.callbackTimerFinished = function(){
            $scope.getTweet($scope.tweetData, undefined);
            $scope.$digest();
        };

        $scope.changeInterval = function(){
            $scope.stopClock();
            $scope.countdownTimer = $scope.userState * 60;
            $scope.$broadcast('timer-set-countdown', $scope.countdownTimer);
            $scope.resetClock();

            if($scope.countdownTimer > 0) {
                if(angular.isDefined($scope.tweetData))
                    $scope.startClock();
            }
        };

        $scope.timerRunning = false;
        var timeStarted = false;

        $scope.startClock = function() {
            if (!timeStarted) {
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
                timeStarted = true;
            } else if ((timeStarted) && (!$scope.timerRunning)) {
                $scope.$broadcast('timer-resume');
                $scope.timerRunning = true;
            }
        };

        $scope.stopClock = function() {
            if ((timeStarted) && ($scope.timerRunning)) {
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }
        };

        $scope.resetClock = function() {
            if ((!$scope.timerRunning))
                $scope.$broadcast('timer-reset');
        };

        $scope.$on('timer-stopped', function(event, data) {
            timeStarted = true;
        });

        $scope.getFB = function () {
            /*$http.post('http://localhost:8080/api/scrapeFB', {urlText: 'ab'})
                .success(function(data) {
                    $log.debug(data);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); */
            
            $location.path("/fb");  
        };
        
        $scope.getTwitter = function () {            
            $location.path("/main");  
        };
        /***********************************************************************************************************/    

        $scope.itemTwitters = [];    
        $scope.isAdd = true;

        $scope.getTweetsLink = function () {
            botService.get()
                .success(function(data) {
                    $scope.itemTwitters = [];
                    angular.forEach(data, function(value, key) {            
                        $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                  linkTweetsReplies : value.tweetsRepliesLink});            
                    });
                    //$log.debug(JSON.stringify($scope.itemTwitters, null, 4) + ' addTweetsLink: ' + JSON.stringify(data, null, 4));
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

            /*$scope.itemTwitters = [{tweetName: 'Maybank Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/MyMaybank', linkTweetsReplies : 'https://twitter.com/MyMaybank/with_replies'}, 
                              {tweetName: 'CIMB Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/cimbmalaysia', linkTweetsReplies : 'https://twitter.com/CIMBMalaysia/with_replies'},
                              {tweetName: 'HLB Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/myhongleong', linkTweetsReplies : 'https://twitter.com/MYHongLeong/with_replies'},
                               {tweetName: 'OCBC Twitter', tweetImage: 'assets/img/twitterIcon.png', 
                    linkTweets : 'https://twitter.com/OCBCmy', linkTweetsReplies : 'https://twitter.com/OCBCmy/with_replies'},
                              ]; */
        };

        $scope.addTweetsLink = function (twitData) {        
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.create(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemTwitters = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                      linkTweetsReplies : value.tweetsRepliesLink});             
                        });
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }
        };

        $scope.editTwitterLink = function (twit, id, event) {
            //$log.debug(JSON.stringify($scope.itemTwitters, null, 4) + ' editTwitterLink: ' + event);
            $scope.isAdd = false;
            angular.forEach($scope.itemTwitters, function(value, key) { 
                if(value.id === id) {
                    $scope.twit = {id: value.id, twitterName: value.tweetName, tweetsLink: value.linkTweets,
                    tweetsRepliesLink: value.linkTweetsReplies};
                }
            }); 
        };

        $scope.cancelTwitterLink = function () {
            $scope.twit = undefined;
            $scope.isAdd = true;
        };

        $scope.updateTwitterLink = function (twitData) {
            //$log.debug(JSON.stringify(twitData, null, 4) + ' updateTwitterLink: ' + event);
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.put(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemTwitters = [];
                        //$log.debug(JSON.stringify(data, null, 4) + ' updateTwitterLink: ');
                        angular.forEach(data, function(value, key) {            
                            $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                      linkTweetsReplies : value.tweetsRepliesLink});              
                        });                    
                        $scope.isAdd = true;
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }        
        };

        $scope.deleteTwitterLink = function (id, event) {
            if (!$.isEmptyObject(id)) {
                // call the create function from our service (returns a promise object)
                botService.delete(id)
                    .success(function(data) {                       
                        $scope.itemTwitters = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemTwitters.push({id : value._id, tweetName: value.twitterName, linkTweets : value.tweetsLink, 
                                                      linkTweetsReplies : value.tweetsRepliesLink});              
                        });                   
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }    
        };

        /***********************************************************************************************************/

        $scope.tweet = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.tweetReplies = [{
                 tweet: '',
                 image: '',
                 gotConversation: 'true',
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }],
        }];        

        $scope.tweetData = undefined;

        $scope.getTweet = function (tweet, event) {
            if (angular.isDefined(event)) {
                if (event.target.tagName === 'A')
                    return;
            }

            $scope.isLoading = false;
            $scope.tweetData = tweet; 

            return $timeout(function() {              
                var urlTweets = tweet.linkTweets;
                
                botScrapeService.scrapeTweets(urlTweets)
                .success(function(data) {
                    $log.debug(JSON.stringify(data));
                    $scope.tweet = data;
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

                /****************************************************************************************/
                var urlTweetsReplies = tweet.linkTweetsReplies;

                botScrapeService.scrapeTweetsReplies(urlTweetsReplies)
                .success(function(data) {
                    $scope.tweetReplies = data;
                    $scope.isLoading = true;
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

                if(!angular.isDefined($scope.tweetData))
                    $scope.startClock();
                else {
                    $scope.stopClock();
                    $scope.resetClock();
                    $scope.startClock();
                }
            }, 200); 
        };

        $scope.tweetsReplies = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.getTweetsReplies = function (linkTweetsReplies, dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = linkTweetsReplies;

                botScrapeService.scrapeTweets(urlTweetsReplies)
                .success(function(data) {
                    dataTweetReplies.tweetsReplies = [];
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].tweetDetails.length > 0)
                            dataTweetReplies.tweetsReplies.push(data[i]);
                    }
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200); 
        };

        $scope.export = function (data, fileName) {
            /*var a = document.createElement('a');
            a.href = 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4));
            a.target = '_blank';
            a.download = 'tweets.json';

            document.body.appendChild(a);
            a.click(); */

            var anchor = angular.element('<a/>');
            anchor.attr({ href: 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4)),
                 target: '_blank', download: fileName + '.json'
            })[0].click();
        };

        $scope.exportTweets = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.tweetData.linkTweets;

                botScrapeService.exportTweets(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweets');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportTweetsReplies = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.tweetData.linkTweetsReplies;

                botScrapeService.exportTweetsReplies(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweetsReplies');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportConversation = function (dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = dataTweetReplies.hideCvstLink;

                botScrapeService.exportConversation(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'conversation');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };
    }
})();;(function() {
    'use strict';    
    angular.module('fbController', ['ngMaterial', 'ngMessages', 'timer'])
            .controller('botFBController', FBController);

    FBController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botService', 'botScrapeService'];

    function FBController($scope, $http, $timeout, $log, $interval, $location, $filter, botService, botScrapeService) {
        $scope.format = 'd MMM yyyy - h:mm:ss a';
        $scope.modes = true;
        $scope.isLoading = true;

        /***********************************************************************************************************/

        $scope.userState = 1;
        $scope.states = ('0 1 2 3 4 5 10 15 20 25 30').split(' ').map(function (state) { return { abbrev: state }; });

        $scope.intervals = 1000;
        $scope.countdownTimer = $scope.userState * 60;

        $scope.callbackTimerFinished = function(){
            $scope.getPosts($scope.postData, undefined);
            $scope.$digest();
        };

        $scope.changeInterval = function(){
            $scope.stopClock();
            $scope.countdownTimer = $scope.userState * 60;
            $scope.$broadcast('timer-set-countdown', $scope.countdownTimer);
            $scope.resetClock();

            if($scope.countdownTimer > 0) {
                if(angular.isDefined($scope.postData))
                    $scope.startClock();
            }
        };

        $scope.timerRunning = false;
        var timeStarted = false;

        $scope.startClock = function() {
            if (!timeStarted) {
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
                timeStarted = true;
            } else if ((timeStarted) && (!$scope.timerRunning)) {
                $scope.$broadcast('timer-resume');
                $scope.timerRunning = true;
            }
        };

        $scope.stopClock = function() {
            if ((timeStarted) && ($scope.timerRunning)) {
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }
        };

        $scope.resetClock = function() {
            if ((!$scope.timerRunning))
                $scope.$broadcast('timer-reset');
        };

        $scope.$on('timer-stopped', function(event, data) {
            timeStarted = true;
        });

        $scope.getFB = function () {            
            $location.path("/fb");  
        };
        
        $scope.getTwitter = function () {            
            $location.path("/main");  
        };
        
        /***********************************************************************************************************/    

        $scope.itemFBPosts = [];    
        $scope.isAdd = true;

        $scope.getFBsLink = function () {
            /*botService.get()
                .success(function(data) {
                    $scope.itemFBPosts = [];
                    angular.forEach(data, function(value, key) {            
                        $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                  linkFBPost : value.tweetsRepliesLink});            
                    });
                    //$log.debug(JSON.stringify($scope.itemFBPosts, null, 4) + ' addTweetsLink: ' + JSON.stringify(data, null, 4));
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
            */
            $scope.itemFBPosts = [{fbPostName: 'Maybank', fbPostImage: 'assets/img/maybank.jpg', 
                    fbPageID : 'Maybank', linkFBPost : 'https://www.facebook.com/Maybank'}, 
                              {fbPostName: 'CIMB Malaysia', fbPostImage: 'assets/img/cimb.jpeg', 
                    fbPageID : 'CIMBMalaysia', linkFBPost : 'https://www.facebook.com/CIMBMalaysia'}
                              ]; 
        };

        $scope.addTweetsLink = function (twitData) {        
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.create(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemFBPosts = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                      linkFBPost : value.tweetsRepliesLink});             
                        });
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }
        };

        $scope.editTwitterLink = function (twit, id, event) {
            //$log.debug(JSON.stringify($scope.itemFBPosts, null, 4) + ' editTwitterLink: ' + event);
            $scope.isAdd = false;
            angular.forEach($scope.itemFBPosts, function(value, key) { 
                if(value.id === id) {
                    $scope.twit = {id: value.id, twitterName: value.fbPostName, tweetsLink: value.fbPageID,
                    tweetsRepliesLink: value.linkFBPost};
                }
            }); 
        };

        $scope.cancelTwitterLink = function () {
            $scope.twit = undefined;
            $scope.isAdd = true;
        };

        $scope.updateTwitterLink = function (twitData) {
            //$log.debug(JSON.stringify(twitData, null, 4) + ' updateTwitterLink: ' + event);
            if (!$.isEmptyObject(twitData)) {
                // call the create function from our service (returns a promise object)
                botService.put(twitData)
                    .success(function(data) {
                        $scope.twit = {}; // clear the form so our user is ready to enter another                        
                        $scope.itemFBPosts = [];
                        //$log.debug(JSON.stringify(data, null, 4) + ' updateTwitterLink: ');
                        angular.forEach(data, function(value, key) {            
                            $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                      linkFBPost : value.tweetsRepliesLink});              
                        });                    
                        $scope.isAdd = true;
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }        
        };

        $scope.deleteTwitterLink = function (id, event) {
            if (!$.isEmptyObject(id)) {
                // call the create function from our service (returns a promise object)
                botService.delete(id)
                    .success(function(data) {                       
                        $scope.itemFBPosts = [];
                        angular.forEach(data, function(value, key) {            
                            $scope.itemFBPosts.push({id : value._id, fbPostName: value.twitterName, fbPageID : value.tweetsLink, 
                                                      linkFBPost : value.tweetsRepliesLink});              
                        });                   
                    })
                    .error(function(data) {
                        $log.debug('Error: ' + data);
                    });
            }    
        };

        /***********************************************************************************************************/

        $scope.tweet = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.fbPosts = [{
                 message: '',
                 image: '',
                 gotComments: 'true',
                 postDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }],
        }];        

        $scope.postData = undefined;

        $scope.getPosts = function (postLinkInfo, event) {
            if (angular.isDefined(event)) {
                if (event.target.tagName === 'A')
                    return;
            }

            $scope.isLoading = false;
            $scope.postData = postLinkInfo; 

            return $timeout(function() {                              
                botScrapeService.scrapeFBPost(postLinkInfo.fbPageID)
                .success(function(data) {
                    var data1 = JSON.parse(data);
                    //$log.debug(data1.data);   
                    $scope.fbPosts = [];
                    angular.forEach(data1.data, function(value, key) {            
                        //$log.debug(JSON.stringify(value)); 
                        //$log.debug('message : ' + value.message);
                        var avatarImg = 'assets/img/fb.png';
                        if(value.from.name == $scope.postData.fbPostName) {
                            avatarImg = $scope.postData.fbPostImage;
                        }
                        $scope.fbPosts.push({
                             message: value.message,
                             image: value.full_picture,
                             gotComments: 'true',
                             postDetails: [{               
                                                 avatar: avatarImg,
                                                 fullname: value.from.name,
                                                 username: value.from.id,
                                                 time: $filter('date')(new Date(value.created_time), 'hh:mm a - dd MMM yyyy')
                        }]});                        
                    });     
                    //$log.debug(JSON.stringify($scope.fbPosts)); 
                    $scope.isLoading = true;
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 

                if(!angular.isDefined($scope.postData))
                    $scope.startClock();
                else {
                    $scope.stopClock();
                    $scope.resetClock();
                    $scope.startClock();
                }
            }, 200); 
        };

        $scope.tweetsReplies = [{
                 tweet: '',
                 image: '',           
                 tweetDetails: [{               
                                     avatar: 'assets/img/default.png',
                                     fullname: 'Autobot',
                                     username: '@autobot',
                                     time: '2015'
                                }]
        }];

        $scope.getTweetsReplies = function (linkFBPost, dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = linkFBPost;

                botScrapeService.scrapeTweets(urlTweetsReplies)
                .success(function(data) {
                    dataTweetReplies.tweetsReplies = [];
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].tweetDetails.length > 0)
                            dataTweetReplies.tweetsReplies.push(data[i]);
                    }
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200); 
        };

        $scope.export = function (data, fileName) {
            /*var a = document.createElement('a');
            a.href = 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4));
            a.target = '_blank';
            a.download = 'tweets.json';

            document.body.appendChild(a);
            a.click(); */

            var anchor = angular.element('<a/>');
            anchor.attr({ href: 'data:attachment/json;charset=utf-8,' + encodeURI(JSON.stringify(data, null, 4)),
                 target: '_blank', download: fileName + '.json'
            })[0].click();
        };

        $scope.exportTweets = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.postData.fbPageID;

                botScrapeService.exportTweets(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweets');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportTweetsReplies = function () {
            return $timeout(function() {      
                var urlTweetsReplies = $scope.postData.linkFBPost;

                botScrapeService.exportTweetsReplies(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'tweetsReplies');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };

        $scope.exportConversation = function (dataTweetReplies) {
            return $timeout(function() {      
                var urlTweetsReplies = dataTweetReplies.hideCvstLink;

                botScrapeService.exportConversation(urlTweetsReplies)
                .success(function(data) {
                    $scope.export(data, 'conversation');
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                });            
            }, 200);
        };
    }
})();;(function() {
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
})();;(function() {
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
})();;angular.module('myCurrentTime', ['timer'])
        .directive('myCurrentTime', CurrentTimeDirective);

    CurrentTimeDirective.$inject = ['$interval', 'dateFilter'];

    function CurrentTimeDirective($interval, dateFilter) {
        return function(scope, element, attrs) {
            var format,  // date format
                  stopTime; // so that we can cancel the time updates

              // used to update the UI
              function updateTime() {
                element.text(dateFilter(new Date(), format));
              }

              // watch the expression, and update the UI on change.
              scope.$watch(attrs.myCurrentTime, function(value) {
                format = value;
                updateTime();
              });

              stopTime = $interval(updateTime, 1000);

              // listen on DOM destroy (removal) event, and cancel the next UI update
              // to prevent updating time after the DOM element was removed.
              element.on('$destroy', function() {
                $interval.cancel(stopTime);
              });
        };
    }