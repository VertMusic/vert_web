/** Create Ember Context **/
App = Ember.Application.create();


/** Adapter for REST calls to the backend used by the Ember Data Store **/
App.ApplicationAdapter = DS.RESTAdapter.extend({
    host: "http://192.168.56.101:8080",
    namespace: "vert/data",
    headers: {
        /// TODO: Eventually replace dev:password with current users hashed credential token (passed back from
        "authorization": "Basic " + window.btoa("dev:password")
    }
});


/** Define our data models (What our data looks like on the backend to help the Ember Data Store) **/
App.Playlist = DS.Model.extend({
    name: DS.attr("string"),
    author: DS.attr("string"),
    date: DS.attr("string")
});
App.Song = DS.Model.extend({
    title: DS.attr("string"),
    artist: DS.attr("string"),
    playlistId: DS.attr("string"),
    filename: DS.attr("string")
});
App.User = DS.Model.extend({
    username: DS.attr("string"),
    passwordHash: DS.attr("string"),
    crentialToken: DS.attr("string")
});


/** Create TextField that performs auto focus after render: {{focus-input}} **/
App.FocusInputComponent = Ember.TextField.extend({
  becomeFocused: function() {
    this.$().focus();
  }.on('didInsertElement')
});


/** Define application routes **/
App.Router.map(function () {
    /** About page is single layer **/
    this.resource("about");
    
    /** Settings page is single layer **/
    this.resource("settings");
    
    /** Playlists provides us with nested contenst, where we can navigate to all the different playlists **/
    this.resource("playlists", function () {
        this.resource("playlist", {path: ":playlist_id"});
    });
});


/** Routes determine which data model is applied to the template specified as a resource in the Router **/
App.ApplicationRoute = Ember.Route.extend({
    ///List the options for the main navigation menu here. Then add them as 'resource' to the Router and
    ///define a "<name_of_context>Route" such as PlaylistsRoute.
    model: function() {
        return [{displayName: "Playlists", context: "playlists"},
                {displayName: "Account Settings", context: "settings"},
                {displayName: "About", context: "about"}]
    }
});
App.PlaylistsRoute = Ember.Route.extend({
    model: function () {
        /** Returns list of 'playlists' items (just their information (not the songs) **/
        /** Makes GET request to: <host><namespace>/playlists                         **/
        return this.store.find("playlist");
        
//        return playlists; 
        
//        return $.getJSON("http://192.168.56.101:8080/vert/file/playlists").then(function(data) {
//            if (window.console) console.log(data);
//            return data;
//        });
        
        
//        var data = $.ajax({
//            /// Add Basic Authorization:  "Basic username:password" where 'username:password' is in Base64
//            beforeSend: function(request) {
//                var auth = window.btoa("dev:password")
//                request.setRequestHeader("authorization", "Basic " + auth);
//            },
//            dataType: "application/json",
//            url: "http://192.168.56.101:8080/vert/file/playlists"
//        });
//        
//        return data.always(function(data) {
//            if (window.console) console.log(data.responseText);
//            return data;
//        });
    }
});
App.PlaylistRoute = Ember.Route.extend({
    model: function (params) {
        /** Returns server data associated with specific "playlist_id" **/        
//        return playlists.findBy("id", params.playlist_id); 
        /** Makes GET request to: <host><namespace>/playlists/<id>                  **/
        return this.store.find("playlist", params.playlist_id);
    }
});
App.SettingsRoute = Ember.Route.extend({
    //TODO: Load model, etc
});


/** Controller stores application state, and responds to events from templates **/
App.PlaylistController = Ember.ObjectController.extend({
    isEditing: false,
    actions: {
        edit: function() {
            // Edit action is triggered - causes input element to be rendered after 'isEditing' is set.
            this.set('isEditing', true);
        },
        doneEditing: function() {
            this.set('isEditing', false);
        }
    }
});

/** Handlebar helper helps format display of data: {{<name-of-helper> <data>}} **/
/** <!--small class="muted">&nbsp;({{format-date date}})</small--> **/
Ember.Handlebars.helper("format-date", function(date) {
    /** Creates relative date (e.g. 1 week ago) **/
    return moment(date).fromNow();
});

/** Fake playlist data **/
var playlists = [
    {
        id:"1",
        name:"Road Trip",
        //date: new Date("1-23-2015"),
        author: "d2h"
    },
    {
        id:"2",
        name:"Rock Anthem",
        //date: new Date("12-17-2014"),
        author: "def_cat"
    },
    {
        id:"3",
        name:"Hip Hop Party",
        //date: new Date("11-5-2013"),
        author: "$muney"
    },
    {
        id:"4",
        name:"CMT Top 30",
        //date: new Date("1-31-2015"),
        author: "fmrsTan92"
    }
];
               