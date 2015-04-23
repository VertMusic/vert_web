/** Define application routes **/
App.Router.map(function () {
    
    window.console.log("Intializing router...");

    this.resource("about");
    this.resource("login");
    
    /// TODO: eventually created a nested resource and combine with 'login' (This may cause 'action' issue in controller, so holding off)
    this.resource("session", function(){
        this.route("destroy");
    });
    
    /// TODO: created nested 'user' resource, where 'new' is 'register' and add 'edit' resource.
    this.resource("register");
    
    /// Playlists provides us with nested contents, where we can navigate to all the different playlists
    this.resource("playlists", function() {
        this.resource("playlist", {path: "/:playlist_id"});
    });
    
    /// Activate a user
    this.resource('activate', {path: '/activate/:activate_id'});
});

/** Routes determine which data model is applied to the template specified as a resource in the Router **/
App.AuthenticatedRoute = Ember.Route.extend({
    ///Save attempted route so it can be loaded after login success.
    redirectToLogin: function(transition) {
        window.console.log("Redirect to login...");
        this.session.set('attemptedTransition', transition);
        this.transitionTo('login');
    },
    ///First check whether the user has an authorization token in session
    beforeModel: function(transition) {
        if (!this.session.get('authToken')) {
            window.console.log("Redirect to transistion...");
            this.redirectToLogin(transition);
        }
    },
    
    actions: {
        error: function(error, transition) {
            if (error.status == 401) {
                /// Redirect to login as authentication failed. Set all cookies empty
                this.session.setProperties({
                    authToken:  '',
                    authUserId: ''
                });

                this.session.set('attemptedTransition', transition);
                this.transitionTo('login');
            }
        }
    }
});

/** Can enter Vert index page for login and registration and info **/
App.ApplicationRoute = Ember.Route.extend({
    init: function() {
        if (!this.get("session.authUserId")) {
            window.console.log("Starting application (No user session defined)...");
        } else {
            window.console.log("Starting application for user session: " + this.session.get("authUserId") + "...");
        }
    },
    actions: {
        showModal: function(name, model) {
          this.render(name, {
            into: 'application',
            outlet: 'modal',
            model: model
          });
        },
        removeModal: function() {
          return this.disconnectOutlet({
            outlet: 'modal',
            parentView: 'application'
          });
        }
    }, 
    redirect: function() {
        if (this.get("session.authUserId")) {
            this.transitionTo('playlists');
        }
    }
});

/** Can't access playlists until authenticated **/
App.PlaylistsRoute =  App.AuthenticatedRoute.extend({
    model: function () {
        /// Returns list of 'playlists' items (just their information (not the songs)
        /// Makes GET request to: <host><namespace>/playlists
        return this.store.find("playlist");
    },
    renderTemplate: function() {
        this.render({ outlet: 'playlists' });
    }
});

/** Can't access a sepcific playlist until authenticated **/
App.PlaylistRoute =  App.AuthenticatedRoute.extend({
    model: function (params) {
        /// Returns server data associated with specific "playlist_id"        
        /// Makes GET request to: <host><namespace>/playlists/<id>
        return this.store.find("playlist", params.playlist_id);
    }, 
    
    actions: {
        didTransition: function() {
            window.console.log("route transition....");   
        }
    }
});

/** You can register without being authenticated **/
App.RegisterRoute = Ember.Route.extend({
    model: function() {
        return this.store.createRecord('user');
    },
    renderTemplate: function(controller, model) {
        /// Render the `register` template into the outlet `notAuth`
        this.render('register', {
              outlet: 'notAuth'
        });
    }, 
    deactivate: function() {
    this.controllerFor('register').send('reset');
  }
});

/** You can login without being authenticated **/
App.LoginRoute = Ember.Route.extend({
    renderTemplate: function(controller, model) {
        /// Render the `login` template into the outlet `notAuth`
        this.render('login', {
              outlet: 'notAuth'
        });
    }
});

/** You activate an account via a link from your email **/
App.ActivateRoute = Ember.Route.extend({
    model: function(params) {
        return this.store.find("activate", params.activate_id);
    },
    renderTemplate: function(controller, model) {
        /// Render the `activate` template into the outlet `notAuth`
        this.render('activate', {
              outlet: 'notAuth'
        });
    }
});

/** You can't log out unless you are authenticated **/
App.SessionDestroyRoute =  App.AuthenticatedRoute.extend({
    renderTemplate: function(controller, model) {
        ///Log out by removing login data from session (calls SessionDestroyController.logout())
        controller.logout();
    }
});
