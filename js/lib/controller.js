/********************************************************************************/
/** Controller stores application state, and responds to events from templates **/
/********************************************************************************/

App.ApplicationController = Ember.Controller.extend({
    songUrl: (function() {
        return this.get("constants.ip") + "/vert/file/song/";
    }).property("constants.ip"),
    currentSong: "",
    currentSongIndex: null,
    currentPlaylist: [],
    
    isIndex: (function() {
        window.console.log("Current route: "+this.get("currentRouteName"));
        return this.get("currentRouteName") == "index";
    }).property("currentRouteName"),
    
    isLanding: (function() {
        var current = this.get("currentRouteName");
        window.console.log("Current route: " + current);
        return (current == "index" || current == "playlists.index");
    }).property("currentRouteName"),
    
    actions : {
        toggleOptionsMenu: function() {            
            ///Toggle css class to open or close options menu
            $('#optionsMenu').toggleClass('open');
            
            ///Close options menu when option is clicked
            $('#optionsMenu a').on('click', function() { 
                $('#optionsMenu .navbar-toggler').trigger('click'); 
                
                ///Toggle css classes to close playlist menu
                $('#playlistToggle').removeClass('open');
                $('#wrapper').removeClass('toggled');
            });
        },
        togglePlaylistMenu: function() {
                        
            ///Toggle css classes to open playlist menu
            $('#playlistToggle').toggleClass('open');
		    $('#wrapper').toggleClass('toggled');
            $('#audio-player-container').toggleClass('open');
            
            ///Set listener on meu items for select: 
            ///TODO can be removed after adding {{#link-to}}, then alse change '.higlight' to '.active' in css file
            $('.list-group-item').click(function() {
                $('.list-group-item').removeClass('highlight');
                $(this).addClass('highlight');
            });
            
            if ($('#playlistToggle').hasClass('open')) {
                this.transitionToRoute("playlists");
            }
        }
    }
});

App.PlaylistsController = Ember.ArrayController.extend({
    isAddingPlaylist: false,
    actions : {
        addNew: function() {
            // 'Add Playlist' is triggered
            window.console.log("Adding new playlist...");
            this.set('isAdding', true);
        },
        cancelNew: function() {
            this.set('isAdding', false);
            this.set("playlistName","");
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
                date: dateString,
                visibility: "private",
                likes: 0
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
    isAddingSong: false,
    isSubmitting: false,
    oldValue: "",
    currentSong: "",
    
    needs: ['application'],
    
    actions: {
        edit: function() {
            // Edit action is triggered - causes input element to be rendered after 'isEditing' is set.
            oldValue = this.get('name');
            this.set('isEditing', true);
            window.console.log("Editing playlist title...");
        },
        cancelEditing: function() {
            this.set('name', oldValue);
            this.set('isEditing', false);
        },
        doneEditing: function() {
            window.console.log("Done editing playlist title...");
            this.set('isEditing', false);
            
            ///Update the new model on the server.
            this.model.save().then(function(playlist){
                window.console.log("Playlist updated");
            });
        },
        playSong: function(id) {
            var audioContainer =  document.getElementById("audio-player-container"); //$('#audio-player');
            var audioPlayer = document.getElementById("audio-player");
            var audioSongTitle = document.getElementById("audio-player-title");
            var audioSongArtist = document.getElementById("audio-player-artist");
            
            var songRow = document.getElementById(id);
            var songRowPlay = songRow.getElementsByClassName("play")[0];
            var songRowArtist = songRow.getElementsByClassName("song-artist")[0];
            var songRowTitle = songRow.getElementsByClassName("song-title")[0];
            
            if (songRowPlay.classList.contains("glyphicon-play")) {
                /// It is the play icon, so play the song
                if (this.get("controllers.application.currentSong") != id) {
                    /// Start new song
                    window.console.log("Starting new song: " + this.get("controllers.application.currentSong") + " != " + id);
                    
                    this.set("controllers.application.currentSong", id);
                    
                    /// Create a new playlist of continous songs if it is a song from a different playlist than that is currently being played
                    var containsID = false;
                    for (var i=0; i < this.get("controllers.application.currentPlaylist").length; i++) {
                        if (this.get("controllers.application.currentPlaylist")[i].id == id) {
                            containsID = true;   
                        }
                    }
                    
                    var currentSongIndex;
                    if (!containsID) {
                        window.console.log("Making playlist...");
                        /// Generate playlist based from current song being played
                        var allPlaylistSongs = document.getElementsByClassName("song");
 
                        for (var i=0, el; el = allPlaylistSongs[i]; i++) {
                            window.console.log(i + ": " + el.id);
                            if (el.id == id) {
                                currentSongIndex = i;
                            }
                            var song = { "id": el.id,
                                         "url": this.get("controllers.application.songUrl") + el.id,
                                         "title": document.getElementById(el.id).getElementsByClassName("song-title")[0].innerHTML,
                                         "artist": document.getElementById(el.id).getElementsByClassName("song-artist")[0].innerHTML
                                       };
                            this.get("controllers.application.currentPlaylist").push(song);
                        }                   
                        
                    } else {
                        /// Set the current index, so when the song ends the ApplicationView can set thenext song in the list
                        for (var i=0, song; song = this.get("controllers.application.currentPlaylist")[i]; i++) {
                            if (song.id == id) {
                                currentSongIndex = i;
                                break;
                            }
                        } 
                    }
                    
                    window.console.log("Current: " + currentSongIndex);
                    this.set("controllers.application.currentSongIndex", currentSongIndex);
                    
                    //JSON.stringify(this.get("controllers.application.currentPlaylist"))
                    window.console.log(this.get("controllers.application.currentPlaylist"));
                    
                    /// Setup new song in player
                    audioSongTitle.innerHTML = songRowTitle.innerHTML;
                    audioSongArtist.innerHTML = songRowArtist.innerHTML;
                    audioPlayer.src = this.get("controllers.application.songUrl") + id;
                    
                } else {
                    /// Continue old paused song
                    window.console.log("Continue pause song: " + id);
                }
                audioPlayer.play();
            } else {
                /// It is the pause icon, so pause the current song
                audioPlayer.pause();
            }
            
            songRowPlay.classList.toggle("glyphicon-play");
            songRowPlay.classList.toggle("glyphicon-pause");
        },
        addSong: function() {
            var self = this;
            self.set('isAddingSong', true);
            window.console.log("Click add song...");
        },
        cancelAddSong: function() {
            this.set('isAddingSong', false);   
        },
        submitSongData: function() {
            var self = this;
            
            var data = self.getProperties("songTitle", "songArtist");
            if(!Ember.isEmpty(data.songTitle) && !Ember.isEmpty(data.songArtist)) {
                
                self.set("isSubmitting", true);
                
                var fileElement = $('.songFile')[0];
                var file = fileElement.files[0];
                window.console.log("FileElement: " + fileElement);
                window.console.log("File: " + file);
                
                var formData = new FormData();
                formData.append("playlistId", self.get("id"));
                formData.append("title", data.songTitle);
                formData.append("artist", data.songArtist);
                formData.append("file", file);
                formData.append("filename", file.name);

                var hash = {};
                hash.type = "POST";
                hash.url = self.get("constants.ip") + "/vert/file/song";
                hash.headers = { authorization: self.get("session.authToken")};
                hash.data = formData;
                hash.processData = false; //Prevent data from being turned into a string
                hash.contentType = false; //Ensures the boundary flag is added

                $.ajax(hash).then(
                    function(success){
                        window.console.log("Song add success - server response to song add: " + success);
                        self.store.push('song', success.song);
                        self.set('isAddingSong', false);
                        self.setProperties({
                            songTitle: '',
                            songArtist: ''
                        });
                        self.set("isSubmitting", false);
                    },
                    function(failure) {
                        window.console.log("Song add error...");
                        self.set('isAddingSong', false);
                        self.setProperties({
                            songTitle: '',
                            songArtist: ''
                        });
                        self.set("isSubmitting", false);
                    });
            } else {
                window.console.log("Song add error - song title or artist is missing...");   
            }
        }
    }
});

App.RegisterController = Ember.ObjectController.extend({
    name: null, 
    email: null,
    username: null,
    password: null,
    usernameFailed: false,
    completionFailed: false,
    buttonsDisabled: false,
    registrationComplete: false, // Registration Variable to notify user when account is created


    actions: {
        createUser: function() {
            var self = this;
            ///Get the properties set by the user on the registration page
            var data = self.getProperties("name","username","password","email");
            window.console.log("Create user triggered: " + JSON.stringify(data));

            ///Make sure all fields are present
            if (!Ember.isEmpty(data.username) && !Ember.isEmpty(data.password) && !Ember.isEmpty(data.name)
               && !Ember.isEmpty(data.email)) {
                self.set("completionFailed", false);
                self.set("usernameFailed", false);
                self.set("buttonsDisabled", true);
                
                /// POST new user data to server
                var user = this.store.createRecord('user', data);
                user.save().then(function(success) {
                    // Success
                    window.console.log("New user created: " + user.get('accessToken'));

                        self.set("registrationComplete",true);
                    // Disable Register 
                    self.set("buttonsDisabled", false);
                }, function(failure) {
                    // Failure
                    window.console.log("Registration error...");
                    self.set("usernameFailed", true);
                    self.set("buttonsDisabled", false);
                });
            } else {
                window.console.log("ERROR: There are missing fields in the registration form!");
                self.set("completionFailed", true);
                self.set("usernameFailed", false);
            }
        },
        
        reset: function() {	
            this.set("usernameFailed", false);
            this.set("completionFailed", false);
            this.set("registrationComplete",false);
            ///Clear all registration fields
			this.setProperties({
                "name":"", 
                "email":"", 
                "username":"", 
                "password":""});	
        }
    }
});

App.LoginController = Ember.Controller.extend({
    username: null,
    password: null,
    remember: true,
    loginFailed: false,
    errorMessage: "There is an error with your login",
    
    actions: {
        login: function() {
            var self = this;
            var data = self.getProperties('username', 'password');

            if (!Ember.isEmpty(data.username) && !Ember.isEmpty(data.password)) {
                window.console.log("Username and password are provided...");
                var postData = { session: { username: data.username, password: data.password } };
                
                var hash = {};
                hash.url = this.get("constants.ip") + "/vert/data/session";
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
                            self.transitionToRoute('playlists');
                        }
                    },
                    function(failure) {
                        /// Show warning that information is incorrect
                        window.console.log("Login error - Unauthorized access! fail: " + JSON.stringify(failure));
                        self.send('reset');
                        
                        if (failure.status == 401) {
                            self.set("errorMessage", "Incorrect Username or Password!");
                        } else if (failure.status == 409) {
                            self.set("errorMessage", "Check your email to activate your account!");
                        }
                        self.set("loginFailed", true);
                    });
            } else {
                /// Show warning that information is incorrect
                window.console.log("Login error - Username and password are missing...");
                self.send('reset');
                self.set("loginFailed", true);
            }
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

App.ActivateController = Ember.Controller.extend({    
    actions: {
        toLogin: function() {
            this.transitionToRoute('login');
        }
    }
});

App.SessionDestroyController = Ember.Controller.extend({
    logout: function() {
        ///This removes our session and triggers the removal of cookies as well
        window.console.log("Logging out...");
        this.session.setProperties({
            authToken:  '',
            authUserId: ''
        });
        this.transitionToRoute('index');
    }
});