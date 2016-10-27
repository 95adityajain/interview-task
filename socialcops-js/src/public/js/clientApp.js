/* CONSTANTS **/
app.constant ('registerUrl', "/api/register");
app.constant ('loginUrl', "/api/login");
app.constant ('detailsUrl', "/api/details");
app.constant ("subscriptionsUrl", "/api/subscriptions");
app.constant ("notificationsUrl", "/api/notifications");

/* SERVICES */
/**
 * @service socket
 * @description Service to wrap the socket object returned by Socket.IO, so can be used as a dependency in angular.
 */
app.factory('socket', function ($rootScope, $log) {
  var socket = io();
  return {
    on: function (eventName, callback) {
        socket.on(eventName, function () {
            $log.debug (eventName + " event received.");  
            var args = arguments;
            $rootScope.$apply(function () {
                callback.apply(socket, args);
            });
        });
    },
    emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
            $log.debug (eventName + " event emitted.");
            var args = arguments;
            $rootScope.$apply(function () {
                if (callback) {
                    callback.apply(socket, args);
                }
            });
        })
    },
    disconnect: function () {
        $log.debug ("Socket disconnecting.");
        socket.disconnect ();
    },
    reconnect: function () {
        $log.debug ("Socket reconnecting.");
        socket.reconnect ();
    }
  };
});

/**
 * @service socketEventService
 * @description Service that wraps all customs Socket.IO events used in app.
 */
app.factory ("socketEventService", function (socket) {
    return {
        /**
         * Function that registers callback to Socket.IO custom event "notification"
         * "notification" event is emitted by server when some user in user's subscription list make some changes to database.
         * @param  {Function} callback
         */
        onNotification : function (callback) {
            socket.on ("notification", callback);
        },
        /**
         * Function that registers callback to Socket.IO custom event "receive:allNotifications"
         * "receive:allNotifications" event returns current user's all notifications.
         * @param  {Function} callback
         */
        onReceiveAllNotifications : function (callback) {
            socket.on ("receive:allNotifications", callback);
        },
        /**
         * Function that emits "add:subscription" custom event to server, to add new subscription to database.
         * @param  {Object} subscription 
         */
        emitAddSubscription : function (subscription) {
            socket.emit ("add:subscription", subscription);
        },
        /**
         * Function that emits "send:allNotifications" custom event to server, asking server to send curretn user's all notifications.
         * @param  {Number} userId
         */
        emitSendAllNotifications : function (userId) {
            socket.emit ("send:allNotifications", userId);
        },
        /**
         * Function that registers callback to Socket.IO custom event "add:newUser"
         * "add:newUser" event is emitted by server when a new user is registered in database, so we can update out app. 
         * @param  {Function} callback
         */
        onAddNewUser : function (callback) {
            socket.on ("add:newUser", callback);
        },
        /**
         * Function that registers callback to Socket.IO custom event "add:newUserField"
         * @param  {Function} callback
         */
        onAddNewUserField : function (callback) {
            socket.on ("add:newUserField", callback);
        }
    };
});

/**
 * @service xhrService
 * @description Service that wraps custom http request specific to app.
 */
app.factory ("xhrService", function ($http, $rootScope, $log, toastService, loadingService) {
    return {
        /**
         * @param  {String} url request url.
         * @param  {String} method http request method name
         * @param  {Object} params data to sent along with request
         * @param  {Function} successCallback function to be executed when request is completed successfully.
         */
        send : function (url, method, params, successCallback) {
            $log.debug ("Sending request to : "+ method + "-" +url + "-"+params);
            loadingService.start ();
            $http[method] (url, params)
            .then (function (response) {
                $log.debug (response);
                loadingService.stop ();
                if (response.data.status === "success") {
                    successCallback (response.data);
                } else {
                    toastService.show (response.data.message);
                }
            }, function (error) {
                $log.debug (error);
                loadingService.stop ();
                toastService.show ('Oops! Some error occured.');
            });
        }
    }
});

/**
 * @service toastService
 * @description Service that wraps Angular-Material $mdToast directive.
 */
app.factory ("toastService", function ($mdToast) {
    return {
        /**
         * Shows simple toast with custom message.
         * @param  {String} message custom message to be shown on toast.
         */
        'show' : function(message) {
            var toast = $mdToast.simple()
                .textContent(message)
                .highlightClass('md-accent')
                .position('bottom left')
                .hideDelay(4000);

            $mdToast.show(toast);
        },
        /**
         * shows toast with custom action.
         * @param  {String} message custom message to be shown on toast.
         * @param  {String} actionName custom value to show in action button of toast.
         * @param  {Function} callback function to be executed when action button is clicked.
         */
        'showWithAction' : function (message, actionName, callback) {
            var toast = $mdToast.simple()
                .textContent(message)
                .action(actionName)
                .highlightAction(true)
                .highlightClass('md-accent')
                .position('bottom right')
                .hideDelay(7000);

            $mdToast.show(toast)
            .then(function(response) {
                if ( response == 'ok' ) {
                    callback ();
                }
            });
        }
    };
});

/**
 * @service loadingService
 * @description Service that wraps loading process specific to app
 */
app.factory ("loadingService", function ($rootScope) {
    return {
        start : function () {
            $rootScope.data.isProcessing = true;
        },
        stop : function () {
            $rootScope.data.isProcessing = false;
        },
        isLoading : function () {
            return $rootScope.data.isProcessing;
        }
    };
})

/**
 * @service notificationService
 * @description Service that wraps Notification component logic.
 */
app.factory ("notificationService", function ($rootScope, xhrService, notificationsUrl, userService) {
    return {
        /**
         * Function to get all user's notification from server and load it in rootScope.
         */
        getAllFromServer : function () {
            xhrService.send (notificationsUrl+"/"+userService.getLoggedInUserId (), "get", null, function (response) {
                $rootScope.data.notifications = response.notifications;
            });
        },
        /**
         * Function to add notification to rootScope.
         * @param {Object} notification
         */
        add : function (notification) {
            $rootScope.data.notifications.push (notification);
        },
    }
});

/**
 * @service userService
 * @description Service that wraps User component logic.
 */
app.factory ("userService", function ($rootScope, xhrService, routingService, loginUrl, registerUrl, toastService, $log) {
    return {
        getLoggedInUsername : function () {
            if ($rootScope.data.user) {
                return $rootScope.data.user.username;
            }
            return "";
        },
        getLoggedInUserId : function () {
            return $rootScope.data.user.id;
        },
        isLoggedIn : function () {
            return $rootScope.data.loggedIn;
        },
        getOtherUsernameById : function (userId) {
            if ($rootScope["data"]["subscriptions"][userId]) {
                return $rootScope["data"]["subscriptions"][userId]["username"];
            }
            $log.debug ("No Username found for userId : "+userId);
            return "";
        },
        login : function (username, password, callback) {
            xhrService.send (loginUrl, "post", {username : username, password : password}, function (response) {
                $rootScope.data.loggedIn = true;
                $rootScope.data.user = response.user;
                callback (); //get notifications after login
                routingService.gotoSubscriptions ();
            })
        },
        register : function (username, password) {
            xhrService.send (registerUrl, "post", {username : username, password : password}, function (response) {
                toastService.show (response.message);
            })
        },
        logout : function () {
            $rootScope ["data"] = {
                loggedIn : false,
                user : null,
                subscriptions : null,
                subscribeAll : false,
                subscribeAllPerUser : {},
                isProcessing : false,
                notifications : []
            };
            routingService.gotoHome ();
        }
    };
});

/**
 * @service detailsService
 * @description Service that wraps Details Component logic.
 */
app.factory ("detailService", function ($rootScope, xhrService, detailsUrl, userService) {
    return {
        get : function (callback) {
            xhrService.send (detailsUrl+"/"+userService.getLoggedInUserId (), "get", null, callback);
        },
        add : function (fieldName, fieldValue, callback) {
            xhrService.send (detailsUrl, "put", {
                "user_id" : userService.getLoggedInUserId (), 
                "detail" : {"field_name":fieldName, "field_value":fieldValue}
            }, callback);
        },
        update : function (fieldName, fieldValue, callback) {
            xhrService.send (detailsUrl, "post", {
                "user_id" : userService.getLoggedInUserId (), 
                "detail" : {"field_name":fieldName, "field_value":fieldValue}
            }, callback);
        },
        delete : function (fieldName, callback) {
            xhrService.send (detailsUrl+"/"+userService.getLoggedInUserId ()+"/"+fieldName, "delete", null, callback);
        }
    };
});

/**
 * @service subscriptionService
 * @description Service that wraps Subscription Component logic.
 */
app.factory ("subscriptionService", function ($rootScope, xhrService, subscriptionsUrl, userService, toastService, socketEventService, $log) {
    return {
        /**
         * Function to checks if current user subscribed to @subscribedUserId and to particular fieldName.
         * @param  {Number} subscribedUserId
         * @param  {String} fieldName
         * @return {Boolean}
         */
        isSubscribedTo : function (subscribedUserId, fieldName) {
            if ($rootScope["data"]["subscriptions"][subscribedUserId]) {
                return $rootScope["data"]["subscriptions"][subscribedUserId]["details"][fieldName] === 1;
            }
            return false;
        },
        /**
         * Function to check if current user is subscribed to all fields of @subscribedUserId
         * @param  {Number} subscribedUserId
         * @return {Boolean}
         */
        isSubscribedAllTo : function (subscribedUserId) {
            return $rootScope["data"]["subscribeAllPerUser"][subscribedUserId]; //|| $rootScope.data.subscribeAll ;
        },
        setSubscribeAll : function (val) {
            $rootScope.data.subscribeAll = val;
        },
        setUserSpecificSubscribeAll (userId, val) {
            $rootScope["data"]["subscribeAllPerUser"][userId] = val;    
        },
        setSubscription : function (subscriptions) {
            $rootScope.data.subscriptions = angular.copy (subscriptions);
        },
        getSubscriptionsFromServer : function (callback) {
            xhrService.send (subscriptionsUrl+"/"+userService.getLoggedInUserId (), "get", null, callback);
        },
        /**
         * Function to save subscription to server and on success make changes to app state.
         * @param  {Object} subscriptionToSend
         * @param  {Object} allSubscription
         * @param  {Function} callback
         */
        saveSubscription : function (subscriptionToSend, allSubscription, callback) {
            xhrService.send (subscriptionsUrl+"/"+userService.getLoggedInUserId (), "post", {subscriptions : subscriptionToSend || {}}, function (response) {
                toastService.show ("Subscriptions Saved.");
                socketEventService.emitSendAllNotifications (userService.getLoggedInUserId ());

                $rootScope.data.subscriptions = angular.copy (allSubscription);
                var subscriptions = $rootScope.data.subscriptions;
                Object.keys (subscriptions).forEach (function (userId) {
                    var allCurUserTrue = true;
                    var fieldsObj = subscriptions[userId]["details"];
                    Object.keys (fieldsObj).forEach (function (curFieldName) {
                        if (fieldsObj [curFieldName] == 0) {
                            allCurUserTrue = false;
                        }
                    });
                    $rootScope["data"]["subscribeAllPerUser"][userId] = (allCurUserTrue);
                });

                callback ();
            });
        }
    };
});

/**
 * @service routingService
 * @description Service that wraps all routes of app.
 */
app.factory ("routingService", function ($rootScope, $location) {
    return {
        gotoHome : function () {
            $location.path ("/");
        },
        gotoNotifications : function () {
            $location.path ("/notifications");
        },
        gotoDetails : function () {
            $location.path ("/details");
        },
        gotoSubscriptions : function () {
            $location.path ("/subscriptions");
        },
        redirectIfLoggedOut : function () {
            if ($rootScope.data.loggedIn === false) {
                $location.path ("/");
            }
        }
    }
})

/* CONFIGURATIONS */
app.config(['$routeProvider','$locationProvider','$logProvider',function($routeProvider,$locationProvider,$logProvider) {
    $logProvider.debugEnabled(true);
    if (window.history && history.pushState) {
        $locationProvider.html5Mode(true);
    }
    $routeProvider.when("/",{
        title : "Gossip Girl",
        templateUrl : "/static/partials/auth.html",
        controller : "authController"
    });
    $routeProvider.when("/notifications",{
        title : "Notifications",
        templateUrl : "/static/partials/notifications.html",
        controller : "notificationsController"
    });
    $routeProvider.when("/details",{
        title : "Details",
        templateUrl : "/static/partials/details.html",
        controller : "detailsController"
    });
    $routeProvider.when("/subscriptions",{
        title : "Subscriptions",
        templateUrl : "/static/partials/subscriptions.html",
        controller : "subscriptionsController"
    });
    $routeProvider.otherwise({
        title : "Gossip Girl",
        templateUrl : "/static/partials/auth.html",
        controller : "authController"
    });
}]);

app.run(['$rootScope','$route','toastService','socketEventService','userService','notificationService','subscriptionService','loadingService','routingService',function($rootScope, $route,toastService, socketEventService, userService, notificationService, subscriptionService, loadingService, routingService) {
    $rootScope ["data"] = {
        loggedIn : false,
        user : null,
        subscriptions : null,
        subscribeAll : false,
        subscribeAllPerUser : {},
        isProcessing : false,
        notifications : []
    };
    socketEventService.onNotification (function (notification) {
        if (userService.isLoggedIn () && userService.getLoggedInUserId () != notification.actor_id) {
            if (subscriptionService.isSubscribedAllTo (notification.actor_id) || 
                subscriptionService.isSubscribedTo (notification.actor_id, notification.field_name)) {
                
                toastService.show ("Some New Notifications recieved.");
                notificationService.add (notification);
            }
        }
    });

    socketEventService.onAddNewUser (function (newUser) {
        if ($route.current.title === "Subscriptions") {
            toastService.showWithAction ("New User Available", "Refresh Page", function () {
                $route.reload ();
            });
        }
    });

    socketEventService.onAddNewUserField (function (userId) {
        if ($route.current.title === "Subscriptions" && !subscriptionService.isSubscribedAllTo (userId)) {
            toastService.showWithAction ("Some user made changes", "Refresh Page", function () {
                $route.reload ();
            });
        }
    })

    socketEventService.onReceiveAllNotifications (function (notifications) {
        if ($rootScope.data.user != null) {
            $rootScope.data.notifications = notifications;
        }
    });

    $rootScope.$on('$routeChangeSuccess',function() {
        $rootScope.pageTitle = $route.current.title;
        $rootScope.data.isProcessing = false;
    });

    $rootScope.isProcessing = loadingService.isLoading;
    $rootScope.isLoggedIn = userService.isLoggedIn;
    $rootScope.logout = userService.logout;
    $rootScope.routingService = routingService;
}]);

/* CONTROLLERS */
/**
 * @controller authController
 * @description Controller that wraps logic for user authentication.
 */
app.controller ("authController", ['$scope','routingService','userService','notificationService', function ($scope, routingService, userService, notificationService) {
    //if user is logged in then redirect user to subscription route.
    if (userService.isLoggedIn ()) {
        routingService.gotoSubscriptions ();
    }
    /**
     * data object correspoding to form input model.
     * @type {Object}
     */
    $scope.data = {
        username : "",
        password : "",
        passwordAgain : ""
    };
    /**
     * function to reset form input model.
     */
    $scope.resetState = function () {
        $scope.data = {
            username : "", password : "", passwordAgain : ""
        };
    };
    $scope.login = function () {
        userService.login ($scope.data.username, $scope.data.password, function () {
            notificationService.getAllFromServer ();
        });
    };
    $scope.register = function () {
        userService.register ($scope.data.username, $scope.data.password);
        $scope.resetState ();
    };
}]);

/**
 * @controller notificationsController
 * @description Controller for notifications route of app.
 */
app.controller ("notificationsController", ["$scope","routingService","userService", function ($scope, routingService, userService) {
    //if user is logged out then redirect user for authentication.
    routingService.redirectIfLoggedOut ();

    $scope.getLoggedInUsername = userService.getLoggedInUsername;
    $scope.getOtherUsernameById = userService.getOtherUsernameById;

    /**
     * Make Sentence from notification object for display.
     * @param  {Object} notification
     * @return {String} 
     */
    $scope.makeSentence = function (notification) {
        var sentence = "";
        if (notification.verb === 'updated') {
            sentence += "UPDATED " + notification.field_name + " to ";
            if (notification.field_value.trim () === "") {
                sentence += "NONE.";
            } else {
                sentence += notification.field_value + ".";
            }
        } else if (notification.verb === 'deleted') {
            sentence += "DELETED " + notification.field_name;
        } else {
            sentence += "ADDED " + notification.field_name + " as ";
            if (notification.field_value.trim () === "") {
                sentence += "NONE.";
            } else {
                sentence += notification.field_value + ".";
            }
        }
        return sentence;
    }

    /**
     * returns time string for display from timeStamp.
     * @param  {timeStamp}
     * @return {String}
     */
    $scope.getTime = function (timeStamp) {
        return new Date (parseInt (timeStamp)).toDateString ();
    }
}]);

/**
 * @controller detailsController
 * @description Controller for details route of app.
 */
app.controller ("detailsController", ["$scope", "routingService", "toastService","detailService", function ($scope, routingService, toastService,detailService) {
    //if user is logged out then redirect user for authentication.
    routingService.redirectIfLoggedOut ();

    $scope.data = {
        details : {},
        newDetail : {name : "", value : ""}
    };
    $scope.emptyDetails = function () {
        if (Object.keys ($scope.data.details).length == 0) return true;
        return false;
    }
    $scope.getDetails = function () {
        detailService.get (function (response) {
            $scope.data.details = response.details.reduce (function (acc, detail) {
                acc [detail.field_name] =  {
                    value : detail.field_value,
                    edit : false,
                    newValue : ""
                };
                return acc;
            }, {});
        });
    }
    $scope.addDetail = function (key, value) {
        detailService.add (key, value, function (response) {
            $scope["data"]["newDetail"]["name"] = "";
            $scope["data"]["newDetail"]["value"] = "";
            $scope.data.details [key] = {
                value : value,
                edit : false,
                newValue : ""
            };
            toastService.show (response.message);
        });
    }
    $scope.updateDetail = function (key, value) {
        detailService.update (key, value, function (response) {
            $scope.data.details [key]["value"] = value;
            $scope.data.details [key]["newValue"] = "";
            $scope.data.details [key]["edit"] = false;
            toastService.show (response.message);
        });
    }
    $scope.deleteDetail = function (key) {
        detailService.delete (key, function (response) {
            delete $scope.data.details [key];
            toastService.show (response.message);
        });
    }

    $scope.toggleEdit = function (key) {
        $scope.data.details [key]["edit"] = $scope.data.details [key]["edit"] ? false : true; 
    }

    $scope.getDetails ();
}]);

/**
 * @controller detailsController
 * @description Controller for subscriptions route of app.
 */
app.controller ("subscriptionsController", ["$scope","subscriptionService","$timeout","socketEventService","routingService","loadingService", function ($scope, subscriptionService, $timeout, socketEventService, routingService, loadingService) {
    //if user is logged out then redirect user for authentication.
    routingService.redirectIfLoggedOut ();

    $scope.data = {
        subscribeAll : false,
        subscribeAllPerUser : {},
        subscriptions : {}
    };
    var initializing1 = true; //for explicitly watchers to run first time;

    $scope.emptySubscriptions = function () {
        return Object.keys ($scope.data.subscriptions).length == 0;
    }

    $scope.subscribeAllSpecificUser = function (userId) {
        $scope.subscribeAllToggle ([userId], $scope["data"]["subscribeAllPerUser"][userId]);
    }

    $scope.subscribeAllToggle = function (users, value) {
        users.forEach (function (userId) {
            $scope["data"]["subscribeAllPerUser"][userId] = value;
            var fieldsObj = $scope["data"]["subscriptions"][userId]["details"];
            Object.keys (fieldsObj).forEach (function (curFieldName) {
                fieldsObj [curFieldName] = value ? 1 : 0;
            });
        });
    };

    function bootstrapSubscriptions (subscriptions, fromRootScope) {
        if (subscriptions) {
            $scope.data.subscriptions = subscriptions;
            var dirtyAll = false;
            Object.keys (subscriptions).forEach (function (userId) {
                var allCurUserTrue = true;
                var fieldsObj = subscriptions[userId]["details"];
                var dirtyAllSpecific = false;

                if (Object.keys (fieldsObj).length > 0) {
                    dirtyAll = true;
                    dirtyAllSpecific = true;
                    if (!fieldsObj ["ALL"]) {
                        allCurUserTrue = false;
                    } else {
                        delete $scope["data"]["subscriptions"][userId]["details"]["ALL"];
                    }
                }
                var valSpecific = (allCurUserTrue && dirtyAllSpecific) ? true : false; 
                $scope["data"]["subscribeAllPerUser"][userId] = valSpecific;
                subscriptionService.setUserSpecificSubscribeAll (userId, valSpecific); //updating rootscope
                $scope.$watch ("data['subscribeAllPerUser']["+userId+"]", function () {
                    if (!initializing1) {
                        $scope.subscribeAllSpecificUser (userId);
                    } else {
                        $timeout(function() { initializing1 = false; });
                    }
                });
            });

            //updating rootscope
            subscriptionService.setSubscription (subscriptions);

            loadingService.stop ();
        }
    }

    $scope.getSubscribers = function () {
        subscriptionService.getSubscriptionsFromServer (function (response) {
            bootstrapSubscriptions (response.subscriptions, false);
        });
    };

    $scope.saveSubscription = function () {
        loadingService.start ();
        var newSubscriptions = {};
        for (var curUserId in $scope.data.subscriptions) {
            var curUserFields = $scope["data"]["subscriptions"][curUserId]["details"];
            var isAllTrue = true;
            for (var curFieldName in curUserFields) {
                if (curUserFields [curFieldName] === 1) {
                    if (!newSubscriptions [curUserId]) {
                        newSubscriptions [curUserId] = [];
                    }
                    newSubscriptions [curUserId].push (curFieldName);
                } else {
                    isAllTrue = false;
                }
            }
            if (isAllTrue) {
                if (newSubscriptions [curUserId]) {
                    newSubscriptions [curUserId].push ("ALL");
                } else if ($scope["data"]["subscribeAllPerUser"][curUserId]) {
                    newSubscriptions [curUserId] = [];
                    newSubscriptions [curUserId].push ("ALL");
                }
            }
        }
        subscriptionService.saveSubscription (newSubscriptions, $scope.data.subscriptions, function () {
            routingService.gotoNotifications ();
        });
    };

    $scope.getSubscribers ();
}]);