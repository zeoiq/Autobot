(function() {
    'use strict';    
    angular.module('iisLogController', ['ngMaterial', 'ngMessages', 'timer', 'googlechart'])
            .controller('botIISLogController', IISLogController);

    IISLogController.$inject = ['$scope', '$http', '$timeout', '$log', '$interval', '$location', '$filter', 'botIISLogService'];

    function IISLogController($scope, $http, $timeout, $log, $interval, $location, $filter, botIISLogService) {
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
        
        $scope.getIISLog = function () {            
            $location.path("/iislog");  
        };
        
        /***********************************************************************************************************/    

        $scope.itemsByPage = 10; 
        $scope.iisLogStatusCollection = [];    
        $scope.iisLogNoOfHitsAPICollection = []; 
        $scope.iisLogErrorStatusCollection = [];    
        $scope.itemIISLogStatus = [].concat($scope.iisLogStatusCollection);
        $scope.itemIISLogNoOfHitsAPI = [].concat($scope.iisLogNoOfHitsAPICollection);
        $scope.itemIISLogErrorStatus = [].concat($scope.iisLogErrorStatusCollection);
        
        
        $scope.load_iislogstatus_lib = function () {            
            $scope.getIISLogStatusReport();  
            $scope.getIISLogErrorStatusReport();  
            $scope.getIISLogNoOfHitsAPIReport();  
        };
        
        $scope.getIISLogStatusReport = function () {
            botIISLogService.getIISLogStatus()
                .success(function(data) {
                    var rowData = [];
                    var rowData1 = [];
                    var serverName = '';
                    angular.forEach(data, function(value1, key) {  
                        //$log.debug('getIISLogStatusReport: ' + JSON.stringify(value1.iisLogStatus.iisLogStatusDetails));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogStatus.iisLogStatusDetails;
                        var count = 0;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogStatusCollection.push({apiLink : value.apiLink, averageTimeTaken: value.averageTimeTaken, maxTimeTaken : value.maxTimeTaken, minTimeTaken : value.minTimeTaken});  
                            
                            if (count < logdata.length/2) {
                                rowData.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.averageTimeTaken)},
                                    {v: parseInt(value.maxTimeTaken)},
                                    {v: parseInt(value.minTimeTaken)}
                                ]});
                            }
                            else {
                                rowData1.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.averageTimeTaken)},
                                    {v: parseInt(value.maxTimeTaken)},
                                    {v: parseInt(value.minTimeTaken)}
                                ]});
                            }
                            count++;
                        });
                    });
                    $scope.getIISlogStatusColChart(serverName, rowData);
                    $scope.getIISlogStatusColChart1(serverName, rowData1);
                    //$scope.$apply(); 
                    //$log.debug(JSON.stringify($scope.itemTwitters, null, 4) + ' addTweetsLink: ' + JSON.stringify(data, null, 4));
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        $scope.getIISLogNoOfHitsAPIReport = function () {
            botIISLogService.getIISLogNoOfHitsAPI()
                .success(function(data) {
                    var rowData = [];
                    var rowData1 = [];
                    var serverName = '';
                    //$log.debug('getIISLogErrorStatusReport: ' + JSON.stringify(data));
                
                    angular.forEach(data, function(value1, key) {  
                        serverName = value1.serverName;
                        var logdata = value1.iisLogNoOfHitsAPI.iisLogNoOfHitsAPIDetails;
                        var count = 0;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogNoOfHitsAPICollection.push({apiLink : value.apiLink, noOfHits: value.noOfHits });  
                            
                            if (count < logdata.length/2) {
                                rowData.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.noOfHits)}
                                ]});
                            }
                            else {
                                rowData1.push({c: [
                                    {v: value.apiLink },
                                    {v: parseInt(value.noOfHits)}
                                ]});
                            }
                            count++;
                        });
                    });
                    $scope.getIISLogNoOfHitsAPIColChart(serverName, rowData);
                    $scope.getIISLogNoOfHitsAPIColChart1(serverName, rowData1);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        $scope.getIISLogErrorStatusReport = function () {
            botIISLogService.getIISLogErrorStatus()
                .success(function(data) {
                    var rowData = [];
                    var serverName = '';
                
                    angular.forEach(data, function(value1, key) {  
                        //$log.debug('getIISLogErrorStatusReport: ' + JSON.stringify(value1.iisLogErrorStatus.iisLogErrorStatusDetails));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogErrorStatus.iisLogErrorStatusDetails;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogErrorStatusCollection.push({status : value.status, total: value.total}); 
                            
                            rowData.push({c: [
                                {v: value.status },
                                {v: parseInt(value.total)}
                            ]});
                        });
                    });
                    $scope.getIISlogErrorStatusBarChart(serverName, rowData);
                })
                .error(function(data) {
                    $log.debug('Error: ' + data);
                }); 
        };
        
        /********************************************************************************************************/   
        
        var dataLogStatus = [
                    {id: "api", label: "API Link", type: "string"},
                    {id: "ave", label: "Average Time", type: "number"},
                    {id: "max", label: "Max Time", type: "number"},
                    {id: "min", label: "Min Time", type: "number"}
                ];
        var dataLogStatusTitle = 'Time taken based on API link - Server : ';
        
        $scope.getIISlogStatusColChart = function (serverName, rowData) {
            $scope.iisLogStatusColChart = {};    
            $scope.iisLogStatusColChart.type = "ColumnChart";

            $scope.iisLogStatusColChart.data = {
                "cols": dataLogStatus, 
                "rows": rowData
            };

            $scope.iisLogStatusColChart.options = {
                'title': dataLogStatusTitle + serverName
            };
        };
        
        $scope.getIISlogStatusColChart1 = function (serverName, rowData) {
            $scope.iisLogStatusColChart1 = {};    
            $scope.iisLogStatusColChart1.type = "ColumnChart";

            $scope.iisLogStatusColChart1.data = {
                "cols": dataLogStatus, 
                "rows": rowData
            };

            $scope.iisLogStatusColChart1.options = {
                'title': dataLogStatusTitle + serverName
            };
        };
        
        /********************************************************************************************************/   
        
        var dataNoOfHitsAPI = [
                    {id: "api", label: "API Link", type: "string"},
                    {id: "noh", label: "No of Hits", type: "number"}
                ];
        var dataNoOfHitsAPITitle = 'No of hits based on API link - Server : ';
        
        $scope.getIISLogNoOfHitsAPIColChart = function (serverName, rowData) {
            $scope.iisLogNoOfHitsAPIColChart = {};    
            $scope.iisLogNoOfHitsAPIColChart.type = "ColumnChart";

            $scope.iisLogNoOfHitsAPIColChart.data = {
                "cols": dataNoOfHitsAPI, 
                "rows": rowData
            };

            $scope.iisLogNoOfHitsAPIColChart.options = {
                'title': dataNoOfHitsAPITitle + serverName
            };
        };
        
        $scope.getIISLogNoOfHitsAPIColChart1 = function (serverName, rowData) {
            $scope.iisLogNoOfHitsAPIColChart1 = {};    
            $scope.iisLogNoOfHitsAPIColChart1.type = "ColumnChart";

            $scope.iisLogNoOfHitsAPIColChart1.data = {
                "cols": dataNoOfHitsAPI, 
                "rows": rowData
            };

            $scope.iisLogNoOfHitsAPIColChart1.options = {
                'title': dataNoOfHitsAPITitle + serverName
            };
        };
        
        /********************************************************************************************************/   
        
        $scope.getIISlogErrorStatusBarChart = function (serverName, rowData) {
            var chartData = {
                "cols": [
                    {id: "s", label: "Status Code", type: "string"},
                    {id: "t", label: "Total of hits", type: "number"}
                ], 
                "rows": rowData
            };
            
            /*$scope.iisLogErrorStatusPieChart = {};    
            $scope.iisLogErrorStatusPieChart.type = "PieChart";

            $scope.iisLogErrorStatusPieChart.data = chartData;

            $scope.iisLogErrorStatusPieChart.options = {
                'title': 'Status Report'
            }; */
            
            $scope.iisLogErrorStatusBarChart = {};
            $scope.iisLogErrorStatusBarChart.type = "BarChart";

            $scope.iisLogErrorStatusBarChart.data = chartData;

            $scope.iisLogErrorStatusBarChart.options = {
                'title': 'Status Code Report - Server : ' + serverName
            };
        };
        
        /********************************************************************************************************/ 

        $scope.hideSeries = function (selectedItem) {
            if(selectedItem != undefined) {
                if(selectedItem.column != undefined) {
                //if (selectedItem.column === null) {
                    var col = selectedItem.column;
                    var row = selectedItem.row;
                    $log.debug('col: ' + JSON.stringify(col) + ' - row: ' + JSON.stringify(row));
                    var data = $scope.iisLogNoOfHitsAPIColChart.data.rows[row].c;
                    $log.debug(data.length + ' - ' + data[0].v);
                    
                    var apiLink = data[0].v;
                    botIISLogService.getIISLogNoOfHitsAPICIP(apiLink)
                        .success(function(data) {
                            var rowData = [];
                            var rowData1 = [];
                            var serverName = 'B';
                            //$log.debug('getIISLogErrorStatusReport: ' + JSON.stringify(data));

                            angular.forEach(data, function(value, key) {  
                                //serverName = value1.serverName;
                                //var logdata = value1.iisLogNoOfHitsAPI.iisLogNoOfHitsAPIDetails;
                                //var count = 0;
                                rowData.push({c: [
                                            {v: value.sourceIP },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                                /*angular.forEach(logdata, function(value, key) {
                                    $scope.iisLogNoOfHitsAPICollection.push({apiLink : value.apiLink, noOfHits: value.noOfHits });  

                                    if (count < logdata.length/2) {
                                        rowData.push({c: [
                                            {v: value.apiLink },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                                    }
                                    else {
                                        rowData1.push({c: [
                                            {v: value.apiLink },
                                            {v: parseInt(value.noOfHits)}
                                        ]});
                                    }
                                    count++;
                                }); */
                            });
                            $scope.getIISLogNoOfHitsAPIColChart(serverName, rowData);
                            //$scope.getIISLogNoOfHitsAPIColChart1(serverName, rowData1);
                        })
                        .error(function(data) {
                            $log.debug('Error: ' + data);
                        }); 
                    /*for (var i = 0; i < data.length; i++) {
                        $log.debug('hideSeries1: ' + JSON.stringify(data[i]));
                    }
                    angular.forEach(data, function(value, key) {  
                        $log.debug('hideSeries2: ' + JSON.stringify(value.v));
                        serverName = value1.serverName;
                        var logdata = value1.iisLogErrorStatus.iisLogErrorStatusDetails;
                        angular.forEach(logdata, function(value, key) {
                            $scope.iisLogErrorStatusCollection.push({status : value.status, total: value.total}); 
                            
                            rowData.push({c: [
                                {v: value.status },
                                {v: parseInt(value.total)}
                            ]});
                        }); 
                    });*/
                    
                }
                if (selectedItem.row === null) {

                    /*if ($scope.iisLogNoOfHitsAPIColChart.view.columns[col] == col) {
                        $scope.iisLogNoOfHitsAPIColChart.view.columns[col] = {
                            label: $scope.iisLogNoOfHitsAPIColChart.data.cols[col].label,
                            type: $scope.iisLogNoOfHitsAPIColChart.data.cols[col].type,
                            calc: function() {
                                return null;
                            }
                        };
                        $scope.iisLogNoOfHitsAPIColChart.options.colors[col - 1] = '#CCCCCC';
                    }
                    else {
                        $scope.iisLogNoOfHitsAPIColChart.view.columns[col] = col;
                        $scope.iisLogNoOfHitsAPIColChart.options.colors[col - 1] = $scope.iisLogNoOfHitsAPIColChart.options.defaultColors[col - 1];
                    }*/
                }
            }
        };
        
    }
})();