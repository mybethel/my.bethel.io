# Workers #

Workers are periodic tasks that must be run to ensure operational integrity of
the Bethel platform. Each worker should be single-purpose in nature so that they
can run either on demand or in variable frequency as required. To this end, each
worker should not have dependencies on either the presence or the frequency of
other worker scripts.

Workers can be deployed to an on-demand Heroku instance and for this reason it
is important that each worker script terminates the process once completed.

#### Creating a Worker ####

A worker can run inside of the Sails environment by utilizing `Sails.load`. This
will launch Sails with all hooks, services and the ORM but without the server
component. If certain hooks are not needed, they can be excluded through the
configuration passed as the first parameter. To disable grunt, for instance:

```
Sails.load({
  hooks: {
    grunt: false
  }
}, function(err, sails) {
  // Do stuff here.
});
```

It is very important to terminate the process once the worker has finished it's
task. This can be done by simply calling `process.exit()` rather than the
traditional lowering of the Sails server.
