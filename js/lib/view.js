Ember.View.reopen({
  contentChanged : function() {
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  }.observes('controller.content.[]'),
  afterRenderEvent : function() {
        // implement this hook in your own subclasses and run your jQuery (or other) logic there
  }
});

App.ApplicationView = Ember.View.extend({
    afterRenderEvent: function() {
        window.console.log("Application rendered...");
        var audioPlayer = document.getElementById("audio-player");
        var self = this;
        
        /// Play the next song in the playlist of the current song when the current song ends
        audioPlayer.addEventListener("ended", function(){
            window.console.log("SONG ENDED....");
            var nextSongIndex = self.controller.currentSongIndex + 1;
            var currentPlaylist = self.controller.currentPlaylist;
            
            window.console.log("Next song index: " + nextSongIndex);
            window.console.log("Playlist Length: " + currentPlaylist.length);
            
            /// Loop around when next index is past last song
            if (nextSongIndex >= currentPlaylist.length) {
                window.console.log("Setting next to 0...");
                nextSongIndex = 0;
            }
            
            var audioSongTitle = document.getElementById("audio-player-title");
            var audioSongArtist = document.getElementById("audio-player-artist");
            
            window.console.log("New song url: " + currentPlaylist[nextSongIndex].url);
            window.console.log("New song title: " + currentPlaylist[nextSongIndex].title);
            window.console.log("New song artist: " + currentPlaylist[nextSongIndex].artist);
            
            audioPlayer.src = currentPlaylist[nextSongIndex].url;
            audioSongTitle.innerHTML = currentPlaylist[nextSongIndex].title;
            audioSongArtist.innerHTML = currentPlaylist[nextSongIndex].artist;
            
            self.controller.currentSongIndex = nextSongIndex;
            self.controller.currentSong = currentPlaylist[nextSongIndex].id;
            
            audioPlayer.play();
            var songRow = document.getElementById(currentPlaylist[nextSongIndex].id);
            if (songRow != null) {
                var button = songRow.getElementsByClassName("play")[0];
                button.classList.add("glyphicon-pause");
                button.classList.remove("glyphicon-play");
            }
        });
    }
});

App.PlaylistView = Ember.View.extend({
    afterRenderEvent: function() {        
        var currentSongID = this.get("controller.controllers.application.currentSong");
        
        if (currentSongID != undefined && currentSongID != "") {
            var songRow = document.getElementById(currentSongID);
            if (songRow != null) {
                var button = songRow.getElementsByClassName("play")[0];
                button.classList.add("glyphicon-pause");
                button.classList.remove("glyphicon-play");
            }
        }
    }
});
App.RegistrationView = Ember.View.extend({
    afterRenderEvent: function() {        
        window.console.log("something");
       this.controller.registrationComplete = false;
    }
});