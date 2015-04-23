/** Create Ember Context **/
App = window.App = Ember.Application.create();

/** Injects the Store into our Session object to be able to get user data upon authentication **/
App.initializer({
    name: 'injectStoreToSession',
    before: 'session',
    
    initialize: function(container, application) {
        application.inject('session', 'store', 'store:main');
    }
});

/** Initializes a Session to be available to controllers, routes, components, and adapters **/
App.initializer({
    name: 'session',
    before: 'ember-data',
    
    initialize: function(container, application) {        
        /// Singleton=true so we only have one instance, instatantiate=false because we already call create() above
        application.register('session:current', App.Session);
        
        application.inject('controller', 'session', 'session:current');
        application.inject('route', 'session', 'session:current');
        application.inject('component', 'session', 'session:current');
        application.inject('adapter', 'session', 'session:current');
        application.inject('adapter:-rest', 'session', 'session:current');
        application.inject('data-adapter', 'session', 'session:current');
    }
});

/** Initializes the IP of our server to be available to controllers, routes, components, and adapters **/
App.initializer({
    name: 'constants',
    before: 'ember-data',
    
    initialize: function(container, application) {        
        /// Singleton=true so we only have one instance, instatantiate=false because we already call create() above
        application.register('constants:current', App.Constants);
        
        application.inject('controller', 'constants', 'constants:current');
        application.inject('route', 'constants', 'constants:current');
        application.inject('component', 'constants', 'constants:current');
        application.inject('adapter', 'constants', 'constants:current');
        application.inject('adapter:-rest', 'constants', 'constants:current');
        application.inject('data-adapter', 'constants', 'constants:current');
    }
});
