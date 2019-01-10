# CNES

This project was generated with [ngX-Rocket](https://github.com/ngx-rocket/generator-ngx-rocket/)
version 2.0.0

# Getting started

1. Go to project folder and install dependencies:
 ```bash
 npm install
 ```
2. Launch backend DataCube:
 ```bash
 java -jar <path>/cubeExplorer-1.0.0-SNAPSHOT.jar
 ```
 If jar file is not generated, you shoud launch the following command into root backend project:
  ```bash
mvn clean install
 ```
 Log file is written where backend is launched.

3. Launch development client, and open `localhost:4200` in your browser:
 ```bash
 npm start
 ```
 4. Launch production client (into frontend project), and open `localhost/datacube/` in your browser:
 ```bash
 npm run build && cp -R dist/ <tomcat-path>/
 ```
 
# Project structure

```
dist/                        web app production build
docs/                        project docs and coding guides
e2e/                         end-to-end tests
src/                         project source code
|- app/                      app components
|  |- core/                  core module (singleton services and single-use components)
|  |- shared/                shared module  (common components, directives and pipes)
|  |- home/                  datacube components  (datacube, histogramm, spectre, description)
|  |- app.component.*        app root component (shell)
|  |- app.module.ts          app root module definition
|  |- app-routing.module.ts  app routes
|  +- ...                    additional modules and components
|- assets/                   app assets (images, fonts, sounds...)
|- environments/             values for various build environments
|- theme/                    app global scss variables and theme
|- translations/             translations files
|- index.html                html entry point
|- main.scss                 global style entry point
|- main.ts                   app entry point
|- polyfills.ts              polyfills needed by Angular
+- test.ts                   unit tests entry point
plugin/                      plugin javascript source
|- src/                      plugin source folder
|  |- vendor/                javascript libraries 
|- jquery.datacube.js        plugin source
|- Gruntfile.js              Grunt file
|- index.html                Demo plugin page
reports/                     test and coverage reports
proxy.conf.js                backend proxy configuration
```

# Main tasks

Task automation is based on [NPM scripts](https://docs.npmjs.com/misc/scripts).

Task                            | Description
--------------------------------|--------------------------------------------------------------------------------------
`npm start`                     | Run development server on `http://localhost:4200/`
`npm run build [-- --env=prod]` | Lint code and build web app for production in `dist/` folder
`npm test`                      | Run unit tests via [Karma](https://karma-runner.github.io) in watch mode
`npm run test:ci`               | Lint code and run unit tests once for continuous integration
`npm run e2e`                   | Run e2e tests using [Protractor](http://www.protractortest.org)
`npm run lint`                  | Lint code
`npm run translations:extract`  | Extract strings from code and templates to `src/app/translations/template.json`
`npm run compodoc`              | Generate project documentation
`npm run docs`                  | Display project documentation
`node_modules/bin/esdoc `
    `-c plugin/esdoc.json`      | Generate plugin documentation

When building the application, you can specify the target environment using the additional flag `--env <name>` (do not
forget to prepend `--` to pass arguments to npm scripts).

The default build environment is `prod`.

## DataCube Functionnality

### 1. Login
By default, two accounts are created (admin and public). You must be identified to used DataCube.

### 2. Search
Following your account, you are allowed or not to choose a specific file. Admin account has all files.

### 3. DataCube
At the left top, you can see a datacube who represent the file choosen.

##### 3.1 Point
You can click on the DataCube to display a spectre below the datacube.

##### 3.2 Lasso
After one or more point on Datacube, a new option is available (lasso option). This option can selected many points to draw one spectre by point.

##### 3.3 Slide
You can selected a slide of DataCube with the first slider. The slide selected is displayed with the number but also the maximum number of slides.

##### 3.4 Opacity
You can selected a opacity to display to see the next slide.

### 4. Histogramme
Once file loaded, a histogramme is displayed next to DataCube. It represents of count of pixels by physical values of each pixel of picture.

### 5. Metadata
a Metadata block contains all metadata of picture. Click on header to display or hide this block.

### 6. Description
This part is stubbed.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.
You should not use `ng serve` directly, as it does not use the backend proxy configuration by default.

## Code scaffolding

Run `npm run generate -- component <name>` to generate a new component. You can also use
`npm run generate -- directive|pipe|service|class|module`.

If you have installed [angular-cli](https://github.com/angular/angular-cli) globally with `npm install -g @angular/cli`,
you can also use the command `ng generate` directly.

## Additional tools

Tasks are mostly based on the `angular-cli` tool. Use `ng help` to get more help or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).

# What's in the box

The app template is based on [HTML5](http://whatwg.org/html), [TypeScript](http://www.typescriptlang.org) and
[Sass](http://sass-lang.com). The translation files use the common [JSON](http://www.json.org) format.

#### Tools

Development, build and quality processes are based on [angular-cli](https://github.com/angular/angular-cli) and
[NPM scripts](https://docs.npmjs.com/misc/scripts), which includes:

- Optimized build and bundling process with [Webpack](https://webpack.github.io)
- [Development server](https://webpack.github.io/docs/webpack-dev-server.html) with backend proxy and live reload
- Cross-browser CSS with [autoprefixer](https://github.com/postcss/autoprefixer) and
  [browserslist](https://github.com/ai/browserslist)
- Asset revisioning for [better cache management](https://webpack.github.io/docs/long-term-caching.html)
- Unit tests using [Jasmine](http://jasmine.github.io) and [Karma](https://karma-runner.github.io)
- End-to-end tests using [Protractor](https://github.com/angular/protractor)
- Static code analysis: [TSLint](https://github.com/palantir/tslint), [Codelyzer](https://github.com/mgechev/codelyzer),
  [Stylelint](http://stylelint.io) and [HTMLHint](http://htmlhint.com/)
- Local knowledgebase server using [Hads](https://github.com/sinedied/hads)

#### Libraries

- [Angular](https://angular.io)
- [Bootstrap 4](https://v4-alpha.getbootstrap.com)
- [ng-bootsrap](https://ng-bootstrap.github.io/)
- [Font Awesome](http://fontawesome.io)
- [RxJS](http://reactivex.io/rxjs)
- [ngx-translate](https://github.com/ngx-translate/core)
- [Lodash](https://lodash.com)
- [Plotly](https://plot.ly/javascript/)
- [Ng2 Toastr](https://github.com/PointInside/ng2-toastr)
- [Primeng](https://www.primefaces.org/primeng/#/slider)
- [Mizar](https://github.com/MizarWeb/Mizar)

#### Coding guides

- [Angular](docs/coding-guides/angular.md)
- [TypeScript](docs/coding-guides/typescript.md)
- [Sass](docs/coding-guides/sass.md)
- [HTML](docs/coding-guides/html.md)
- [Unit tests](docs/coding-guides/unit-tests.md)
- [End-to-end tests](docs/coding-guides/e2e-tests.md)

#### Other documentation

- [I18n guide](docs/i18n.md)
- [Working behind a corporate proxy](docs/corporate-proxy.md)
- [Updating dependencies and tools](docs/updating.md)
- [Using a backend proxy for development](docs/backend-proxy.md)
- [Browser routing](docs/routing.md)
