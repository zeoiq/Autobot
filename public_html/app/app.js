angular.module('autobotSearch', ['ngRoute', 'twitterController', 'fbController', 'iisLogController', 'autobotService', 'autobotScrapeService', 'iisLogService', 'smart-table', 'myCurrentTime'])
        .config(AbotConfig);
    
AbotConfig.$inject = ['$mdThemingProvider', '$routeProvider'];
    
function AbotConfig($mdThemingProvider, $routeProvider) {
  //$mdThemingProvider.theme("customTheme").primaryPalette("blue").accentPalette("green");
  $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('blue-grey');
    
  $routeProvider.
    when('/main', {
        templateUrl: 'view/main.html',
        controller: 'botTwitterController'
    }).
    when('/fb', {
        templateUrl: 'view/fb.html',
        controller: 'botFBController'
    }).
    when('/iislog', {
        templateUrl: 'view/iislog.html',
        controller: 'botIISLogController'
    }).
    otherwise({
        redirectTo: '/main'
    });
}
