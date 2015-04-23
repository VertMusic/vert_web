/** Adapter for REST calls to the backend used by the Ember Data Store **/
App.ApplicationAdapter = DS.RESTAdapter.extend({
    host: (function() {
        return this.get("constants.ip");
    }).property("constants.ip"),
    namespace: "vert/data",
    headers: function() {
      return {
        "authorization": this.get("session.authToken")
      };
    }.property("session.authToken")
});

/** Reset the authentication if any ember data request returns a 401 unauthorized error **/
DS.rejectionHandler = function(reason) {
    if (reason.status === 401) {
        window.console.log("Authorization failed: 401 Unauthorized Access...");
        this.transitionToRoute('login');
    }
    throw reason;
};