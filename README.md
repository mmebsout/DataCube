<!-- vscode-markdown-toc -->
* [Getting Started](#GettingStarted)
	* [Prerequisites](#Prerequisites)
		* [DataCubeServer](#DataCubeServer)
	* [Installation](#Installation)
		* [Standalone](#Standalone)
		* [As a plugin in MizarWidget](#AsaplugininMizarWidget)
	* [Usage](#Usage)
		* [Login](#Login)
		* [Header](#Header)
		* [Home](#Home)
		* [Histogram](#Histogram)
		* [File](#File)
		* [Metadata](#Metadata)
* [Development](#Development)
	* [Project structure](#Projectstructure)
	* [Main tasks](#Maintasks)
		* [Development server](#Developmentserver)
		* [Code scaffolding](#Codescaffolding)
		* [Additional tools](#Additionaltools)
	* [What's in the box](#Whatsinthebox)
		* [Tools](#Tools)
		* [Libraries](#Libraries)
		* [Coding guides](#Codingguides)
		* [Other documentation](#Otherdocumentation)
* [Licence](#Licence)
* [Credits](#Credits)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

# CNES DataCube

## <a name='GettingStarted'></a>Getting Started

### <a name='Prerequisites'></a>Prerequisites
1. Install and launch [DataCubeServer](#DataCubeServer) following the instructions of the project.

2. Add the default cube file to the Server 'public' folder 
```
wget -P <path>/public http://idoc-herschel.ias.u-psud.fr/sitools/datastorage/user/storageRelease//R7_spire_fts/HIPE_Fits/FTS_SPIRE/OT1_atielens/M17-2/1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits

```
 
#### <a name='DataCubeServer'></a>DataCubeServer

DataCube needs another application that reads the cube files and returns the cube data in json following the DataCube [API](SERVER\README.md).

An example of such an application that works with Fits ant NetCDF files is provided with the project [DataCubeServer](https://github.com/MizarWeb/DataCubeServer). 


### <a name='Installation'></a>Installation

#### <a name='Standalone'></a>Standalone
##### <a name='Installdependencies'></a>Install dependencies
```bash
 npm install
 ```
##### <a name='RuninDevelopment'></a>Run in Development
1. Run 
```bash
npm start
 ```
2. Open `localhost:4200` in your browser


##### <a name='RuninProduction'></a>Run in Production
1. Run 
```bash
npm run build && mv build/ datacube/ && cp -R datacube/ <http-server>/
```
2. Open `<youdomain>/datacube/` in your browser

#### <a name='AsaplugininMizarWidget'></a>As a plugin in MizarWidget

<-TODO->

### <a name='Usage'></a>Usage

#### <a name='Login'></a>Login
You must be identified to used DataCube.

The Login functionality depends on a service answering the [Identification API](SERVER\README.md#Identification).
When using DataCubeServer by default two accounts are created (admin and public). 

#### <a name='Header'></a>Header
On the top right of the app the Header displays the Contributors logos, a search icon and a menu icon.

##### Search
Following your account, you are allowed or not to choose a specific file. Admin account has all files.

##### Menu
When clicking on the menu icon the menu is displayed with 
- Home -> showing the main view with the Slider etc.
- About -> showing the About page with information on this project
- The locale -> allowing to change the language of the app with a dropdown list
- User icon -> to log out

#### <a name='Home'></a>Home

##### Slider
At the left top, you can see a slider displaying slides from the chosen datacube.

You can selected a slide of DataCube by dragging the slider curser on the bottom of the Slider. 

##### Spectre
You can click on the DataCube to display the spectre of the selected pixel on the right of the slider.

##### Lasso
When moving the mouse over the top right of the slider, options appear. One of them is called "Lasso select". This options allows the user to create a series of spectre traces that follows a line he would draw on the slide. 


#### <a name='Histogram'></a>Histogram
Once file loaded, a histogram is displayed at the bottom of the Slider. It represents the count of pixels by physical values.
The user can select the physical values to display by dragging the handles available at the edges of the second smaller histogram. The one on the top will only display the selected values and the Slider will adapt it's display to show only these values and adjust the color gradient in consequence.

#### <a name='File'></a>File
The File block displays the datacube filename.

#### <a name='Metadata'></a>Metadata
The Metadata block contains all metadata of the file. Click on "Metadata" to display or hide this block.

## <a name='Development'></a>Development

### <a name='Projectstructure'></a>Project structure

```
dist/                        web app production build
docs/                        project docs and coding guides
e2e/                         end-to-end tests
src/                         project source code
|- app/                      app components
|  |- core/                  core module (singleton services and single-use components)
|  |- shared/                shared module  (common components, directives and pipes)
|  |- home/                  datacube components  (datacube, histogram, spectre, description)
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

### <a name='Maintasks'></a>Main tasks

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

#### <a name='Developmentserver'></a>Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.
You should not use `ng serve` directly, as it does not use the backend proxy configuration by default.

#### <a name='Codescaffolding'></a>Code scaffolding

Run `npm run generate -- component <name>` to generate a new component. You can also use
`npm run generate -- directive|pipe|service|class|module`.

If you have installed [angular-cli](https://github.com/angular/angular-cli) globally with `npm install -g @angular/cli`,
you can also use the command `ng generate` directly.

#### <a name='Additionaltools'></a>Additional tools

Tasks are mostly based on the `angular-cli` tool. Use `ng help` to get more help or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).

### <a name='Whatsinthebox'></a>What's in the box

The app template is based on [HTML5](http://whatwg.org/html), [TypeScript](http://www.typescriptlang.org) and
[Sass](http://sass-lang.com). The translation files use the common [JSON](http://www.json.org) format.

#### <a name='Tools'></a>Tools

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

#### <a name='Libraries'></a>Libraries

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

#### <a name='Codingguides'></a>Coding guides

- [Angular](docs/coding-guides/angular.md)
- [TypeScript](docs/coding-guides/typescript.md)
- [Sass](docs/coding-guides/sass.md)
- [HTML](docs/coding-guides/html.md)
- [Unit tests](docs/coding-guides/unit-tests.md)
- [End-to-end tests](docs/coding-guides/e2e-tests.md)

#### <a name='Otherdocumentation'></a>Other documentation

- [I18n guide](docs/i18n.md)
- [Working behind a corporate proxy](docs/corporate-proxy.md)
- [Updating dependencies and tools](docs/updating.md)
- [Using a backend proxy for development](docs/backend-proxy.md)
- [Browser routing](docs/routing.md)

## <a name='Licence'></a>Licence

MizarWeb/MizarWidget is licensed under the
[GNU General Public License v3.0](LICENCE)

## <a name='Credits'></a>Credits

See [CREDITS.md](CREDITS.md)

This project was generated with [ngX-Rocket](https://github.com/ngx-rocket/generator-ngx-rocket/)
version 2.0.0