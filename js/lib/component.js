/*************************************************************************/
/** This file contains re-usable components and mustache helper objects **/
/*************************************************************************/

/** Create TextField that performs auto focus after it is rendered: {{focus-input}} **/
App.FocusInputComponent = Ember.TextField.extend({
    becomeFocused: function() {
        this.$().focus();
    }.on('didInsertElement')
});

/** Handlebar helper helps format display of data: {{<name-of-helper> <data>}} **/
/** <!--small class="muted">&nbsp;({{format-date date}})</small--> **/
Ember.Handlebars.helper("format-date", function(date) {
    /** Creates relative date (e.g. 1 week ago) **/
    window.console.log("Handlebar date formating...");
    return moment(date).fromNow();
});
