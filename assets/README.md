# Bethel Frontend

This directory contains the frontend of the Bethel site built in Angular.js

### Angular structure

```
shared/   // reusable directives or partials not related to one single feature
---- sidebar/
--------- sidebarDirective.js
--------- sidebarView.html
---- article/
--------- articleDirective.js
--------- articleView.html
features/   // each feature is treated as a standalone Angular app
---- feature/
--------- featureController.js
--------- featureService.js
--------- featureView.html
app.module.js
app.routes.js
```
