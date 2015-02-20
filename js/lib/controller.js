/********************************************************************************/
/** Controller stores application state, and responds to events from templates **/
/********************************************************************************/

App.ApplicationController = Ember.Controller.extend({
    ///Place any logic that belongs on the main landing (index) page here
});

App.PlaylistsController = Ember.ArrayController.extend({
    isAddingPlaylist: false,
    actions : {
        addNew: function() {
            // 'Add Playlist' is triggered
            window.console.log("Adding new playlist...");
            this.set('isAdding', true);
        },
        saveNew: function() {
            var self = this;
            self.set('isAdding', false);
            
            ///Get name of playlist to be added, return if the name is empty string
            var playlistName = self.get('playlistName');
            if (!playlistName.trim()) { return; }
            
            ///Create date of creation
            var date = new Date();
            var dateString = moment().format("MM-DD-YYYY HH:mm");
            
            window.console.log("New playlist being created: name:" + playlistName + ", date:" + dateString +", author:" + this.session.get("authUser.username"));
            
            ///Create new playlist record
            var playlist = this.store.createRecord("playlist", {
                name: playlistName,
                author: this.session.get("authUser.username"),
                date: dateString
            });
            
            ///Clear DOM field
            self.set("playlistName","");
            
            ///Save new playlist then navigate to its page
            playlist.save().then(function(newPlaylist){
                window.console.log("New playlist '" + newPlaylist.get("name") + "' created successfully...");
                
                ///Navigate to new page (Scroll to top incase of a long page)
                window.scrollTo(0,0);
                self.transitionToRoute("playlist", newPlaylist);
            });
        }
    }
});

App.PlaylistController = Ember.ObjectController.extend({
    isEditing: false,
    actions: {
        edit: function() {
            // Edit action is triggered - causes input element to be rendered after 'isEditing' is set.
            this.set('isEditing', true);
            window.console.log("Editing playlist title...");
		},
        doneEditing: function() {
            window.console.log("Done editing playlist title...");
            this.set('isEditing', false);
            
            ///Update the new model on the server.
            this.model.save().then(function(playlist){
                window.console.log("Playlist updated");
            });
        }
    }
});
App.SongModalController = Ember.ObjectController.extend({
  actions: {
    save: function() {
      alert("Save is not yet implemented...");
    }
  }
});

App.RegisterController = Ember.ObjectController.extend({
    name: null,
    email: null,
    username: null,
    password: null,
    
    actions: {
        createUser: function() {
            var self = this;
            ///Get the properties set by the user on the registration page
            var data = self.getProperties("name","username","password","email");
            window.console.log("Create user triggered: " + JSON.stringify(data));

            ///Make sure the required fields are present
            if (!Ember.isEmpty(data.username) && !Ember.isEmpty(data.password)) {
                /// POST new user data to server
                var user = this.store.createRecord('user', data);
                user.save().then(function(results) {
                    window.console.log("New user created: " + user.get('accessToken'));
                    self.set("session.authToken", user.get("accessToken"));
                    self.set("session.authUserId", user.get("id"));
                    self.transitionToRoute("index");
                });
            } else {
                window.console.log("ERROR: There are missing fields in the registration form!");   
            }
        },
        
        reset: function() {
            ///TODO: Clear all fields
            alert("Not implemented - Clearing form...");
        }
    }
});

App.LoginController = Ember.Controller.extend({
    username: null,
    password: null,
    remember: true,
    loginFailed: false,
    
    actions: {
        login: function() {
            var self = this;
            var data = self.getProperties('username', 'password');

            if (!Ember.isEmpty(data.username) && !Ember.isEmpty(data.password)) {
                window.console.log("Username and password are provided...");
                var postData = { session: { username: data.username, password: data.password } };
                
                var hash = {};
                hash.url = "http://192.168.56.101:8080/vert/data/session";
                hash.type = "POST";
                hash.dataType = 'json';
                hash.contentType = 'application/json; charset=utf-8';
                hash.data = JSON.stringify(postData);

                $.ajax(hash).then(
                    function(success){
                        window.console.log("Login success - server response to login: " + success);
                        var sessionData = (success.session || {})

                        /// Important to remember first, since there is no listener on it
                        self.set("session.remember", self.get("remember"));
                        self.set("session.authToken", sessionData.accessToken);
                        self.set("session.authUserId", sessionData.userId);

                        var attemptedTransition = self.session.get('attemptedTransition');
                        if (attemptedTransition) {
                            attemptedTransition.retry();
                            self.session.set('attemptedTransition', null);
                        } else {
                            self.transitionToRoute('index');
                        }
                    },
                    function(failure) {
                        /// Show warning that information is incorrect
                        window.console.log("Login error - Unauthorized access!");
                        self.send('reset');
                        self.set("loginFailed", true);
                    });
            } else {
                /// Show warning that information is incorrect
                window.console.log("Login error - Username and password are missing...");
                self.send('reset');
                self.set("loginFailed", true);
            }
        },
        
        forgotPassword: function() {
            ///TODO: Send password to user's email account
            alert("Not implemented - Sending password to your email...");
        },
        
        reset: function() {
            this.setProperties({
                password: "",
                username: "",
                remember: true
            });
            this.set('loginFailed', false);
        }
    }
});

App.SessionDestroyController = Ember.Controller.extend({
    logout: function() {
        ///This removes our sessesion and triggers the removal of cookies as well
        window.console.log("Logging out...");
        this.session.setProperties({
            authToken:  '',
            authUserId: ''
        });
        this.transitionToRoute('login');
    }
});