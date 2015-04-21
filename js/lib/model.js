/***************************************************************************************************/
/** Define our data models (What our data looks like on the backend to help the Ember Data Store) **/
/***************************************************************************************************/

/** PLaylist: Holds information regarding a playlist **/
App.Playlist = DS.Model.extend({
    name: DS.attr("string"),
    author: DS.attr("string"),
    date: DS.attr("string"),
    visibility: DS.attr("string"),
    likes: DS.attr("number"),
    songs: DS.hasMany("song", {async: true})
});

/** Song: Holds information regarding a song **/
App.Song = DS.Model.extend({
    title: DS.attr("string"),
    artist: DS.attr("string"),
    duration: DS.attr("string"),
    playlistId: DS.belongsTo("playlist", {async: true})
});

/** User: Hold informtation regarding a user of our application **/
App.User = DS.Model.extend({
    name: DS.attr("string"),
    email: DS.attr("string"),
    username: DS.attr("string"),
    password: DS.attr("string"),
    accessToken: DS.attr("string")
});

App.Activate = DS.Model.extend({
    // 'id' is the activation code
    accessToken: DS.attr("string"),
    name: DS.attr("string"),
    username: DS.attr("string"),
    userId: DS.attr("string")
});

/** Session: An object to hold the current user and their authentication token **/
App.Session = Ember.Object.extend({
    authToken: null,
    authUserId: null,
    authUser: null,
    remember: null,

    init: function() {
        this._super();
        $.cookie.json = true; /// Allows storage of json (does auto JSON.stringify and JSON.parse
        this.set('authToken', $.cookie('auth_token'));
        this.set('authUserId', $.cookie('auth_account'));
        this.set('authUser', $.cookie('auth_user'));
    },

    ///Listener for authentication token changes (mainly triggered on log out)
    authTokenChanged: function() {
        window.console.log("'authToken' changed....");
        var authToken = this.get("authToken");
        if (Ember.isEmpty(authToken)) {
            this.set("isAuthenticated", false);
        } else {
            this.set("isAuthenticated", true);
        }
    
        /// Only save session info in cookie if user checks "remember me" at login time, or erase token if empty
        if (this.get("remember") === true || Ember.isEmpty(authToken)) {
            window.console.log("Set cookie: " + authToken);
            $.cookie('auth_token', authToken);
        }
    }.observes('authToken'),

    ///Listener for account id changes (mainly triggered on log out)
    authUserIdChanged: function() {
        window.console.log("'authUserId' changed...");
        var authUserId = this.get('authUserId');
        
        /// Only save session info in cookie if user checks "remember me" at login time, or erase cookie when id is empty
        if (this.get("remember") === true || Ember.isEmpty(authUserId)) {
            window.console.log("Set cookie: " + authUserId);
            $.cookie('auth_account', authUserId);
        }
        
        ///Load User information into Session if the userId change is not a delete.
        if (!Ember.isEmpty(authUserId)) {
            window.console.log("Getting current user information (id: " + authUserId + ")");
            var self = this;
            this.store.find('user', authUserId).then(function(user){
                window.console.log(JSON.stringify(user));
                self.set('authUser', user);
                $.cookie('auth_user', user);
                self.set("isAuthenticated", true);
            });
            
        } else {
            this.set("isAuthenticated", false);
        }
    }.observes('authUserId'),

    /// Determine if the user is currently authenticated.
    isAuthenticated: function() {
        if (Ember.isEmpty(this.get('authToken')) && Ember.isEmpty(this.get('authUserId'))) {
            window.console.log("Not authenticated...");
            return false;
        } else {
            window.console.log("Authenticated...");
            return true;
        }
    }.property("isAuthenticated")
});