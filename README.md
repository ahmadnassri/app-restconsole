# REST Console
[![Build Status](https://travis-ci.org/codeinchaos/restconsole.png?branch=development)](https://travis-ci.org/codeinchaos/restconsole)
[![Dependency Status](https://david-dm.org/codeinchaos/restconsole.png)](https://david-dm.org/codeinchaos/restconsole#info=Dependencies)
[![devDependency Status](https://david-dm.org/codeinchaos/restconsole.png/dev-status.png)](https://david-dm.org/codeinchaos/restconsole#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/codeinchaos/restconsole/badge.png)](https://coveralls.io/r/codeinchaos/restconsole)
[![Total views](https://sourcegraph.com/api/repos/github.com/codeinchaos/restconsole/counters/views.png)](https://sourcegraph.com/github.com/codeinchaos/restconsole)

an HTTP Request Visualizer and Constructor tool, helps developers build, debug and test RESTful APIs.

## Features
- Syntax highlighting (multiple themes)
- Custom headers
- Construct POST or PUT body via raw input
- Auto Complete
- File upload
- Easy query parameters creation
- Add custom headers through intuitive ui
- Authentication support: Plain, Basic, OAuth + Custom
- Keyboard navigation and shortcuts
- Customizable Interface

## TO DO

- Request History
- Auto Complete all Fields
- HAR Support
- Send Binary Files as Body

## Table of contents

- [Download](#download)
- [Change Log](#changelog)
- [Documentation](#documentation)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [Compiling](#compiling)
- [Contributing](#contributing)
- [Donating](#donating)
- [Community](#community)
- [Versioning](#versioning)
- [Authors](#authors)
- [License](#license)

## Download

Download the latest production release on the [Chrome Web Store](http://restconsole.com)

## Change Log
* v4.0.2 oAuth improvements, Collapsible sections, Clickable Links in Response, UI enhancements, Bug Fixes.
* v4.0.1 Corrupted images in the previous build now fixed.
* v4.0.0 Brand New UI, enhanced oAuth, Multiple files upload, HTML Response preview.
* v3.0.7 Moving project to github.
* v3.0.6 UI enhancements, File uploads + "Save Default" Option.
* v3.0.5 More keyboard shortcuts.
* v3.0.4 Bug Fixes.
* v3.0.3 Keyboard navigation, Bug Fixes.
* v3.0.2 Syntax Highlighting themes, Collapsible sections, Options.
* v3.0.1 RAW request body, Bug Fixes.
* v3.0.0 Brand New UI.
* v2.1.1 Bug Fixes.
* v2.1.0 Added OAuth1.0a support, Bug Fixes.
* v2.0.0 Revamped Design.
* v1.0.0 Released!

## Documentation

Refer to the [Wiki](https://github.com/codeinchaos/restconsole/wiki) for detailed API documentation.

## Chrome Permissions

* **Your tabs and browsing activity**  
  The only access to tabs we need is for launching the oAuth Authorization page to the 3rd party oAuth provider.

* **Your data on all websites**  
  This is somewhat misleading, we ask for `*://*/*` access so that developers can make API calls to **ANY URL**.  

  *we don't collect any personal data and we don't want access to your data on all websites, we simply have to use that permission so developers can use the App on all urls.*

## Bugs and feature requests

Have a bug or a feature request? Please first read the [issue guidelines](https://github.com/codeinchaos/restconsole/blob/master/CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/codeinchaos/restconsole/issues/new).

## Compiling [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

REST Console uses [Grunt](http://gruntjs.com/). If you haven't used Grunt before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide.

### Available Grunt commands

| Function  | Command       | Description                                                                                                                               |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Build     | `grunt`       | Run `grunt` to run tests locally and compile the app into `/dist`.                                                           |
| Tests     | `grunt test`  | Runs [JSHint](http://jshint.com) and [QUnit](http://qunitjs.com/) tests headlessly in [PhantomJS](http://phantomjs.org/) (used for CI).   |
| Watch     | `grunt watch` | This is a convenience method for watching just Less files and automatically building them whenever you save.                              |

### Troubleshooting dependencies

Should you encounter problems with installing dependencies or running Grunt commands, uninstall all previous dependency versions (global and local). Then, rerun `npm install`.

## Contributing

Please read through our [contributing guidelines](https://github.com/codeinchaos/restconsole/blob/master/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

More over, if your pull request contains JavaScript patches or features, you must include relevant unit tests.

Editor preferences are available in the [editor config](https://github.com/codeinchaos/restconsole/blob/master/.editorconfig) for easy use in common text editors. Read more and download plugins at <http://editorconfig.org>.

## Donating
Donations are welcome to help support the continuous development of this project.
- [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UJ2B2BTK9VLRS)

## Community

Keep track of development and updates.

- Follow [@AhmadNassri](http://twitter.com/ahmadnassri) & [@RESTConsole](http://twitter.com/restconsole) on Twitter.
- Tweet [@RESTConsole](http://twitter.com/restconsole) with any questions/personal support requests.
- Implementation help may be found at Stack Overflow (tagged [`restconsole`](http://stackoverflow.com/questions/tagged/restconsole)).
- Read and subscribe to [My Blog](http://blog.ahmadnassri.com).

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, REST Console is maintained under the Semantic Versioning guidelines. Sometimes we screw up, but we'll adhere to these rules whenever possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

- Breaking backward compatibility **bumps the major** while resetting minor and patch
- New additions without breaking backward compatibility **bumps the minor** while resetting the patch
- Bug fixes and misc changes **bumps only the patch**

For more information on SemVer, please visit <http://semver.org/>.

## Authors

**Ahmad Nassri**

- Twitter: [@AhmadNassri](http://twitter.com/ahmadnassri)
- Website: [ahmadnassri.com](http://ahmadnassri.com)

## License

Licensed under [the MIT license](LICENSE-MIT).

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/6a1039412502fb7030eef6ae24a3ca37 "githalytics.com")](http://githalytics.com/codeinchaos/restconsole)
