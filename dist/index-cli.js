'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs-extra');
var path = require('path');
var LiveServer = require('live-server');
var Handlebars = require('handlebars');

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var gutil = require('gulp-util');
var c = gutil.colors;
var pkg$2 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["DEBUG"] = 1] = "DEBUG";
    LEVEL[LEVEL["ERROR"] = 2] = "ERROR";
    LEVEL[LEVEL["WARN"] = 3] = "WARN";
})(LEVEL || (LEVEL = {}));
var Logger = (function () {
    function Logger() {
        this.name = pkg$2.name;
        this.version = pkg$2.version;
        this.logger = gutil.log;
        this.silent = true;
    }
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.INFO].concat(args)));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.ERROR].concat(args)));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.WARN].concat(args)));
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.DEBUG].concat(args)));
    };
    Logger.prototype.format = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var pad = function (s, l, c) {
            if (c === void 0) { c = ''; }
            return s + Array(Math.max(0, l - s.length + 1)).join(c);
        };
        var msg = args.join(' ');
        if (args.length > 1) {
            msg = pad(args.shift(), 15, ' ') + ": " + args.join(' ');
        }
        switch (level) {
            case LEVEL.INFO:
                msg = c.green(msg);
                break;
            case LEVEL.DEBUG:
                msg = c.cyan(msg);
                break;
            case LEVEL.WARN:
                msg = c.yellow(msg);
                break;
            case LEVEL.ERROR:
                msg = c.red(msg);
                break;
        }
        return [
            msg
        ].join('');
    };
    return Logger;
}());
var logger = new Logger();

var AngularAPIs = require('../src/data/api-list.json');
var _$3 = require('lodash');
function finderInAngularAPIs(type) {
    var _result = {
        source: 'external',
        data: null
    };
    _$3.forEach(AngularAPIs, function (angularModuleAPIs, angularModule) {
        var i = 0, len = angularModuleAPIs.length;
        for (i; i < len; i++) {
            if (angularModuleAPIs[i].title === type) {
                _result.data = angularModuleAPIs[i];
            }
        }
    });
    return _result;
}

var _$2 = require('lodash');
var DependenciesEngine = (function () {
    function DependenciesEngine() {
        if (DependenciesEngine._instance) {
            throw new Error('Error: Instantiation failed: Use DependenciesEngine.getInstance() instead of new.');
        }
        DependenciesEngine._instance = this;
    }
    DependenciesEngine.getInstance = function () {
        return DependenciesEngine._instance;
    };
    DependenciesEngine.prototype.cleanModules = function (modules) {
        var _m = modules, i = 0, len = modules.length;
        for (i; i < len; i++) {
            var j = 0, leng = _m[i].declarations.length;
            for (j; j < leng; j++) {
                var k = 0, lengt = void 0;
                if (_m[i].declarations[j].jsdoctags) {
                    lengt = _m[i].declarations[j].jsdoctags.length;
                    for (k; k < lengt; k++) {
                        delete _m[i].declarations[j].jsdoctags[k].parent;
                    }
                }
                if (_m[i].declarations[j].constructorObj) {
                    if (_m[i].declarations[j].constructorObj.jsdoctags) {
                        lengt = _m[i].declarations[j].constructorObj.jsdoctags.length;
                        for (k; k < lengt; k++) {
                            delete _m[i].declarations[j].constructorObj.jsdoctags[k].parent;
                        }
                    }
                }
            }
        }
        return _m;
    };
    DependenciesEngine.prototype.init = function (data) {
        this.rawData = data;
        this.modules = _$2.sortBy(this.rawData.modules, ['name']);
        this.rawModulesForOverview = _$2.sortBy(data.modulesForGraph, ['name']);
        this.rawModules = _$2.sortBy(data.modulesForGraph, ['name']);
        this.components = _$2.sortBy(this.rawData.components, ['name']);
        this.directives = _$2.sortBy(this.rawData.directives, ['name']);
        this.injectables = _$2.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _$2.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _$2.sortBy(this.rawData.pipes, ['name']);
        this.classes = _$2.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.routes = this.rawData.routesTree;
    };
    DependenciesEngine.prototype.find = function (type) {
        var finderInCompodocDependencies = function (data) {
            var _result = {
                source: 'internal',
                data: null
            }, i = 0, len = data.length;
            for (i; i < len; i++) {
                if (typeof type !== 'undefined') {
                    if (type.indexOf(data[i].name) !== -1) {
                        _result.data = data[i];
                    }
                }
            }
            return _result;
        }, resultInCompodocInjectables = finderInCompodocDependencies(this.injectables), resultInCompodocInterfaces = finderInCompodocDependencies(this.interfaces), resultInCompodocClasses = finderInCompodocDependencies(this.classes), resultInCompodocComponents = finderInCompodocDependencies(this.components), resultInAngularAPIs = finderInAngularAPIs(type);
        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables;
        }
        else if (resultInCompodocInterfaces.data !== null) {
            return resultInCompodocInterfaces;
        }
        else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses;
        }
        else if (resultInCompodocComponents.data !== null) {
            return resultInCompodocComponents;
        }
        else if (resultInAngularAPIs.data !== null) {
            return resultInAngularAPIs;
        }
    };
    DependenciesEngine.prototype.update = function (updatedData) {
        var _this = this;
        if (updatedData.modules.length > 0) {
            _$2.forEach(updatedData.modules, function (module) {
                var _index = _$2.findIndex(_this.modules, { 'name': module.name });
                _this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _$2.forEach(updatedData.components, function (component) {
                var _index = _$2.findIndex(_this.components, { 'name': component.name });
                _this.components[_index] = component;
            });
        }
        if (updatedData.directives.length > 0) {
            _$2.forEach(updatedData.directives, function (directive) {
                var _index = _$2.findIndex(_this.directives, { 'name': directive.name });
                _this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _$2.forEach(updatedData.injectables, function (injectable) {
                var _index = _$2.findIndex(_this.injectables, { 'name': injectable.name });
                _this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _$2.forEach(updatedData.interfaces, function (int) {
                var _index = _$2.findIndex(_this.interfaces, { 'name': int.name });
                _this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _$2.forEach(updatedData.pipes, function (pipe) {
                var _index = _$2.findIndex(_this.pipes, { 'name': pipe.name });
                _this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _$2.forEach(updatedData.classes, function (classe) {
                var _index = _$2.findIndex(_this.classes, { 'name': classe.name });
                _this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0) {
            _$2.forEach(updatedData.miscellaneous.variables, function (variable) {
                var _index = _$2.findIndex(_this.miscellaneous.variables, {
                    'name': variable.name,
                    'file': variable.file
                });
                _this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0) {
            _$2.forEach(updatedData.miscellaneous.functions, function (func) {
                var _index = _$2.findIndex(_this.miscellaneous.functions, {
                    'name': func.name,
                    'file': func.file
                });
                _this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0) {
            _$2.forEach(updatedData.miscellaneous.typealiases, function (typealias) {
                var _index = _$2.findIndex(_this.miscellaneous.typealiases, {
                    'name': typealias.name,
                    'file': typealias.file
                });
                _this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0) {
            _$2.forEach(updatedData.miscellaneous.enumerations, function (enumeration) {
                var _index = _$2.findIndex(_this.miscellaneous.enumerations, {
                    'name': enumeration.name,
                    'file': enumeration.file
                });
                _this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        if (updatedData.miscellaneous.types.length > 0) {
            _$2.forEach(updatedData.miscellaneous.types, function (typ) {
                var _index = _$2.findIndex(_this.miscellaneous.types, {
                    'name': typ.name,
                    'file': typ.file
                });
                _this.miscellaneous.types[_index] = typ;
            });
        }
        this.prepareMiscellaneous();
    };
    DependenciesEngine.prototype.findInCompodoc = function (name) {
        var mergedData = _$2.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes), result = _$2.find(mergedData, { 'name': name });
        return result || false;
    };
    DependenciesEngine.prototype.prepareMiscellaneous = function () {
        //group each subgoup by file
        this.miscellaneous.groupedVariables = _$2.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _$2.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _$2.groupBy(this.miscellaneous.enumerations, 'file');
    };
    DependenciesEngine.prototype.getModule = function (name) {
        return _$2.find(this.modules, ['name', name]);
    };
    DependenciesEngine.prototype.getRawModule = function (name) {
        return _$2.find(this.rawModules, ['name', name]);
    };
    DependenciesEngine.prototype.getModules = function () {
        return this.modules;
    };
    DependenciesEngine.prototype.getComponents = function () {
        return this.components;
    };
    DependenciesEngine.prototype.getDirectives = function () {
        return this.directives;
    };
    DependenciesEngine.prototype.getInjectables = function () {
        return this.injectables;
    };
    DependenciesEngine.prototype.getInterfaces = function () {
        return this.interfaces;
    };
    DependenciesEngine.prototype.getRoutes = function () {
        return this.routes;
    };
    DependenciesEngine.prototype.getPipes = function () {
        return this.pipes;
    };
    DependenciesEngine.prototype.getClasses = function () {
        return this.classes;
    };
    DependenciesEngine.prototype.getMiscellaneous = function () {
        return this.miscellaneous;
    };
    DependenciesEngine._instance = new DependenciesEngine();
    return DependenciesEngine;
}());

var $dependenciesEngine = DependenciesEngine.getInstance();

function extractLeadingText(string, completeTag) {
    var tagIndex = string.indexOf(completeTag);
    var leadingText = null;
    var leadingTextRegExp = /\[(.+?)\]/g;
    var leadingTextInfo = leadingTextRegExp.exec(string);
    // did we find leading text, and if so, does it immediately precede the tag?
    while (leadingTextInfo && leadingTextInfo.length) {
        if (leadingTextInfo.index + leadingTextInfo[0].length === tagIndex) {
            string = string.replace(leadingTextInfo[0], '');
            leadingText = leadingTextInfo[1];
            break;
        }
        leadingTextInfo = leadingTextRegExp.exec(string);
    }
    return {
        leadingText: leadingText,
        string: string
    };
}
function splitLinkText(text) {
    var linkText;
    var target;
    var splitIndex;
    // if a pipe is not present, we split on the first space
    splitIndex = text.indexOf('|');
    if (splitIndex === -1) {
        splitIndex = text.search(/\s/);
    }
    if (splitIndex !== -1) {
        linkText = text.substr(splitIndex + 1);
        // Normalize subsequent newlines to a single space.
        linkText = linkText.replace(/\n+/, ' ');
        target = text.substr(0, splitIndex);
    }
    return {
        linkText: linkText,
        target: target || text
    };
}
var LinkParser = (function () {
    var processTheLink = function (string, tagInfo, leadingText) {
        var leading = extractLeadingText(string, tagInfo.completeTag), linkText, split, target, stringtoReplace;
        linkText = (leadingText) ? leadingText : (leading.leadingText || '');
        split = splitLinkText(tagInfo.text);
        target = split.target;
        if (leading.leadingText !== null) {
            stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
        }
        else if (typeof split.linkText !== 'undefined') {
            stringtoReplace = tagInfo.completeTag;
            linkText = split.linkText;
        }
        return string.replace(stringtoReplace, '[' + linkText + '](' + target + ')');
    };
    /**
     * Convert
     * {@link http://www.google.com|Google} or {@link https://github.com GitHub} or [Github]{@link https://github.com} to [Github](https://github.com)
     */
    var replaceLinkTag = function (str) {
        // new RegExp('\\[((?:.|\n)+?)]\\{@link\\s+((?:.|\n)+?)\\}', 'i').exec('ee [TO DO]{@link Todo} fo') -> "[TO DO]{@link Todo}", "TO DO", "Todo"
        // new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i').exec('ee [TODO]{@link Todo} fo') -> "{@link Todo}", "Todo"
        var tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), tagRegExp, matches, previousString, tagInfo = [];
        tagRegExp = (str.indexOf(']{') !== -1) ? tagRegExpFull : tagRegExpLight;
        function replaceMatch(replacer, tag, match, text, linkText) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);
            if (linkText) {
                return replacer(str, matchedTag, linkText);
            }
            else {
                return replacer(str, matchedTag);
            }
        }
        do {
            matches = tagRegExp.exec(str);
            if (matches) {
                previousString = str;
                if (matches.length === 2) {
                    str = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
                if (matches.length === 3) {
                    str = replaceMatch(processTheLink, 'link', matches[0], matches[2], matches[1]);
                }
            }
        } while (matches && previousString !== str);
        return {
            newString: str
        };
    };
    var _resolveLinks = function (str) {
        return replaceLinkTag(str).newString;
    };
    return {
        resolveLinks: _resolveLinks
    };
})();

var COMPODOC_DEFAULTS = {
    title: 'Application documentation',
    additionalEntryName: 'Additional documentation',
    additionalEntryPath: 'additional-documentation',
    folder: './documentation/',
    port: 8080,
    theme: 'gitbook',
    base: '/',
    defaultCoverageThreshold: 70,
    toggleMenuItems: ['all'],
    disableSourceCode: false,
    disableGraph: false,
    disableMainGraph: false,
    disableCoverage: false,
    disablePrivateOrInternalSupport: false,
    PAGE_TYPES: {
        ROOT: 'root',
        INTERNAL: 'internal'
    }
};

var _$4 = require('lodash');
var Configuration = (function () {
    function Configuration() {
        this._pages = [];
        this._mainData = {
            output: COMPODOC_DEFAULTS.folder,
            theme: COMPODOC_DEFAULTS.theme,
            extTheme: '',
            serve: false,
            port: COMPODOC_DEFAULTS.port,
            open: false,
            assetsFolder: '',
            documentationMainName: COMPODOC_DEFAULTS.title,
            documentationMainDescription: '',
            base: COMPODOC_DEFAULTS.base,
            hideGenerator: false,
            modules: [],
            readme: false,
            changelog: '',
            contributing: '',
            license: '',
            todo: '',
            markdowns: [],
            additionalPages: [],
            pipes: [],
            classes: [],
            interfaces: [],
            components: [],
            directives: [],
            injectables: [],
            miscellaneous: [],
            routes: [],
            tsconfig: '',
            toggleMenuItems: [],
            includes: '',
            includesName: COMPODOC_DEFAULTS.additionalEntryName,
            includesFolder: COMPODOC_DEFAULTS.additionalEntryPath,
            disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
            disableGraph: COMPODOC_DEFAULTS.disableGraph,
            disableMainGraph: COMPODOC_DEFAULTS.disableMainGraph,
            disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
            disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport,
            watch: false,
            mainGraph: '',
            coverageTest: false,
            coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
            routesLength: 0,
            angularVersion: ''
        };
        if (Configuration._instance) {
            throw new Error('Error: Instantiation failed: Use Configuration.getInstance() instead of new.');
        }
        Configuration._instance = this;
    }
    Configuration.getInstance = function () {
        return Configuration._instance;
    };
    Configuration.prototype.addPage = function (page) {
        var indexPage = _$4.findIndex(this._pages, { 'name': page.name });
        if (indexPage === -1) {
            this._pages.push(page);
        }
    };
    Configuration.prototype.addAdditionalPage = function (page) {
        this._mainData.additionalPages.push(page);
    };
    Configuration.prototype.resetPages = function () {
        this._pages = [];
    };
    Configuration.prototype.resetAdditionalPages = function () {
        this._mainData.additionalPages = [];
    };
    Configuration.prototype.resetRootMarkdownPages = function () {
        var indexPage = _$4.findIndex(this._pages, { 'name': 'index' });
        this._pages.splice(indexPage, 1);
        indexPage = _$4.findIndex(this._pages, { 'name': 'changelog' });
        this._pages.splice(indexPage, 1);
        indexPage = _$4.findIndex(this._pages, { 'name': 'contributing' });
        this._pages.splice(indexPage, 1);
        indexPage = _$4.findIndex(this._pages, { 'name': 'license' });
        this._pages.splice(indexPage, 1);
        indexPage = _$4.findIndex(this._pages, { 'name': 'todo' });
        this._pages.splice(indexPage, 1);
        this._mainData.markdowns = [];
    };
    Object.defineProperty(Configuration.prototype, "pages", {
        get: function () {
            return this._pages;
        },
        set: function (pages) {
            this._pages = [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "mainData", {
        get: function () {
            return this._mainData;
        },
        set: function (data) {
            Object.assign(this._mainData, data);
        },
        enumerable: true,
        configurable: true
    });
    Configuration._instance = new Configuration();
    return Configuration;
}());

var semver = require('semver');
function cleanVersion(version) {
    return version.replace('~', '')
        .replace('^', '')
        .replace('=', '')
        .replace('<', '')
        .replace('>', '');
}
function getAngularVersionOfProject(packageData) {
    var _result = '';
    if (packageData['dependencies']) {
        var angularCore = packageData['dependencies']['@angular/core'];
        if (angularCore) {
            _result = cleanVersion(angularCore);
        }
    }
    return _result;
}
function isAngularVersionArchived(version) {
    var result;
    try {
        result = semver.compare(version, '2.4.10') <= 0;
    }
    catch (e) { }
    return result;
}
function prefixOfficialDoc(version) {
    return isAngularVersionArchived(version) ? 'v2.' : '';
}

var BasicTypes;
(function (BasicTypes) {
    BasicTypes[BasicTypes["number"] = 0] = "number";
    BasicTypes[BasicTypes["boolean"] = 1] = "boolean";
    BasicTypes[BasicTypes["string"] = 2] = "string";
    BasicTypes[BasicTypes["object"] = 3] = "object";
    BasicTypes[BasicTypes["date"] = 4] = "date";
    BasicTypes[BasicTypes["function"] = 5] = "function";
})(BasicTypes || (BasicTypes = {}));

var BasicTypeScriptTypes;
(function (BasicTypeScriptTypes) {
    BasicTypeScriptTypes[BasicTypeScriptTypes["any"] = 0] = "any";
    BasicTypeScriptTypes[BasicTypeScriptTypes["void"] = 1] = "void";
})(BasicTypeScriptTypes || (BasicTypeScriptTypes = {}));

function finderInBasicTypes(type) {
    if (typeof type !== 'undefined') {
        return (type.toLowerCase() in BasicTypes);
    }
    else {
        return false;
    }
}
function finderInTypeScriptBasicTypes(type) {
    if (typeof type !== 'undefined') {
        return (type.toLowerCase() in BasicTypeScriptTypes);
    }
    else {
        return false;
    }
}

var HtmlEngineHelpers = (function () {
    var init = function () {
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper("compare", function (a, operator, b, options) {
            if (arguments.length < 4) {
                throw new Error('handlebars Helper {{compare}} expects 4 arguments');
            }
            var result;
            switch (operator) {
                case 'indexof':
                    result = (b.indexOf(a) !== -1);
                    break;
                case '===':
                    result = a === b;
                    break;
                case '!==':
                    result = a !== b;
                    break;
                case '>':
                    result = a > b;
                    break;
                default: {
                    throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
                }
            }
            if (result === false) {
                return options.inverse(this);
            }
            return options.fn(this);
        });
        Handlebars.registerHelper("or", function () {
            var len = arguments.length - 1;
            var options = arguments[len];
            for (var i = 0; i < len; i++) {
                if (arguments[i]) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper("filterAngular2Modules", function (text, options) {
            var NG2_MODULES = [
                'BrowserModule',
                'FormsModule',
                'HttpModule',
                'RouterModule'
            ], len = NG2_MODULES.length;
            var i = 0, result = false;
            for (i; i < len; i++) {
                if (text.indexOf(NG2_MODULES[i]) > -1) {
                    result = true;
                }
            }
            if (result) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper("debug", function (optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);
            if (optionalValue) {
                console.log("OptionalValue");
                console.log("====================");
                console.log(optionalValue);
            }
        });
        Handlebars.registerHelper('breaklines', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            text = text.replace(/ /gm, '&nbsp;');
            text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('clean-paragraph', function (text) {
            text = text.replace(/<p>/gm, '');
            text = text.replace(/<\/p>/gm, '');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('escapeSimpleQuote', function (text) {
            if (!text)
                return;
            var _text = text.replace(/'/g, "\\'");
            _text = _text.replace(/(\r\n|\n|\r)/gm, '');
            return _text;
        });
        Handlebars.registerHelper('breakComma', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('modifKind', function (kind) {
            // https://github.com/Microsoft/TypeScript/blob/73ee2feb51c9b7e24a29eb4cee19d7c14b933065/lib/typescript.d.ts#L64
            var _kindText = '';
            switch (kind) {
                case 112:
                    _kindText = 'Private';
                    break;
                case 113:
                    _kindText = 'Protected';
                    break;
                case 114:
                    _kindText = 'Public';
                    break;
                case 115:
                    _kindText = 'Static';
                    break;
            }
            return new Handlebars.SafeString(_kindText);
        });
        Handlebars.registerHelper('modifIcon', function (kind) {
            // https://github.com/Microsoft/TypeScript/blob/73ee2feb51c9b7e24a29eb4cee19d7c14b933065/lib/typescript.d.ts#L64
            var _kindText = '';
            switch (kind) {
                case 112:
                    _kindText = 'lock';
                    break;
                case 113:
                    _kindText = 'circle';
                    break;
                case 115:
                    _kindText = 'square';
                case 83:
                    _kindText = 'export';
                    break;
            }
            return _kindText;
        });
        /**
         * Convert {@link MyClass} to [MyClass](http://localhost:8080/classes/MyClass.html)
         */
        Handlebars.registerHelper('parseDescription', function (description, depth) {
            var tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), tagRegExp, matches, previousString, tagInfo = [];
            tagRegExp = (description.indexOf(']{') !== -1) ? tagRegExpFull : tagRegExpLight;
            var processTheLink = function (string, tagInfo, leadingText) {
                var leading = extractLeadingText(string, tagInfo.completeTag), split, result, newLink, rootPath, stringtoReplace;
                split = splitLinkText(tagInfo.text);
                if (typeof split.linkText !== 'undefined') {
                    result = $dependenciesEngine.findInCompodoc(split.target);
                }
                else {
                    result = $dependenciesEngine.findInCompodoc(tagInfo.text);
                }
                if (result) {
                    if (leadingText) {
                        stringtoReplace = '[' + leadingText + ']' + tagInfo.completeTag;
                    }
                    else if (leading.leadingText !== null) {
                        stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                    }
                    else if (typeof split.linkText !== 'undefined') {
                        stringtoReplace = tagInfo.completeTag;
                    }
                    else {
                        stringtoReplace = tagInfo.completeTag;
                    }
                    if (result.type === 'class')
                        result.type = 'classe';
                    rootPath = '';
                    switch (depth) {
                        case 0:
                            rootPath = './';
                            break;
                        case 1:
                            rootPath = '../';
                            break;
                        case 2:
                            rootPath = '../../';
                            break;
                    }
                    var label = result.name;
                    if (leading.leadingText !== null) {
                        label = leading.leadingText;
                    }
                    if (typeof split.linkText !== 'undefined') {
                        label = split.linkText;
                    }
                    newLink = "<a href=\"" + rootPath + result.type + "s/" + result.name + ".html\">" + label + "</a>";
                    return string.replace(stringtoReplace, newLink);
                }
                else {
                    return string;
                }
            };
            function replaceMatch(replacer, tag, match, text, linkText) {
                var matchedTag = {
                    completeTag: match,
                    tag: tag,
                    text: text
                };
                tagInfo.push(matchedTag);
                if (linkText) {
                    return replacer(description, matchedTag, linkText);
                }
                else {
                    return replacer(description, matchedTag);
                }
            }
            do {
                matches = tagRegExp.exec(description);
                if (matches) {
                    previousString = description;
                    if (matches.length === 2) {
                        description = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                    }
                    if (matches.length === 3) {
                        description = replaceMatch(processTheLink, 'link', matches[0], matches[2], matches[1]);
                    }
                }
            } while (matches && previousString !== description);
            return description;
        });
        Handlebars.registerHelper('relativeURL', function (currentDepth, context) {
            var result = '';
            switch (currentDepth) {
                case 0:
                    result = './';
                    break;
                case 1:
                    result = '../';
                    break;
                case 2:
                    result = '../../';
                    break;
            }
            return result;
        });
        Handlebars.registerHelper('functionSignature', function (method) {
            var args = [], configuration = Configuration.getInstance(), angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (method.args) {
                args = method.args.map(function (arg) {
                    var _result = $dependenciesEngine.find(arg.type);
                    if (_result) {
                        if (_result.source === 'internal') {
                            var path$$1 = _result.data.type;
                            if (_result.data.type === 'class')
                                path$$1 = 'classe';
                            return arg.name + ": <a href=\"../" + path$$1 + "s/" + _result.data.name + ".html\">" + arg.type + "</a>";
                        }
                        else {
                            var path$$1 = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                            return arg.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                        }
                    }
                    else if (arg.dotDotDotToken) {
                        return "..." + arg.name + ": " + arg.type;
                    }
                    else if (arg.function) {
                        if (arg.function.length > 0) {
                            var argums = arg.function.map(function (argu) {
                                var _result = $dependenciesEngine.find(argu.type);
                                if (_result) {
                                    if (_result.source === 'internal') {
                                        var path$$1 = _result.data.type;
                                        if (_result.data.type === 'class')
                                            path$$1 = 'classe';
                                        return argu.name + ": <a href=\"../" + path$$1 + "s/" + _result.data.name + ".html\">" + argu.type + "</a>";
                                    }
                                    else {
                                        var path$$1 = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                                        return argu.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + argu.type + "</a>";
                                    }
                                }
                                else if (finderInBasicTypes(argu.type)) {
                                    var path$$1 = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/" + argu.type;
                                    return argu.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + argu.type + "</a>";
                                }
                                else if (finderInTypeScriptBasicTypes(argu.type)) {
                                    var path$$1 = "https://www.typescriptlang.org/docs/handbook/basic-types.html";
                                    return argu.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + argu.type + "</a>";
                                }
                                else {
                                    if (argu.name && argu.type) {
                                        return argu.name + ": " + argu.type;
                                    }
                                    else {
                                        return "" + argu.name.text;
                                    }
                                }
                            });
                            return arg.name + ": (" + argums + ") => void";
                        }
                        else {
                            return arg.name + ": () => void";
                        }
                    }
                    else if (finderInBasicTypes(arg.type)) {
                        var path$$1 = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/" + arg.type;
                        return arg.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                    }
                    else if (finderInTypeScriptBasicTypes(arg.type)) {
                        var path$$1 = "https://www.typescriptlang.org/docs/handbook/basic-types.html";
                        return arg.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                    }
                    else {
                        return arg.name + ": " + arg.type;
                    }
                }).join(', ');
            }
            if (method.name) {
                return method.name + "(" + args + ")";
            }
            else {
                return "(" + args + ")";
            }
        });
        Handlebars.registerHelper('jsdoc-returns-comment', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, result;
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'returns') {
                        result = jsdocTags[i].comment;
                        break;
                    }
                }
            }
            return result;
        });
        Handlebars.registerHelper('jsdoc-component-example', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            var cleanTag = function (comment) {
                if (comment.charAt(0) === '*') {
                    comment = comment.substring(1, comment.length);
                }
                if (comment.charAt(0) === ' ') {
                    comment = comment.substring(1, comment.length);
                }
                return comment;
            };
            var type = 'html';
            if (options.hash.type) {
                type = options.hash.type;
            }
            function htmlEntities(str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {};
                        if (jsdocTags[i].comment) {
                            tag.comment = "<pre class=\"line-numbers\"><code class=\"language-" + type + "\">" + htmlEntities(cleanTag(jsdocTags[i].comment)) + "</code></pre>";
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length > 0) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-example', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {};
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment.replace(/<caption>/g, '<b><i>').replace(/\/caption>/g, '/b></i>');
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length > 0) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-params', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        var tag = {};
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text;
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment;
                        }
                        if (jsdocTags[i].name) {
                            tag.name = jsdocTags[i].name.text;
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length >= 1) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-params-valid', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [], valid = false;
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        valid = true;
                    }
                }
            }
            if (valid) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('jsdoc-default', function (jsdocTags, options) {
            if (jsdocTags) {
                var i = 0, len = jsdocTags.length, tag = {}, defaultValue = false;
                for (i; i < len; i++) {
                    if (jsdocTags[i].tagName) {
                        if (jsdocTags[i].tagName.text === 'default') {
                            defaultValue = true;
                            if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                                tag.type = jsdocTags[i].typeExpression.type.name.text;
                            }
                            if (jsdocTags[i].comment) {
                                tag.comment = jsdocTags[i].comment;
                            }
                            if (jsdocTags[i].name) {
                                tag.name = jsdocTags[i].name.text;
                            }
                        }
                    }
                }
                if (defaultValue) {
                    this.tag = tag;
                    return options.fn(this);
                }
            }
        });
        Handlebars.registerHelper('linkType', function (name, options) {
            var _result = $dependenciesEngine.find(name), configuration = Configuration.getInstance(), angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (_result) {
                this.type = {
                    raw: name
                };
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class')
                        _result.data.type = 'classe';
                    this.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                    this.type.target = '_self';
                }
                else {
                    this.type.href = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                    this.type.target = '_blank';
                }
                return options.fn(this);
            }
            else if (finderInBasicTypes(name)) {
                this.type = {
                    raw: name
                };
                this.type.target = '_blank';
                this.type.href = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/" + name;
                return options.fn(this);
            }
            else if (finderInTypeScriptBasicTypes(name)) {
                this.type = {
                    raw: name
                };
                this.type.target = '_blank';
                this.type.href = 'https://www.typescriptlang.org/docs/handbook/basic-types.html';
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('indexableSignature', function (method) {
            var args = method.args.map(function (arg) { return arg.name + ": " + arg.type; }).join(', ');
            if (method.name) {
                return method.name + "[" + args + "]";
            }
            else {
                return "[" + args + "]";
            }
        });
        Handlebars.registerHelper('object', function (text) {
            text = JSON.stringify(text);
            text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/}$/, '<br>}');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('isNotToggle', function (type, options) {
            var configuration = Configuration.getInstance(), result = configuration.mainData.toggleMenuItems.indexOf(type);
            if (configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
                return options.inverse(this);
            }
            else if (result === -1) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
    };
    return {
        init: init
    };
})();

//import * as helpers from 'handlebars-helpers';
var HtmlEngine = (function () {
    function HtmlEngine() {
        this.cache = {};
        HtmlEngineHelpers.init();
    }
    HtmlEngine.prototype.init = function () {
        var _this = this;
        var partials = [
            'menu',
            'overview',
            'markdown',
            'modules',
            'module',
            'components',
            'component',
            'component-detail',
            'directives',
            'directive',
            'injectables',
            'injectable',
            'pipes',
            'pipe',
            'classes',
            'class',
            'interface',
            'routes',
            'search-results',
            'search-input',
            'link-type',
            'block-method',
            'block-enum',
            'block-property',
            'block-index',
            'block-constructor',
            'coverage-report',
            'miscellaneous',
            'additional-page'
        ], i = 0, len = partials.length, loop = function (resolve$$1, reject) {
            if (i <= len - 1) {
                fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject();
                    }
                    Handlebars.registerPartial(partials[i], data);
                    i++;
                    loop(resolve$$1, reject);
                });
            }
            else {
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject('Error during index generation');
                    }
                    else {
                        _this.cache['page'] = data;
                        resolve$$1();
                    }
                });
            }
        };
        return new Promise(function (resolve$$1, reject) {
            loop(resolve$$1, reject);
        });
    };
    HtmlEngine.prototype.render = function (mainData, page) {
        var o = mainData, that = this;
        Object.assign(o, page);
        var template = Handlebars.compile(that.cache['page']), result = template({
            data: o
        });
        return result;
    };
    HtmlEngine.prototype.generateCoverageBadge = function (outputFolder, coverageData) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/coverage-badge.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during coverage badge generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        data: coverageData
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(outputFolder + path.sep + '/images/coverage-badge.svg'), result, function (err) {
                        if (err) {
                            logger.error('Error during coverage badge file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    };
    return HtmlEngine;
}());

var marked$1 = require('marked');
var MarkdownEngine = (function () {
    function MarkdownEngine() {
        var _this = this;
        var renderer = new marked$1.Renderer();
        renderer.code = function (code, language) {
            var highlighted = code;
            if (!language) {
                language = 'none';
            }
            highlighted = _this.escape(code);
            return "<pre class=\"line-numbers\"><code class=\"language-" + language + "\">" + highlighted + "</code></pre>";
        };
        renderer.table = function (header, body) {
            return '<table class="table table-bordered compodoc-table">\n'
                + '<thead>\n'
                + header
                + '</thead>\n'
                + '<tbody>\n'
                + body
                + '</tbody>\n'
                + '</table>\n';
        };
        renderer.image = function (href, title, text) {
            var out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += this.options.xhtml ? '/>' : '>';
            return out;
        };
        marked$1.setOptions({
            renderer: renderer,
            breaks: false
        });
    }
    MarkdownEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.getTraditionalMarkdown = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath + '.md'), 'utf8', function (err, data) {
                if (err) {
                    fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                        if (err) {
                            reject('Error during ' + filepath + ' read');
                        }
                        else {
                            resolve$$1(marked$1(data));
                        }
                    });
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.getReadmeFile = function () {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + 'README.md'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during README.md file reading');
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.readNeighbourReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        return fs.readFileSync(readmeFile, 'utf8');
    };
    MarkdownEngine.prototype.hasNeighbourReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        return fs.existsSync(readmeFile);
    };
    MarkdownEngine.prototype.componentReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + 'README.md', readmeAlternativeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md', finalPath = '';
        if (fs.existsSync(readmeFile)) {
            finalPath = readmeFile;
        }
        else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    };
    MarkdownEngine.prototype.hasRootMarkdowns = function () {
        var readmeFile = process.cwd() + path.sep + 'README.md', readmeFileWithoutExtension = process.cwd() + path.sep + 'README', changelogFile = process.cwd() + path.sep + 'CHANGELOG.md', changelogFileWithoutExtension = process.cwd() + path.sep + 'CHANGELOG', licenseFile = process.cwd() + path.sep + 'LICENSE.md', licenseFileWithoutExtension = process.cwd() + path.sep + 'LICENSE', contributingFile = process.cwd() + path.sep + 'CONTRIBUTING.md', contributingFileWithoutExtension = process.cwd() + path.sep + 'CONTRIBUTING', todoFile = process.cwd() + path.sep + 'TODO.md', todoFileWithoutExtension = process.cwd() + path.sep + 'TODO';
        return fs.existsSync(readmeFile) ||
            fs.existsSync(readmeFileWithoutExtension) ||
            fs.existsSync(changelogFile) ||
            fs.existsSync(changelogFileWithoutExtension) ||
            fs.existsSync(licenseFile) ||
            fs.existsSync(licenseFileWithoutExtension) ||
            fs.existsSync(contributingFile) ||
            fs.existsSync(contributingFileWithoutExtension) ||
            fs.existsSync(todoFile) ||
            fs.existsSync(todoFileWithoutExtension);
    };
    MarkdownEngine.prototype.listRootMarkdowns = function () {
        var list = [], readme = 'README', changelog = 'CHANGELOG', contributing = 'CONTRIBUTING', license = 'LICENSE', todo = 'TODO';
        if (fs.existsSync(process.cwd() + path.sep + readme + '.md') || fs.existsSync(process.cwd() + path.sep + readme)) {
            list.push(readme);
            list.push(readme + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + changelog + '.md') || fs.existsSync(process.cwd() + path.sep + changelog)) {
            list.push(changelog);
            list.push(changelog + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + contributing + '.md') || fs.existsSync(process.cwd() + path.sep + contributing)) {
            list.push(contributing);
            list.push(contributing + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + license + '.md') || fs.existsSync(process.cwd() + path.sep + license)) {
            list.push(license);
            list.push(license + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + todo + '.md') || fs.existsSync(process.cwd() + path.sep + todo)) {
            list.push(todo);
            list.push(todo + '.md');
        }
        return list;
    };
    MarkdownEngine.prototype.escape = function (html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/@/g, '&#64;');
    };
    return MarkdownEngine;
}());

var FileEngine = (function () {
    function FileEngine() {
    }
    FileEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    };
    return FileEngine;
}());

var ngdCr = require('@compodoc/ngd-core');
var ngdT = require('@compodoc/ngd-transformer');
var _$5 = require('lodash');
var NgdEngine = (function () {
    function NgdEngine() {
    }
    NgdEngine.prototype.renderGraph = function (filepath, outputpath, type, name) {
        return new Promise(function (resolve$$1, reject) {
            ngdCr.logger.silent = false;
            var engine = new ngdT.DotEngine({
                output: outputpath,
                displayLegend: true,
                outputFormats: 'svg'
            });
            if (type === 'f') {
                engine
                    .generateGraph([$dependenciesEngine.getRawModule(name)])
                    .then(function (file) {
                    resolve$$1();
                }, function (error) {
                    reject(error);
                });
            }
            else {
                engine
                    .generateGraph($dependenciesEngine.rawModulesForOverview)
                    .then(function (file) {
                    resolve$$1();
                }, function (error) {
                    reject(error);
                });
            }
        });
    };
    NgdEngine.prototype.readGraph = function (filepath, name) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during graph read ' + name);
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    };
    return NgdEngine;
}());

var lunr = require('lunr');
var cheerio = require('cheerio');
var Entities = require('html-entities').AllHtmlEntities;
var $configuration = Configuration.getInstance();
var Html = new Entities();
var SearchEngine = (function () {
    function SearchEngine() {
        this.documentsStore = {};
    }
    SearchEngine.prototype.getSearchIndex = function () {
        if (!this.searchIndex) {
            this.searchIndex = lunr(function () {
                this.ref('url');
                this.field('title', { boost: 10 });
                this.field('body');
            });
        }
        return this.searchIndex;
    };
    SearchEngine.prototype.indexPage = function (page) {
        var text, $ = cheerio.load(page.rawData);
        text = $('.content').html();
        text = Html.decode(text);
        text = text.replace(/(<([^>]+)>)/ig, '');
        page.url = page.url.replace($configuration.mainData.output, '');
        var doc = {
            url: page.url,
            title: page.infos.context + ' - ' + page.infos.name,
            body: text
        };
        if (!this.documentsStore.hasOwnProperty(doc.url)) {
            this.documentsStore[doc.url] = doc;
            this.getSearchIndex().add(doc);
        }
    };
    SearchEngine.prototype.generateSearchIndexJson = function (outputFolder) {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/search-index.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during search index generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        index: JSON.stringify(_this.getSearchIndex()),
                        store: JSON.stringify(_this.documentsStore)
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(outputFolder + path.sep + '/js/search/search_index.js'), result, function (err) {
                        if (err) {
                            logger.error('Error during search index file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    };
    return SearchEngine;
}());

var AngularLifecycleHooks;
(function (AngularLifecycleHooks) {
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnChanges"] = 0] = "ngOnChanges";
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnInit"] = 1] = "ngOnInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngDoCheck"] = 2] = "ngDoCheck";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterContentInit"] = 3] = "ngAfterContentInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterContentChecked"] = 4] = "ngAfterContentChecked";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterViewInit"] = 5] = "ngAfterViewInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterViewChecked"] = 6] = "ngAfterViewChecked";
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnDestroy"] = 7] = "ngOnDestroy";
})(AngularLifecycleHooks || (AngularLifecycleHooks = {}));

var ts$3 = require('typescript');
var getCurrentDirectory = ts$3.sys.getCurrentDirectory;
var useCaseSensitiveFileNames = ts$3.sys.useCaseSensitiveFileNames;
var newLine = ts$3.sys.newLine;
var marked$3 = require('marked');
var _$8 = require('lodash');
function getNewLine() {
    return newLine;
}
function getCanonicalFileName(fileName) {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}
var formatDiagnosticsHost = {
    getCurrentDirectory: getCurrentDirectory,
    getCanonicalFileName: getCanonicalFileName,
    getNewLine: getNewLine
};
function markedtags(tags) {
    var mtags = tags;
    _$8.forEach(mtags, function (tag) {
        tag.comment = marked$3(LinkParser.resolveLinks(tag.comment));
    });
    return mtags;
}

function readConfig(configFile) {
    var result = ts$3.readConfigFile(configFile, ts$3.sys.readFile);
    if (result.error) {
        var message = ts$3.formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}

function stripBom(source) {
    if (source.charCodeAt(0) === 0xFEFF) {
        return source.slice(1);
    }
    return source;
}
function hasBom(source) {
    return (source.charCodeAt(0) === 0xFEFF);
}
function handlePath(files, cwd) {
    var _files = files, i = 0, len = files.length;
    for (i; i < len; i++) {
        if (files[i].indexOf(cwd) === -1) {
            files[i] = path.resolve(cwd + path.sep + files[i]);
        }
    }
    return _files;
}
function cleanLifecycleHooksFromMethods(methods) {
    var result = [], i = 0, len = methods.length;
    for (i; i < len; i++) {
        if (!methods[i].name in AngularLifecycleHooks) {
            console.log('clean');
            result.push(methods[i]);
        }
    }
    return result;
}

var carriageReturnLineFeed = '\r\n';
var lineFeed = '\n';
var ts$2 = require('typescript');
var _$7 = require('lodash');
function cleanNameWithoutSpaceAndToLowerCase(name) {
    return name.toLowerCase().replace(/ /g, '-');
}
function detectIndent(str, count, indent) {
    var stripIndent = function (str) {
        var match = str.match(/^[ \t]*(?=\S)/gm);
        if (!match) {
            return str;
        }
        // TODO: use spread operator when targeting Node.js 6
        var indent = Math.min.apply(Math, match.map(function (x) { return x.length; })); // eslint-disable-line
        var re = new RegExp("^[ \\t]{" + indent + "}", 'gm');
        return indent > 0 ? str.replace(re, '') : str;
    }, repeating = function (n, str) {
        str = str === undefined ? ' ' : str;
        if (typeof str !== 'string') {
            throw new TypeError("Expected `input` to be a `string`, got `" + typeof str + "`");
        }
        if (n < 0) {
            throw new TypeError("Expected `count` to be a positive finite number, got `" + n + "`");
        }
        var ret = '';
        do {
            if (n & 1) {
                ret += str;
            }
            str += str;
        } while ((n >>= 1));
        return ret;
    }, indentString = function (str, count, indent) {
        indent = indent === undefined ? ' ' : indent;
        count = count === undefined ? 1 : count;
        if (typeof str !== 'string') {
            throw new TypeError("Expected `input` to be a `string`, got `" + typeof str + "`");
        }
        if (typeof count !== 'number') {
            throw new TypeError("Expected `count` to be a `number`, got `" + typeof count + "`");
        }
        if (typeof indent !== 'string') {
            throw new TypeError("Expected `indent` to be a `string`, got `" + typeof indent + "`");
        }
        if (count === 0) {
            return str;
        }
        indent = count > 1 ? repeating(count, indent) : indent;
        return str.replace(/^(?!\s*$)/mg, indent);
    };
    return indentString(stripIndent(str), count || 0, indent);
}
// Create a compilerHost object to allow the compiler to read and write files
function compilerHost(transpileOptions) {
    var inputFileName = transpileOptions.fileName || (transpileOptions.jsx ? 'module.tsx' : 'module.ts');
    var compilerHost = {
        getSourceFile: function (fileName) {
            if (fileName.lastIndexOf('.ts') !== -1) {
                if (fileName === 'lib.d.ts') {
                    return undefined;
                }
                if (fileName.substr(-5) === '.d.ts') {
                    return undefined;
                }
                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }
                if (!fs.existsSync(fileName)) {
                    return undefined;
                }
                var libSource = '';
                try {
                    libSource = fs.readFileSync(fileName).toString();
                    if (hasBom(libSource)) {
                        libSource = stripBom(libSource);
                    }
                }
                catch (e) {
                    logger.debug(e, fileName);
                }
                return ts$2.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: function (name, text) { },
        getDefaultLibFileName: function () { return 'lib.d.ts'; },
        useCaseSensitiveFileNames: function () { return false; },
        getCanonicalFileName: function (fileName) { return fileName; },
        getCurrentDirectory: function () { return ''; },
        getNewLine: function () { return '\n'; },
        fileExists: function (fileName) { return fileName === inputFileName; },
        readFile: function () { return ''; },
        directoryExists: function () { return true; },
        getDirectories: function () { return []; }
    };
    return compilerHost;
}
function findMainSourceFolder(files) {
    var mainFolder = '', mainFolderCount = 0, rawFolders = files.map(function (filepath) {
        var shortPath = filepath.replace(process.cwd() + path.sep, '');
        return path.dirname(shortPath);
    }), folders = {}, i = 0;
    rawFolders = _$7.uniq(rawFolders);
    var len = rawFolders.length;
    for (i; i < len; i++) {
        var sep$$1 = rawFolders[i].split(path.sep);
        sep$$1.map(function (folder) {
            if (folders[folder]) {
                folders[folder] += 1;
            }
            else {
                folders[folder] = 1;
            }
        });
    }
    for (var f in folders) {
        if (folders[f] > mainFolderCount) {
            mainFolderCount = folders[f];
            mainFolder = f;
        }
    }
    return mainFolder;
}

var JSON5 = require('json5');
var _$9 = require('lodash');
var RouterParser = (function () {
    var routes = [], incompleteRoutes = [], modules = [], modulesTree, rootModule, cleanModulesTree, modulesWithRoutes = [], _addRoute = function (route) {
        routes.push(route);
        routes = _$9.sortBy(_$9.uniqWith(routes, _$9.isEqual), ['name']);
    }, _addIncompleteRoute = function (route) {
        incompleteRoutes.push(route);
        incompleteRoutes = _$9.sortBy(_$9.uniqWith(incompleteRoutes, _$9.isEqual), ['name']);
    }, _addModuleWithRoutes = function (moduleName, moduleImports, filename) {
        modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports,
            filename: filename
        });
        modulesWithRoutes = _$9.sortBy(_$9.uniqWith(modulesWithRoutes, _$9.isEqual), ['name']);
    }, _addModule = function (moduleName, moduleImports) {
        modules.push({
            name: moduleName,
            importsNode: moduleImports
        });
        modules = _$9.sortBy(_$9.uniqWith(modules, _$9.isEqual), ['name']);
    }, _cleanRawRouteParsed = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, ''), testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma != -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return JSON5.parse(routesWithoutSpaces);
    }, _cleanRawRoute = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, ''), testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma != -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return routesWithoutSpaces;
    }, _setRootModule = function (module) {
        rootModule = module;
    }, _hasRouterModuleInImports = function (imports) {
        var result = false, i = 0, len = imports.length;
        for (i; i < len; i++) {
            if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                result = true;
            }
        }
        return result;
    }, _fixIncompleteRoutes = function (miscellaneousVariables) {
        /*console.log('fixIncompleteRoutes');
        console.log('');
        console.log(routes);
        console.log('');*/
        //console.log(miscellaneousVariables);
        //console.log('');
        var i = 0, len = incompleteRoutes.length, matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (i; i < len; i++) {
            var j = 0, leng = miscellaneousVariables.length;
            for (j; j < leng; j++) {
                if (incompleteRoutes[i].data.indexOf(miscellaneousVariables[j].name) !== -1) {
                    console.log('found one misc var inside incompleteRoute');
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            //Clean incompleteRoute
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace('[', '');
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace(']', '');
        }
        /*console.log(incompleteRoutes);
        console.log('');
        console.log(matchingVariables);
        console.log('');*/
    }, _linkModulesAndRoutes = function () {
        /*console.log('');
        console.log('linkModulesAndRoutes: ');
        //scan each module imports AST for each routes, and link routes with module
        console.log('linkModulesAndRoutes routes: ', routes);
        console.log('');*/
        var i = 0, len = modulesWithRoutes.length;
        for (i; i < len; i++) {
            _$9.forEach(modulesWithRoutes[i].importsNode, function (node) {
                if (node.initializer) {
                    if (node.initializer.elements) {
                        _$9.forEach(node.initializer.elements, function (element) {
                            //find element with arguments
                            if (element.arguments) {
                                _$9.forEach(element.arguments, function (argument) {
                                    _$9.forEach(routes, function (route) {
                                        if (argument.text && route.name === argument.text && route.filename === modulesWithRoutes[i].filename) {
                                            route.module = modulesWithRoutes[i].name;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
        /*console.log('');
        console.log('end linkModulesAndRoutes: ');
        console.log(util.inspect(routes, { depth: 10 }));
        console.log('');*/
    }, foundRouteWithModuleName = function (moduleName) {
        return _$9.find(routes, { 'module': moduleName });
    }, foundLazyModuleWithPath = function (path$$1) {
        //path is like app/customers/customers.module#CustomersModule
        var split = path$$1.split('#'), lazyModulePath = split[0], lazyModuleName = split[1];
        return lazyModuleName;
    }, _constructRoutesTree = function () {
        //console.log('');
        /*console.log('constructRoutesTree modules: ', modules);
        console.log('');
        console.log('constructRoutesTree modulesWithRoutes: ', modulesWithRoutes);
        console.log('');
        console.log('constructRoutesTree modulesTree: ', util.inspect(modulesTree, { depth: 10 }));
        console.log('');*/
        // routes[] contains routes with module link
        // modulesTree contains modules tree
        // make a final routes tree with that
        cleanModulesTree = _$9.cloneDeep(modulesTree);
        var modulesCleaner = function (arr) {
            for (var i in arr) {
                if (arr[i].importsNode) {
                    delete arr[i].importsNode;
                }
                if (arr[i].parent) {
                    delete arr[i].parent;
                }
                if (arr[i].children) {
                    modulesCleaner(arr[i].children);
                }
            }
        };
        modulesCleaner(cleanModulesTree);
        //console.log('');
        //console.log('  cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
        //console.log('');
        //console.log(routes);
        //console.log('');
        var routesTree = {
            name: '<root>',
            kind: 'module',
            className: rootModule,
            children: []
        };
        var loopModulesParser = function (node) {
            if (node.children && node.children.length > 0) {
                //If module has child modules
                //console.log('   If module has child modules');
                for (var i in node.children) {
                    var route = foundRouteWithModuleName(node.children[i].name);
                    if (route && route.data) {
                        route.children = JSON5.parse(route.data);
                        delete route.data;
                        route.kind = 'module';
                        routesTree.children.push(route);
                    }
                    if (node.children[i].children) {
                        loopModulesParser(node.children[i]);
                    }
                }
            }
            else {
                //else routes are directly inside the module
                //console.log('   else routes are directly inside the root module');
                var rawRoutes = foundRouteWithModuleName(node.name);
                if (rawRoutes) {
                    var routes_1 = JSON5.parse(rawRoutes.data);
                    if (routes_1) {
                        var i_1 = 0, len = routes_1.length;
                        for (i_1; i_1 < len; i_1++) {
                            var route = routes_1[i_1];
                            if (routes_1[i_1].component) {
                                routesTree.children.push({
                                    kind: 'component',
                                    component: routes_1[i_1].component,
                                    path: routes_1[i_1].path
                                });
                            }
                        }
                    }
                }
            }
        };
        //console.log('');
        //console.log('  rootModule: ', rootModule);
        //console.log('');
        var startModule = _$9.find(cleanModulesTree, { 'name': rootModule });
        if (startModule) {
            loopModulesParser(startModule);
            //Loop twice for routes with lazy loading
            //loopModulesParser(routesTree);
        }
        /*console.log('');
        console.log('  routesTree: ', routesTree);
        console.log('');*/
        var cleanedRoutesTree = null;
        var cleanRoutesTree = function (route) {
            for (var i in route.children) {
                var routes = route.children[i].routes;
            }
            return route;
        };
        cleanedRoutesTree = cleanRoutesTree(routesTree);
        //Try updating routes with lazy loading
        //console.log('');
        //console.log('Try updating routes with lazy loading');
        var loopRoutesParser = function (route) {
            if (route.children) {
                var _loop_1 = function () {
                    if (route.children[i].loadChildren) {
                        var child = foundLazyModuleWithPath(route.children[i].loadChildren), module = _$9.find(cleanModulesTree, { 'name': child });
                        if (module) {
                            var _rawModule_1 = {};
                            _rawModule_1.kind = 'module';
                            _rawModule_1.children = [];
                            _rawModule_1.module = module.name;
                            var loopInside = function (mod) {
                                if (mod.children) {
                                    for (var i in mod.children) {
                                        var route_1 = foundRouteWithModuleName(mod.children[i].name);
                                        if (typeof route_1 !== 'undefined') {
                                            if (route_1.data) {
                                                route_1.children = JSON5.parse(route_1.data);
                                                delete route_1.data;
                                                route_1.kind = 'module';
                                                _rawModule_1.children.push(route_1);
                                            }
                                        }
                                    }
                                }
                            };
                            loopInside(module);
                            route.children[i].children = [];
                            route.children[i].children.push(_rawModule_1);
                        }
                    }
                    loopRoutesParser(route.children[i]);
                };
                for (var i in route.children) {
                    _loop_1();
                }
            }
        };
        loopRoutesParser(cleanedRoutesTree);
        //console.log('');
        //console.log('  cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));
        return cleanedRoutesTree;
    }, _constructModulesTree = function () {
        //console.log('');
        //console.log('constructModulesTree');
        var getNestedChildren = function (arr, parent) {
            var out = [];
            for (var i in arr) {
                if (arr[i].parent === parent) {
                    var children = getNestedChildren(arr, arr[i].name);
                    if (children.length) {
                        arr[i].children = children;
                    }
                    out.push(arr[i]);
                }
            }
            return out;
        };
        //Scan each module and add parent property
        _$9.forEach(modules, function (firstLoopModule) {
            _$9.forEach(firstLoopModule.importsNode, function (importNode) {
                _$9.forEach(modules, function (module) {
                    if (module.name === importNode.name) {
                        module.parent = firstLoopModule.name;
                    }
                });
            });
        });
        modulesTree = getNestedChildren(modules);
        /*console.log('');
        console.log('end constructModulesTree');
        console.log(modulesTree);*/
    }, _generateRoutesIndex = function (outputFolder, routes) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/routes-index.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during routes index generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        routes: JSON.stringify(routes)
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(outputFolder + path.sep + '/js/routes/routes_index.js'), result, function (err) {
                        if (err) {
                            logger.error('Error during routes index file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    }, _routesLength = function () {
        var _n = 0;
        var routesParser = function (route) {
            if (typeof route.path !== 'undefined') {
                _n += 1;
            }
            if (route.children) {
                for (var j in route.children) {
                    routesParser(route.children[j]);
                }
            }
        };
        for (var i in routes) {
            routesParser(routes[i]);
        }
        return _n;
    };
    return {
        incompleteRoutes: incompleteRoutes,
        addRoute: _addRoute,
        addIncompleteRoute: _addIncompleteRoute,
        addModuleWithRoutes: _addModuleWithRoutes,
        addModule: _addModule,
        cleanRawRouteParsed: _cleanRawRouteParsed,
        cleanRawRoute: _cleanRawRoute,
        setRootModule: _setRootModule,
        printRoutes: function () {
            console.log('');
            console.log('printRoutes: ');
            console.log(routes);
        },
        printModulesRoutes: function () {
            console.log('');
            console.log('printModulesRoutes: ');
            console.log(modulesWithRoutes);
        },
        routesLength: _routesLength,
        hasRouterModuleInImports: _hasRouterModuleInImports,
        fixIncompleteRoutes: _fixIncompleteRoutes,
        linkModulesAndRoutes: _linkModulesAndRoutes,
        constructRoutesTree: _constructRoutesTree,
        constructModulesTree: _constructModulesTree,
        generateRoutesIndex: _generateRoutesIndex
    };
})();

var ts$4 = require('typescript');
function isVariableLike(node) {
    if (node) {
        switch (node.kind) {
            case ts$4.SyntaxKind.BindingElement:
            case ts$4.SyntaxKind.EnumMember:
            case ts$4.SyntaxKind.Parameter:
            case ts$4.SyntaxKind.PropertyAssignment:
            case ts$4.SyntaxKind.PropertyDeclaration:
            case ts$4.SyntaxKind.PropertySignature:
            case ts$4.SyntaxKind.ShorthandPropertyAssignment:
            case ts$4.SyntaxKind.VariableDeclaration:
                return true;
        }
    }
    return false;
}
function some(array, predicate) {
    if (array) {
        if (predicate) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (predicate(v)) {
                    return true;
                }
            }
        }
        else {
            return array.length > 0;
        }
    }
    return false;
}
function concatenate(array1, array2) {
    if (!some(array2))
        return array1;
    if (!some(array1))
        return array2;
    return array1.concat(array2);
}
function isParameter(node) {
    return node.kind === ts$4.SyntaxKind.Parameter;
}
function getJSDocParameterTags(param) {
    if (!isParameter(param)) {
        return undefined;
    }
    var func = param.parent;
    var tags = getJSDocTags(func, ts$4.SyntaxKind.JSDocParameterTag);
    if (!param.name) {
        // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
        var i = func.parameters.indexOf(param);
        var paramTags = filter(tags, function (tag) { return tag.kind === ts$4.SyntaxKind.JSDocParameterTag; });
        if (paramTags && 0 <= i && i < paramTags.length) {
            return [paramTags[i]];
        }
    }
    else if (param.name.kind === ts$4.SyntaxKind.Identifier) {
        var name_1 = param.name.text;
        return filter(tags, function (tag) { return tag.kind === ts$4.SyntaxKind.JSDocParameterTag && tag.parameterName.text === name_1; });
    }
    else {
        // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
        // But multi-line object types aren't supported yet either
        return undefined;
    }
}
var JSDocTagsParser = (function () {
    var _getJSDocs = function (node) {
        //console.log('getJSDocs: ', node);
        var cache = node.jsDocCache;
        if (!cache) {
            getJSDocsWorker(node);
            node.jsDocCache = cache;
        }
        return cache;
        function getJSDocsWorker(node) {
            var parent = node.parent;
            // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
            // /**
            //   * @param {number} name
            //   * @returns {number}
            //   */
            // var x = function(name) { return name.length; }
            var isInitializerOfVariableDeclarationInStatement = isVariableLike(parent) &&
                parent.initializer === node &&
                parent.parent.parent.kind === ts$4.SyntaxKind.VariableStatement;
            var isVariableOfVariableDeclarationStatement = isVariableLike(node) &&
                parent.parent.kind === ts$4.SyntaxKind.VariableStatement;
            var variableStatementNode = isInitializerOfVariableDeclarationInStatement ? parent.parent.parent :
                isVariableOfVariableDeclarationStatement ? parent.parent :
                    undefined;
            if (variableStatementNode) {
                getJSDocsWorker(variableStatementNode);
            }
            // Also recognize when the node is the RHS of an assignment expression
            var isSourceOfAssignmentExpressionStatement = parent && parent.parent &&
                parent.kind === ts$4.SyntaxKind.BinaryExpression &&
                parent.operatorToken.kind === ts$4.SyntaxKind.EqualsToken &&
                parent.parent.kind === ts$4.SyntaxKind.ExpressionStatement;
            if (isSourceOfAssignmentExpressionStatement) {
                getJSDocsWorker(parent.parent);
            }
            var isModuleDeclaration = node.kind === ts$4.SyntaxKind.ModuleDeclaration &&
                parent && parent.kind === ts$4.SyntaxKind.ModuleDeclaration;
            var isPropertyAssignmentExpression = parent && parent.kind === ts$4.SyntaxKind.PropertyAssignment;
            if (isModuleDeclaration || isPropertyAssignmentExpression) {
                getJSDocsWorker(parent);
            }
            // Pull parameter comments from declaring function as well
            if (node.kind === ts$4.SyntaxKind.Parameter) {
                cache = concatenate(cache, getJSDocParameterTags(node));
            }
            if (isVariableLike(node) && node.initializer) {
                cache = concatenate(cache, node.initializer.jsDoc);
            }
            cache = concatenate(cache, node.jsDoc);
        }
    };
    return {
        getJSDocs: _getJSDocs
    };
})();

var ts$5 = require('typescript');
function kindToType(kind) {
    var _type = '';
    switch (kind) {
        case ts$5.SyntaxKind.StringKeyword:
            _type = 'string';
            break;
        case ts$5.SyntaxKind.NumberKeyword:
            _type = 'number';
            break;
        case ts$5.SyntaxKind.ArrayType:
            _type = '[]';
            break;
        case ts$5.SyntaxKind.VoidKeyword:
            _type = 'void';
            break;
        case ts$5.SyntaxKind.BooleanKeyword:
            _type = 'boolean';
            break;
        case ts$5.SyntaxKind.AnyKeyword:
            _type = 'any';
            break;
        case ts$5.SyntaxKind.NeverKeyword:
            _type = 'never';
            break;
        case ts$5.SyntaxKind.ObjectKeyword:
            _type = 'object';
            break;
    }
    return _type;
}

var ts$6 = require('typescript');
var code = [];
var gen = (function () {
    var tmp = [];
    return function (token) {
        if (token === void 0) { token = null; }
        if (!token) {
            //console.log(' ! token');
            return code;
        }
        else if (token === '\n') {
            //console.log(' \n');
            code.push(tmp.join(''));
            tmp = [];
        }
        else {
            code.push(token);
        }
        return code;
    };
}());
function generate(node) {
    code = [];
    visitAndRecognize(node);
    return code.join('');
}
function visitAndRecognize(node, depth) {
    if (depth === void 0) { depth = 0; }
    recognize(node);
    depth++;
    node.getChildren().forEach(function (c) { return visitAndRecognize(c, depth); });
}
function recognize(node) {
    //console.log('recognizing...', ts.SyntaxKind[node.kind+'']);
    switch (node.kind) {
        case ts$6.SyntaxKind.FirstLiteralToken:
        case ts$6.SyntaxKind.Identifier:
            gen('\"');
            gen(node.text);
            gen('\"');
            break;
        case ts$6.SyntaxKind.StringLiteral:
            gen('\"');
            gen(node.text);
            gen('\"');
            break;
        case ts$6.SyntaxKind.ArrayLiteralExpression:
            break;
        case ts$6.SyntaxKind.ImportKeyword:
            gen('import');
            gen(' ');
            break;
        case ts$6.SyntaxKind.FromKeyword:
            gen('from');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ExportKeyword:
            gen('\n');
            gen('export');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ClassKeyword:
            gen('class');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ThisKeyword:
            gen('this');
            break;
        case ts$6.SyntaxKind.ConstructorKeyword:
            gen('constructor');
            break;
        case ts$6.SyntaxKind.FalseKeyword:
            gen('false');
            break;
        case ts$6.SyntaxKind.TrueKeyword:
            gen('true');
            break;
        case ts$6.SyntaxKind.NullKeyword:
            gen('null');
            break;
        case ts$6.SyntaxKind.AtToken:
            break;
        case ts$6.SyntaxKind.PlusToken:
            gen('+');
            break;
        case ts$6.SyntaxKind.EqualsGreaterThanToken:
            gen(' => ');
            break;
        case ts$6.SyntaxKind.OpenParenToken:
            gen('(');
            break;
        case ts$6.SyntaxKind.ImportClause:
        case ts$6.SyntaxKind.ObjectLiteralExpression:
            gen('{');
            gen(' ');
            break;
        case ts$6.SyntaxKind.Block:
            gen('{');
            gen('\n');
            break;
        case ts$6.SyntaxKind.CloseBraceToken:
            gen('}');
            break;
        case ts$6.SyntaxKind.CloseParenToken:
            gen(')');
            break;
        case ts$6.SyntaxKind.OpenBracketToken:
            gen('[');
            break;
        case ts$6.SyntaxKind.CloseBracketToken:
            gen(']');
            break;
        case ts$6.SyntaxKind.SemicolonToken:
            gen(';');
            gen('\n');
            break;
        case ts$6.SyntaxKind.CommaToken:
            gen(',');
            gen(' ');
            break;
        case ts$6.SyntaxKind.ColonToken:
            gen(' ');
            gen(':');
            gen(' ');
            break;
        case ts$6.SyntaxKind.DotToken:
            gen('.');
            break;
        case ts$6.SyntaxKind.DoStatement:
            break;
        case ts$6.SyntaxKind.Decorator:
            break;
        case ts$6.SyntaxKind.FirstAssignment:
            gen(' = ');
            break;
        case ts$6.SyntaxKind.FirstPunctuation:
            gen(' ');
            break;
        case ts$6.SyntaxKind.PrivateKeyword:
            gen('private');
            gen(' ');
            break;
        case ts$6.SyntaxKind.PublicKeyword:
            gen('public');
            gen(' ');
            break;
        default:
            break;
    }
}

var $ = require('cheerio');
var _$10 = require('lodash');
var ComponentsTreeEngine = (function () {
    function ComponentsTreeEngine() {
        this.components = [];
        this.componentsForTree = [];
        if (ComponentsTreeEngine._instance) {
            throw new Error('Error: Instantiation failed: Use ComponentsTreeEngine.getInstance() instead of new.');
        }
        ComponentsTreeEngine._instance = this;
    }
    ComponentsTreeEngine.getInstance = function () {
        return ComponentsTreeEngine._instance;
    };
    ComponentsTreeEngine.prototype.addComponent = function (component) {
        this.components.push(component);
    };
    ComponentsTreeEngine.prototype.readTemplates = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.componentsForTree.length, $fileengine = new FileEngine(), loop = function () {
                if (i <= len - 1) {
                    if (_this.componentsForTree[i].templateUrl) {
                        $fileengine.get(path.dirname(_this.componentsForTree[i].file) + path.sep + _this.componentsForTree[i].templateUrl).then(function (templateData) {
                            _this.componentsForTree[i].templateData = templateData;
                            i++;
                            loop();
                        }, function (e) {
                            logger.error(e);
                            reject();
                        });
                    }
                    else {
                        _this.componentsForTree[i].templateData = _this.componentsForTree[i].template;
                        i++;
                        loop();
                    }
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    ComponentsTreeEngine.prototype.findChildrenAndParents = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            _$10.forEach(_this.componentsForTree, function (component) {
                var $component = $(component.templateData);
                _$10.forEach(_this.componentsForTree, function (componentToFind) {
                    if ($component.find(componentToFind.selector).length > 0) {
                        console.log(componentToFind.name + ' found in ' + component.name);
                        component.children.push(componentToFind.name);
                    }
                });
            });
            resolve$$1();
        });
    };
    ComponentsTreeEngine.prototype.createTreesForComponents = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            _$10.forEach(_this.components, function (component) {
                var _component = {
                    name: component.name,
                    file: component.file,
                    selector: component.selector,
                    children: [],
                    template: '',
                    templateUrl: ''
                };
                if (typeof component.template !== 'undefined') {
                    _component.template = component.template;
                }
                if (component.templateUrl.length > 0) {
                    _component.templateUrl = component.templateUrl[0];
                }
                _this.componentsForTree.push(_component);
            });
            _this.readTemplates().then(function () {
                _this.findChildrenAndParents().then(function () {
                    console.log('this.componentsForTree: ', _this.componentsForTree);
                    resolve$$1();
                }, function (e) {
                    logger.error(e);
                    reject();
                });
            }, function (e) {
                logger.error(e);
            });
        });
    };
    ComponentsTreeEngine._instance = new ComponentsTreeEngine();
    return ComponentsTreeEngine;
}());

var $componentsTreeEngine = ComponentsTreeEngine.getInstance();

var marked$2 = require('marked');
var ts$1 = require('typescript');
var _$6 = require('lodash');
var Dependencies = (function () {
    function Dependencies(files, options) {
        this.__cache = {};
        this.__nsModule = {};
        this.unknown = '???';
        this.configuration = Configuration.getInstance();
        this.getComponentExampleUrls = function (text) {
            var exampleUrlsMatches = text.match(/<example-url>(.*?)<\/example-url>/g);
            var exampleUrls = null;
            if (exampleUrlsMatches && exampleUrlsMatches.length) {
                exampleUrls = exampleUrlsMatches.map(function (val) {
                    return val.replace(/<\/?example-url>/g, '');
                });
            }
            return exampleUrls;
        };
        this.files = files;
        var transpileOptions = {
            target: ts$1.ScriptTarget.ES5,
            module: ts$1.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts$1.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
        this.typeChecker = this.program.getTypeChecker();
    }
    Dependencies.prototype.getDependencies = function () {
        var _this = this;
        var deps = {
            'modules': [],
            'modulesForGraph': [],
            'components': [],
            'injectables': [],
            'pipes': [],
            'directives': [],
            'routes': [],
            'classes': [],
            'interfaces': [],
            'miscellaneous': {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: [],
                types: []
            }
        };
        var sourceFiles = this.program.getSourceFiles() || [];
        sourceFiles.map(function (file) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);
                    try {
                        _this.getSourceFileDecorators(file, deps);
                    }
                    catch (e) {
                        logger.error(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        // End of file scanning
        // Try merging inside the same file declarated variables & modules with imports | exports | declarations | providers
        if (deps['miscellaneous'].variables.length > 0) {
            deps['miscellaneous'].variables.forEach(function (_variable) {
                var newVar = [];
                (function (_var, _newVar) {
                    // getType pr reconstruire....
                    if (_var.initializer) {
                        if (_var.initializer.elements) {
                            if (_var.initializer.elements.length > 0) {
                                _var.initializer.elements.forEach(function (element) {
                                    if (element.text) {
                                        newVar.push({
                                            name: element.text,
                                            type: _this.getType(element.text)
                                        });
                                    }
                                });
                            }
                        }
                    }
                })(_variable, newVar);
                var onLink = function (mod) {
                    if (mod.file === _variable.file) {
                        var process = function (initialArray, _var) {
                            var indexToClean = 0, found = false;
                            var findVariableInArray = function (el, index, theArray) {
                                if (el.name === _var.name) {
                                    indexToClean = index;
                                    found = true;
                                }
                            };
                            initialArray.forEach(findVariableInArray);
                            // Clean indexes to replace
                            if (found) {
                                initialArray.splice(indexToClean, 1);
                                // Add variable
                                newVar.forEach(function (newEle) {
                                    if (typeof _$6.find(initialArray, { 'name': newEle.name }) === 'undefined') {
                                        initialArray.push(newEle);
                                    }
                                });
                            }
                        };
                        process(mod.imports, _variable);
                        process(mod.exports, _variable);
                        process(mod.declarations, _variable);
                        process(mod.providers, _variable);
                    }
                };
                deps['modules'].forEach(onLink);
                deps['modulesForGraph'].forEach(onLink);
            });
        }
        //RouterParser.printModulesRoutes();
        //RouterParser.printRoutes();
        /*if (RouterParser.incompleteRoutes.length > 0) {
            if (deps['miscellaneous']['variables'].length > 0) {
                RouterParser.fixIncompleteRoutes(deps['miscellaneous']['variables']);
            }
        }*/
        //$componentsTreeEngine.createTreesForComponents();
        RouterParser.linkModulesAndRoutes();
        RouterParser.constructModulesTree();
        deps.routesTree = RouterParser.constructRoutesTree();
        return deps;
    };
    Dependencies.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
        var _this = this;
        var cleaner = (process.cwd() + path.sep).replace(/\\/g, '/'), file = srcFile.fileName.replace(cleaner, '');
        ts$1.forEachChild(srcFile, function (node) {
            var deps = {};
            if (node.decorators) {
                var visitNode = function (visitedNode, index) {
                    var metadata = node.decorators;
                    var name = _this.getSymboleName(node);
                    var props = _this.findProps(visitedNode);
                    var IO = _this.getComponentIO(file, srcFile, node);
                    if (_this.isModule(metadata)) {
                        deps = {
                            name: name,
                            id: 'module-' + name + '-' + Date.now(),
                            file: file,
                            providers: _this.getModuleProviders(props),
                            declarations: _this.getModuleDeclations(props),
                            imports: _this.getModuleImports(props),
                            exports: _this.getModuleExports(props),
                            bootstrap: _this.getModuleBootstrap(props),
                            type: 'module',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (RouterParser.hasRouterModuleInImports(deps.imports)) {
                            RouterParser.addModuleWithRoutes(name, _this.getModuleImportsRaw(props), file);
                        }
                        RouterParser.addModule(name, deps.imports);
                        outputSymbols['modules'].push(deps);
                        outputSymbols['modulesForGraph'].push(deps);
                    }
                    else if (_this.isComponent(metadata)) {
                        if (props.length === 0)
                            return;
                        //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                        deps = {
                            name: name,
                            id: 'component-' + name + '-' + Date.now(),
                            file: file,
                            //animations?: string[]; // TODO
                            changeDetection: _this.getComponentChangeDetection(props),
                            encapsulation: _this.getComponentEncapsulation(props),
                            //entryComponents?: string; // TODO waiting doc infos
                            exportAs: _this.getComponentExportAs(props),
                            host: _this.getComponentHost(props),
                            inputs: _this.getComponentInputsMetadata(props),
                            //interpolation?: string; // TODO waiting doc infos
                            moduleId: _this.getComponentModuleId(props),
                            outputs: _this.getComponentOutputs(props),
                            providers: _this.getComponentProviders(props),
                            //queries?: Deps[]; // TODO
                            selector: _this.getComponentSelector(props),
                            styleUrls: _this.getComponentStyleUrls(props),
                            styles: _this.getComponentStyles(props),
                            template: _this.getComponentTemplate(props),
                            templateUrl: _this.getComponentTemplateUrl(props),
                            viewProviders: _this.getComponentViewProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            description: IO.description,
                            type: 'component',
                            sourceCode: srcFile.getText(),
                            exampleUrls: _this.getComponentExampleUrls(srcFile.getText())
                        };
                        if (_this.configuration.mainData.disablePrivateOrInternalSupport) {
                            deps.methodsClass = cleanLifecycleHooksFromMethods(deps.methodsClass);
                        }
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        if (IO.extends) {
                            deps.extends = IO.extends;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        $componentsTreeEngine.addComponent(deps);
                        outputSymbols['components'].push(deps);
                    }
                    else if (_this.isInjectable(metadata)) {
                        deps = {
                            name: name,
                            id: 'injectable-' + name + '-' + Date.now(),
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (_this.isPipe(metadata)) {
                        deps = {
                            name: name,
                            id: 'pipe-' + name + '-' + Date.now(),
                            file: file,
                            type: 'pipe',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (_this.isDirective(metadata)) {
                        if (props.length === 0)
                            return;
                        deps = {
                            name: name,
                            id: 'directive-' + name + '-' + Date.now(),
                            file: file,
                            type: 'directive',
                            description: IO.description,
                            sourceCode: srcFile.getText(),
                            selector: _this.getComponentSelector(props),
                            providers: _this.getComponentProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            exampleUrls: _this.getComponentExampleUrls(srcFile.getText())
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['directives'].push(deps);
                    }
                    _this.debug(deps);
                    _this.__cache[name] = deps;
                };
                var filterByDecorators = function (node) {
                    if (node.expression && node.expression.expression) {
                        return /(NgModule|Component|Injectable|Pipe|Directive)/.test(node.expression.expression.text);
                    }
                    return false;
                };
                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else if (node.symbol) {
                if (node.symbol.flags === ts$1.SymbolFlags.Class) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getClassIO(file, srcFile, node);
                    deps = {
                        name: name,
                        id: 'class-' + name + '-' + Date.now(),
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.constructor) {
                        deps.constructorObj = IO.constructor;
                    }
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.description) {
                        deps.description = IO.description;
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    if (IO.extends) {
                        deps.extends = IO.extends;
                    }
                    if (IO.implements && IO.implements.length > 0) {
                        deps.implements = IO.implements;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                else if (node.symbol.flags === ts$1.SymbolFlags.Interface) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getInterfaceIO(file, srcFile, node);
                    deps = {
                        name: name,
                        id: 'interface-' + name + '-' + Date.now(),
                        file: file,
                        type: 'interface',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.indexSignatures) {
                        deps.indexSignatures = IO.indexSignatures;
                    }
                    if (IO.kind) {
                        deps.kind = IO.kind;
                    }
                    if (IO.description) {
                        deps.description = IO.description;
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    _this.debug(deps);
                    outputSymbols['interfaces'].push(deps);
                }
                else if (node.kind === ts$1.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node), tags = _this.visitFunctionDeclarationJSDocTags(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node)
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    if (tags && tags.length > 0) {
                        deps.jsdoctags = tags;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                else if (node.kind === ts$1.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node), name = node.name.text;
                    deps = {
                        name: name,
                        childs: infos,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node),
                        file: file
                    };
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
            else {
                var IO = _this.getRouteIO(file, srcFile);
                if (IO.routes) {
                    var newRoutes = void 0;
                    try {
                        newRoutes = RouterParser.cleanRawRouteParsed(IO.routes);
                    }
                    catch (e) {
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.');
                        newRoutes = IO.routes.replace(/ /gm, '');
                        RouterParser.addIncompleteRoute({
                            data: newRoutes,
                            file: file
                        });
                        return true;
                    }
                    outputSymbols['routes'] = outputSymbols['routes'].concat(newRoutes);
                }
                if (node.kind === ts$1.SyntaxKind.ClassDeclaration) {
                    var name = _this.getSymboleName(node);
                    var IO_1 = _this.getClassIO(file, srcFile, node);
                    deps = {
                        name: name,
                        id: 'class-' + name + '-' + Date.now(),
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if (IO_1.constructor) {
                        deps.constructorObj = IO_1.constructor;
                    }
                    if (IO_1.properties) {
                        deps.properties = IO_1.properties;
                    }
                    if (IO_1.indexSignatures) {
                        deps.indexSignatures = IO_1.indexSignatures;
                    }
                    if (IO_1.description) {
                        deps.description = IO_1.description;
                    }
                    if (IO_1.methods) {
                        deps.methods = IO_1.methods;
                    }
                    if (IO_1.extends) {
                        deps.extends = IO_1.extends;
                    }
                    if (IO_1.implements && IO_1.implements.length > 0) {
                        deps.implements = IO_1.implements;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.ExpressionStatement) {
                    var bootstrapModuleReference = 'bootstrapModule';
                    //Find the root module with bootstrapModule call
                    //1. find a simple call : platformBrowserDynamic().bootstrapModule(AppModule);
                    //2. or inside a call :
                    // () => {
                    //     platformBrowserDynamic().bootstrapModule(AppModule);
                    // });
                    //3. with a catch : platformBrowserDynamic().bootstrapModule(AppModule).catch(error => console.error(error));
                    //4. with parameters : platformBrowserDynamic().bootstrapModule(AppModule, {}).catch(error => console.error(error));
                    //Find recusively in expression nodes one with name 'bootstrapModule'
                    var rootModule_1, resultNode = void 0;
                    if (srcFile.text.indexOf(bootstrapModuleReference) !== -1) {
                        if (node.expression) {
                            resultNode = _this.findExpressionByNameInExpressions(node.expression, 'bootstrapModule');
                        }
                        if (!resultNode) {
                            if (node.expression && node.expression.arguments && node.expression.arguments.length > 0) {
                                resultNode = _this.findExpressionByNameInExpressionArguments(node.expression.arguments, 'bootstrapModule');
                            }
                        }
                        if (resultNode) {
                            if (resultNode.arguments.length > 0) {
                                _$6.forEach(resultNode.arguments, function (argument) {
                                    if (argument.text) {
                                        rootModule_1 = argument.text;
                                    }
                                });
                            }
                            if (rootModule_1) {
                                RouterParser.setRootModule(rootModule_1);
                            }
                        }
                    }
                }
                if (node.kind === ts$1.SyntaxKind.VariableStatement && !_this.isVariableRoutes(node)) {
                    var infos = _this.visitVariableDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    deps.type = (infos.type) ? infos.type : '';
                    if (infos.defaultValue) {
                        deps.defaultValue = infos.defaultValue;
                    }
                    if (infos.initializer) {
                        deps.initializer = infos.initializer;
                    }
                    if (node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[0].comment) {
                        deps.description = marked$2(node.jsDoc[0].comment);
                    }
                    outputSymbols['miscellaneous'].variables.push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.TypeAliasDeclaration) {
                    var infos = _this.visitTypeDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    outputSymbols['miscellaneous'].types.push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node)
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                if (node.kind === ts$1.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node), name = node.name.text;
                    deps = {
                        name: name,
                        childs: infos,
                        description: _this.visitEnumAndFunctionDeclarationDescription(node),
                        file: file
                    };
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
        });
    };
    Dependencies.prototype.debug = function (deps) {
        logger.debug('found', "" + deps.name);
        [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
        ].forEach(function (symbols) {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug('', "- " + symbols + ":");
                deps[symbols].map(function (i) { return i.name; }).forEach(function (d) {
                    logger.debug('', "\t- " + d);
                });
            }
        });
    };
    Dependencies.prototype.isVariableRoutes = function (node) {
        var result = false;
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        result = true;
                    }
                }
            }
        }
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressions = function (entryNode, name) {
        var result, loop = function (node, name) {
            if (node.expression && !node.expression.name) {
                loop(node.expression, name);
            }
            if (node.expression && node.expression.name) {
                if (node.expression.name.text === name) {
                    result = node;
                }
                else {
                    loop(node.expression, name);
                }
            }
        };
        loop(entryNode, name);
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressionArguments = function (arg, name) {
        var result, that = this, i = 0, len = arg.length, loop = function (node, name) {
            if (node.body) {
                if (node.body.statements && node.body.statements.length > 0) {
                    var j = 0, leng = node.body.statements.length;
                    for (j; j < leng; j++) {
                        result = that.findExpressionByNameInExpressions(node.body.statements[j], name);
                    }
                }
            }
        };
        for (i; i < len; i++) {
            loop(arg[i], name);
        }
        return result;
    };
    Dependencies.prototype.parseDecorators = function (decorators, type) {
        var result = false;
        if (decorators.length > 1) {
            _$6.forEach(decorators, function (decorator) {
                if (decorator.expression.expression) {
                    if (decorator.expression.expression.text === type) {
                        result = true;
                    }
                }
            });
        }
        else {
            if (decorators[0].expression.expression) {
                if (decorators[0].expression.expression.text === type) {
                    result = true;
                }
            }
        }
        return result;
    };
    Dependencies.prototype.isComponent = function (metadatas) {
        return this.parseDecorators(metadatas, 'Component');
    };
    Dependencies.prototype.isPipe = function (metadatas) {
        return this.parseDecorators(metadatas, 'Pipe');
    };
    Dependencies.prototype.isDirective = function (metadatas) {
        return this.parseDecorators(metadatas, 'Directive');
    };
    Dependencies.prototype.isInjectable = function (metadatas) {
        return this.parseDecorators(metadatas, 'Injectable');
    };
    Dependencies.prototype.isModule = function (metadatas) {
        return this.parseDecorators(metadatas, 'NgModule');
    };
    Dependencies.prototype.getType = function (name) {
        var type;
        if (name.toLowerCase().indexOf('component') !== -1) {
            type = 'component';
        }
        else if (name.toLowerCase().indexOf('pipe') !== -1) {
            type = 'pipe';
        }
        else if (name.toLowerCase().indexOf('module') !== -1) {
            type = 'module';
        }
        else if (name.toLowerCase().indexOf('directive') !== -1) {
            type = 'directive';
        }
        return type;
    };
    Dependencies.prototype.getSymboleName = function (node) {
        return node.name.text;
    };
    Dependencies.prototype.getComponentSelector = function (props) {
        return this.getSymbolDeps(props, 'selector').pop();
    };
    Dependencies.prototype.getComponentExportAs = function (props) {
        return this.getSymbolDeps(props, 'exportAs').pop();
    };
    Dependencies.prototype.getModuleProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (providerName) {
            return _this.parseDeepIndentifier(providerName);
        });
    };
    Dependencies.prototype.findProps = function (visitedNode) {
        if (visitedNode.expression.arguments.length > 0) {
            return visitedNode.expression.arguments.pop().properties;
        }
        else {
            return '';
        }
    };
    Dependencies.prototype.getModuleDeclations = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'declarations').map(function (name) {
            var component = _this.findComponentSelectorByName(name);
            if (component) {
                return component;
            }
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getModuleImportsRaw = function (props) {
        return this.getSymbolDepsRaw(props, 'imports');
    };
    Dependencies.prototype.getModuleImports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'imports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getModuleExports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'exports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentHost = function (props) {
        return this.getSymbolDepsObject(props, 'host');
    };
    Dependencies.prototype.getModuleBootstrap = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'bootstrap').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentInputsMetadata = function (props) {
        return this.getSymbolDeps(props, 'inputs');
    };
    Dependencies.prototype.getDecoratorOfType = function (node, decoratorType) {
        var decorators = node.decorators || [];
        for (var i = 0; i < decorators.length; i++) {
            if (decorators[i].expression.expression) {
                if (decorators[i].expression.expression.text === decoratorType) {
                    return decorators[i];
                }
            }
        }
        return null;
    };
    Dependencies.prototype.visitInput = function (property, inDecorator, sourceFile) {
        var inArgs = inDecorator.expression.arguments, _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked$2(ts$1.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$2(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
        }
        else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts$1.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    };
    Dependencies.prototype.visitType = function (node) {
        var _return = 'void';
        if (node) {
            if (node.typeName) {
                _return = node.typeName.text;
            }
            else if (node.type) {
                if (node.type.kind) {
                    _return = kindToType(node.type.kind);
                }
                if (node.type.typeName) {
                    _return = node.type.typeName.text;
                }
                if (node.type.typeArguments) {
                    _return += '<';
                    for (var _i = 0, _a = node.type.typeArguments; _i < _a.length; _i++) {
                        var argument = _a[_i];
                        if (argument.kind) {
                            _return += kindToType(argument.kind);
                        }
                        if (argument.typeName) {
                            _return += argument.typeName.text;
                        }
                    }
                    _return += '>';
                }
            }
            else if (node.elementType) {
                _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            }
            else if (node.types && node.kind === ts$1.SyntaxKind.UnionType) {
                _return = '';
                var i = 0, len = node.types.length;
                for (i; i < len; i++) {
                    _return += kindToType(node.types[i].kind);
                    if (i < len - 1) {
                        _return += '|';
                    }
                }
            }
            else if (node.dotDotDotToken) {
                _return = 'any[]';
            }
            else {
                _return = kindToType(node.kind);
            }
            if (node.typeArguments) {
                _return += '<';
                for (var _b = 0, _c = node.typeArguments; _b < _c.length; _b++) {
                    var argument = _c[_b];
                    _return += kindToType(argument.kind);
                }
                _return += '>';
            }
        }
        return _return;
    };
    Dependencies.prototype.visitOutput = function (property, outDecorator, sourceFile) {
        var inArgs = outDecorator.expression.arguments, _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked$2(ts$1.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$2(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
        }
        else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts$1.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    };
    Dependencies.prototype.isPublic = function (member) {
        if (member.modifiers) {
            var isPublic = member.modifiers.some(function (modifier) {
                return modifier.kind === ts$1.SyntaxKind.PublicKeyword;
            });
            if (isPublic) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    };
    Dependencies.prototype.isPrivate = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            var isPrivate = member.modifiers.some(function (modifier) { return modifier.kind === ts$1.SyntaxKind.PrivateKeyword; });
            if (isPrivate) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    };
    Dependencies.prototype.isInternal = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['internal'];
        if (member.jsDoc) {
            for (var _i = 0, _a = member.jsDoc; _i < _a.length; _i++) {
                var doc = _a[_i];
                if (doc.tags) {
                    for (var _b = 0, _c = doc.tags; _b < _c.length; _b++) {
                        var tag = _c[_b];
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    Dependencies.prototype.isHiddenMember = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['hidden'];
        if (member.jsDoc) {
            for (var _i = 0, _a = member.jsDoc; _i < _a.length; _i++) {
                var doc = _a[_i];
                if (doc.tags) {
                    for (var _b = 0, _c = doc.tags; _b < _c.length; _b++) {
                        var tag = _c[_b];
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    Dependencies.prototype.isAngularLifecycleHook = function (methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var ANGULAR_LIFECYCLE_METHODS = [
            'ngOnInit', 'ngOnChanges', 'ngDoCheck', 'ngOnDestroy', 'ngAfterContentInit', 'ngAfterContentChecked',
            'ngAfterViewInit', 'ngAfterViewChecked', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'
        ];
        return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
    };
    Dependencies.prototype.visitConstructorDeclaration = function (method, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (method.symbol) {
            result.description = marked$2(ts$1.displayPartsToString(method.symbol.getDocumentationComment()));
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitConstructorProperties = function (method) {
        var that = this;
        if (method.parameters) {
            var _parameters = [], i = 0, len = method.parameters.length;
            for (i; i < len; i++) {
                if (that.isPublic(method.parameters[i])) {
                    _parameters.push(that.visitArgument(method.parameters[i]));
                }
            }
            return _parameters;
        }
        else {
            return [];
        }
    };
    Dependencies.prototype.visitCallDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            description: marked$2(ts$1.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitIndexDeclaration = function (method, sourceFile) {
        var _this = this;
        return {
            description: marked$2(ts$1.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
    };
    Dependencies.prototype.getPosition = function (node, sourceFile) {
        var position;
        if (node['name'] && node['name'].end) {
            position = ts$1.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
        }
        else {
            position = ts$1.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    };
    Dependencies.prototype.visitMethodDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (method.symbol) {
            result.description = marked$2(ts$1.displayPartsToString(method.symbol.getDocumentationComment()));
        }
        if (method.decorators) {
            result.decorators = this.formatDecorators(method.decorators);
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitArgument = function (arg) {
        var _this = this;
        var _result = {
            name: arg.name.text,
            type: this.visitType(arg)
        };
        if (arg.dotDotDotToken) {
            _result.dotDotDotToken = true;
        }
        if (arg.type) {
            if (arg.type.kind) {
                if (arg.type.kind === ts$1.SyntaxKind.FunctionType) {
                    _result.function = arg.type.parameters ? arg.type.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [];
                }
            }
        }
        return _result;
    };
    Dependencies.prototype.getNamesCompareFn = function (name) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        name = name || 'name';
        var t = function (a, b) {
            if (a[name]) {
                return a[name].localeCompare(b[name]);
            }
            else {
                return 0;
            }
        };
        return t;
    };
    Dependencies.prototype.stringifyDefaultValue = function (node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (node.text) {
            return node.text;
        }
        else if (node.kind === ts$1.SyntaxKind.FalseKeyword) {
            return 'false';
        }
        else if (node.kind === ts$1.SyntaxKind.TrueKeyword) {
            return 'true';
        }
    };
    Dependencies.prototype.formatDecorators = function (decorators) {
        var _decorators = [];
        _$6.forEach(decorators, function (decorator) {
            if (decorator.expression) {
                if (decorator.expression.text) {
                    _decorators.push({
                        name: decorator.expression.text
                    });
                }
                if (decorator.expression.expression) {
                    var info = {
                        name: decorator.expression.expression.text
                    };
                    if (decorator.expression.expression.arguments) {
                        if (decorator.expression.expression.arguments.length > 0) {
                            info.args = decorator.expression.expression.arguments;
                        }
                    }
                    _decorators.push(info);
                }
            }
        });
        return _decorators;
    };
    Dependencies.prototype.visitProperty = function (property, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: '',
            line: this.getPosition(property, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(property);
        if (property.symbol) {
            result.description = marked$2(ts$1.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (property.decorators) {
            result.decorators = this.formatDecorators(property.decorators);
        }
        if (property.modifiers) {
            if (property.modifiers.length > 0) {
                result.modifierKind = property.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitMembers = function (members, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [], outputs = [], methods = [], properties = [], indexSignatures = [], kind, inputDecorator, constructor, outDecorator;
        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
            kind = members[i].kind;
            if (inputDecorator) {
                inputs.push(this.visitInput(members[i], inputDecorator, sourceFile));
            }
            else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator, sourceFile));
            }
            else if (!this.isHiddenMember(members[i])) {
                if ((this.isPrivate(members[i]) || this.isInternal(members[i])) && this.configuration.mainData.disablePrivateOrInternalSupport) { }
                else {
                    if ((members[i].kind === ts$1.SyntaxKind.MethodDeclaration ||
                        members[i].kind === ts$1.SyntaxKind.MethodSignature)) {
                        methods.push(this.visitMethodDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.PropertyDeclaration ||
                        members[i].kind === ts$1.SyntaxKind.PropertySignature || members[i].kind === ts$1.SyntaxKind.GetAccessor) {
                        properties.push(this.visitProperty(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.IndexSignature) {
                        indexSignatures.push(this.visitIndexDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts$1.SyntaxKind.Constructor) {
                        var _constructorProperties = this.visitConstructorProperties(members[i]), j = 0, len = _constructorProperties.length;
                        for (j; j < len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i], sourceFile);
                    }
                }
            }
        }
        inputs.sort(this.getNamesCompareFn());
        outputs.sort(this.getNamesCompareFn());
        properties.sort(this.getNamesCompareFn());
        indexSignatures.sort(this.getNamesCompareFn());
        return {
            inputs: inputs,
            outputs: outputs,
            methods: methods,
            properties: properties,
            indexSignatures: indexSignatures,
            kind: kind,
            constructor: constructor
        };
    };
    Dependencies.prototype.visitDirectiveDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var selector;
        var exportAs;
        var properties;
        if (decorator.expression.arguments.length > 0) {
            properties = decorator.expression.arguments[0].properties;
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].name.text === 'selector') {
                    // TODO: this will only work if selector is initialized as a string literal
                    selector = properties[i].initializer.text;
                }
                if (properties[i].name.text === 'exportAs') {
                    // TODO: this will only work if selector is initialized as a string literal
                    exportAs = properties[i].initializer.text;
                }
            }
        }
        return {
            selector: selector,
            exportAs: exportAs
        };
    };
    Dependencies.prototype.isPipeDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Pipe' : false;
    };
    Dependencies.prototype.isModuleDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'NgModule' : false;
    };
    Dependencies.prototype.isDirectiveDecorator = function (decorator) {
        if (decorator.expression.expression) {
            var decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        }
        else {
            return false;
        }
    };
    Dependencies.prototype.isServiceDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Injectable' : false;
    };
    Dependencies.prototype.visitClassDeclaration = function (fileName, classDeclaration, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        var description = '';
        if (symbol) {
            description = marked$2(ts$1.displayPartsToString(symbol.getDocumentationComment()));
        }
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;
        var implementsElements = [];
        var extendsElement;
        var jsdoctags = [];
        if (typeof ts$1.getClassImplementsHeritageClauseElements !== 'undefined') {
            var implementedTypes = ts$1.getClassImplementsHeritageClauseElements(classDeclaration);
            if (implementedTypes) {
                var i_1 = 0, len = implementedTypes.length;
                for (i_1; i_1 < len; i_1++) {
                    if (implementedTypes[i_1].expression) {
                        implementsElements.push(implementedTypes[i_1].expression.text);
                    }
                }
            }
        }
        if (typeof ts$1.getClassExtendsHeritageClauseElement !== 'undefined') {
            var extendsTypes = ts$1.getClassExtendsHeritageClauseElement(classDeclaration);
            if (extendsTypes) {
                if (extendsTypes.expression) {
                    extendsElement = extendsTypes.expression.text;
                }
            }
        }
        if (symbol) {
            if (symbol.valueDeclaration) {
                jsdoctags = JSDocTagsParser.getJSDocs(symbol.valueDeclaration);
            }
        }
        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return {
                        description: description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElement,
                        implements: implementsElements
                    };
                }
                else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            methods: members.methods,
                            indexSignatures: members.indexSignatures,
                            properties: members.properties,
                            kind: members.kind,
                            constructor: members.constructor,
                            extends: extendsElement,
                            implements: implementsElements
                        }];
                }
                else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            jsdoctags: jsdoctags
                        }];
                }
                else {
                    //console.log('custom decorator');
                }
            }
        }
        else if (description) {
            members = this.visitMembers(classDeclaration.members, sourceFile);
            return [{
                    description: description,
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        else {
            members = this.visitMembers(classDeclaration.members, sourceFile);
            return [{
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        return [];
    };
    Dependencies.prototype.visitTypeDeclaration = function (type) {
        var result = {
            name: type.name.text
        }, jsdoctags = JSDocTagsParser.getJSDocs(type);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitFunctionDeclaration = function (method) {
        var mapTypes = function (type) {
            switch (type) {
                case 94:
                    return 'Null';
                case 118:
                    return 'Any';
                case 121:
                    return 'Boolean';
                case 129:
                    return 'Never';
                case 132:
                    return 'Number';
                case 134:
                    return 'String';
                case 137:
                    return 'Undefined';
                case 157:
                    return 'TypeReference';
            }
        };
        var visitArgument = function (arg) {
            var result = {
                name: arg.name.text
            };
            if (arg.type) {
                result.type = mapTypes(arg.type.kind);
                if (arg.type.kind === 157) {
                    //try replace TypeReference with typeName
                    if (arg.type.typeName) {
                        result.type = arg.type.typeName.text;
                    }
                }
            }
            return result;
        };
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return visitArgument(prop); }) : []
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (typeof method.type !== 'undefined') {
            result.returnType = this.visitType(method.type);
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitVariableDeclaration = function (node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                var result = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i].initializer ? this.stringifyDefaultValue(node.declarationList.declarations[i].initializer) : undefined
                };
                if (node.declarationList.declarations[i].initializer) {
                    result.initializer = node.declarationList.declarations[i].initializer;
                }
                if (node.declarationList.declarations[i].type) {
                    result.type = this.visitType(node.declarationList.declarations[i].type);
                }
                return result;
            }
        }
    };
    Dependencies.prototype.visitFunctionDeclarationJSDocTags = function (node) {
        var jsdoctags = JSDocTagsParser.getJSDocs(node), result;
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitEnumAndFunctionDeclarationDescription = function (node) {
        var description = '';
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                if (typeof node.jsDoc[0].comment !== 'undefined') {
                    description = marked$2(node.jsDoc[0].comment);
                }
            }
        }
        return description;
    };
    Dependencies.prototype.visitEnumDeclaration = function (node) {
        var result = [];
        if (node.members) {
            var i = 0, len = node.members.length;
            for (i; i < len; i++) {
                var member = {
                    name: node.members[i].name.text
                };
                if (node.members[i].initializer) {
                    member.value = node.members[i].initializer.text;
                }
                result.push(member);
            }
        }
        return result;
    };
    Dependencies.prototype.visitEnumDeclarationForRoutes = function (fileName, node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        var data = generate(node.declarationList.declarations[i].initializer);
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: RouterParser.cleanRawRoute(data),
                            filename: fileName
                        });
                        return [{
                                routes: data
                            }];
                    }
                }
            }
        }
        return [];
    };
    Dependencies.prototype.getRouteIO = function (filename, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.VariableStatement) {
                return directive.concat(_this.visitEnumDeclarationForRoutes(filename, statement));
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getClassIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getInterfaceIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts$1.SyntaxKind.InterfaceDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentOutputs = function (props) {
        return this.getSymbolDeps(props, 'outputs');
    };
    Dependencies.prototype.getComponentProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentViewProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'viewProviders').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentDirectives = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'directives').map(function (name) {
            var identifier = _this.parseDeepIndentifier(name);
            identifier.selector = _this.findComponentSelectorByName(name);
            identifier.label = '';
            return identifier;
        });
    };
    Dependencies.prototype.parseDeepIndentifier = function (name) {
        var nsModule = name.split('.'), type = this.getType(name);
        if (nsModule.length > 1) {
            // cache deps with the same namespace (i.e Shared.*)
            if (this.__nsModule[nsModule[0]]) {
                this.__nsModule[nsModule[0]].push(name);
            }
            else {
                this.__nsModule[nsModule[0]] = [name];
            }
            return {
                ns: nsModule[0],
                name: name,
                type: type
            };
        }
        return {
            name: name,
            type: type
        };
    };
    Dependencies.prototype.getComponentTemplateUrl = function (props) {
        return this.getSymbolDeps(props, 'templateUrl');
    };
    Dependencies.prototype.getComponentTemplate = function (props) {
        var t = this.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    };
    Dependencies.prototype.getComponentStyleUrls = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    };
    Dependencies.prototype.getComponentStyles = function (props) {
        return this.getSymbolDeps(props, 'styles');
    };
    Dependencies.prototype.getComponentModuleId = function (props) {
        return this.getSymbolDeps(props, 'moduleId').pop();
    };
    Dependencies.prototype.getComponentChangeDetection = function (props) {
        return this.getSymbolDeps(props, 'changeDetection').pop();
    };
    Dependencies.prototype.getComponentEncapsulation = function (props) {
        return this.getSymbolDeps(props, 'encapsulation');
    };
    Dependencies.prototype.sanitizeUrls = function (urls) {
        return urls.map(function (url) { return url.replace('./', ''); });
    };
    Dependencies.prototype.getSymbolDepsObject = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseProperties = function (node) {
            var obj = {};
            (node.initializer.properties || []).forEach(function (prop) {
                obj[prop.name.text] = prop.initializer.text;
            });
            return obj;
        };
        return deps.map(parseProperties).pop();
    };
    Dependencies.prototype.getSymbolDepsRaw = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        return deps || [];
    };
    Dependencies.prototype.getSymbolDeps = function (props, type, multiLine) {
        var _this = this;
        if (props.length === 0) {
            return [];
        }
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseSymbolText = function (text) {
            return [
                text
            ];
        };
        var buildIdentifierName = function (node, name) {
            if (name === void 0) { name = ''; }
            if (node.expression) {
                name = name ? "." + name : name;
                var nodeName = _this.unknown;
                if (node.name) {
                    nodeName = node.name.text;
                }
                else if (node.text) {
                    nodeName = node.text;
                }
                else if (node.expression) {
                    if (node.expression.text) {
                        nodeName = node.expression.text;
                    }
                    else if (node.expression.elements) {
                        if (node.expression.kind === ts$1.SyntaxKind.ArrayLiteralExpression) {
                            nodeName = node.expression.elements.map(function (el) { return el.text; }).join(', ');
                            nodeName = "[" + nodeName + "]";
                        }
                    }
                }
                if (node.kind === ts$1.SyntaxKind.SpreadElement) {
                    return "..." + nodeName;
                }
                return "" + buildIdentifierName(node.expression, nodeName) + name;
            }
            return node.text + "." + name;
        };
        var parseProviderConfiguration = function (o) {
            // parse expressions such as:
            // { provide: APP_BASE_HREF, useValue: '/' },
            // or
            // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
            var _genProviderName = [];
            var _providerProps = [];
            (o.properties || []).forEach(function (prop) {
                var identifier = prop.initializer.text;
                if (prop.initializer.kind === ts$1.SyntaxKind.StringLiteral) {
                    identifier = "'" + identifier + "'";
                }
                // lambda function (i.e useFactory)
                if (prop.initializer.body) {
                    var params = (prop.initializer.parameters || []).map(function (params) { return params.name.text; });
                    identifier = "(" + params.join(', ') + ") => {}";
                }
                else if (prop.initializer.elements) {
                    var elements = (prop.initializer.elements || []).map(function (n) {
                        if (n.kind === ts$1.SyntaxKind.StringLiteral) {
                            return "'" + n.text + "'";
                        }
                        return n.text;
                    });
                    identifier = "[" + elements.join(', ') + "]";
                }
                _providerProps.push([
                    // i.e provide
                    prop.name.text,
                    // i.e OpaqueToken or 'StringToken'
                    identifier
                ].join(': '));
            });
            return "{ " + _providerProps.join(', ') + " }";
        };
        var parseSymbolElements = function (o) {
            // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
            if (o.arguments) {
                var className = buildIdentifierName(o.expression);
                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "args" to indicate
                // that we have arguments.
                var functionArgs = o.arguments.length > 0 ? 'args' : '';
                var text = className + "(" + functionArgs + ")";
                return text;
            }
            else if (o.expression) {
                var identifier = buildIdentifierName(o);
                return identifier;
            }
            return o.text ? o.text : parseProviderConfiguration(o);
        };
        var parseSymbols = function (node) {
            var text = node.initializer.text;
            if (text) {
                return parseSymbolText(text);
            }
            else if (node.initializer.expression) {
                var identifier = parseSymbolElements(node.initializer);
                return [
                    identifier
                ];
            }
            else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }
        };
        return deps.map(parseSymbols).pop() || [];
    };
    Dependencies.prototype.findComponentSelectorByName = function (name) {
        return this.__cache[name];
    };
    return Dependencies;
}());

function promiseSequential(promises) {
    if (!Array.isArray(promises)) {
        throw new Error('First argument need to be an array of Promises');
    }
    return new Promise(function (resolve$$1, reject) {
        var count = 0;
        var results = [];
        var iterateeFunc = function (previousPromise, currentPromise) {
            return previousPromise
                .then(function (result) {
                if (count++ !== 0)
                    results = results.concat(result);
                return currentPromise(result, results, count);
            })
                .catch(function (err) {
                return reject(err);
            });
        };
        promises = promises.concat(function () { return Promise.resolve(); });
        promises
            .reduce(iterateeFunc, Promise.resolve(false))
            .then(function (res) {
            resolve$$1(results);
        });
    });
}

var glob = require('glob');
var ts = require('typescript');
var _$1 = require('lodash');
var marked = require('marked');
var chokidar = require('chokidar');
var pkg$1 = require('../package.json');
var cwd$1 = process.cwd();
var $htmlengine = new HtmlEngine();
var $fileengine = new FileEngine();
var $markdownengine = new MarkdownEngine();
var $ngdengine = new NgdEngine();
var $searchEngine = new SearchEngine();
var startTime = new Date();
var Application = (function () {
    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    function Application(options) {
        var _this = this;
        /**
         * Files changed during watch scanning
         */
        this.watchChangedFiles = [];
        /**
         * Boolean for watching status
         * @type {boolean}
         */
        this.isWatching = false;
        this.preparePipes = function (somePipes) {
            logger.info('Prepare pipes');
            _this.configuration.mainData.pipes = (somePipes) ? somePipes : $dependenciesEngine.getPipes();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.pipes.length, loop = function () {
                    if (i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.pipes[i].file)) {
                            logger.info(" " + _this.configuration.mainData.pipes[i].name + " has a README file, include it");
                            var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.pipes[i].file);
                            _this.configuration.mainData.pipes[i].readme = marked(readme);
                        }
                        _this.configuration.addPage({
                            path: 'pipes',
                            name: _this.configuration.mainData.pipes[i].name,
                            id: _this.configuration.mainData.pipes[i].id,
                            context: 'pipe',
                            pipe: _this.configuration.mainData.pipes[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            });
        };
        this.prepareClasses = function (someClasses) {
            logger.info('Prepare classes');
            _this.configuration.mainData.classes = (someClasses) ? someClasses : $dependenciesEngine.getClasses();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.classes.length, loop = function () {
                    if (i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.classes[i].file)) {
                            logger.info(" " + _this.configuration.mainData.classes[i].name + " has a README file, include it");
                            var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.classes[i].file);
                            _this.configuration.mainData.classes[i].readme = marked(readme);
                        }
                        _this.configuration.addPage({
                            path: 'classes',
                            name: _this.configuration.mainData.classes[i].name,
                            id: _this.configuration.mainData.classes[i].id,
                            context: 'class',
                            class: _this.configuration.mainData.classes[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            });
        };
        this.prepareDirectives = function (someDirectives) {
            logger.info('Prepare directives');
            _this.configuration.mainData.directives = (someDirectives) ? someDirectives : $dependenciesEngine.getDirectives();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.directives.length, loop = function () {
                    if (i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.directives[i].file)) {
                            logger.info(" " + _this.configuration.mainData.directives[i].name + " has a README file, include it");
                            var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.directives[i].file);
                            _this.configuration.mainData.directives[i].readme = marked(readme);
                        }
                        _this.configuration.addPage({
                            path: 'directives',
                            name: _this.configuration.mainData.directives[i].name,
                            id: _this.configuration.mainData.directives[i].id,
                            context: 'directive',
                            directive: _this.configuration.mainData.directives[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            });
        };
        this.configuration = Configuration.getInstance();
        for (var option in options) {
            if (typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'name') {
                this.configuration.mainData['documentationMainName'] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'silent') {
                logger.silent = false;
            }
        }
    }
    /**
     * Start compodoc process
     */
    Application.prototype.generate = function () {
        var _this = this;
        if (this.configuration.mainData.output.charAt(this.configuration.mainData.output.length - 1) !== '/') {
            this.configuration.mainData.output += '/';
        }
        $htmlengine.init().then(function () {
            _this.processPackageJson();
        });
    };
    /**
     * Start compodoc documentation coverage
     */
    Application.prototype.testCoverage = function () {
        this.getDependenciesData();
    };
    /**
     * Store files for initial processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    Application.prototype.setFiles = function (files) {
        this.files = files;
    };
    /**
     * Store files for watch processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    Application.prototype.setUpdatedFiles = function (files) {
        this.updatedFiles = files;
    };
    /**
     * Return a boolean indicating presence of one TypeScript file in updatedFiles list
     * @return {boolean} Result of scan
     */
    Application.prototype.hasWatchedFilesTSFiles = function () {
        var result = false;
        _$1.forEach(this.updatedFiles, function (file) {
            if (path.extname(file) === '.ts') {
                result = true;
            }
        });
        return result;
    };
    /**
     * Return a boolean indicating presence of one root markdown files in updatedFiles list
     * @return {boolean} Result of scan
     */
    Application.prototype.hasWatchedFilesRootMarkdownFiles = function () {
        var result = false;
        _$1.forEach(this.updatedFiles, function (file) {
            if (path.extname(file) === '.md' && path.dirname(file) === process.cwd()) {
                result = true;
            }
        });
        return result;
    };
    /**
     * Clear files for watch processing
     */
    Application.prototype.clearUpdatedFiles = function () {
        this.updatedFiles = [];
        this.watchChangedFiles = [];
    };
    Application.prototype.processPackageJson = function () {
        var _this = this;
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then(function (packageData) {
            var parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && _this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                _this.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                _this.configuration.mainData.documentationMainDescription = parsedData.description;
            }
            _this.configuration.mainData.angularVersion = getAngularVersionOfProject(parsedData);
            logger.info('package.json file found');
            _this.processMarkdowns().then(function () {
                _this.getDependenciesData();
            }, function (errorMessage) {
                logger.error(errorMessage);
            });
        }, function (errorMessage) {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            _this.processMarkdowns().then(function () {
                _this.getDependenciesData();
            }, function (errorMessage) {
                logger.error(errorMessage);
            });
        });
    };
    Application.prototype.processMarkdowns = function () {
        var _this = this;
        logger.info('Searching README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md files');
        return new Promise(function (resolve$$1, reject) {
            var i = 0, markdowns = ['readme', 'changelog', 'contributing', 'license', 'todo'], numberOfMarkdowns = 5, loop = function () {
                if (i < numberOfMarkdowns) {
                    $markdownengine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then(function (readmeData) {
                        _this.configuration.addPage({
                            name: (markdowns[i] === 'readme') ? 'index' : markdowns[i],
                            context: 'getting-started',
                            id: 'getting-started',
                            markdown: readmeData,
                            depth: 0,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                        });
                        if (markdowns[i] === 'readme') {
                            _this.configuration.mainData.readme = true;
                            _this.configuration.addPage({
                                name: 'overview',
                                id: 'overview',
                                context: 'overview',
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        }
                        else {
                            _this.configuration.mainData.markdowns.push({
                                name: markdowns[i],
                                uppername: markdowns[i].toUpperCase(),
                                depth: 0,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        }
                        logger.info(markdowns[i].toUpperCase() + ".md file found");
                        i++;
                        loop();
                    }, function (errorMessage) {
                        logger.warn(errorMessage);
                        logger.warn("Continuing without " + markdowns[i].toUpperCase() + ".md file");
                        if (markdowns[i] === 'readme') {
                            _this.configuration.addPage({
                                name: 'index',
                                id: 'index',
                                context: 'overview'
                            });
                        }
                        i++;
                        loop();
                    });
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.rebuildRootMarkdowns = function () {
        var _this = this;
        logger.info('Regenerating README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md pages');
        var actions = [];
        this.configuration.resetRootMarkdownPages();
        actions.push(function () { return _this.processMarkdowns(); });
        promiseSequential(actions)
            .then(function (res) {
            _this.processPages();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    /**
     * Get dependency data for small group of updated files during watch process
     */
    Application.prototype.getMicroDependenciesData = function () {
        logger.info('Get diff dependencies data');
        var crawler = new Dependencies(this.updatedFiles, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.update(dependenciesData);
        this.prepareJustAFewThings(dependenciesData);
    };
    /**
     * Rebuild external documentation during watch process
     */
    Application.prototype.rebuildExternalDocumentation = function () {
        var _this = this;
        logger.info('Rebuild external documentation');
        var actions = [];
        this.configuration.resetAdditionalPages();
        if (this.configuration.mainData.includes !== '') {
            actions.push(function () { return _this.prepareExternalIncludes(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processPages();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.getDependenciesData = function () {
        logger.info('Get dependencies data');
        var crawler = new Dependencies(this.files, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.init(dependenciesData);
        this.configuration.mainData.routesLength = RouterParser.routesLength();
        this.printStatistics();
        this.prepareEverything();
    };
    Application.prototype.prepareJustAFewThings = function (diffCrawledData) {
        var _this = this;
        var actions = [];
        this.configuration.resetPages();
        actions.push(function () { return _this.prepareRoutes(); });
        if (diffCrawledData.modules.length > 0) {
            actions.push(function () { return _this.prepareModules(); });
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(function () { return _this.prepareComponents(); });
        }
        if (diffCrawledData.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if (diffCrawledData.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if (diffCrawledData.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if (diffCrawledData.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if (diffCrawledData.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0 ||
            diffCrawledData.miscellaneous.types.length > 0) {
            actions.push(function () { return _this.prepareMiscellaneous(); });
        }
        if (!this.configuration.mainData.disableCoverage) {
            actions.push(function () { return _this.prepareCoverage(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processGraphs();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.printStatistics = function () {
        logger.info('-------------------');
        logger.info('Project statistics ');
        if ($dependenciesEngine.modules.length > 0) {
            logger.info("- module     : " + $dependenciesEngine.modules.length);
        }
        if ($dependenciesEngine.components.length > 0) {
            logger.info("- component  : " + $dependenciesEngine.components.length);
        }
        if ($dependenciesEngine.directives.length > 0) {
            logger.info("- directive  : " + $dependenciesEngine.directives.length);
        }
        if ($dependenciesEngine.injectables.length > 0) {
            logger.info("- injectable : " + $dependenciesEngine.injectables.length);
        }
        if ($dependenciesEngine.pipes.length > 0) {
            logger.info("- pipe       : " + $dependenciesEngine.pipes.length);
        }
        if ($dependenciesEngine.classes.length > 0) {
            logger.info("- class      : " + $dependenciesEngine.classes.length);
        }
        if ($dependenciesEngine.interfaces.length > 0) {
            logger.info("- interface  : " + $dependenciesEngine.interfaces.length);
        }
        if (this.configuration.mainData.routesLength > 0) {
            logger.info("- route      : " + this.configuration.mainData.routesLength);
        }
        logger.info('-------------------');
    };
    Application.prototype.prepareEverything = function () {
        var _this = this;
        var actions = [];
        actions.push(function () { return _this.prepareModules(); });
        actions.push(function () { return _this.prepareComponents(); });
        if ($dependenciesEngine.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if ($dependenciesEngine.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if ($dependenciesEngine.routes && $dependenciesEngine.routes.children.length > 0) {
            actions.push(function () { return _this.prepareRoutes(); });
        }
        if ($dependenciesEngine.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if ($dependenciesEngine.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if ($dependenciesEngine.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if ($dependenciesEngine.miscellaneous.variables.length > 0 ||
            $dependenciesEngine.miscellaneous.functions.length > 0 ||
            $dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            $dependenciesEngine.miscellaneous.enumerations.length > 0 ||
            $dependenciesEngine.miscellaneous.types.length > 0) {
            actions.push(function () { return _this.prepareMiscellaneous(); });
        }
        if (!this.configuration.mainData.disableCoverage) {
            actions.push(function () { return _this.prepareCoverage(); });
        }
        if (this.configuration.mainData.includes !== '') {
            actions.push(function () { return _this.prepareExternalIncludes(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processGraphs();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.prepareExternalIncludes = function () {
        var _this = this;
        logger.info('Adding external markdown files');
        //Scan include folder for files detailed in summary.json
        //For each file, add to this.configuration.mainData.additionalPages
        //Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise(function (resolve$$1, reject) {
            $fileengine.get(_this.configuration.mainData.includes + path.sep + 'summary.json').then(function (summaryData) {
                logger.info('Additional documentation: summary.json file found');
                var parsedSummaryData = JSON.parse(summaryData), i = 0, len = parsedSummaryData.length, loop = function () {
                    if (i <= len - 1) {
                        $markdownengine.get(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].file).then(function (markedData) {
                            _this.configuration.addAdditionalPage({
                                name: parsedSummaryData[i].title,
                                id: parsedSummaryData[i].title,
                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                context: 'additional-page',
                                path: _this.configuration.mainData.includesFolder,
                                additionalPage: markedData,
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (parsedSummaryData[i].children && parsedSummaryData[i].children.length > 0) {
                                var j_1 = 0, leng_1 = parsedSummaryData[i].children.length, loopChild_1 = function () {
                                    if (j_1 <= leng_1 - 1) {
                                        $markdownengine.get(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].children[j_1].file).then(function (markedData) {
                                            _this.configuration.addAdditionalPage({
                                                name: parsedSummaryData[i].children[j_1].title,
                                                id: parsedSummaryData[i].children[j_1].title,
                                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].children[j_1].title),
                                                context: 'additional-page',
                                                path: _this.configuration.mainData.includesFolder + '/' + cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                                additionalPage: markedData,
                                                depth: 2,
                                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                            });
                                            j_1++;
                                            loopChild_1();
                                        }, function (e) {
                                            logger.error(e);
                                        });
                                    }
                                    else {
                                        i++;
                                        loop();
                                    }
                                };
                                loopChild_1();
                            }
                            else {
                                i++;
                                loop();
                            }
                        }, function (e) {
                            logger.error(e);
                        });
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            }, function (errorMessage) {
                logger.error(errorMessage);
                reject('Error during Additional documentation generation');
            });
        });
    };
    Application.prototype.prepareModules = function (someModules) {
        var _this = this;
        logger.info('Prepare modules');
        var i = 0, _modules = (someModules) ? someModules : $dependenciesEngine.getModules();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.mainData.modules = _modules.map(function (ngModule) {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(function (metadataType) {
                    ngModule[metadataType] = ngModule[metadataType].filter(function (metaDataItem) {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return $dependenciesEngine.getDirectives().some(function (directive) { return directive.name === metaDataItem.name; });
                            case 'component':
                                return $dependenciesEngine.getComponents().some(function (component) { return component.name === metaDataItem.name; });
                            case 'module':
                                return $dependenciesEngine.getModules().some(function (module) { return module.name === metaDataItem.name; });
                            case 'pipe':
                                return $dependenciesEngine.getPipes().some(function (pipe) { return pipe.name === metaDataItem.name; });
                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(function (provider) {
                    return $dependenciesEngine.getInjectables().some(function (injectable) { return injectable.name === provider.name; });
                });
                return ngModule;
            });
            _this.configuration.addPage({
                name: 'modules',
                id: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            var len = _this.configuration.mainData.modules.length, loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.modules[i].file)) {
                        logger.info(" " + _this.configuration.mainData.modules[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.modules[i].file);
                        _this.configuration.mainData.modules[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'modules',
                        name: _this.configuration.mainData.modules[i].name,
                        id: _this.configuration.mainData.modules[i].id,
                        context: 'module',
                        module: _this.configuration.mainData.modules[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInterfaces = function (someInterfaces) {
        var _this = this;
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : $dependenciesEngine.getInterfaces();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.configuration.mainData.interfaces.length, loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.interfaces[i].file)) {
                        logger.info(" " + _this.configuration.mainData.interfaces[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.interfaces[i].file);
                        _this.configuration.mainData.interfaces[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'interfaces',
                        name: _this.configuration.mainData.interfaces[i].name,
                        id: _this.configuration.mainData.interfaces[i].id,
                        context: 'interface',
                        interface: _this.configuration.mainData.interfaces[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareMiscellaneous = function (someMisc) {
        var _this = this;
        logger.info('Prepare miscellaneous');
        this.configuration.mainData.miscellaneous = (someMisc) ? someMisc : $dependenciesEngine.getMiscellaneous();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'miscellaneous',
                id: 'miscellaneous',
                context: 'miscellaneous',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            resolve$$1();
        });
    };
    Application.prototype.prepareComponents = function (someComponents) {
        var _this = this;
        logger.info('Prepare components');
        this.configuration.mainData.components = (someComponents) ? someComponents : $dependenciesEngine.getComponents();
        return new Promise(function (mainResolve, reject) {
            var i = 0, len = _this.configuration.mainData.components.length, loop = function () {
                if (i <= len - 1) {
                    var dirname_1 = path.dirname(_this.configuration.mainData.components[i].file), handleTemplateurl = function () {
                        return new Promise(function (resolve$$1, reject) {
                            var templatePath = path.resolve(dirname_1 + path.sep + _this.configuration.mainData.components[i].templateUrl);
                            if (fs.existsSync(templatePath)) {
                                fs.readFile(templatePath, 'utf8', function (err, data) {
                                    if (err) {
                                        logger.error(err);
                                        reject();
                                    }
                                    else {
                                        _this.configuration.mainData.components[i].templateData = data;
                                        resolve$$1();
                                    }
                                });
                            }
                            else {
                                logger.error("Cannot read template for " + _this.configuration.mainData.components[i].name);
                            }
                        });
                    };
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.components[i].file)) {
                        logger.info(" " + _this.configuration.mainData.components[i].name + " has a README file, include it");
                        var readmeFile = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.components[i].file);
                        _this.configuration.mainData.components[i].readme = marked(readmeFile);
                        _this.configuration.addPage({
                            path: 'components',
                            name: _this.configuration.mainData.components[i].name,
                            id: _this.configuration.mainData.components[i].id,
                            context: 'component',
                            component: _this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(" " + _this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                            handleTemplateurl().then(function () {
                                i++;
                                loop();
                            }, function (e) {
                                logger.error(e);
                            });
                        }
                        else {
                            i++;
                            loop();
                        }
                    }
                    else {
                        _this.configuration.addPage({
                            path: 'components',
                            name: _this.configuration.mainData.components[i].name,
                            id: _this.configuration.mainData.components[i].id,
                            context: 'component',
                            component: _this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(" " + _this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                            handleTemplateurl().then(function () {
                                i++;
                                loop();
                            }, function (e) {
                                logger.error(e);
                            });
                        }
                        else {
                            i++;
                            loop();
                        }
                    }
                }
                else {
                    mainResolve();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInjectables = function (someInjectables) {
        var _this = this;
        logger.info('Prepare injectables');
        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : $dependenciesEngine.getInjectables();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.configuration.mainData.injectables.length, loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.injectables[i].file)) {
                        logger.info(" " + _this.configuration.mainData.injectables[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.injectables[i].file);
                        _this.configuration.mainData.injectables[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'injectables',
                        name: _this.configuration.mainData.injectables[i].name,
                        id: _this.configuration.mainData.injectables[i].id,
                        context: 'injectable',
                        injectable: _this.configuration.mainData.injectables[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareRoutes = function () {
        var _this = this;
        logger.info('Process routes');
        this.configuration.mainData.routes = $dependenciesEngine.getRoutes();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'routes',
                id: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            RouterParser.generateRoutesIndex(_this.configuration.mainData.output, _this.configuration.mainData.routes).then(function () {
                logger.info(' Routes index generated');
                resolve$$1();
            }, function (e) {
                logger.error(e);
                reject();
            });
        });
    };
    Application.prototype.prepareCoverage = function () {
        var _this = this;
        logger.info('Process documentation coverage report');
        return new Promise(function (resolve$$1, reject) {
            /*
             * loop with components, classes, injectables, interfaces, pipes
             */
            var files = [], totalProjectStatementDocumented = 0, getStatus = function (percent) {
                var status;
                if (percent <= 25) {
                    status = 'low';
                }
                else if (percent > 25 && percent <= 50) {
                    status = 'medium';
                }
                else if (percent > 50 && percent <= 75) {
                    status = 'good';
                }
                else {
                    status = 'good';
                }
                return status;
            };
            _$1.forEach(_this.configuration.mainData.components, function (component) {
                if (!component.propertiesClass ||
                    !component.methodsClass ||
                    !component.inputsClass ||
                    !component.outputsClass) {
                    return;
                }
                var cl = {
                    filePath: component.file,
                    type: component.type,
                    linktype: component.type,
                    name: component.name
                }, totalStatementDocumented = 0, totalStatements = component.propertiesClass.length + component.methodsClass.length + component.inputsClass.length + component.outputsClass.length + 1; // +1 for component decorator comment
                if (component.constructorObj) {
                    totalStatements += 1;
                    if (component.constructorObj && component.constructorObj.description && component.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (component.description && component.description !== '') {
                    totalStatementDocumented += 1;
                }
                _$1.forEach(component.propertiesClass, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _$1.forEach(component.methodsClass, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _$1.forEach(component.inputsClass, function (input) {
                    if (input.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (input.description && input.description !== '' && input.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _$1.forEach(component.outputsClass, function (output) {
                    if (output.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (output.description && output.description !== '' && output.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _$1.forEach(_this.configuration.mainData.classes, function (classe) {
                if (!classe.properties ||
                    !classe.methods) {
                    return;
                }
                var cl = {
                    filePath: classe.file,
                    type: 'class',
                    linktype: 'classe',
                    name: classe.name
                }, totalStatementDocumented = 0, totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself
                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (classe.constructorObj && classe.constructorObj.description && classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description && classe.description !== '') {
                    totalStatementDocumented += 1;
                }
                _$1.forEach(classe.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _$1.forEach(classe.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _$1.forEach(_this.configuration.mainData.injectables, function (injectable) {
                if (!injectable.properties ||
                    !injectable.methods) {
                    return;
                }
                var cl = {
                    filePath: injectable.file,
                    type: injectable.type,
                    linktype: injectable.type,
                    name: injectable.name
                }, totalStatementDocumented = 0, totalStatements = injectable.properties.length + injectable.methods.length + 1; // +1 for injectable itself
                if (injectable.constructorObj) {
                    totalStatements += 1;
                    if (injectable.constructorObj && injectable.constructorObj.description && injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description && injectable.description !== '') {
                    totalStatementDocumented += 1;
                }
                _$1.forEach(injectable.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _$1.forEach(injectable.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _$1.forEach(_this.configuration.mainData.interfaces, function (inter) {
                if (!inter.properties ||
                    !inter.methods) {
                    return;
                }
                var cl = {
                    filePath: inter.file,
                    type: inter.type,
                    linktype: inter.type,
                    name: inter.name
                }, totalStatementDocumented = 0, totalStatements = inter.properties.length + inter.methods.length + 1; // +1 for interface itself
                if (inter.constructorObj) {
                    totalStatements += 1;
                    if (inter.constructorObj && inter.constructorObj.description && inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description && inter.description !== '') {
                    totalStatementDocumented += 1;
                }
                _$1.forEach(inter.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _$1.forEach(inter.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _$1.forEach(_this.configuration.mainData.pipes, function (pipe) {
                var cl = {
                    filePath: pipe.file,
                    type: pipe.type,
                    linktype: pipe.type,
                    name: pipe.name
                }, totalStatementDocumented = 0, totalStatements = 1;
                if (pipe.description && pipe.description !== '') {
                    totalStatementDocumented += 1;
                }
                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            files = _$1.sortBy(files, ['filePath']);
            var coverageData = {
                count: (files.length > 0) ? Math.floor(totalProjectStatementDocumented / files.length) : 0,
                status: ''
            };
            coverageData.status = getStatus(coverageData.count);
            _this.configuration.addPage({
                name: 'coverage',
                id: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            $htmlengine.generateCoverageBadge(_this.configuration.mainData.output, coverageData);
            if (_this.configuration.mainData.coverageTest) {
                if (coverageData.count >= _this.configuration.mainData.coverageTestThreshold) {
                    logger.info('Documentation coverage is over threshold');
                    process.exit(0);
                }
                else {
                    logger.error('Documentation coverage is not over threshold');
                    process.exit(1);
                }
            }
            else {
                resolve$$1();
            }
        });
    };
    Application.prototype.processPages = function () {
        var _this = this;
        logger.info('Process pages');
        var pages = this.configuration.pages;
        Promise.all(pages.map(function (page, i) {
            return new Promise(function (resolve$$1, reject) {
                logger.info('Process page', page.name);
                var htmlData = $htmlengine.render(_this.configuration.mainData, page);
                var finalPath = _this.configuration.mainData.output;
                if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                    finalPath += '/';
                }
                if (page.path) {
                    finalPath += page.path + '/';
                }
                finalPath += page.name + '.html';
                $searchEngine.indexPage({
                    infos: page,
                    rawData: htmlData,
                    url: finalPath
                });
                fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                    if (err) {
                        logger.error('Error during ' + page.name + ' page generation');
                        reject();
                    }
                    else {
                        resolve$$1();
                    }
                });
            });
        })).then(function () {
            $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.additionalPages.length > 0) {
                    _this.processAdditionalPages();
                }
                else {
                    if (_this.configuration.mainData.assetsFolder !== '') {
                        _this.processAssetsFolder();
                    }
                    _this.processResources();
                }
            }, function (e) {
                logger.error(e);
            });
        })
            .catch(function (e) {
            logger.error(e);
        });
    };
    Application.prototype.processAdditionalPages = function () {
        var _this = this;
        logger.info('Process additional pages');
        var pages = this.configuration.mainData.additionalPages;
        Promise.all(pages.map(function (page, i) {
            return new Promise(function (resolve$$1, reject) {
                logger.info('Process page', pages[i].name);
                var htmlData = $htmlengine.render(_this.configuration.mainData, pages[i]);
                var finalPath = _this.configuration.mainData.output;
                if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                    finalPath += '/';
                }
                if (pages[i].path) {
                    finalPath += pages[i].path + '/';
                }
                finalPath += pages[i].filename + '.html';
                $searchEngine.indexPage({
                    infos: pages[i],
                    rawData: htmlData,
                    url: finalPath
                });
                fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                    if (err) {
                        logger.error('Error during ' + pages[i].name + ' page generation');
                        reject();
                    }
                    else {
                        resolve$$1();
                    }
                });
            });
        })).then(function () {
            $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.assetsFolder !== '') {
                    _this.processAssetsFolder();
                }
                _this.processResources();
            }, function (e) {
                logger.error(e);
            });
        })
            .catch(function (e) {
            logger.error(e);
        });
    };
    Application.prototype.processAssetsFolder = function () {
        logger.info('Copy assets folder');
        if (!fs.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error("Provided assets folder " + this.configuration.mainData.assetsFolder + " did not exist");
        }
        else {
            fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
                if (err) {
                    logger.error('Error during resources copy ', err);
                }
            });
        }
    };
    Application.prototype.processResources = function () {
        var _this = this;
        logger.info('Copy main resources');
        var onComplete = function () {
            var finalTime = (new Date() - startTime) / 1000;
            logger.info('Documentation generated in ' + _this.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + _this.configuration.mainData.theme + ' theme');
            if (_this.configuration.mainData.serve) {
                logger.info("Serving documentation from " + _this.configuration.mainData.output + " at http://127.0.0.1:" + _this.configuration.mainData.port);
                _this.runWebServer(_this.configuration.mainData.output);
            }
        };
        var finalOutput = this.configuration.mainData.output.replace(process.cwd(), '');
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(finalOutput), function (err) {
            if (err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (_this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + _this.configuration.mainData.extTheme), path.resolve(finalOutput + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        }
                        else {
                            logger.info('External styling theme copy succeeded');
                            onComplete();
                        }
                    });
                }
                else {
                    onComplete();
                }
            }
        });
    };
    Application.prototype.processGraphs = function () {
        var _this = this;
        if (this.configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            this.processPages();
        }
        else {
            logger.info('Process main graph');
            var modules_1 = this.configuration.mainData.modules, i_1 = 0, len_1 = modules_1.length, loop_1 = function () {
                if (i_1 <= len_1 - 1) {
                    logger.info('Process module graph', modules_1[i_1].name);
                    var finalPath_1 = _this.configuration.mainData.output;
                    if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath_1 += '/';
                    }
                    finalPath_1 += 'modules/' + modules_1[i_1].name;
                    var _rawModule = $dependenciesEngine.getRawModule(modules_1[i_1].name);
                    if (_rawModule.declarations.length > 0 ||
                        _rawModule.bootstrap.length > 0 ||
                        _rawModule.imports.length > 0 ||
                        _rawModule.exports.length > 0 ||
                        _rawModule.providers.length > 0) {
                        $ngdengine.renderGraph(modules_1[i_1].file, finalPath_1, 'f', modules_1[i_1].name).then(function () {
                            $ngdengine.readGraph(path.resolve(finalPath_1 + path.sep + 'dependencies.svg'), modules_1[i_1].name).then(function (data) {
                                modules_1[i_1].graph = data;
                                i_1++;
                                loop_1();
                            }, function (err) {
                                logger.error('Error during graph read: ', err);
                            });
                        }, function (errorMessage) {
                            logger.error(errorMessage);
                        });
                    }
                    else {
                        i_1++;
                        loop_1();
                    }
                }
                else {
                    _this.processPages();
                }
            };
            var finalMainGraphPath_1 = this.configuration.mainData.output;
            if (finalMainGraphPath_1.lastIndexOf('/') === -1) {
                finalMainGraphPath_1 += '/';
            }
            finalMainGraphPath_1 += 'graph';
            if ($dependenciesEngine.rawModulesForOverview.length > 150) {
                logger.warn("Too many modules (" + $dependenciesEngine.rawModulesForOverview.length + "), main graph generation disabled");
                this.configuration.mainData.disableMainGraph = true;
                loop_1();
            }
            else {
                $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath_1), 'p').then(function () {
                    $ngdengine.readGraph(path.resolve(finalMainGraphPath_1 + path.sep + 'dependencies.svg'), 'Main graph').then(function (data) {
                        _this.configuration.mainData.mainGraph = data;
                        loop_1();
                    }, function (err) {
                        logger.error('Error during graph read: ', err);
                    });
                }, function (err) {
                    logger.error('Error during graph generation: ', err);
                });
            }
        }
    };
    Application.prototype.runWebServer = function (folder) {
        if (!this.isWatching) {
            LiveServer.start({
                root: folder,
                open: this.configuration.mainData.open,
                quiet: true,
                logLevel: 0,
                wait: 1000,
                port: this.configuration.mainData.port
            });
        }
        if (this.configuration.mainData.watch && !this.isWatching) {
            this.runWatch();
        }
        else if (this.configuration.mainData.watch && this.isWatching) {
            var srcFolder = findMainSourceFolder(this.files);
            logger.info("Already watching sources in " + srcFolder + " folder");
        }
    };
    Application.prototype.runWatch = function () {
        var _this = this;
        var sources = [findMainSourceFolder(this.files)], watcherReady = false;
        this.isWatching = true;
        logger.info("Watching sources in " + findMainSourceFolder(this.files) + " folder");
        if ($markdownengine.hasRootMarkdowns()) {
            sources = sources.concat($markdownengine.listRootMarkdowns());
        }
        if (this.configuration.mainData.includes !== '') {
            sources = sources.concat(this.configuration.mainData.includes);
        }
        var watcher = chokidar.watch(sources, {
            awaitWriteFinish: true,
            ignoreInitial: true,
            ignored: /(spec|\.d)\.ts/
        }), timerAddAndRemoveRef, timerChangeRef, waiterAddAndRemove = function () {
            clearTimeout(timerAddAndRemoveRef);
            timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
        }, runnerAddAndRemove = function () {
            startTime = new Date();
            _this.generate();
        }, waiterChange = function () {
            clearTimeout(timerChangeRef);
            timerChangeRef = setTimeout(runnerChange, 1000);
        }, runnerChange = function () {
            startTime = new Date();
            _this.setUpdatedFiles(_this.watchChangedFiles);
            if (_this.hasWatchedFilesTSFiles()) {
                _this.getMicroDependenciesData();
            }
            else if (_this.hasWatchedFilesRootMarkdownFiles()) {
                _this.rebuildRootMarkdowns();
            }
            else {
                _this.rebuildExternalDocumentation();
            }
        };
        watcher
            .on('ready', function () {
            if (!watcherReady) {
                watcherReady = true;
                watcher
                    .on('add', function (file) {
                    logger.debug("File " + file + " has been added");
                    // Test extension, if ts
                    // rescan everything
                    if (path.extname(file) === '.ts') {
                        waiterAddAndRemove();
                    }
                })
                    .on('change', function (file) {
                    logger.debug("File " + file + " has been changed");
                    // Test extension, if ts
                    // rescan only file
                    if (path.extname(file) === '.ts' || path.extname(file) === '.md' || path.extname(file) === '.json') {
                        _this.watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
                        waiterChange();
                    }
                })
                    .on('unlink', function (file) {
                    logger.debug("File " + file + " has been removed");
                    // Test extension, if ts
                    // rescan everything
                    if (path.extname(file) === '.ts') {
                        waiterAddAndRemove();
                    }
                });
            }
        });
    };
    Object.defineProperty(Application.prototype, "application", {
        /**
         * Return the application / root component instance.
         */
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "isCLI", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return Application;
}());

var glob$1 = require('glob');
var ExcludeParser = (function () {
    var _exclude, _cwd, _globFiles = [];
    var _init = function (exclude, cwd) {
        _exclude = exclude;
        _cwd = cwd;
        var i = 0, len = exclude.length;
        for (i; i < len; i++) {
            _globFiles = _globFiles.concat(glob$1.sync(exclude[i], { cwd: _cwd }));
        }
    }, _testFile = function (file) {
        var i = 0, len = _exclude.length, fileBasename = path.basename(file), result = false;
        for (i; i < len; i++) {
            if (glob$1.hasMagic(_exclude[i]) && _globFiles.length > 0) {
                var resultGlobSearch = _globFiles.findIndex(function (element) {
                    return path.basename(element) === fileBasename;
                });
                result = resultGlobSearch !== -1;
            }
            else {
                result = fileBasename === path.basename(_exclude[i]);
            }
            if (result) {
                break;
            }
        }
        return result;
    };
    return {
        init: _init,
        testFile: _testFile
    };
})();

var pkg = require('../package.json');
var program = require('commander');
var _ = require('lodash');
var os = require('os');
var osName = require('os-name');
var files = [];
var cwd = process.cwd();
process.setMaxListeners(0);
process.on('unhandledRejection', function (err) {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});
process.on('uncaughtException', function (err) {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});
var CliApplication = (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Run compodoc from the command line.
     */
    CliApplication.prototype.generate = function () {
        var _this = this;
        function list(val) {
            return val.split(',');
        }
        program
            .version(pkg.version)
            .usage('<src> [options]')
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('-w, --watch', 'Watch source files after serve and force documentation rebuild', false)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--toggleMenuItems <items>', 'Close by default items in the menu (default [\'all\']) values : [\'all\'] or one of these [\'modules\',\'components\',\'directives\',\'classes\',\'injectables\',\'interfaces\',\'pipes\',\'additionalPages\']', list, COMPODOC_DEFAULTS.toggleMenuItems)
            .option('--includes [path]', 'Path of external markdown files to include')
            .option('--includesName [name]', 'Name of item menu of externals markdown files (default "Additional documentation")', COMPODOC_DEFAULTS.additionalEntryName)
            .option('--coverageTest [threshold]', 'Test command of documentation coverage with a threshold (default 70)')
            .option('--disableSourceCode', 'Do not add source code tab and links to source code', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivateOrInternalSupport', 'Do not show private, @internal or Angular lifecycle hooks in generated documentation', false)
            .parse(process.argv);
        var outputHelp = function () {
            program.outputHelp();
            process.exit(1);
        };
        if (program.output) {
            this.configuration.mainData.output = program.output;
        }
        if (program.extTheme) {
            this.configuration.mainData.extTheme = program.extTheme;
        }
        if (program.theme) {
            this.configuration.mainData.theme = program.theme;
        }
        if (program.name) {
            this.configuration.mainData.documentationMainName = program.name;
        }
        if (program.assetsFolder) {
            this.configuration.mainData.assetsFolder = program.assetsFolder;
        }
        if (program.open) {
            this.configuration.mainData.open = program.open;
        }
        if (program.toggleMenuItems) {
            this.configuration.mainData.toggleMenuItems = program.toggleMenuItems;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }
        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }
        if (program.silent) {
            logger.silent = false;
        }
        if (program.serve) {
            this.configuration.mainData.serve = program.serve;
        }
        if (program.port) {
            this.configuration.mainData.port = program.port;
        }
        if (program.watch) {
            this.configuration.mainData.watch = program.watch;
        }
        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }
        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }
        if (program.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold = (typeof program.coverageTest === 'string') ? parseInt(program.coverageTest) : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }
        if (program.disableSourceCode) {
            this.configuration.mainData.disableSourceCode = program.disableSourceCode;
        }
        if (program.disableGraph) {
            this.configuration.mainData.disableGraph = program.disableGraph;
        }
        if (program.disableCoverage) {
            this.configuration.mainData.disableCoverage = program.disableCoverage;
        }
        if (program.disablePrivateOrInternalSupport) {
            this.configuration.mainData.disablePrivateOrInternalSupport = program.disablePrivateOrInternalSupport;
        }
        if (!this.isWatching) {
            console.log(fs.readFileSync(path.join(__dirname, '../src/resources/images/banner')).toString());
            console.log(pkg.version);
            console.log('');
            console.log("Node.js version : " + process.version);
            console.log('');
            console.log("Operating system : " + osName(os.platform(), os.release()));
            console.log('');
        }
        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!fs.existsSync(program.output)) {
                logger.error(program.output + " folder doesn't exist");
                process.exit(1);
            }
            else {
                logger.info("Serving documentation from " + program.output + " at http://127.0.0.1:" + program.port);
                _super.prototype.runWebServer.call(this, program.output);
            }
        }
        else if (program.serve && !program.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!fs.existsSync(program.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            }
            else {
                logger.info("Serving documentation from " + program.output + " at http://127.0.0.1:" + program.port);
                _super.prototype.runWebServer.call(this, program.output);
            }
        }
        else {
            if (program.hideGenerator) {
                this.configuration.mainData.hideGenerator = true;
            }
            if (program.tsconfig && program.args.length === 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [], files_1 = [];
                        ExcludeParser.init(exclude, cwd);
                        var finder = require('findit')(cwd || '.');
                        finder.on('directory', function (dir, stat, stop) {
                            var base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules')
                                stop();
                        });
                        finder.on('file', function (file, stat) {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (ExcludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                files_1.push(file);
                            }
                        });
                        finder.on('end', function () {
                            _super.prototype.setFiles.call(_this, files_1);
                            _super.prototype.generate.call(_this);
                        });
                    }
                    else {
                        _super.prototype.setFiles.call(this, files);
                        _super.prototype.generate.call(this);
                    }
                }
            }
            else if (program.tsconfig && program.args.length > 0 && program.coverageTest) {
                logger.info('Run documentation coverage test');
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [];
                        ExcludeParser.init(exclude, cwd);
                        var finder = require('findit')(cwd || '.');
                        finder.on('directory', function (dir, stat, stop) {
                            var base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules')
                                stop();
                        });
                        finder.on('file', function (file, stat) {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (ExcludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                files.push(file);
                            }
                        });
                        finder.on('end', function () {
                            _super.prototype.setFiles.call(_this, files);
                            _super.prototype.testCoverage.call(_this);
                        });
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.testCoverage.call(this);
                }
            }
            else if (program.tsconfig && program.args.length > 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                var sourceFolder = program.args[0];
                if (!fs.existsSync(sourceFolder)) {
                    logger.error("Provided source folder " + sourceFolder + " was not found in the current directory");
                    process.exit(1);
                }
                else {
                    logger.info('Using provided source folder');
                    if (!fs.existsSync(program.tsconfig)) {
                        logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                        process.exit(1);
                    }
                    else {
                        var tsConfigFile = readConfig(program.tsconfig);
                        var exclude = tsConfigFile.exclude || [];
                        ExcludeParser.init(exclude, cwd);
                        var finder = require('findit')(path.resolve(sourceFolder));
                        finder.on('directory', function (dir, stat, stop) {
                            var base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules')
                                stop();
                        });
                        finder.on('file', function (file, stat) {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (ExcludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                files.push(file);
                            }
                        });
                        finder.on('end', function () {
                            _super.prototype.setFiles.call(_this, files);
                            _super.prototype.generate.call(_this);
                        });
                    }
                }
            }
            else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    };
    return CliApplication;
}(Application));

exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtY2xpLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbG9nZ2VyLnRzIiwiLi4vc3JjL3V0aWxzL2FuZ3VsYXItYXBpLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUudHMiLCIuLi9zcmMvdXRpbHMvbGluay1wYXJzZXIudHMiLCIuLi9zcmMvdXRpbHMvZGVmYXVsdHMudHMiLCIuLi9zcmMvYXBwL2NvbmZpZ3VyYXRpb24udHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci12ZXJzaW9uLnRzIiwiLi4vc3JjL3V0aWxzL2Jhc2ljLXR5cGVzLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwuZW5naW5lLmhlbHBlcnMudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbWFya2Rvd24uZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL25nZC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvc2VhcmNoLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy9hbmd1bGFyLWxpZmVjeWNsZXMtaG9va3MudHMiLCIuLi9zcmMvdXRpbHMvdXRpbHMudHMiLCIuLi9zcmMvdXRpbGl0aWVzLnRzIiwiLi4vc3JjL3V0aWxzL3JvdXRlci5wYXJzZXIudHMiLCIuLi9zcmMvdXRpbHMvanNkb2MucGFyc2VyLnRzIiwiLi4vc3JjL3V0aWxzL2tpbmQtdG8tdHlwZS50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvY29kZWdlbi50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9jb21wb25lbnRzLXRyZWUuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBlbmRlbmNpZXMudHMiLCIuLi9zcmMvdXRpbHMvcHJvbWlzZS1zZXF1ZW50aWFsLnRzIiwiLi4vc3JjL2FwcC9hcHBsaWNhdGlvbi50cyIsIi4uL3NyYy91dGlscy9leGNsdWRlLnBhcnNlci50cyIsIi4uL3NyYy9pbmRleC1jbGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IGd1dGlsID0gcmVxdWlyZSgnZ3VscC11dGlsJylcbmxldCBjID0gZ3V0aWwuY29sb3JzO1xubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuXG5lbnVtIExFVkVMIHtcblx0SU5GTyxcblx0REVCVUcsXG4gICAgRVJST1IsXG4gICAgV0FSTlxufVxuXG5jbGFzcyBMb2dnZXIge1xuXG5cdG5hbWU7XG5cdGxvZ2dlcjtcblx0dmVyc2lvbjtcblx0c2lsZW50O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubmFtZSA9IHBrZy5uYW1lO1xuXHRcdHRoaXMudmVyc2lvbiA9IHBrZy52ZXJzaW9uO1xuXHRcdHRoaXMubG9nZ2VyID0gZ3V0aWwubG9nO1xuXHRcdHRoaXMuc2lsZW50ID0gdHJ1ZTtcblx0fVxuXG5cdGluZm8oLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuSU5GTywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0ZXJyb3IoLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuRVJST1IsIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG4gICAgd2FybiguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5XQVJOLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRkZWJ1ZyguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5ERUJVRywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0cHJpdmF0ZSBmb3JtYXQobGV2ZWwsIC4uLmFyZ3MpIHtcblxuXHRcdGxldCBwYWQgPSAocywgbCwgYz0nJykgPT4ge1xuXHRcdFx0cmV0dXJuIHMgKyBBcnJheSggTWF0aC5tYXgoMCwgbCAtIHMubGVuZ3RoICsgMSkpLmpvaW4oIGMgKVxuXHRcdH07XG5cblx0XHRsZXQgbXNnID0gYXJncy5qb2luKCcgJyk7XG5cdFx0aWYoYXJncy5sZW5ndGggPiAxKSB7XG5cdFx0XHRtc2cgPSBgJHsgcGFkKGFyZ3Muc2hpZnQoKSwgMTUsICcgJykgfTogJHsgYXJncy5qb2luKCcgJykgfWA7XG5cdFx0fVxuXG5cblx0XHRzd2l0Y2gobGV2ZWwpIHtcblx0XHRcdGNhc2UgTEVWRUwuSU5GTzpcblx0XHRcdFx0bXNnID0gYy5ncmVlbihtc2cpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBMRVZFTC5ERUJVRzpcblx0XHRcdFx0bXNnID0gYy5jeWFuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIExFVkVMLldBUk46XG5cdFx0XHRcdG1zZyA9IGMueWVsbG93KG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkVSUk9SOlxuXHRcdFx0XHRtc2cgPSBjLnJlZChtc2cpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0bXNnXG5cdFx0XS5qb2luKCcnKTtcblx0fVxufVxuXG5leHBvcnQgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiIsImNvbnN0IEFuZ3VsYXJBUElzID0gcmVxdWlyZSgnLi4vc3JjL2RhdGEvYXBpLWxpc3QuanNvbicpLFxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZGVySW5Bbmd1bGFyQVBJcyh0eXBlOiBzdHJpbmcpIHtcbiAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgc291cmNlOiAnZXh0ZXJuYWwnLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgfTtcblxuICAgIF8uZm9yRWFjaChBbmd1bGFyQVBJcywgZnVuY3Rpb24oYW5ndWxhck1vZHVsZUFQSXMsIGFuZ3VsYXJNb2R1bGUpIHtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gYW5ndWxhck1vZHVsZUFQSXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyTW9kdWxlQVBJc1tpXS50aXRsZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGFuZ3VsYXJNb2R1bGVBUElzW2ldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBfcmVzdWx0O1xufVxuIiwiaW1wb3J0IHsgZmluZGVySW5Bbmd1bGFyQVBJcyB9IGZyb20gJy4uLy4uL3V0aWxzL2FuZ3VsYXItYXBpJztcblxuaW1wb3J0IHsgUGFyc2VkRGF0YSB9IGZyb20gJy4uL2ludGVyZmFjZXMvcGFyc2VkLWRhdGEuaW50ZXJmYWNlJztcbmltcG9ydCB7IE1pc2NlbGxhbmVvdXNEYXRhIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9taXNjZWxsYW5lb3VzLWRhdGEuaW50ZXJmYWNlJztcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5jbGFzcyBEZXBlbmRlbmNpZXNFbmdpbmUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpEZXBlbmRlbmNpZXNFbmdpbmUgPSBuZXcgRGVwZW5kZW5jaWVzRW5naW5lKCk7XG5cbiAgICByYXdEYXRhOiBQYXJzZWREYXRhO1xuICAgIG1vZHVsZXM6IE9iamVjdFtdO1xuICAgIHJhd01vZHVsZXM6IE9iamVjdFtdO1xuICAgIHJhd01vZHVsZXNGb3JPdmVydmlldzogT2JqZWN0W107XG4gICAgY29tcG9uZW50czogT2JqZWN0W107XG4gICAgZGlyZWN0aXZlczogT2JqZWN0W107XG4gICAgaW5qZWN0YWJsZXM6IE9iamVjdFtdO1xuICAgIGludGVyZmFjZXM6IE9iamVjdFtdO1xuICAgIHJvdXRlczogT2JqZWN0W107XG4gICAgcGlwZXM6IE9iamVjdFtdO1xuICAgIGNsYXNzZXM6IE9iamVjdFtdO1xuICAgIG1pc2NlbGxhbmVvdXM6IE1pc2NlbGxhbmVvdXNEYXRhO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmKERlcGVuZGVuY2llc0VuZ2luZS5faW5zdGFuY2Upe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvcjogSW5zdGFudGlhdGlvbiBmYWlsZWQ6IFVzZSBEZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5zdGFuY2UoKSBpbnN0ZWFkIG9mIG5ldy4nKTtcbiAgICAgICAgfVxuICAgICAgICBEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOkRlcGVuZGVuY2llc0VuZ2luZVxuICAgIHtcbiAgICAgICAgcmV0dXJuIERlcGVuZGVuY2llc0VuZ2luZS5faW5zdGFuY2U7XG4gICAgfVxuICAgIGNsZWFuTW9kdWxlcyhtb2R1bGVzKSB7XG4gICAgICAgIGxldCBfbSA9IG1vZHVsZXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IG1vZHVsZXMubGVuZ3RoO1xuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgbGV0IGogPSAwLFxuICAgICAgICAgICAgICAgIGxlbmcgPSBfbVtpXS5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGo7IGo8bGVuZzsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGsgPSAwLFxuICAgICAgICAgICAgICAgICAgICBsZW5ndDtcbiAgICAgICAgICAgICAgICBpZiAoX21baV0uZGVjbGFyYXRpb25zW2pdLmpzZG9jdGFncykge1xuICAgICAgICAgICAgICAgICAgICBsZW5ndCA9IF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5qc2RvY3RhZ3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IoazsgazxsZW5ndDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX21baV0uZGVjbGFyYXRpb25zW2pdLmpzZG9jdGFnc1trXS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5jb25zdHJ1Y3Rvck9iaikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX21baV0uZGVjbGFyYXRpb25zW2pdLmNvbnN0cnVjdG9yT2JqLmpzZG9jdGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3QgPSBfbVtpXS5kZWNsYXJhdGlvbnNbal0uY29uc3RydWN0b3JPYmouanNkb2N0YWdzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrOyBrPGxlbmd0OyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX21baV0uZGVjbGFyYXRpb25zW2pdLmNvbnN0cnVjdG9yT2JqLmpzZG9jdGFnc1trXS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9tO1xuICAgIH1cbiAgICBpbml0KGRhdGE6IFBhcnNlZERhdGEpIHtcbiAgICAgICAgdGhpcy5yYXdEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLm1vZHVsZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5yYXdNb2R1bGVzRm9yT3ZlcnZpZXcgPSBfLnNvcnRCeShkYXRhLm1vZHVsZXNGb3JHcmFwaCwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnJhd01vZHVsZXMgPSBfLnNvcnRCeShkYXRhLm1vZHVsZXNGb3JHcmFwaCwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuY29tcG9uZW50cywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuZGlyZWN0aXZlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmluamVjdGFibGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmluamVjdGFibGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbnRlcmZhY2VzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucGlwZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEucGlwZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jbGFzc2VzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNsYXNzZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzID0gdGhpcy5yYXdEYXRhLm1pc2NlbGxhbmVvdXM7XG4gICAgICAgIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTtcbiAgICAgICAgdGhpcy5yb3V0ZXMgPSB0aGlzLnJhd0RhdGEucm91dGVzVHJlZTtcbiAgICB9XG4gICAgZmluZCh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnaW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihkYXRhW2ldLm5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gZGF0YVtpXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXMgPSBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzKHRoaXMuaW5qZWN0YWJsZXMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Db21wb2RvY0ludGVyZmFjZXMgPSBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzKHRoaXMuaW50ZXJmYWNlcyksXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NDb21wb25lbnRzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmNvbXBvbmVudHMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Bbmd1bGFyQVBJcyA9IGZpbmRlckluQW5ndWxhckFQSXModHlwZSlcblxuICAgICAgICBpZiAocmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXM7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Db21wb2RvY0ludGVyZmFjZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NJbnRlcmZhY2VzO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcztcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkNvbXBvZG9jQ29tcG9uZW50cy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0NvbXBvbmVudHM7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Bbmd1bGFyQVBJcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Bbmd1bGFyQVBJcztcbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGUodXBkYXRlZERhdGEpIHtcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1vZHVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1vZHVsZXMsIChtb2R1bGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5tb2R1bGVzLCB7J25hbWUnOiBtb2R1bGUubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlc1tfaW5kZXhdID0gbW9kdWxlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmNvbXBvbmVudHMsIChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5jb21wb25lbnRzLCB7J25hbWUnOiBjb21wb25lbnQubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50c1tfaW5kZXhdID0gY29tcG9uZW50O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmRpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmRpcmVjdGl2ZXMsIChkaXJlY3RpdmUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5kaXJlY3RpdmVzLCB7J25hbWUnOiBkaXJlY3RpdmUubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlc1tfaW5kZXhdID0gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5pbmplY3RhYmxlcywgeyduYW1lJzogaW5qZWN0YWJsZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3RhYmxlc1tfaW5kZXhdID0gaW5qZWN0YWJsZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5pbnRlcmZhY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5pbnRlcmZhY2VzLCAoaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMuaW50ZXJmYWNlcywgeyduYW1lJzogaW50Lm5hbWV9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyZmFjZXNbX2luZGV4XSA9IGludDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5waXBlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEucGlwZXMsIChwaXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMucGlwZXMsIHsnbmFtZSc6IHBpcGUubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMucGlwZXNbX2luZGV4XSA9IHBpcGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuY2xhc3NlcywgKGNsYXNzZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLmNsYXNzZXMsIHsnbmFtZSc6IGNsYXNzZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc2VzW19pbmRleF0gPSBjbGFzc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogTWlzY2VsbGFuZW91cyB1cGRhdGVcbiAgICAgICAgICovXG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLCAodmFyaWFibGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcywge1xuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IHZhcmlhYmxlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogdmFyaWFibGUuZmlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy52YXJpYWJsZXNbX2luZGV4XSA9IHZhcmlhYmxlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsIChmdW5jKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBmdW5jLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogZnVuYy5maWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9uc1tfaW5kZXhdID0gZnVuYztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcywgKHR5cGVhbGlhcykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1pc2NlbGxhbmVvdXMudHlwZWFsaWFzZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiB0eXBlYWxpYXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiB0eXBlYWxpYXMuZmlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlc1tfaW5kZXhdID0gdHlwZWFsaWFzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMsIChlbnVtZXJhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLCB7XG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogZW51bWVyYXRpb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiBlbnVtZXJhdGlvbi5maWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9uc1tfaW5kZXhdID0gZW51bWVyYXRpb247XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy50eXBlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudHlwZXMsICh0eXApID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLnR5cGVzLCB7XG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogdHlwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogdHlwLmZpbGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMudHlwZXNbX2luZGV4XSA9IHR5cDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTtcbiAgICB9XG4gICAgZmluZEluQ29tcG9kb2MobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBtZXJnZWREYXRhID0gXy5jb25jYXQoW10sIHRoaXMubW9kdWxlcywgdGhpcy5jb21wb25lbnRzLCB0aGlzLmRpcmVjdGl2ZXMsIHRoaXMuaW5qZWN0YWJsZXMsIHRoaXMuaW50ZXJmYWNlcywgdGhpcy5waXBlcywgdGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IF8uZmluZChtZXJnZWREYXRhLCB7J25hbWUnOiBuYW1lfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgZmFsc2U7XG4gICAgfVxuICAgIHByZXBhcmVNaXNjZWxsYW5lb3VzKCkge1xuICAgICAgICAvL2dyb3VwIGVhY2ggc3ViZ291cCBieSBmaWxlXG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkVmFyaWFibGVzID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy52YXJpYWJsZXMsICdmaWxlJyk7XG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkRnVuY3Rpb25zID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsICdmaWxlJyk7XG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkRW51bWVyYXRpb25zID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMsICdmaWxlJyk7XG4gICAgfVxuICAgIGdldE1vZHVsZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIF8uZmluZCh0aGlzLm1vZHVsZXMsIFsnbmFtZScsIG5hbWVdKTtcbiAgICB9XG4gICAgZ2V0UmF3TW9kdWxlKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gXy5maW5kKHRoaXMucmF3TW9kdWxlcywgWyduYW1lJywgbmFtZV0pO1xuICAgIH1cbiAgICBnZXRNb2R1bGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2R1bGVzO1xuICAgIH1cbiAgICBnZXRDb21wb25lbnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzO1xuICAgIH1cbiAgICBnZXREaXJlY3RpdmVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3RpdmVzO1xuICAgIH1cbiAgICBnZXRJbmplY3RhYmxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0YWJsZXM7XG4gICAgfVxuICAgIGdldEludGVyZmFjZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZXM7XG4gICAgfVxuICAgIGdldFJvdXRlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm91dGVzO1xuICAgIH1cbiAgICBnZXRQaXBlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGlwZXM7XG4gICAgfVxuICAgIGdldENsYXNzZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsYXNzZXM7XG4gICAgfVxuICAgIGdldE1pc2NlbGxhbmVvdXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pc2NlbGxhbmVvdXM7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0ICRkZXBlbmRlbmNpZXNFbmdpbmUgPSBEZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5zdGFuY2UoKTtcbiIsImV4cG9ydCBmdW5jdGlvbiBleHRyYWN0TGVhZGluZ1RleHQoc3RyaW5nLCBjb21wbGV0ZVRhZykge1xuICAgIHZhciB0YWdJbmRleCA9IHN0cmluZy5pbmRleE9mKGNvbXBsZXRlVGFnKTtcbiAgICB2YXIgbGVhZGluZ1RleHQgPSBudWxsO1xuICAgIHZhciBsZWFkaW5nVGV4dFJlZ0V4cCA9IC9cXFsoLis/KVxcXS9nO1xuICAgIHZhciBsZWFkaW5nVGV4dEluZm8gPSBsZWFkaW5nVGV4dFJlZ0V4cC5leGVjKHN0cmluZyk7XG5cbiAgICAvLyBkaWQgd2UgZmluZCBsZWFkaW5nIHRleHQsIGFuZCBpZiBzbywgZG9lcyBpdCBpbW1lZGlhdGVseSBwcmVjZWRlIHRoZSB0YWc/XG4gICAgd2hpbGUgKGxlYWRpbmdUZXh0SW5mbyAmJiBsZWFkaW5nVGV4dEluZm8ubGVuZ3RoKSB7XG4gICAgICAgIGlmIChsZWFkaW5nVGV4dEluZm8uaW5kZXggKyBsZWFkaW5nVGV4dEluZm9bMF0ubGVuZ3RoID09PSB0YWdJbmRleCkge1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobGVhZGluZ1RleHRJbmZvWzBdLCAnJyk7XG4gICAgICAgICAgICBsZWFkaW5nVGV4dCA9IGxlYWRpbmdUZXh0SW5mb1sxXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbGVhZGluZ1RleHRJbmZvID0gbGVhZGluZ1RleHRSZWdFeHAuZXhlYyhzdHJpbmcpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGxlYWRpbmdUZXh0OiBsZWFkaW5nVGV4dCxcbiAgICAgICAgc3RyaW5nOiBzdHJpbmdcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRMaW5rVGV4dCh0ZXh0KSB7XG4gICAgdmFyIGxpbmtUZXh0O1xuICAgIHZhciB0YXJnZXQ7XG4gICAgdmFyIHNwbGl0SW5kZXg7XG5cbiAgICAvLyBpZiBhIHBpcGUgaXMgbm90IHByZXNlbnQsIHdlIHNwbGl0IG9uIHRoZSBmaXJzdCBzcGFjZVxuICAgIHNwbGl0SW5kZXggPSB0ZXh0LmluZGV4T2YoJ3wnKTtcbiAgICBpZiAoc3BsaXRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgc3BsaXRJbmRleCA9IHRleHQuc2VhcmNoKC9cXHMvKTtcbiAgICB9XG5cbiAgICBpZiAoc3BsaXRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlua1RleHQgPSB0ZXh0LnN1YnN0cihzcGxpdEluZGV4ICsgMSk7XG4gICAgICAgIC8vIE5vcm1hbGl6ZSBzdWJzZXF1ZW50IG5ld2xpbmVzIHRvIGEgc2luZ2xlIHNwYWNlLlxuICAgICAgICBsaW5rVGV4dCA9IGxpbmtUZXh0LnJlcGxhY2UoL1xcbisvLCAnICcpO1xuICAgICAgICB0YXJnZXQgPSB0ZXh0LnN1YnN0cigwLCBzcGxpdEluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5rVGV4dDogbGlua1RleHQsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0IHx8IHRleHRcbiAgICB9O1xufVxuXG5leHBvcnQgbGV0IExpbmtQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcHJvY2Vzc1RoZUxpbmsgPSBmdW5jdGlvbihzdHJpbmcsIHRhZ0luZm8sIGxlYWRpbmdUZXh0KSB7XG4gICAgICAgIHZhciBsZWFkaW5nID0gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgdGFnSW5mby5jb21wbGV0ZVRhZyksXG4gICAgICAgICAgICBsaW5rVGV4dCxcbiAgICAgICAgICAgIHNwbGl0LFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlO1xuXG4gICAgICAgIGxpbmtUZXh0ID0gKGxlYWRpbmdUZXh0KSA/IGxlYWRpbmdUZXh0IDogKGxlYWRpbmcubGVhZGluZ1RleHQgfHwgJycpO1xuXG4gICAgICAgIHNwbGl0ID0gc3BsaXRMaW5rVGV4dCh0YWdJbmZvLnRleHQpO1xuICAgICAgICB0YXJnZXQgPSBzcGxpdC50YXJnZXQ7XG5cbiAgICAgICAgaWYgKGxlYWRpbmcubGVhZGluZ1RleHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9ICdbJyArIGxlYWRpbmcubGVhZGluZ1RleHQgKyAnXScgKyB0YWdJbmZvLmNvbXBsZXRlVGFnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGxpdC5saW5rVGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9IHRhZ0luZm8uY29tcGxldGVUYWc7XG4gICAgICAgICAgICBsaW5rVGV4dCA9IHNwbGl0LmxpbmtUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHN0cmluZ3RvUmVwbGFjZSwgJ1snICsgbGlua1RleHQgKyAnXSgnICsgdGFyZ2V0ICsgJyknKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0XG4gICAgICoge0BsaW5rIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbXxHb29nbGV9IG9yIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20gR2l0SHVifSBvciBbR2l0aHViXXtAbGluayBodHRwczovL2dpdGh1Yi5jb219IHRvIFtHaXRodWJdKGh0dHBzOi8vZ2l0aHViLmNvbSlcbiAgICAgKi9cblxuICAgIHZhciByZXBsYWNlTGlua1RhZyA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG5cbiAgICAgICAgLy8gbmV3IFJlZ0V4cCgnXFxcXFsoKD86LnxcXG4pKz8pXVxcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLmV4ZWMoJ2VlIFtUTyBET117QGxpbmsgVG9kb30gZm8nKSAtPiBcIltUTyBET117QGxpbmsgVG9kb31cIiwgXCJUTyBET1wiLCBcIlRvZG9cIlxuICAgICAgICAvLyBuZXcgUmVnRXhwKCdcXFxce0BsaW5rXFxcXHMrKCg/Oi58XFxuKSs/KVxcXFx9JywgJ2knKS5leGVjKCdlZSBbVE9ET117QGxpbmsgVG9kb30gZm8nKSAtPiBcIntAbGluayBUb2RvfVwiLCBcIlRvZG9cIlxuXG4gICAgICAgIHZhciB0YWdSZWdFeHBMaWdodCA9IG5ldyBSZWdFeHAoJ1xcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLFxuICAgICAgICAgICAgdGFnUmVnRXhwRnVsbCA9IG5ldyBSZWdFeHAoJ1xcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLFxuICAgICAgICAgICAgdGFnUmVnRXhwLFxuICAgICAgICAgICAgbWF0Y2hlcyxcbiAgICAgICAgICAgIHByZXZpb3VzU3RyaW5nLFxuICAgICAgICAgICAgdGFnSW5mbyA9IFtdO1xuXG4gICAgICAgIHRhZ1JlZ0V4cCA9IChzdHIuaW5kZXhPZignXXsnKSAhPT0gLTEpID8gdGFnUmVnRXhwRnVsbCA6IHRhZ1JlZ0V4cExpZ2h0O1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcGxhY2VNYXRjaChyZXBsYWNlciwgdGFnLCBtYXRjaCwgdGV4dCwgbGlua1RleHQ/KSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2hlZFRhZyA9IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZVRhZzogbWF0Y2gsXG4gICAgICAgICAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRhZ0luZm8ucHVzaChtYXRjaGVkVGFnKTtcbiAgICAgICAgICAgIGlmIChsaW5rVGV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXBsYWNlcihzdHIsIG1hdGNoZWRUYWcsIGxpbmtUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyKHN0ciwgbWF0Y2hlZFRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBtYXRjaGVzID0gdGFnUmVnRXhwLmV4ZWMoc3RyKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcgPSBzdHI7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHJlcGxhY2VNYXRjaChwcm9jZXNzVGhlTGluaywgJ2xpbmsnLCBtYXRjaGVzWzBdLCBtYXRjaGVzWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHJlcGxhY2VNYXRjaChwcm9jZXNzVGhlTGluaywgJ2xpbmsnLCBtYXRjaGVzWzBdLCBtYXRjaGVzWzJdLCBtYXRjaGVzWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKG1hdGNoZXMgJiYgcHJldmlvdXNTdHJpbmcgIT09IHN0cik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5ld1N0cmluZzogc3RyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIF9yZXNvbHZlTGlua3MgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gcmVwbGFjZUxpbmtUYWcoc3RyKS5uZXdTdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzb2x2ZUxpbmtzOiBfcmVzb2x2ZUxpbmtzXG4gICAgfVxufSkoKTtcbiIsImV4cG9ydCBjb25zdCBDT01QT0RPQ19ERUZBVUxUUyA9IHtcbiAgICB0aXRsZTogJ0FwcGxpY2F0aW9uIGRvY3VtZW50YXRpb24nLFxuICAgIGFkZGl0aW9uYWxFbnRyeU5hbWU6ICdBZGRpdGlvbmFsIGRvY3VtZW50YXRpb24nLFxuICAgIGFkZGl0aW9uYWxFbnRyeVBhdGg6ICdhZGRpdGlvbmFsLWRvY3VtZW50YXRpb24nLFxuICAgIGZvbGRlcjogJy4vZG9jdW1lbnRhdGlvbi8nLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgdGhlbWU6ICdnaXRib29rJyxcbiAgICBiYXNlOiAnLycsXG4gICAgZGVmYXVsdENvdmVyYWdlVGhyZXNob2xkOiA3MCxcbiAgICB0b2dnbGVNZW51SXRlbXM6IFsnYWxsJ10sXG4gICAgZGlzYWJsZVNvdXJjZUNvZGU6IGZhbHNlLFxuICAgIGRpc2FibGVHcmFwaDogZmFsc2UsXG4gICAgZGlzYWJsZU1haW5HcmFwaDogZmFsc2UsXG4gICAgZGlzYWJsZUNvdmVyYWdlOiBmYWxzZSxcbiAgICBkaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0OiBmYWxzZSxcbiAgICBQQUdFX1RZUEVTOiB7XG4gICAgICAgIFJPT1Q6ICdyb290JyxcbiAgICAgICAgSU5URVJOQUw6ICdpbnRlcm5hbCdcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxuaW1wb3J0IHsgUGFnZUludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9wYWdlLmludGVyZmFjZSc7XG5cbmltcG9ydCB7IE1haW5EYXRhSW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzL21haW4tZGF0YS5pbnRlcmZhY2UnO1xuXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbmZpZ3VyYXRpb24uaW50ZXJmYWNlJztcblxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhdGlvbiBpbXBsZW1lbnRzIENvbmZpZ3VyYXRpb25JbnRlcmZhY2Uge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpDb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oKTtcblxuICAgIHByaXZhdGUgX3BhZ2VzOlBhZ2VJbnRlcmZhY2VbXSA9IFtdO1xuICAgIHByaXZhdGUgX21haW5EYXRhOiBNYWluRGF0YUludGVyZmFjZSA9IHtcbiAgICAgICAgb3V0cHV0OiBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIsXG4gICAgICAgIHRoZW1lOiBDT01QT0RPQ19ERUZBVUxUUy50aGVtZSxcbiAgICAgICAgZXh0VGhlbWU6ICcnLFxuICAgICAgICBzZXJ2ZTogZmFsc2UsXG4gICAgICAgIHBvcnQ6IENPTVBPRE9DX0RFRkFVTFRTLnBvcnQsXG4gICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICBhc3NldHNGb2xkZXI6ICcnLFxuICAgICAgICBkb2N1bWVudGF0aW9uTWFpbk5hbWU6IENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlLFxuICAgICAgICBkb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgYmFzZTogQ09NUE9ET0NfREVGQVVMVFMuYmFzZSxcbiAgICAgICAgaGlkZUdlbmVyYXRvcjogZmFsc2UsXG4gICAgICAgIG1vZHVsZXM6IFtdLFxuICAgICAgICByZWFkbWU6IGZhbHNlLFxuICAgICAgICBjaGFuZ2Vsb2c6ICcnLFxuICAgICAgICBjb250cmlidXRpbmc6ICcnLFxuICAgICAgICBsaWNlbnNlOiAnJyxcbiAgICAgICAgdG9kbzogJycsXG4gICAgICAgIG1hcmtkb3duczogW10sXG4gICAgICAgIGFkZGl0aW9uYWxQYWdlczogW10sXG4gICAgICAgIHBpcGVzOiBbXSxcbiAgICAgICAgY2xhc3NlczogW10sXG4gICAgICAgIGludGVyZmFjZXM6IFtdLFxuICAgICAgICBjb21wb25lbnRzOiBbXSxcbiAgICAgICAgZGlyZWN0aXZlczogW10sXG4gICAgICAgIGluamVjdGFibGVzOiBbXSxcbiAgICAgICAgbWlzY2VsbGFuZW91czogW10sXG4gICAgICAgIHJvdXRlczogW10sXG4gICAgICAgIHRzY29uZmlnOiAnJyxcbiAgICAgICAgdG9nZ2xlTWVudUl0ZW1zOiBbXSxcbiAgICAgICAgaW5jbHVkZXM6ICcnLFxuICAgICAgICBpbmNsdWRlc05hbWU6IENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeU5hbWUsXG4gICAgICAgIGluY2x1ZGVzRm9sZGVyOiBDT01QT0RPQ19ERUZBVUxUUy5hZGRpdGlvbmFsRW50cnlQYXRoLFxuICAgICAgICBkaXNhYmxlU291cmNlQ29kZTogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZVNvdXJjZUNvZGUsXG4gICAgICAgIGRpc2FibGVHcmFwaDogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUdyYXBoLFxuICAgICAgICBkaXNhYmxlTWFpbkdyYXBoOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlTWFpbkdyYXBoLFxuICAgICAgICBkaXNhYmxlQ292ZXJhZ2U6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVDb3ZlcmFnZSxcbiAgICAgICAgZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydDogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCxcbiAgICAgICAgd2F0Y2g6IGZhbHNlLFxuICAgICAgICBtYWluR3JhcGg6ICcnLFxuICAgICAgICBjb3ZlcmFnZVRlc3Q6IGZhbHNlLFxuICAgICAgICBjb3ZlcmFnZVRlc3RUaHJlc2hvbGQ6IENPTVBPRE9DX0RFRkFVTFRTLmRlZmF1bHRDb3ZlcmFnZVRocmVzaG9sZCxcbiAgICAgICAgcm91dGVzTGVuZ3RoOiAwLFxuICAgICAgICBhbmd1bGFyVmVyc2lvbjogJydcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmKENvbmZpZ3VyYXRpb24uX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6Q29uZmlndXJhdGlvblxuICAgIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGFkZFBhZ2UocGFnZTogUGFnZUludGVyZmFjZSkge1xuICAgICAgICBsZXQgaW5kZXhQYWdlID0gXy5maW5kSW5kZXgodGhpcy5fcGFnZXMsIHsnbmFtZSc6IHBhZ2UubmFtZX0pO1xuICAgICAgICBpZiAoaW5kZXhQYWdlID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5fcGFnZXMucHVzaChwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEFkZGl0aW9uYWxQYWdlKHBhZ2U6IFBhZ2VJbnRlcmZhY2UpIHtcbiAgICAgICAgdGhpcy5fbWFpbkRhdGEuYWRkaXRpb25hbFBhZ2VzLnB1c2gocGFnZSk7XG4gICAgfVxuXG4gICAgcmVzZXRQYWdlcygpIHtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICByZXNldEFkZGl0aW9uYWxQYWdlcygpIHtcbiAgICAgICAgdGhpcy5fbWFpbkRhdGEuYWRkaXRpb25hbFBhZ2VzID0gW107XG4gICAgfVxuXG4gICAgcmVzZXRSb290TWFya2Rvd25QYWdlcygpIHtcbiAgICAgICAgbGV0IGluZGV4UGFnZSA9IF8uZmluZEluZGV4KHRoaXMuX3BhZ2VzLCB7J25hbWUnOiAnaW5kZXgnfSk7XG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xuICAgICAgICBpbmRleFBhZ2UgPSBfLmZpbmRJbmRleCh0aGlzLl9wYWdlcywgeyduYW1lJzogJ2NoYW5nZWxvZyd9KTtcbiAgICAgICAgdGhpcy5fcGFnZXMuc3BsaWNlKGluZGV4UGFnZSwgMSk7XG4gICAgICAgIGluZGV4UGFnZSA9IF8uZmluZEluZGV4KHRoaXMuX3BhZ2VzLCB7J25hbWUnOiAnY29udHJpYnV0aW5nJ30pO1xuICAgICAgICB0aGlzLl9wYWdlcy5zcGxpY2UoaW5kZXhQYWdlLCAxKTtcbiAgICAgICAgaW5kZXhQYWdlID0gXy5maW5kSW5kZXgodGhpcy5fcGFnZXMsIHsnbmFtZSc6ICdsaWNlbnNlJ30pO1xuICAgICAgICB0aGlzLl9wYWdlcy5zcGxpY2UoaW5kZXhQYWdlLCAxKTtcbiAgICAgICAgaW5kZXhQYWdlID0gXy5maW5kSW5kZXgodGhpcy5fcGFnZXMsIHsnbmFtZSc6ICd0b2RvJ30pO1xuICAgICAgICB0aGlzLl9wYWdlcy5zcGxpY2UoaW5kZXhQYWdlLCAxKTtcbiAgICAgICAgdGhpcy5fbWFpbkRhdGEubWFya2Rvd25zID0gW107XG4gICAgfVxuXG4gICAgZ2V0IHBhZ2VzKCk6UGFnZUludGVyZmFjZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZ2VzO1xuICAgIH1cbiAgICBzZXQgcGFnZXMocGFnZXM6UGFnZUludGVyZmFjZVtdKSB7XG4gICAgICAgIHRoaXMuX3BhZ2VzID0gW107XG4gICAgfVxuXG4gICAgZ2V0IG1haW5EYXRhKCk6TWFpbkRhdGFJbnRlcmZhY2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFpbkRhdGE7XG4gICAgfVxuICAgIHNldCBtYWluRGF0YShkYXRhOk1haW5EYXRhSW50ZXJmYWNlKSB7XG4gICAgICAgICg8YW55Pk9iamVjdCkuYXNzaWduKHRoaXMuX21haW5EYXRhLCBkYXRhKTtcbiAgICB9XG59O1xuIiwibGV0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5WZXJzaW9uKHZlcnNpb24pIHtcbiAgICByZXR1cm4gdmVyc2lvbi5yZXBsYWNlKCd+JywgJycpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgnXicsICcnKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJz0nLCAnJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCc8JywgJycpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgnPicsICcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5ndWxhclZlcnNpb25PZlByb2plY3QocGFja2FnZURhdGEpIHtcbiAgICBsZXQgX3Jlc3VsdCA9ICcnO1xuXG4gICAgaWYgKHBhY2thZ2VEYXRhWydkZXBlbmRlbmNpZXMnXSkge1xuICAgICAgICBsZXQgYW5ndWxhckNvcmUgPSBwYWNrYWdlRGF0YVsnZGVwZW5kZW5jaWVzJ11bJ0Bhbmd1bGFyL2NvcmUnXTtcbiAgICAgICAgaWYgKGFuZ3VsYXJDb3JlKSB7XG4gICAgICAgICAgICBfcmVzdWx0ID0gY2xlYW5WZXJzaW9uKGFuZ3VsYXJDb3JlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0FuZ3VsYXJWZXJzaW9uQXJjaGl2ZWQodmVyc2lvbikge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBzZW12ZXIuY29tcGFyZSh2ZXJzaW9uLCAnMi40LjEwJykgPD0gMDtcbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZWZpeE9mZmljaWFsRG9jKHZlcnNpb24pIHtcbiAgICByZXR1cm4gaXNBbmd1bGFyVmVyc2lvbkFyY2hpdmVkKHZlcnNpb24pID8gJ3YyLicgOiAnJztcbn1cbiIsImVudW0gQmFzaWNUeXBlcyB7XG4gICAgbnVtYmVyLFxuICAgIGJvb2xlYW4sXG4gICAgc3RyaW5nLFxuICAgIG9iamVjdCxcbiAgICBkYXRlLFxuICAgIGZ1bmN0aW9uXG59O1xuXG5lbnVtIEJhc2ljVHlwZVNjcmlwdFR5cGVzIHtcbiAgICBhbnksXG4gICAgdm9pZFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRlckluQmFzaWNUeXBlcyh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiAodHlwZS50b0xvd2VyQ2FzZSgpIGluIEJhc2ljVHlwZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kZXJJblR5cGVTY3JpcHRCYXNpY1R5cGVzKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuICh0eXBlLnRvTG93ZXJDYXNlKCkgaW4gQmFzaWNUeXBlU2NyaXB0VHlwZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuLi8uLi91dGlscy9kZWZhdWx0cyc7XG5pbXBvcnQgeyAkZGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi9kZXBlbmRlbmNpZXMuZW5naW5lJztcbmltcG9ydCB7IGV4dHJhY3RMZWFkaW5nVGV4dCwgc3BsaXRMaW5rVGV4dCB9IGZyb20gJy4uLy4uL3V0aWxzL2xpbmstcGFyc2VyJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7IHByZWZpeE9mZmljaWFsRG9jIH0gZnJvbSAnLi4vLi4vdXRpbHMvYW5ndWxhci12ZXJzaW9uJztcblxuaW1wb3J0IHsganNkb2NUYWdJbnRlcmZhY2UgfSBmcm9tICcuLi9pbnRlcmZhY2VzL2pzZG9jLXRhZy5pbnRlcmZhY2UnO1xuXG5pbXBvcnQgeyBmaW5kZXJJbkJhc2ljVHlwZXMsIGZpbmRlckluVHlwZVNjcmlwdEJhc2ljVHlwZXMgfSBmcm9tICcuLi8uLi91dGlscy9iYXNpYy10eXBlcyc7XG5cbmV4cG9ydCBsZXQgSHRtbEVuZ2luZUhlbHBlcnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgbGV0IGluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9UT0RPIHVzZSB0aGlzIGluc3RlYWQgOiBodHRwczovL2dpdGh1Yi5jb20vYXNzZW1ibGUvaGFuZGxlYmFycy1oZWxwZXJzXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoIFwiY29tcGFyZVwiLCBmdW5jdGlvbihhLCBvcGVyYXRvciwgYiwgb3B0aW9ucykge1xuICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoYW5kbGViYXJzIEhlbHBlciB7e2NvbXBhcmV9fSBleHBlY3RzIDQgYXJndW1lbnRzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICAgICAgICBjYXNlICdpbmRleG9mJzpcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAoYi5pbmRleE9mKGEpICE9PSAtMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICc9PT0nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhID09PSBiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyE9PSc6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgIT09IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgPiBiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoZWxwZXIge3tjb21wYXJlfX06IGludmFsaWQgb3BlcmF0b3I6IGAnICsgb3BlcmF0b3IgKyAnYCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoXCJvclwiLCBmdW5jdGlvbigvKiBhbnksIGFueSwgLi4uLCBvcHRpb25zICovKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbbGVuXTtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoXCJmaWx0ZXJBbmd1bGFyMk1vZHVsZXNcIiwgZnVuY3Rpb24odGV4dCwgb3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3QgTkcyX01PRFVMRVM6c3RyaW5nW10gPSBbXG4gICAgICAgICAgICAgICAgJ0Jyb3dzZXJNb2R1bGUnLFxuICAgICAgICAgICAgICAgICdGb3Jtc01vZHVsZScsXG4gICAgICAgICAgICAgICAgJ0h0dHBNb2R1bGUnLFxuICAgICAgICAgICAgICAgICdSb3V0ZXJNb2R1bGUnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGxlbiA9IE5HMl9NT0RVTEVTLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQuaW5kZXhPZihORzJfTU9EVUxFU1tpXSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoXCJkZWJ1Z1wiLCBmdW5jdGlvbihvcHRpb25hbFZhbHVlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJDdXJyZW50IENvbnRleHRcIik7XG4gICAgICAgICAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcblxuICAgICAgICAgIGlmIChvcHRpb25hbFZhbHVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9wdGlvbmFsVmFsdWVcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cob3B0aW9uYWxWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYnJlYWtsaW5lcycsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIHRleHQgPSBIYW5kbGViYXJzLlV0aWxzLmVzY2FwZUV4cHJlc3Npb24odGV4dCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpL2dtLCAnPGJyPicpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nbSwgJyZuYnNwOycpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvXHQvZ20sICcmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsnKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignY2xlYW4tcGFyYWdyYXBoJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPHA+L2dtLCAnJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88XFwvcD4vZ20sICcnKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZXNjYXBlU2ltcGxlUXVvdGUnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICBpZighdGV4dCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIF90ZXh0ID0gdGV4dC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIik7XG4gICAgICAgICAgICBfdGV4dCA9IF90ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICcnKTtcbiAgICAgICAgICAgIHJldHVybiBfdGV4dDtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrQ29tbWEnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLC9nLCAnLDxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbW9kaWZLaW5kJywgZnVuY3Rpb24oa2luZCkge1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvNzNlZTJmZWI1MWM5YjdlMjRhMjllYjRjZWUxOWQ3YzE0YjkzMzA2NS9saWIvdHlwZXNjcmlwdC5kLnRzI0w2NFxuICAgICAgICAgICAgbGV0IF9raW5kVGV4dCA9ICcnO1xuICAgICAgICAgICAgc3dpdGNoKGtpbmQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDExMjpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ1ByaXZhdGUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExMzpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ1Byb3RlY3RlZCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTE0OlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnUHVibGljJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdTdGF0aWMnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKF9raW5kVGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdtb2RpZkljb24nLCBmdW5jdGlvbihraW5kKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi83M2VlMmZlYjUxYzliN2UyNGEyOWViNGNlZTE5ZDdjMTRiOTMzMDY1L2xpYi90eXBlc2NyaXB0LmQudHMjTDY0XG4gICAgICAgICAgICBsZXQgX2tpbmRUZXh0ID0gJyc7XG4gICAgICAgICAgICBzd2l0Y2goa2luZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTEyOlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnbG9jayc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTEzOlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnY2lyY2xlJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdzcXVhcmUnO1xuICAgICAgICAgICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdleHBvcnQnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfa2luZFRleHQ7XG4gICAgICAgIH0pO1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29udmVydCB7QGxpbmsgTXlDbGFzc30gdG8gW015Q2xhc3NdKGh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9jbGFzc2VzL015Q2xhc3MuaHRtbClcbiAgICAgICAgICovXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3BhcnNlRGVzY3JpcHRpb24nLCBmdW5jdGlvbihkZXNjcmlwdGlvbiwgZGVwdGgpIHtcbiAgICAgICAgICAgIGxldCB0YWdSZWdFeHBMaWdodCA9IG5ldyBSZWdFeHAoJ1xcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLFxuICAgICAgICAgICAgICAgIHRhZ1JlZ0V4cEZ1bGwgPSBuZXcgUmVnRXhwKCdcXFxce0BsaW5rXFxcXHMrKCg/Oi58XFxuKSs/KVxcXFx9JywgJ2knKSxcbiAgICAgICAgICAgICAgICB0YWdSZWdFeHAsXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyxcbiAgICAgICAgICAgICAgICBwcmV2aW91c1N0cmluZyxcbiAgICAgICAgICAgICAgICB0YWdJbmZvID0gW107XG5cbiAgICAgICAgICAgIHRhZ1JlZ0V4cCA9IChkZXNjcmlwdGlvbi5pbmRleE9mKCddeycpICE9PSAtMSkgPyB0YWdSZWdFeHBGdWxsIDogdGFnUmVnRXhwTGlnaHQ7XG5cbiAgICAgICAgICAgIHZhciBwcm9jZXNzVGhlTGluayA9IGZ1bmN0aW9uKHN0cmluZywgdGFnSW5mbywgbGVhZGluZ1RleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVhZGluZyA9IGV4dHJhY3RMZWFkaW5nVGV4dChzdHJpbmcsIHRhZ0luZm8uY29tcGxldGVUYWcpLFxuICAgICAgICAgICAgICAgICAgICBzcGxpdCxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBuZXdMaW5rLFxuICAgICAgICAgICAgICAgICAgICByb290UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlO1xuXG4gICAgICAgICAgICAgICAgc3BsaXQgPSBzcGxpdExpbmtUZXh0KHRhZ0luZm8udGV4dCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmRJbkNvbXBvZG9jKHNwbGl0LnRhcmdldCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gJGRlcGVuZGVuY2llc0VuZ2luZS5maW5kSW5Db21wb2RvYyh0YWdJbmZvLnRleHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGVhZGluZ1RleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9ICdbJyArIGxlYWRpbmdUZXh0ICsgJ10nICsgdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsZWFkaW5nLmxlYWRpbmdUZXh0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2UgPSAnWycgKyBsZWFkaW5nLmxlYWRpbmdUZXh0ICsgJ10nICsgdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2UgPSB0YWdJbmZvLmNvbXBsZXRlVGFnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQudHlwZSA9PT0gJ2NsYXNzJykgcmVzdWx0LnR5cGUgPSAnY2xhc3NlJztcblxuICAgICAgICAgICAgICAgICAgICByb290UGF0aCA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZGVwdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290UGF0aCA9ICcuLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnLi4vJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290UGF0aCA9ICcuLi8uLi8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhYmVsID0gcmVzdWx0Lm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZWFkaW5nLmxlYWRpbmdUZXh0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGxlYWRpbmcubGVhZGluZ1RleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzcGxpdC5saW5rVGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gc3BsaXQubGlua1RleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBuZXdMaW5rID0gYDxhIGhyZWY9XCIke3Jvb3RQYXRofSR7cmVzdWx0LnR5cGV9cy8ke3Jlc3VsdC5uYW1lfS5odG1sXCI+JHtsYWJlbH08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHN0cmluZ3RvUmVwbGFjZSwgbmV3TGluayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlcGxhY2VNYXRjaChyZXBsYWNlciwgdGFnLCBtYXRjaCwgdGV4dCwgbGlua1RleHQ/KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoZWRUYWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlVGFnOiBtYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRhZ0luZm8ucHVzaChtYXRjaGVkVGFnKTtcblxuICAgICAgICAgICAgICAgIGlmIChsaW5rVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVwbGFjZXIoZGVzY3JpcHRpb24sIG1hdGNoZWRUYWcsIGxpbmtUZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVwbGFjZXIoZGVzY3JpcHRpb24sIG1hdGNoZWRUYWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSB0YWdSZWdFeHAuZXhlYyhkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcgPSBkZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IHJlcGxhY2VNYXRjaChwcm9jZXNzVGhlTGluaywgJ2xpbmsnLCBtYXRjaGVzWzBdLCBtYXRjaGVzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gcmVwbGFjZU1hdGNoKHByb2Nlc3NUaGVMaW5rLCAnbGluaycsIG1hdGNoZXNbMF0sIG1hdGNoZXNbMl0sIG1hdGNoZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAobWF0Y2hlcyAmJiBwcmV2aW91c1N0cmluZyAhPT0gZGVzY3JpcHRpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb247XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlbGF0aXZlVVJMJywgZnVuY3Rpb24oY3VycmVudERlcHRoLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudERlcHRoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAnLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcuLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcuLi8uLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZnVuY3Rpb25TaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGxldCBhcmdzID0gW10sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgICAgICAgICAgICBhbmd1bGFyRG9jUHJlZml4ID0gcHJlZml4T2ZmaWNpYWxEb2MoY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbik7XG4gICAgICAgICAgICBpZiAobWV0aG9kLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChhcmcudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IF9yZXN1bHQuZGF0YS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgcGF0aCA9ICdjbGFzc2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIuLi8ke3BhdGh9cy8ke19yZXN1bHQuZGF0YS5uYW1lfS5odG1sXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHtfcmVzdWx0LmRhdGEucGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIke3BhdGh9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcuZG90RG90RG90VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgLi4uJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcuZnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmcuZnVuY3Rpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcmd1bXMgPSBhcmcuZnVuY3Rpb24ubWFwKGZ1bmN0aW9uKGFyZ3UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfcmVzdWx0ID0gJGRlcGVuZGVuY2llc0VuZ2luZS5maW5kKGFyZ3UudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IF9yZXN1bHQuZGF0YS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIHBhdGggPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZ3UubmFtZX06IDxhIGhyZWY9XCIuLi8ke3BhdGh9cy8ke19yZXN1bHQuZGF0YS5uYW1lfS5odG1sXCI+JHthcmd1LnR5cGV9PC9hPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHtfcmVzdWx0LmRhdGEucGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJndS5uYW1lfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FyZ3UudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmRlckluQmFzaWNUeXBlcyhhcmd1LnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvJHthcmd1LnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJndS5uYW1lfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FyZ3UudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmluZGVySW5UeXBlU2NyaXB0QmFzaWNUeXBlcyhhcmd1LnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svYmFzaWMtdHlwZXMuaHRtbGA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZ3UubmFtZX06IDxhIGhyZWY9XCIke3BhdGh9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcmd1LnR5cGV9PC9hPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmd1Lm5hbWUgJiYgYXJndS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmd1Lm5hbWV9OiAke2FyZ3UudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmd1Lm5hbWUudGV4dH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogKCR7YXJndW1zfSkgPT4gdm9pZGA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06ICgpID0+IHZvaWRgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmRlckluQmFzaWNUeXBlcyhhcmcudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gYGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzLyR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIke3BhdGh9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5kZXJJblR5cGVTY3JpcHRCYXNpY1R5cGVzKGFyZy50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svYmFzaWMtdHlwZXMuaHRtbGA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9OiA8YSBocmVmPVwiJHtwYXRofVwiIHRhcmdldD1cIl9ibGFua1wiPiR7YXJnLnR5cGV9PC9hPmA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9OiAke2FyZy50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZC5uYW1lfSgke2FyZ3N9KWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgKCR7YXJnc30pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXJldHVybnMtY29tbWVudCcsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdyZXR1cm5zJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdqc2RvYy1jb21wb25lbnQtZXhhbXBsZScsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0YWdzID0gW107XG5cbiAgICAgICAgICAgIGxldCBjbGVhblRhZyA9IGZ1bmN0aW9uKGNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tbWVudC5jaGFyQXQoMCkgPT09ICcqJykge1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY29tbWVudC5zdWJzdHJpbmcoMSwgY29tbWVudC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tbWVudC5jaGFyQXQoMCkgPT09ICcgJykge1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY29tbWVudC5zdWJzdHJpbmcoMSwgY29tbWVudC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHR5cGUgPSAnaHRtbCc7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc2gudHlwZSkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBvcHRpb25zLmhhc2gudHlwZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gaHRtbEVudGl0aWVzKHN0cikge1xuICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoc3RyKS5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7JykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ2V4YW1wbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0ge30gYXMganNkb2NUYWdJbnRlcmZhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGA8cHJlIGNsYXNzPVwibGluZS1udW1iZXJzXCI+PGNvZGUgY2xhc3M9XCJsYW5ndWFnZS0ke3R5cGV9XCI+YCArIGh0bWxFbnRpdGllcyhjbGVhblRhZyhqc2RvY1RhZ3NbaV0uY29tbWVudCkpICsgYDwvY29kZT48L3ByZT5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLWV4YW1wbGUnLCBmdW5jdGlvbihqc2RvY1RhZ3M6anNkb2NUYWdJbnRlcmZhY2VbXSwgb3B0aW9ucykge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgdGFncyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ2V4YW1wbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0ge30gYXMganNkb2NUYWdJbnRlcmZhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGpzZG9jVGFnc1tpXS5jb21tZW50LnJlcGxhY2UoLzxjYXB0aW9uPi9nLCAnPGI+PGk+JykucmVwbGFjZSgvXFwvY2FwdGlvbj4vZywgJy9iPjwvaT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFncyA9IHRhZ3M7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdqc2RvYy1wYXJhbXMnLCBmdW5jdGlvbihqc2RvY1RhZ3M6anNkb2NUYWdJbnRlcmZhY2VbXSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgdGFncyA9IFtdO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdwYXJhbScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fSBhcyBqc2RvY1RhZ0ludGVyZmFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24gJiYganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy50eXBlID0ganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGpzZG9jVGFnc1tpXS5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcubmFtZSA9IGpzZG9jVGFnc1tpXS5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXBhcmFtcy12YWxpZCcsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0YWdzID0gW10sXG4gICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAncGFyYW0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLWRlZmF1bHQnLCBmdW5jdGlvbihqc2RvY1RhZ3M6anNkb2NUYWdJbnRlcmZhY2VbXSwgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKGpzZG9jVGFncykge1xuICAgICAgICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgdGFnID0ge30gYXMganNkb2NUYWdJbnRlcmZhY2UsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbiAmJiBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy50eXBlID0ganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGpzZG9jVGFnc1tpXS5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcubmFtZSA9IGpzZG9jVGFnc1tpXS5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xpbmtUeXBlJywgZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQobmFtZSksXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgICAgICAgICAgICBhbmd1bGFyRG9jUHJlZml4ID0gcHJlZml4T2ZmaWNpYWxEb2MoY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbik7XG4gICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmF3OiBuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIF9yZXN1bHQuZGF0YS50eXBlID0gJ2NsYXNzZSc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS5ocmVmID0gJy4uLycgKyBfcmVzdWx0LmRhdGEudHlwZSArICdzLycgKyBfcmVzdWx0LmRhdGEubmFtZSArICcuaHRtbCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS50YXJnZXQgPSAnX3NlbGYnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS5ocmVmID0gYGh0dHBzOi8vJHthbmd1bGFyRG9jUHJlZml4fWFuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpLyR7X3Jlc3VsdC5kYXRhLnBhdGh9YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5kZXJJbkJhc2ljVHlwZXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJhdzogbmFtZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZS5ocmVmID0gYGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzLyR7bmFtZX1gO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5kZXJJblR5cGVTY3JpcHRCYXNpY1R5cGVzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlID0ge1xuICAgICAgICAgICAgICAgICAgICByYXc6IG5hbWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZS50YXJnZXQgPSAnX2JsYW5rJztcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUuaHJlZiA9ICdodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay9iYXNpYy10eXBlcy5odG1sJztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2luZGV4YWJsZVNpZ25hdHVyZScsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IG1ldGhvZC5hcmdzLm1hcChhcmcgPT4gYCR7YXJnLm5hbWV9OiAke2FyZy50eXBlfWApLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9WyR7YXJnc31dYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBbJHthcmdzfV1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignb2JqZWN0JywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgve1wiLywgJ3s8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyxcIi8sICcsPGJyPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC99JC8sICc8YnI+fScpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lzTm90VG9nZ2xlJywgZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgbGV0IGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCksXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY29uZmlndXJhdGlvbi5tYWluRGF0YS50b2dnbGVNZW51SXRlbXMuaW5kZXhPZih0eXBlKTtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLm1haW5EYXRhLnRvZ2dsZU1lbnVJdGVtcy5pbmRleE9mKCdhbGwnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0XG4gICAgfVxufSkoKVxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuLy9pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJ2hhbmRsZWJhcnMtaGVscGVycyc7XG5pbXBvcnQgeyBIdG1sRW5naW5lSGVscGVycyB9IGZyb20gJy4vaHRtbC5lbmdpbmUuaGVscGVycyc7XG5cbmV4cG9ydCBjbGFzcyBIdG1sRW5naW5lIHtcbiAgICBjYWNoZTogT2JqZWN0ID0ge307XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEh0bWxFbmdpbmVIZWxwZXJzLmluaXQoKTtcbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgbGV0IHBhcnRpYWxzID0gW1xuICAgICAgICAgICAgJ21lbnUnLFxuICAgICAgICAgICAgJ292ZXJ2aWV3JyxcbiAgICAgICAgICAgICdtYXJrZG93bicsXG4gICAgICAgICAgICAnbW9kdWxlcycsXG4gICAgICAgICAgICAnbW9kdWxlJyxcbiAgICAgICAgICAgICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICdjb21wb25lbnQnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudC1kZXRhaWwnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnLFxuICAgICAgICAgICAgJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgJ3BpcGVzJyxcbiAgICAgICAgICAgICdwaXBlJyxcbiAgICAgICAgICAgICdjbGFzc2VzJyxcbiAgICAgICAgICAgICdjbGFzcycsXG5cdCAgICAgICAgJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAncm91dGVzJyxcbiAgICAgICAgICAgICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAnc2VhcmNoLWlucHV0JyxcbiAgICAgICAgICAgICdsaW5rLXR5cGUnLFxuICAgICAgICAgICAgJ2Jsb2NrLW1ldGhvZCcsXG4gICAgICAgICAgICAnYmxvY2stZW51bScsXG4gICAgICAgICAgICAnYmxvY2stcHJvcGVydHknLFxuICAgICAgICAgICAgJ2Jsb2NrLWluZGV4JyxcbiAgICAgICAgICAgICdibG9jay1jb25zdHJ1Y3RvcicsXG4gICAgICAgICAgICAnY292ZXJhZ2UtcmVwb3J0JyxcbiAgICAgICAgICAgICdtaXNjZWxsYW5lb3VzJyxcbiAgICAgICAgICAgICdhZGRpdGlvbmFsLXBhZ2UnXG4gICAgICAgIF0sXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHBhcnRpYWxzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvb3AgPSAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKF9fZGlybmFtZSArICcvLi4vc3JjL3RlbXBsYXRlcy9wYXJ0aWFscy8nICsgcGFydGlhbHNbaV0gKyAnLmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHsgcmVqZWN0KCk7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHBhcnRpYWxzW2ldLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKF9fZGlybmFtZSArICcvLi4vc3JjL3RlbXBsYXRlcy9wYWdlLmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgaW5kZXggZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZVsncGFnZSddID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGxvb3AocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlcihtYWluRGF0YTphbnksIHBhZ2U6YW55KSB7XG4gICAgICAgIHZhciBvID0gbWFpbkRhdGEsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgKDxhbnk+T2JqZWN0KS5hc3NpZ24obywgcGFnZSk7XG4gICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUodGhhdC5jYWNoZVsncGFnZSddKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBvXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2VuZXJhdGVDb3ZlcmFnZUJhZGdlKG91dHB1dEZvbGRlciwgY292ZXJhZ2VEYXRhKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzL2NvdmVyYWdlLWJhZGdlLmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBjb3ZlcmFnZSBiYWRnZSBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNvdmVyYWdlRGF0YVxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICBvdXRwdXRGb2xkZXIgPSBvdXRwdXRGb2xkZXIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgZnMub3V0cHV0RmlsZShwYXRoLnJlc29sdmUob3V0cHV0Rm9sZGVyICsgcGF0aC5zZXAgKyAnL2ltYWdlcy9jb3ZlcmFnZS1iYWRnZS5zdmcnKSwgcmVzdWx0LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgY292ZXJhZ2UgYmFkZ2UgZmlsZSBnZW5lcmF0aW9uICcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgbWFya2VkID0gcmVxdWlyZSgnbWFya2VkJyk7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93bkVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IG1hcmtlZC5SZW5kZXJlcigpO1xuICAgICAgICByZW5kZXJlci5jb2RlID0gKGNvZGUsIGxhbmd1YWdlKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZWQgPSBjb2RlO1xuICAgICAgICAgICAgaWYgKCFsYW5ndWFnZSkge1xuICAgICAgICAgICAgICAgIGxhbmd1YWdlID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoaWdobGlnaHRlZCA9IHRoaXMuZXNjYXBlKGNvZGUpO1xuICAgICAgICAgICAgcmV0dXJuIGA8cHJlIGNsYXNzPVwibGluZS1udW1iZXJzXCI+PGNvZGUgY2xhc3M9XCJsYW5ndWFnZS0ke2xhbmd1YWdlfVwiPiR7aGlnaGxpZ2h0ZWR9PC9jb2RlPjwvcHJlPmA7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVuZGVyZXIudGFibGUgPSAoaGVhZGVyLCBib2R5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJzx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIGNvbXBvZG9jLXRhYmxlXCI+XFxuJ1xuICAgICAgICAgICAgICAgICsgJzx0aGVhZD5cXG4nXG4gICAgICAgICAgICAgICAgKyBoZWFkZXJcbiAgICAgICAgICAgICAgICArICc8L3RoZWFkPlxcbidcbiAgICAgICAgICAgICAgICArICc8dGJvZHk+XFxuJ1xuICAgICAgICAgICAgICAgICsgYm9keVxuICAgICAgICAgICAgICAgICsgJzwvdGJvZHk+XFxuJ1xuICAgICAgICAgICAgICAgICsgJzwvdGFibGU+XFxuJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcmVyLmltYWdlID0gZnVuY3Rpb24gKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgICAgICAgICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCIgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiJztcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfTtcblxuICAgICAgICBtYXJrZWQuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICByZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgICAgICAgICBicmVha3M6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQoZmlsZXBhdGg6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hcmtlZChkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRUcmFkaXRpb25hbE1hcmtkb3duKGZpbGVwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaWxlcGF0aCArICcubWQnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hcmtlZChkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRSZWFkbWVGaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdSRUFETUUubWQnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBSRUFETUUubWQgZmlsZSByZWFkaW5nJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVhZE5laWdoYm91clJlYWRtZUZpbGUoZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArIHBhdGguYmFzZW5hbWUoZmlsZSwgJy50cycpICsgJy5tZCc7XG4gICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocmVhZG1lRmlsZSwgJ3V0ZjgnKTtcbiAgICB9XG4gICAgaGFzTmVpZ2hib3VyUmVhZG1lRmlsZShmaWxlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgICByZWFkbWVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgcGF0aC5iYXNlbmFtZShmaWxlLCAnLnRzJykgKyAnLm1kJztcbiAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSk7XG4gICAgfVxuICAgIGNvbXBvbmVudFJlYWRtZUZpbGUoZmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgICByZWFkbWVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgJ1JFQURNRS5tZCcsXG4gICAgICAgICAgICByZWFkbWVBbHRlcm5hdGl2ZUZpbGUgPSBkaXJuYW1lICsgcGF0aC5zZXAgKyBwYXRoLmJhc2VuYW1lKGZpbGUsICcudHMnKSArICcubWQnLFxuICAgICAgICAgICAgZmluYWxQYXRoID0gJyc7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHJlYWRtZUZpbGUpKSB7XG4gICAgICAgICAgICBmaW5hbFBhdGggPSByZWFkbWVGaWxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmluYWxQYXRoID0gcmVhZG1lQWx0ZXJuYXRpdmVGaWxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaW5hbFBhdGg7XG4gICAgfVxuICAgIGhhc1Jvb3RNYXJrZG93bnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCByZWFkbWVGaWxlID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ1JFQURNRS5tZCcsXG4gICAgICAgICAgICByZWFkbWVGaWxlV2l0aG91dEV4dGVuc2lvbiA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdSRUFETUUnLFxuICAgICAgICAgICAgY2hhbmdlbG9nRmlsZSA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdDSEFOR0VMT0cubWQnLFxuICAgICAgICAgICAgY2hhbmdlbG9nRmlsZVdpdGhvdXRFeHRlbnNpb24gPSBwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnQ0hBTkdFTE9HJyxcbiAgICAgICAgICAgIGxpY2Vuc2VGaWxlID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ0xJQ0VOU0UubWQnLFxuICAgICAgICAgICAgbGljZW5zZUZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ0xJQ0VOU0UnLFxuICAgICAgICAgICAgY29udHJpYnV0aW5nRmlsZSA9IHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdDT05UUklCVVRJTkcubWQnLFxuICAgICAgICAgICAgY29udHJpYnV0aW5nRmlsZVdpdGhvdXRFeHRlbnNpb24gPSBwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAnQ09OVFJJQlVUSU5HJyxcbiAgICAgICAgICAgIHRvZG9GaWxlID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ1RPRE8ubWQnLFxuICAgICAgICAgICAgdG9kb0ZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgJ1RPRE8nO1xuICAgICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhyZWFkbWVGaWxlKSB8fFxuICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhyZWFkbWVGaWxlV2l0aG91dEV4dGVuc2lvbikgfHxcbiAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmMoY2hhbmdlbG9nRmlsZSkgfHxcbiAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmMoY2hhbmdlbG9nRmlsZVdpdGhvdXRFeHRlbnNpb24pIHx8XG4gICAgICAgICAgICAgICBmcy5leGlzdHNTeW5jKGxpY2Vuc2VGaWxlKSB8fFxuICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhsaWNlbnNlRmlsZVdpdGhvdXRFeHRlbnNpb24pIHx8XG4gICAgICAgICAgICAgICBmcy5leGlzdHNTeW5jKGNvbnRyaWJ1dGluZ0ZpbGUpIHx8XG4gICAgICAgICAgICAgICBmcy5leGlzdHNTeW5jKGNvbnRyaWJ1dGluZ0ZpbGVXaXRob3V0RXh0ZW5zaW9uKSB8fFxuICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyh0b2RvRmlsZSkgfHxcbiAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmModG9kb0ZpbGVXaXRob3V0RXh0ZW5zaW9uKTtcbiAgICB9XG4gICAgbGlzdFJvb3RNYXJrZG93bnMoKTogc3RyaW5nW10ge1xuICAgICAgICBsZXQgbGlzdCA9IFtdLFxuICAgICAgICAgICAgcmVhZG1lID0gJ1JFQURNRScsXG4gICAgICAgICAgICBjaGFuZ2Vsb2cgPSAnQ0hBTkdFTE9HJyxcbiAgICAgICAgICAgIGNvbnRyaWJ1dGluZyA9ICdDT05UUklCVVRJTkcnLFxuICAgICAgICAgICAgbGljZW5zZSA9ICdMSUNFTlNFJyxcbiAgICAgICAgICAgIHRvZG8gPSAnVE9ETyc7XG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyByZWFkbWUgKyAnLm1kJykgfHwgZnMuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyByZWFkbWUpKSB7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKHJlYWRtZSk7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKHJlYWRtZSsgJy5tZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgY2hhbmdlbG9nICsgJy5tZCcpIHx8IGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgY2hhbmdlbG9nKSkge1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGFuZ2Vsb2cpO1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGFuZ2Vsb2crICcubWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGNvbnRyaWJ1dGluZyArICcubWQnKSB8fCBmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGNvbnRyaWJ1dGluZykpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goY29udHJpYnV0aW5nKTtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goY29udHJpYnV0aW5nKyAnLm1kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBsaWNlbnNlICsgJy5tZCcpIHx8IGZzLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgbGljZW5zZSkpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2gobGljZW5zZSk7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKGxpY2Vuc2UrICcubWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRvZG8gKyAnLm1kJykgfHwgZnMuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0b2RvKSkge1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2godG9kbysgJy5tZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVzY2FwZShodG1sKSB7XG4gICAgICAgIHJldHVybiBodG1sXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjMzk7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9AL2csICcmIzY0OycpO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcblxuZXhwb3J0IGNsYXNzIEZpbGVFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuICAgIGdldChmaWxlcGF0aDpzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgU2hlbGxqcyBmcm9tICdzaGVsbGpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuXG5pbXBvcnQgaXNHbG9iYWwgZnJvbSAnLi4vLi4vdXRpbHMvZ2xvYmFsLnBhdGgnO1xuXG5jb25zdCBuZ2RDciA9IHJlcXVpcmUoJ0Bjb21wb2RvYy9uZ2QtY29yZScpLFxuICAgICAgbmdkVCA9IHJlcXVpcmUoJ0Bjb21wb2RvYy9uZ2QtdHJhbnNmb3JtZXInKSxcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuZXhwb3J0IGNsYXNzIE5nZEVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIHJlbmRlckdyYXBoKGZpbGVwYXRoOiBzdHJpbmcsIG91dHB1dHBhdGg6IHN0cmluZywgdHlwZTogc3RyaW5nLCBuYW1lPzogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIG5nZENyLmxvZ2dlci5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgbmdkVC5Eb3RFbmdpbmUoe1xuICAgICAgICAgICAgICAgIG91dHB1dDogb3V0cHV0cGF0aCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TGVnZW5kOiB0cnVlLFxuICAgICAgICAgICAgICAgIG91dHB1dEZvcm1hdHM6ICdzdmcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnZicpIHtcbiAgICAgICAgICAgICAgICBlbmdpbmVcbiAgICAgICAgICAgICAgICAgICAgLmdlbmVyYXRlR3JhcGgoWyRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UmF3TW9kdWxlKG5hbWUpXSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmdpbmVcbiAgICAgICAgICAgICAgICAgICAgLmdlbmVyYXRlR3JhcGgoJGRlcGVuZGVuY2llc0VuZ2luZS5yYXdNb2R1bGVzRm9yT3ZlcnZpZXcpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlYWRHcmFwaChmaWxlcGF0aDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgZ3JhcGggcmVhZCAnICsgbmFtZSk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xuXG5jb25zdCBsdW5yOiBhbnkgPSByZXF1aXJlKCdsdW5yJyksXG4gICAgICBjaGVlcmlvOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyksXG4gICAgICBFbnRpdGllczphbnkgPSByZXF1aXJlKCdodG1sLWVudGl0aWVzJykuQWxsSHRtbEVudGl0aWVzLFxuICAgICAgJGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCksXG4gICAgICBIdG1sID0gbmV3IEVudGl0aWVzKCk7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hFbmdpbmUge1xuICAgIHNlYXJjaEluZGV4OiBhbnk7XG4gICAgZG9jdW1lbnRzU3RvcmU6IE9iamVjdCA9IHt9O1xuICAgIGluZGV4U2l6ZTogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICBwcml2YXRlIGdldFNlYXJjaEluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoSW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5kZXggPSBsdW5yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZigndXJsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgndGl0bGUnLCB7IGJvb3N0OiAxMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCdib2R5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hJbmRleDtcbiAgICB9XG4gICAgaW5kZXhQYWdlKHBhZ2UpIHtcbiAgICAgICAgdmFyIHRleHQsXG4gICAgICAgICAgICAkID0gY2hlZXJpby5sb2FkKHBhZ2UucmF3RGF0YSk7XG5cbiAgICAgICAgdGV4dCA9ICQoJy5jb250ZW50JykuaHRtbCgpO1xuICAgICAgICB0ZXh0ID0gSHRtbC5kZWNvZGUodGV4dCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg8KFtePl0rKT4pL2lnLCAnJyk7XG5cbiAgICAgICAgcGFnZS51cmwgPSBwYWdlLnVybC5yZXBsYWNlKCRjb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgJycpO1xuXG4gICAgICAgIHZhciBkb2MgPSB7XG4gICAgICAgICAgICB1cmw6IHBhZ2UudXJsLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2UuaW5mb3MuY29udGV4dCArICcgLSAnICsgcGFnZS5pbmZvcy5uYW1lLFxuICAgICAgICAgICAgYm9keTogdGV4dFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghdGhpcy5kb2N1bWVudHNTdG9yZS5oYXNPd25Qcm9wZXJ0eShkb2MudXJsKSkge1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudHNTdG9yZVtkb2MudXJsXSA9IGRvYztcbiAgICAgICAgICAgIHRoaXMuZ2V0U2VhcmNoSW5kZXgoKS5hZGQoZG9jKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZW5lcmF0ZVNlYXJjaEluZGV4SnNvbihvdXRwdXRGb2xkZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvc2VhcmNoLWluZGV4LmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBzZWFyY2ggaW5kZXggZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKGRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRTZWFyY2hJbmRleCgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlOiBKU09OLnN0cmluZ2lmeSh0aGlzLmRvY3VtZW50c1N0b3JlKVxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICBvdXRwdXRGb2xkZXIgPSBvdXRwdXRGb2xkZXIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgZnMub3V0cHV0RmlsZShwYXRoLnJlc29sdmUob3V0cHV0Rm9sZGVyICsgcGF0aC5zZXAgKyAnL2pzL3NlYXJjaC9zZWFyY2hfaW5kZXguanMnKSwgcmVzdWx0LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgfSk7XG4gICAgfVxufTtcbiIsImV4cG9ydCBjb25zdCBlbnVtIEFuZ3VsYXJMaWZlY3ljbGVIb29rcyB7XG4gICAgbmdPbkNoYW5nZXMsXG4gICAgbmdPbkluaXQsXG4gICAgbmdEb0NoZWNrLFxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCxcbiAgICBuZ0FmdGVyQ29udGVudENoZWNrZWQsXG4gICAgbmdBZnRlclZpZXdJbml0LFxuICAgIG5nQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgICBuZ09uRGVzdHJveVxufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHsgTGlua1BhcnNlciB9IGZyb20gJy4vbGluay1wYXJzZXInO1xuXG5pbXBvcnQgeyBBbmd1bGFyTGlmZWN5Y2xlSG9va3MgfSBmcm9tICcuL2FuZ3VsYXItbGlmZWN5Y2xlcy1ob29rcyc7XG5cbmNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpLFxuICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeSA9IHRzLnN5cy5nZXRDdXJyZW50RGlyZWN0b3J5LFxuICAgICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyA9IHRzLnN5cy51c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzLFxuICAgICAgbmV3TGluZSA9IHRzLnN5cy5uZXdMaW5lLFxuICAgICAgbWFya2VkID0gcmVxdWlyZSgnbWFya2VkJyksXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROZXdMaW5lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ld0xpbmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW5vbmljYWxGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyA/IGZpbGVOYW1lIDogZmlsZU5hbWUudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGNvbnN0IGZvcm1hdERpYWdub3N0aWNzSG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0ge1xuICAgIGdldEN1cnJlbnREaXJlY3RvcnksXG4gICAgZ2V0Q2Fub25pY2FsRmlsZU5hbWUsXG4gICAgZ2V0TmV3TGluZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFya2VkdGFncyh0YWdzKSB7XG4gICAgdmFyIG10YWdzID0gdGFncztcbiAgICBfLmZvckVhY2gobXRhZ3MsICh0YWcpID0+IHtcbiAgICAgICAgdGFnLmNvbW1lbnQgPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModGFnLmNvbW1lbnQpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbXRhZ3M7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbmZpZyhjb25maWdGaWxlOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCByZXN1bHQgPSB0cy5yZWFkQ29uZmlnRmlsZShjb25maWdGaWxlLCB0cy5zeXMucmVhZEZpbGUpO1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSB0cy5mb3JtYXREaWFnbm9zdGljcyhbcmVzdWx0LmVycm9yXSwgZm9ybWF0RGlhZ25vc3RpY3NIb3N0KTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmNvbmZpZztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEJvbShzb3VyY2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcblx0XHRyZXR1cm4gc291cmNlLnNsaWNlKDEpO1xuXHR9XG5cdHJldHVybiBzb3VyY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNCb20oc291cmNlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHNvdXJjZS5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlUGF0aChmaWxlczogc3RyaW5nW10sIGN3ZDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGxldCBfZmlsZXMgPSBmaWxlcyxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbiA9IGZpbGVzLmxlbmd0aDtcblxuICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChmaWxlc1tpXS5pbmRleE9mKGN3ZCkgPT09IC0xKSB7XG4gICAgICAgICAgICBmaWxlc1tpXSA9IHBhdGgucmVzb2x2ZShjd2QgKyBwYXRoLnNlcCArIGZpbGVzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMobWV0aG9kcykge1xuICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbiA9IG1ldGhvZHMubGVuZ3RoO1xuXG4gICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgaWYgKCFtZXRob2RzW2ldLm5hbWUgaW4gQW5ndWxhckxpZmVjeWNsZUhvb2tzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW4nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1ldGhvZHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XG5cbmltcG9ydCB7IHN0cmlwQm9tLCBoYXNCb20gfSBmcm9tICcuL3V0aWxzL3V0aWxzJztcblxuY29uc3QgY2FycmlhZ2VSZXR1cm5MaW5lRmVlZCA9ICdcXHJcXG4nLFxuICAgICAgbGluZUZlZWQgPSAnXFxuJyxcbiAgICAgIHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpLFxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyAvZywgJy0nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdEluZGVudChzdHIsIGNvdW50LCBpbmRlbnQ/KTogc3RyaW5nIHtcbiAgICBsZXQgc3RyaXBJbmRlbnQgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaCgvXlsgXFx0XSooPz1cXFMpL2dtKTtcblxuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogdXNlIHNwcmVhZCBvcGVyYXRvciB3aGVuIHRhcmdldGluZyBOb2RlLmpzIDZcbiAgICAgICAgY29uc3QgaW5kZW50ID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgbWF0Y2gubWFwKHggPT4geC5sZW5ndGgpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYF5bIFxcXFx0XXske2luZGVudH19YCwgJ2dtJyk7XG5cbiAgICAgICAgcmV0dXJuIGluZGVudCA+IDAgPyBzdHIucmVwbGFjZShyZSwgJycpIDogc3RyO1xuICAgIH0sXG4gICAgICAgIHJlcGVhdGluZyA9IGZ1bmN0aW9uKG4sIHN0cikge1xuICAgICAgICBzdHIgPSBzdHIgPT09IHVuZGVmaW5lZCA/ICcgJyA6IHN0cjtcblxuICAgICAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYGlucHV0XFxgIHRvIGJlIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RyfVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG4gPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIHBvc2l0aXZlIGZpbml0ZSBudW1iZXIsIGdvdCBcXGAke259XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmV0ID0gJyc7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XG4gICAgICAgICAgICAgICAgcmV0ICs9IHN0cjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RyICs9IHN0cjtcbiAgICAgICAgfSB3aGlsZSAoKG4gPj49IDEpKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgaW5kZW50U3RyaW5nID0gZnVuY3Rpb24oc3RyLCBjb3VudCwgaW5kZW50KSB7XG4gICAgICAgIGluZGVudCA9IGluZGVudCA9PT0gdW5kZWZpbmVkID8gJyAnIDogaW5kZW50O1xuICAgICAgICBjb3VudCA9IGNvdW50ID09PSB1bmRlZmluZWQgPyAxIDogY291bnQ7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgY291bnQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIFxcYG51bWJlclxcYCwgZ290IFxcYCR7dHlwZW9mIGNvdW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpbmRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbmRlbnRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBpbmRlbnR9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRlbnQgPSBjb3VudCA+IDEgPyByZXBlYXRpbmcoY291bnQsIGluZGVudCkgOiBpbmRlbnQ7XG5cbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eKD8hXFxzKiQpL21nLCBpbmRlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBpbmRlbnRTdHJpbmcoc3RyaXBJbmRlbnQoc3RyKSwgY291bnQgfHwgMCwgaW5kZW50KTtcbn1cblxuLy8gQ3JlYXRlIGEgY29tcGlsZXJIb3N0IG9iamVjdCB0byBhbGxvdyB0aGUgY29tcGlsZXIgdG8gcmVhZCBhbmQgd3JpdGUgZmlsZXNcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlckhvc3QodHJhbnNwaWxlT3B0aW9uczogYW55KTogdHMuQ29tcGlsZXJIb3N0IHtcblxuICAgIGNvbnN0IGlucHV0RmlsZU5hbWUgPSB0cmFuc3BpbGVPcHRpb25zLmZpbGVOYW1lIHx8ICh0cmFuc3BpbGVPcHRpb25zLmpzeCA/ICdtb2R1bGUudHN4JyA6ICdtb2R1bGUudHMnKTtcblxuICAgIGNvbnN0IGNvbXBpbGVySG9zdDogdHMuQ29tcGlsZXJIb3N0ID0ge1xuICAgICAgICBnZXRTb3VyY2VGaWxlOiAoZmlsZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWxlTmFtZS5sYXN0SW5kZXhPZignLnRzJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnbGliLmQudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZS5zdWJzdHIoLTUpID09PSAnLmQudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGguaXNBYnNvbHV0ZShmaWxlTmFtZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aC5qb2luKHRyYW5zcGlsZU9wdGlvbnMudHNjb25maWdEaXJlY3RvcnksIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBsaWJTb3VyY2UgPSAnJztcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGxpYlNvdXJjZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlTmFtZSkudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQm9tKGxpYlNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpYlNvdXJjZSA9IHN0cmlwQm9tKGxpYlNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoZSwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBsaWJTb3VyY2UsIHRyYW5zcGlsZU9wdGlvbnMudGFyZ2V0LCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICB3cml0ZUZpbGU6IChuYW1lLCB0ZXh0KSA9PiB7fSxcbiAgICAgICAgZ2V0RGVmYXVsdExpYkZpbGVOYW1lOiAoKSA9PiAnbGliLmQudHMnLFxuICAgICAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiAoKSA9PiBmYWxzZSxcbiAgICAgICAgZ2V0Q2Fub25pY2FsRmlsZU5hbWU6IGZpbGVOYW1lID0+IGZpbGVOYW1lLFxuICAgICAgICBnZXRDdXJyZW50RGlyZWN0b3J5OiAoKSA9PiAnJyxcbiAgICAgICAgZ2V0TmV3TGluZTogKCkgPT4gJ1xcbicsXG4gICAgICAgIGZpbGVFeGlzdHM6IChmaWxlTmFtZSk6IGJvb2xlYW4gPT4gZmlsZU5hbWUgPT09IGlucHV0RmlsZU5hbWUsXG4gICAgICAgIHJlYWRGaWxlOiAoKSA9PiAnJyxcbiAgICAgICAgZGlyZWN0b3J5RXhpc3RzOiAoKSA9PiB0cnVlLFxuICAgICAgICBnZXREaXJlY3RvcmllczogKCkgPT4gW11cbiAgICB9O1xuICAgIHJldHVybiBjb21waWxlckhvc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTWFpblNvdXJjZUZvbGRlcihmaWxlczogc3RyaW5nW10pIHtcbiAgICBsZXQgbWFpbkZvbGRlciA9ICcnLFxuICAgICAgICBtYWluRm9sZGVyQ291bnQgPSAwLFxuICAgICAgICByYXdGb2xkZXJzID0gZmlsZXMubWFwKChmaWxlcGF0aCkgPT4ge1xuICAgICAgICAgICAgdmFyIHNob3J0UGF0aCA9IGZpbGVwYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwLCAnJyk7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5kaXJuYW1lKHNob3J0UGF0aCk7XG4gICAgICAgIH0pLFxuICAgICAgICBmb2xkZXJzID0ge30sXG4gICAgICAgIGkgPSAwO1xuICAgIHJhd0ZvbGRlcnMgPSBfLnVuaXEocmF3Rm9sZGVycyk7XG4gICAgbGV0IGxlbiA9IHJhd0ZvbGRlcnMubGVuZ3RoO1xuICAgIGZvcihpOyBpPGxlbjsgaSsrKXtcbiAgICAgICAgbGV0IHNlcCA9IHJhd0ZvbGRlcnNbaV0uc3BsaXQocGF0aC5zZXApO1xuICAgICAgICBzZXAubWFwKChmb2xkZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmb2xkZXJzW2ZvbGRlcl0pIHtcbiAgICAgICAgICAgICAgICBmb2xkZXJzW2ZvbGRlcl0gKz0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyc1tmb2xkZXJdID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgZm9yIChsZXQgZiBpbiBmb2xkZXJzKSB7XG4gICAgICAgIGlmKGZvbGRlcnNbZl0gPiBtYWluRm9sZGVyQ291bnQpIHtcbiAgICAgICAgICAgIG1haW5Gb2xkZXJDb3VudCA9IGZvbGRlcnNbZl07XG4gICAgICAgICAgICBtYWluRm9sZGVyID0gZjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFpbkZvbGRlcjtcbn1cbiIsImltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XG5cbmNvbnN0IEpTT041ID0gcmVxdWlyZSgnanNvbjUnKSxcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuZXhwb3J0IGxldCBSb3V0ZXJQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcm91dGVzOiBhbnlbXSA9IFtdLFxuICAgICAgICBpbmNvbXBsZXRlUm91dGVzID0gW10sXG4gICAgICAgIG1vZHVsZXMgPSBbXSxcbiAgICAgICAgbW9kdWxlc1RyZWUsXG4gICAgICAgIHJvb3RNb2R1bGUsXG4gICAgICAgIGNsZWFuTW9kdWxlc1RyZWUsXG4gICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gW10sXG5cbiAgICAgICAgX2FkZFJvdXRlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgIHJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgocm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEluY29tcGxldGVSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICBpbmNvbXBsZXRlUm91dGVzLnB1c2gocm91dGUpO1xuICAgICAgICAgICAgaW5jb21wbGV0ZVJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgoaW5jb21wbGV0ZVJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRNb2R1bGVXaXRoUm91dGVzID0gZnVuY3Rpb24obW9kdWxlTmFtZSwgbW9kdWxlSW1wb3J0cywgZmlsZW5hbWUpIHtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHMsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aChtb2R1bGVzV2l0aFJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRNb2R1bGUgPSBmdW5jdGlvbihtb2R1bGVOYW1lOiBzdHJpbmcsIG1vZHVsZUltcG9ydHMpIHtcbiAgICAgICAgICAgIG1vZHVsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogbW9kdWxlTmFtZSxcbiAgICAgICAgICAgICAgICBpbXBvcnRzTm9kZTogbW9kdWxlSW1wb3J0c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aChtb2R1bGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NsZWFuUmF3Um91dGVQYXJzZWQgPSBmdW5jdGlvbihyb3V0ZTogc3RyaW5nKSB7XG4gICAgICAgICAgICBsZXQgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlLnJlcGxhY2UoLyAvZ20sICcnKSxcbiAgICAgICAgICAgICAgICB0ZXN0VHJhaWxpbmdDb21tYSA9IHJvdXRlc1dpdGhvdXRTcGFjZXMuaW5kZXhPZignfSxdJyk7XG4gICAgICAgICAgICBpZiAodGVzdFRyYWlsaW5nQ29tbWEgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICByb3V0ZXNXaXRob3V0U3BhY2VzID0gcm91dGVzV2l0aG91dFNwYWNlcy5yZXBsYWNlKCd9LF0nLCAnfV0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBKU09ONS5wYXJzZShyb3V0ZXNXaXRob3V0U3BhY2VzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY2xlYW5SYXdSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCByb3V0ZXNXaXRob3V0U3BhY2VzID0gcm91dGUucmVwbGFjZSgvIC9nbSwgJycpLFxuICAgICAgICAgICAgICAgIHRlc3RUcmFpbGluZ0NvbW1hID0gcm91dGVzV2l0aG91dFNwYWNlcy5pbmRleE9mKCd9LF0nKTtcbiAgICAgICAgICAgIGlmICh0ZXN0VHJhaWxpbmdDb21tYSAhPSAtMSkge1xuICAgICAgICAgICAgICAgIHJvdXRlc1dpdGhvdXRTcGFjZXMgPSByb3V0ZXNXaXRob3V0U3BhY2VzLnJlcGxhY2UoJ30sXScsICd9XScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1dpdGhvdXRTcGFjZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldFJvb3RNb2R1bGUgPSBmdW5jdGlvbihtb2R1bGU6IHN0cmluZykge1xuICAgICAgICAgICAgcm9vdE1vZHVsZSA9IG1vZHVsZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzID0gZnVuY3Rpb24oaW1wb3J0cykge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGltcG9ydHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JDaGlsZCcpICE9PSAtMSB8fFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvclJvb3QnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9maXhJbmNvbXBsZXRlUm91dGVzID0gZnVuY3Rpb24obWlzY2VsbGFuZW91c1ZhcmlhYmxlcykge1xuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnZml4SW5jb21wbGV0ZVJvdXRlcycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhtaXNjZWxsYW5lb3VzVmFyaWFibGVzKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGluY29tcGxldGVSb3V0ZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG1hdGNoaW5nVmFyaWFibGVzID0gW107XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBpbmNvbXBsZXRlUm91dGUsIHNjYW4gaWYgb25lIG1pc2MgdmFyaWFibGUgaXMgaW4gY29kZVxuICAgICAgICAgICAgLy8gaWYgb2ssIHRyeSByZWNyZWF0aW5nIGNvbXBsZXRlIHJvdXRlXG4gICAgICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGxlbmcgPSBtaXNjZWxsYW5lb3VzVmFyaWFibGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGo7IGo8bGVuZzsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEuaW5kZXhPZihtaXNjZWxsYW5lb3VzVmFyaWFibGVzW2pdLm5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZvdW5kIG9uZSBtaXNjIHZhciBpbnNpZGUgaW5jb21wbGV0ZVJvdXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtaXNjZWxsYW5lb3VzVmFyaWFibGVzW2pdLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hpbmdWYXJpYWJsZXMucHVzaChtaXNjZWxsYW5lb3VzVmFyaWFibGVzW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL0NsZWFuIGluY29tcGxldGVSb3V0ZVxuICAgICAgICAgICAgICAgIGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YSA9IGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YS5yZXBsYWNlKCdbJywgJycpO1xuICAgICAgICAgICAgICAgIGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YSA9IGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YS5yZXBsYWNlKCddJywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLypjb25zb2xlLmxvZyhpbmNvbXBsZXRlUm91dGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1hdGNoaW5nVmFyaWFibGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2xpbmtNb2R1bGVzQW5kUm91dGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsaW5rTW9kdWxlc0FuZFJvdXRlczogJyk7XG4gICAgICAgICAgICAvL3NjYW4gZWFjaCBtb2R1bGUgaW1wb3J0cyBBU1QgZm9yIGVhY2ggcm91dGVzLCBhbmQgbGluayByb3V0ZXMgd2l0aCBtb2R1bGVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsaW5rTW9kdWxlc0FuZFJvdXRlcyByb3V0ZXM6ICcsIHJvdXRlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzV2l0aFJvdXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzV2l0aFJvdXRlc1tpXS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgZWxlbWVudCB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmFyZ3VtZW50cywgZnVuY3Rpb24oYXJndW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocm91dGVzLCBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0ICYmIHJvdXRlLm5hbWUgPT09IGFyZ3VtZW50LnRleHQgJiYgcm91dGUuZmlsZW5hbWUgPT09IG1vZHVsZXNXaXRoUm91dGVzW2ldLmZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5tb2R1bGUgPSBtb2R1bGVzV2l0aFJvdXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2VuZCBsaW5rTW9kdWxlc0FuZFJvdXRlczogJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh1dGlsLmluc3BlY3Qocm91dGVzLCB7IGRlcHRoOiAxMCB9KSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cbiAgICAgICAgfSxcblxuICAgICAgICBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUgPSBmdW5jdGlvbihtb2R1bGVOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5maW5kKHJvdXRlcywgeydtb2R1bGUnOiBtb2R1bGVOYW1lfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm91bmRMYXp5TW9kdWxlV2l0aFBhdGggPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAvL3BhdGggaXMgbGlrZSBhcHAvY3VzdG9tZXJzL2N1c3RvbWVycy5tb2R1bGUjQ3VzdG9tZXJzTW9kdWxlXG4gICAgICAgICAgICBsZXQgc3BsaXQgPSBwYXRoLnNwbGl0KCcjJyksXG4gICAgICAgICAgICAgICAgbGF6eU1vZHVsZVBhdGggPSBzcGxpdFswXSxcbiAgICAgICAgICAgICAgICBsYXp5TW9kdWxlTmFtZSA9IHNwbGl0WzFdO1xuICAgICAgICAgICAgcmV0dXJuIGxhenlNb2R1bGVOYW1lO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jb25zdHJ1Y3RSb3V0ZXNUcmVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJ2NvbnN0cnVjdFJvdXRlc1RyZWUgbW9kdWxlczogJywgbW9kdWxlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZSBtb2R1bGVzV2l0aFJvdXRlczogJywgbW9kdWxlc1dpdGhSb3V0ZXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbnN0cnVjdFJvdXRlc1RyZWUgbW9kdWxlc1RyZWU6ICcsIHV0aWwuaW5zcGVjdChtb2R1bGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpOyovXG5cbiAgICAgICAgICAgIC8vIHJvdXRlc1tdIGNvbnRhaW5zIHJvdXRlcyB3aXRoIG1vZHVsZSBsaW5rXG4gICAgICAgICAgICAvLyBtb2R1bGVzVHJlZSBjb250YWlucyBtb2R1bGVzIHRyZWVcbiAgICAgICAgICAgIC8vIG1ha2UgYSBmaW5hbCByb3V0ZXMgdHJlZSB3aXRoIHRoYXRcbiAgICAgICAgICAgIGNsZWFuTW9kdWxlc1RyZWUgPSBfLmNsb25lRGVlcChtb2R1bGVzVHJlZSk7XG5cbiAgICAgICAgICAgIGxldCBtb2R1bGVzQ2xlYW5lciA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLmltcG9ydHNOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5pbXBvcnRzTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJbaV0ucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihhcnJbaV0uY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnICBjbGVhbk1vZHVsZXNUcmVlIGxpZ2h0OiAnLCB1dGlsLmluc3BlY3QoY2xlYW5Nb2R1bGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG5cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuXG4gICAgICAgICAgICB2YXIgcm91dGVzVHJlZSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnPHJvb3Q+JyxcbiAgICAgICAgICAgICAgICBraW5kOiAnbW9kdWxlJyxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgbG9vcE1vZHVsZXNQYXJzZXIgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vSWYgbW9kdWxlIGhhcyBjaGlsZCBtb2R1bGVzXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAgIElmIG1vZHVsZSBoYXMgY2hpbGQgbW9kdWxlcycpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlID0gZm91bmRSb3V0ZVdpdGhNb2R1bGVOYW1lKG5vZGUuY2hpbGRyZW5baV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUgJiYgcm91dGUuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuID0gSlNPTjUucGFyc2Uocm91dGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJvdXRlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUua2luZCA9ICdtb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlc1RyZWUuY2hpbGRyZW4ucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BNb2R1bGVzUGFyc2VyKG5vZGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9lbHNlIHJvdXRlcyBhcmUgZGlyZWN0bHkgaW5zaWRlIHRoZSBtb2R1bGVcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnICAgZWxzZSByb3V0ZXMgYXJlIGRpcmVjdGx5IGluc2lkZSB0aGUgcm9vdCBtb2R1bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhd1JvdXRlcyA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShub2RlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmF3Um91dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gSlNPTjUucGFyc2UocmF3Um91dGVzLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gcm91dGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSByb3V0ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXNbaV0uY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNUcmVlLmNoaWxkcmVuLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogcm91dGVzW2ldLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiByb3V0ZXNbaV0ucGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAgcm9vdE1vZHVsZTogJywgcm9vdE1vZHVsZSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgbGV0IHN0YXJ0TW9kdWxlID0gXy5maW5kKGNsZWFuTW9kdWxlc1RyZWUsIHsnbmFtZSc6IHJvb3RNb2R1bGV9KTtcblxuICAgICAgICAgICAgaWYgKHN0YXJ0TW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIoc3RhcnRNb2R1bGUpO1xuICAgICAgICAgICAgICAgIC8vTG9vcCB0d2ljZSBmb3Igcm91dGVzIHdpdGggbGF6eSBsb2FkaW5nXG4gICAgICAgICAgICAgICAgLy9sb29wTW9kdWxlc1BhcnNlcihyb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnICByb3V0ZXNUcmVlOiAnLCByb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5lZFJvdXRlc1RyZWUgPSBudWxsO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5Sb3V0ZXNUcmVlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlLmNoaWxkcmVuW2ldLnJvdXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhbmVkUm91dGVzVHJlZSA9IGNsZWFuUm91dGVzVHJlZShyb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgLy9UcnkgdXBkYXRpbmcgcm91dGVzIHdpdGggbGF6eSBsb2FkaW5nXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1RyeSB1cGRhdGluZyByb3V0ZXMgd2l0aCBsYXp5IGxvYWRpbmcnKTtcblxuICAgICAgICAgICAgbGV0IGxvb3BSb3V0ZXNQYXJzZXIgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgIGlmKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuW2ldLmxvYWRDaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IGZvdW5kTGF6eU1vZHVsZVdpdGhQYXRoKHJvdXRlLmNoaWxkcmVuW2ldLmxvYWRDaGlsZHJlbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZSA9IF8uZmluZChjbGVhbk1vZHVsZXNUcmVlLCB7J25hbWUnOiBjaGlsZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9yYXdNb2R1bGU6YW55ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUua2luZCA9ICdtb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUubW9kdWxlID0gbW9kdWxlLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb29wSW5zaWRlID0gZnVuY3Rpb24obW9kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtb2QuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gbW9kLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZSA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShtb2QuY2hpbGRyZW5baV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygcm91dGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuID0gSlNPTjUucGFyc2Uocm91dGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJvdXRlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUua2luZCA9ICdtb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUuY2hpbGRyZW4ucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcEluc2lkZShtb2R1bGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuW2ldLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuW2ldLmNoaWxkcmVuLnB1c2goX3Jhd01vZHVsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJvdXRlc1BhcnNlcihyb3V0ZS5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wUm91dGVzUGFyc2VyKGNsZWFuZWRSb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgIGNsZWFuZWRSb3V0ZXNUcmVlOiAnLCB1dGlsLmluc3BlY3QoY2xlYW5lZFJvdXRlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNsZWFuZWRSb3V0ZXNUcmVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jb25zdHJ1Y3RNb2R1bGVzVHJlZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjb25zdHJ1Y3RNb2R1bGVzVHJlZScpO1xuICAgICAgICAgICAgbGV0IGdldE5lc3RlZENoaWxkcmVuID0gZnVuY3Rpb24oYXJyLCBwYXJlbnQ/KSB7XG4gICAgICAgICAgICAgICAgdmFyIG91dCA9IFtdXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0ucGFyZW50ID09PSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGdldE5lc3RlZENoaWxkcmVuKGFyciwgYXJyW2ldLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJbaV0uY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goYXJyW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1NjYW4gZWFjaCBtb2R1bGUgYW5kIGFkZCBwYXJlbnQgcHJvcGVydHlcbiAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihmaXJzdExvb3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZmlyc3RMb29wTW9kdWxlLmltcG9ydHNOb2RlLCBmdW5jdGlvbihpbXBvcnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBtb2R1bGUubmFtZSA9PT0gaW1wb3J0Tm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlLnBhcmVudCA9IGZpcnN0TG9vcE1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzVHJlZSA9IGdldE5lc3RlZENoaWxkcmVuKG1vZHVsZXMpO1xuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZW5kIGNvbnN0cnVjdE1vZHVsZXNUcmVlJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtb2R1bGVzVHJlZSk7Ki9cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2VuZXJhdGVSb3V0ZXNJbmRleCA9IGZ1bmN0aW9uKG91dHB1dEZvbGRlciwgcm91dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvcm91dGVzLWluZGV4LmhicycpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIHJvdXRlcyBpbmRleCBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IEpTT04uc3RyaW5naWZ5KHJvdXRlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRGb2xkZXIgPSBvdXRwdXRGb2xkZXIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIGZzLm91dHB1dEZpbGUocGF0aC5yZXNvbHZlKG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJy9qcy9yb3V0ZXMvcm91dGVzX2luZGV4LmpzJyksIHJlc3VsdCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcm91dGVzIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9KTtcbiAgICAgICB9LFxuXG4gICAgICAgX3JvdXRlc0xlbmd0aCA9IGZ1bmN0aW9uKCk6IG51bWJlciB7XG4gICAgICAgICAgIHZhciBfbiA9IDA7XG5cbiAgICAgICAgICAgbGV0IHJvdXRlc1BhcnNlciA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICAgICBpZiAodHlwZW9mIHJvdXRlLnBhdGggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgX24gKz0gMTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNQYXJzZXIocm91dGUuY2hpbGRyZW5bal0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfTtcblxuICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGVzKSB7XG4gICAgICAgICAgICAgICByb3V0ZXNQYXJzZXIocm91dGVzW2ldKTtcbiAgICAgICAgICAgfVxuXG4gICAgICAgICAgIHJldHVybiBfbjtcbiAgICAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbmNvbXBsZXRlUm91dGVzOiBpbmNvbXBsZXRlUm91dGVzLFxuICAgICAgICBhZGRSb3V0ZTogX2FkZFJvdXRlLFxuICAgICAgICBhZGRJbmNvbXBsZXRlUm91dGU6IF9hZGRJbmNvbXBsZXRlUm91dGUsXG4gICAgICAgIGFkZE1vZHVsZVdpdGhSb3V0ZXM6IF9hZGRNb2R1bGVXaXRoUm91dGVzLFxuICAgICAgICBhZGRNb2R1bGU6IF9hZGRNb2R1bGUsXG4gICAgICAgIGNsZWFuUmF3Um91dGVQYXJzZWQ6IF9jbGVhblJhd1JvdXRlUGFyc2VkLFxuICAgICAgICBjbGVhblJhd1JvdXRlOiBfY2xlYW5SYXdSb3V0ZSxcbiAgICAgICAgc2V0Um9vdE1vZHVsZTogX3NldFJvb3RNb2R1bGUsXG4gICAgICAgIHByaW50Um91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcmludFJvdXRlczogJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICB9LFxuICAgICAgICBwcmludE1vZHVsZXNSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3ByaW50TW9kdWxlc1JvdXRlczogJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtb2R1bGVzV2l0aFJvdXRlcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJvdXRlc0xlbmd0aDogX3JvdXRlc0xlbmd0aCxcbiAgICAgICAgaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzOiBfaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzLFxuICAgICAgICBmaXhJbmNvbXBsZXRlUm91dGVzOiBfZml4SW5jb21wbGV0ZVJvdXRlcyxcbiAgICAgICAgbGlua01vZHVsZXNBbmRSb3V0ZXM6IF9saW5rTW9kdWxlc0FuZFJvdXRlcyxcbiAgICAgICAgY29uc3RydWN0Um91dGVzVHJlZTogX2NvbnN0cnVjdFJvdXRlc1RyZWUsXG4gICAgICAgIGNvbnN0cnVjdE1vZHVsZXNUcmVlOiBfY29uc3RydWN0TW9kdWxlc1RyZWUsXG4gICAgICAgIGdlbmVyYXRlUm91dGVzSW5kZXg6IF9nZW5lcmF0ZVJvdXRlc0luZGV4XG4gICAgfVxufSkoKTtcbiIsImNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNWYXJpYWJsZUxpa2Uobm9kZTogTm9kZSk6IG5vZGUgaXMgVmFyaWFibGVMaWtlRGVjbGFyYXRpb24ge1xuICAgaWYgKG5vZGUpIHtcbiAgICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluZGluZ0VsZW1lbnQ6XG4gICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtTWVtYmVyOlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGFyYW1ldGVyOlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50OlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5U2lnbmF0dXJlOlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50OlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgIH1cbiAgIH1cbiAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWU8VD4oYXJyYXk6IFRbXSwgcHJlZGljYXRlPzogKHZhbHVlOiBUKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGFycmF5KSB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiBhcnJheSkge1xuICAgICAgICAgICAgICAgIGlmIChwcmVkaWNhdGUodikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5Lmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0ZW5hdGU8VD4oYXJyYXkxOiBUW10sIGFycmF5MjogVFtdKTogVFtdIHtcbiAgICBpZiAoIXNvbWUoYXJyYXkyKSkgcmV0dXJuIGFycmF5MTtcbiAgICBpZiAoIXNvbWUoYXJyYXkxKSkgcmV0dXJuIGFycmF5MjtcbiAgICByZXR1cm4gWy4uLmFycmF5MSwgLi4uYXJyYXkyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFyYW1ldGVyKG5vZGU6IE5vZGUpOiBub2RlIGlzIFBhcmFtZXRlckRlY2xhcmF0aW9uIHtcbiAgICByZXR1cm4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlBhcmFtZXRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEpTRG9jUGFyYW1ldGVyVGFncyhwYXJhbTogTm9kZSk6IEpTRG9jUGFyYW1ldGVyVGFnW10ge1xuICAgIGlmICghaXNQYXJhbWV0ZXIocGFyYW0pKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGZ1bmMgPSBwYXJhbS5wYXJlbnQgYXMgRnVuY3Rpb25MaWtlRGVjbGFyYXRpb247XG4gICAgY29uc3QgdGFncyA9IGdldEpTRG9jVGFncyhmdW5jLCB0cy5TeW50YXhLaW5kLkpTRG9jUGFyYW1ldGVyVGFnKSBhcyBKU0RvY1BhcmFtZXRlclRhZ1tdO1xuICAgIGlmICghcGFyYW0ubmFtZSkge1xuICAgICAgICAvLyB0aGlzIGlzIGFuIGFub255bW91cyBqc2RvYyBwYXJhbSBmcm9tIGEgYGZ1bmN0aW9uKHR5cGUxLCB0eXBlMik6IHR5cGUzYCBzcGVjaWZpY2F0aW9uXG4gICAgICAgIGNvbnN0IGkgPSBmdW5jLnBhcmFtZXRlcnMuaW5kZXhPZihwYXJhbSk7XG4gICAgICAgIGNvbnN0IHBhcmFtVGFncyA9IGZpbHRlcih0YWdzLCB0YWcgPT4gdGFnLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSlNEb2NQYXJhbWV0ZXJUYWcpO1xuICAgICAgICBpZiAocGFyYW1UYWdzICYmIDAgPD0gaSAmJiBpIDwgcGFyYW1UYWdzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIFtwYXJhbVRhZ3NbaV1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcmFtLm5hbWUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocGFyYW0ubmFtZSBhcyBJZGVudGlmaWVyKS50ZXh0O1xuICAgICAgICByZXR1cm4gZmlsdGVyKHRhZ3MsIHRhZyA9PiB0YWcua2luZCA9PT0gdHMuU3ludGF4S2luZC5KU0RvY1BhcmFtZXRlclRhZyAmJiB0YWcucGFyYW1ldGVyTmFtZS50ZXh0ID09PSBuYW1lKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFRPRE86IGl0J3MgYSBkZXN0cnVjdHVyZWQgcGFyYW1ldGVyLCBzbyBpdCBzaG91bGQgbG9vayB1cCBhbiBcIm9iamVjdCB0eXBlXCIgc2VyaWVzIG9mIG11bHRpcGxlIGxpbmVzXG4gICAgICAgIC8vIEJ1dCBtdWx0aS1saW5lIG9iamVjdCB0eXBlcyBhcmVuJ3Qgc3VwcG9ydGVkIHlldCBlaXRoZXJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmV4cG9ydCBsZXQgSlNEb2NUYWdzUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgbGV0IF9nZXRKU0RvY3MgPSAobm9kZTogTm9kZSk6KEpTRG9jIHwgSlNEb2NUYWcpW10gPT4ge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdnZXRKU0RvY3M6ICcsIG5vZGUpO1xuICAgICAgICBsZXQgY2FjaGU6IChKU0RvYyB8IEpTRG9jVGFnKVtdID0gbm9kZS5qc0RvY0NhY2hlO1xuICAgICAgICBpZiAoIWNhY2hlKSB7XG4gICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIobm9kZSk7XG4gICAgICAgICAgICBub2RlLmpzRG9jQ2FjaGUgPSBjYWNoZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGU7XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0SlNEb2NzV29ya2VyKG5vZGU6IE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJlY29nbml6ZSB0aGlzIHBhdHRlcm4gd2hlbiBub2RlIGlzIGluaXRpYWxpemVyIG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGFuZCBKU0RvYyBjb21tZW50cyBhcmUgb24gY29udGFpbmluZyB2YXJpYWJsZSBzdGF0ZW1lbnQuXG4gICAgICAgICAgICAvLyAvKipcbiAgICAgICAgICAgIC8vICAgKiBAcGFyYW0ge251bWJlcn0gbmFtZVxuICAgICAgICAgICAgLy8gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAgICAvLyAgICovXG4gICAgICAgICAgICAvLyB2YXIgeCA9IGZ1bmN0aW9uKG5hbWUpIHsgcmV0dXJuIG5hbWUubGVuZ3RoOyB9XG4gICAgICAgICAgICBjb25zdCBpc0luaXRpYWxpemVyT2ZWYXJpYWJsZURlY2xhcmF0aW9uSW5TdGF0ZW1lbnQgPVxuICAgICAgICAgICAgICAgIGlzVmFyaWFibGVMaWtlKHBhcmVudCkgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5pdGlhbGl6ZXIgPT09IG5vZGUgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQucGFyZW50LnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgICAgICAgY29uc3QgaXNWYXJpYWJsZU9mVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCA9IGlzVmFyaWFibGVMaWtlKG5vZGUpICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgICAgICAgY29uc3QgdmFyaWFibGVTdGF0ZW1lbnROb2RlID1cbiAgICAgICAgICAgICAgICBpc0luaXRpYWxpemVyT2ZWYXJpYWJsZURlY2xhcmF0aW9uSW5TdGF0ZW1lbnQgPyBwYXJlbnQucGFyZW50LnBhcmVudCA6XG4gICAgICAgICAgICAgICAgaXNWYXJpYWJsZU9mVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCA/IHBhcmVudC5wYXJlbnQgOlxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh2YXJpYWJsZVN0YXRlbWVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIodmFyaWFibGVTdGF0ZW1lbnROb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWxzbyByZWNvZ25pemUgd2hlbiB0aGUgbm9kZSBpcyB0aGUgUkhTIG9mIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvblxuICAgICAgICAgICAgY29uc3QgaXNTb3VyY2VPZkFzc2lnbm1lbnRFeHByZXNzaW9uU3RhdGVtZW50ID1cbiAgICAgICAgICAgICAgICBwYXJlbnQgJiYgcGFyZW50LnBhcmVudCAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24gJiZcbiAgICAgICAgICAgICAgICAocGFyZW50IGFzIEJpbmFyeUV4cHJlc3Npb24pLm9wZXJhdG9yVG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbiAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC5wYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50O1xuICAgICAgICAgICAgaWYgKGlzU291cmNlT2ZBc3NpZ25tZW50RXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIGdldEpTRG9jc1dvcmtlcihwYXJlbnQucGFyZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaXNNb2R1bGVEZWNsYXJhdGlvbiA9IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbiAmJlxuICAgICAgICAgICAgICAgIHBhcmVudCAmJiBwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJvcGVydHlBc3NpZ25tZW50RXhwcmVzc2lvbiA9IHBhcmVudCAmJiBwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XG4gICAgICAgICAgICBpZiAoaXNNb2R1bGVEZWNsYXJhdGlvbiB8fCBpc1Byb3BlcnR5QXNzaWdubWVudEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIocGFyZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHVsbCBwYXJhbWV0ZXIgY29tbWVudHMgZnJvbSBkZWNsYXJpbmcgZnVuY3Rpb24gYXMgd2VsbFxuICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5QYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBjYWNoZSA9IGNvbmNhdGVuYXRlKGNhY2hlLCBnZXRKU0RvY1BhcmFtZXRlclRhZ3Mobm9kZSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNWYXJpYWJsZUxpa2Uobm9kZSkgJiYgbm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIGNhY2hlID0gY29uY2F0ZW5hdGUoY2FjaGUsIG5vZGUuaW5pdGlhbGl6ZXIuanNEb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWNoZSA9IGNvbmNhdGVuYXRlKGNhY2hlLCBub2RlLmpzRG9jKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEpTRG9jczogX2dldEpTRG9jc1xuICAgIH1cbn0pKCk7XG4iLCJjb25zdCB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGtpbmRUb1R5cGUoa2luZDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgX3R5cGUgPSAnJztcbiAgICBzd2l0Y2goa2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZDpcbiAgICAgICAgICAgIF90eXBlID0gJ3N0cmluZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWJlcktleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICdudW1iZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheVR5cGU6XG4gICAgICAgICAgICBfdHlwZSA9ICdbXSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZvaWRLZXl3b3JkOlxuICAgICAgICAgICAgX3R5cGUgPSAndm9pZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJvb2xlYW5LZXl3b3JkOlxuICAgICAgICAgICAgX3R5cGUgPSAnYm9vbGVhbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFueUtleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICdhbnknO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OZXZlcktleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICduZXZlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdEtleXdvcmQ6XG4gICAgICAgICAgICBfdHlwZSA9ICdvYmplY3QnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBfdHlwZTtcbn1cbiIsImNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpO1xuXG5sZXQgY29kZTogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGxldCBnZW4gPSAoZnVuY3Rpb24gKCkge1xuICAgIGxldCB0bXA6IHR5cGVvZiBjb2RlID0gW107XG5cbiAgICByZXR1cm4gKHRva2VuID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgISB0b2tlbicpO1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG9rZW4gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgXFxuJyk7XG4gICAgICAgICAgICBjb2RlLnB1c2godG1wLmpvaW4oJycpKTtcbiAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29kZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG59ICgpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlKG5vZGU6IGFueSkge1xuICAgIGNvZGUgPSBbXTtcbiAgICB2aXNpdEFuZFJlY29nbml6ZShub2RlKTtcbiAgICByZXR1cm4gY29kZS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gdmlzaXRBbmRSZWNvZ25pemUobm9kZTogYW55LCBkZXB0aCA9IDApIHtcbiAgICByZWNvZ25pemUobm9kZSk7XG4gICAgZGVwdGgrKztcbiAgICBub2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChjID0+IHZpc2l0QW5kUmVjb2duaXplKGMsIGRlcHRoKSk7XG59XG5cbmZ1bmN0aW9uIHJlY29nbml6ZShub2RlOiBhbnkpIHtcblxuICAgIC8vY29uc29sZS5sb2coJ3JlY29nbml6aW5nLi4uJywgdHMuU3ludGF4S2luZFtub2RlLmtpbmQrJyddKTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GaXJzdExpdGVyYWxUb2tlbjpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ltcG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdmcm9tJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBnZW4oJ2V4cG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjbGFzcycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRoaXNLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0aGlzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignY29uc3RydWN0b3InKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ZhbHNlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0cnVlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdudWxsJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXRUb2tlbjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgZ2VuKCcrJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICBnZW4oJyA9PiAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKCcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydENsYXVzZTpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZ2VuKCd7Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmxvY2s6XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuOlxuICAgICAgICAgICAgZ2VuKCd9Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCdbJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCddJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJzsnKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbW1hVG9rZW46XG4gICAgICAgICAgICBnZW4oJywnKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db2xvblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBnZW4oJzonKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb3RUb2tlbjpcbiAgICAgICAgICAgIGdlbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb1N0YXRlbWVudDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yOlxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudDpcbiAgICAgICAgICAgIGdlbignID0gJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0UHVuY3R1YXRpb246XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHJpdmF0ZScpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3B1YmxpYycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5cbmNvbnN0ICQ6IGFueSA9IHJlcXVpcmUoJ2NoZWVyaW8nKSxcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuY2xhc3MgQ29tcG9uZW50c1RyZWVFbmdpbmUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogQ29tcG9uZW50c1RyZWVFbmdpbmUgPSBuZXcgQ29tcG9uZW50c1RyZWVFbmdpbmUoKTtcbiAgICBjb21wb25lbnRzOiBhbnlbXSA9IFtdO1xuICAgIGNvbXBvbmVudHNGb3JUcmVlOiBhbnlbXSA9IFtdO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoQ29tcG9uZW50c1RyZWVFbmdpbmUuX2luc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIENvbXBvbmVudHNUcmVlRW5naW5lLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgQ29tcG9uZW50c1RyZWVFbmdpbmUuX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBDb21wb25lbnRzVHJlZUVuZ2luZSB7XG4gICAgICAgIHJldHVybiBDb21wb25lbnRzVHJlZUVuZ2luZS5faW5zdGFuY2U7XG4gICAgfVxuICAgIGFkZENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgcmVhZFRlbXBsYXRlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbXBvbmVudHNGb3JUcmVlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAkZmlsZWVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCksXG4gICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPD0gbGVuIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGVVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZmlsZWVuZ2luZS5nZXQocGF0aC5kaXJuYW1lKHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0uZmlsZSkgKyBwYXRoLnNlcCArIHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGVVcmwpLnRoZW4oKHRlbXBsYXRlRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlRGF0YSA9IHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluZENoaWxkcmVuQW5kUGFyZW50cygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbXBvbmVudHNGb3JUcmVlLCAoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0ICRjb21wb25lbnQgPSAkKGNvbXBvbmVudC50ZW1wbGF0ZURhdGEpO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbXBvbmVudHNGb3JUcmVlLCAoY29tcG9uZW50VG9GaW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkY29tcG9uZW50LmZpbmQoY29tcG9uZW50VG9GaW5kLnNlbGVjdG9yKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb21wb25lbnRUb0ZpbmQubmFtZSArICcgZm91bmQgaW4gJyArIGNvbXBvbmVudC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jaGlsZHJlbi5wdXNoKGNvbXBvbmVudFRvRmluZC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjcmVhdGVUcmVlc0ZvckNvbXBvbmVudHMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb21wb25lbnRzLCAoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9jb21wb25lbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBmaWxlOiBjb21wb25lbnQuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IGNvbXBvbmVudC5zZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBvbmVudC50ZW1wbGF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbXBvbmVudC50ZW1wbGF0ZSA9IGNvbXBvbmVudC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnRlbXBsYXRlVXJsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbXBvbmVudC50ZW1wbGF0ZVVybCA9IGNvbXBvbmVudC50ZW1wbGF0ZVVybFswXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNGb3JUcmVlLnB1c2goX2NvbXBvbmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucmVhZFRlbXBsYXRlcygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmluZENoaWxkcmVuQW5kUGFyZW50cygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcy5jb21wb25lbnRzRm9yVHJlZTogJywgdGhpcy5jb21wb25lbnRzRm9yVHJlZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0ICRjb21wb25lbnRzVHJlZUVuZ2luZSA9IENvbXBvbmVudHNUcmVlRW5naW5lLmdldEluc3RhbmNlKCk7XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcblxuaW1wb3J0IHsgY29tcGlsZXJIb3N0LCBkZXRlY3RJbmRlbnQgfSBmcm9tICcuLi8uLi91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xuaW1wb3J0IHsgTGlua1BhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL2xpbmstcGFyc2VyJztcbmltcG9ydCB7IEpTRG9jVGFnc1BhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL2pzZG9jLnBhcnNlcic7XG5pbXBvcnQgeyBtYXJrZWR0YWdzIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHsga2luZFRvVHlwZSB9IGZyb20gJy4uLy4uL3V0aWxzL2tpbmQtdG8tdHlwZSc7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vY29kZWdlbic7XG5pbXBvcnQgeyBzdHJpcEJvbSwgaGFzQm9tLCBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMgfSBmcm9tICcuLi8uLi91dGlscy91dGlscyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyAkY29tcG9uZW50c1RyZWVFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL2NvbXBvbmVudHMtdHJlZS5lbmdpbmUnO1xuXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKSxcbiAgICAgIHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpLFxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vLyBUeXBlU2NyaXB0IHJlZmVyZW5jZSA6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL21hc3Rlci9saWIvdHlwZXNjcmlwdC5kLnRzXG5cbmludGVyZmFjZSBOb2RlT2JqZWN0IHtcbiAgICBraW5kOiBOdW1iZXI7XG4gICAgcG9zOiBOdW1iZXI7XG4gICAgZW5kOiBOdW1iZXI7XG4gICAgdGV4dDogc3RyaW5nO1xuICAgIGluaXRpYWxpemVyOiBOb2RlT2JqZWN0LFxuICAgIG5hbWU/OiB7IHRleHQ6IHN0cmluZyB9O1xuICAgIGV4cHJlc3Npb24/OiBOb2RlT2JqZWN0O1xuICAgIGVsZW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIGFyZ3VtZW50cz86IE5vZGVPYmplY3RbXTtcbiAgICBwcm9wZXJ0aWVzPzogYW55W107XG4gICAgcGFyc2VyQ29udGV4dEZsYWdzPzogTnVtYmVyO1xuICAgIGVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4/OiBOb2RlT2JqZWN0W107XG4gICAgcGFyYW1ldGVycz86IE5vZGVPYmplY3RbXTtcbiAgICBDb21wb25lbnQ/OiBzdHJpbmc7XG4gICAgYm9keT86IHtcbiAgICAgICAgcG9zOiBOdW1iZXI7XG4gICAgICAgIGVuZDogTnVtYmVyO1xuICAgICAgICBzdGF0ZW1lbnRzOiBOb2RlT2JqZWN0W107XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgRGVwcyB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgc291cmNlQ29kZT86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcblxuICAgIC8vQ29tcG9uZW50XG5cbiAgICBhbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBzdHJpbmc7XG4gICAgZW5jYXBzdWxhdGlvbj86IHN0cmluZztcbiAgICBlbnRyeUNvbXBvbmVudHM/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBleHBvcnRBcz86IHN0cmluZztcbiAgICBob3N0Pzogc3RyaW5nO1xuICAgIGlucHV0cz86IHN0cmluZ1tdO1xuICAgIGludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBtb2R1bGVJZD86IHN0cmluZztcbiAgICBvdXRwdXRzPzogc3RyaW5nW107XG4gICAgcXVlcmllcz86IERlcHNbXTsgLy8gVE9ET1xuICAgIHNlbGVjdG9yPzogc3RyaW5nO1xuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdO1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIHRlbXBsYXRlPzogc3RyaW5nO1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nW107XG4gICAgdmlld1Byb3ZpZGVycz86IHN0cmluZ1tdO1xuXG4gICAgaW1wbGVtZW50cz87XG4gICAgZXh0ZW5kcz87XG5cbiAgICBpbnB1dHNDbGFzcz86IE9iamVjdFtdO1xuICAgIG91dHB1dHNDbGFzcz86IE9iamVjdFtdO1xuICAgIHByb3BlcnRpZXNDbGFzcz86IE9iamVjdFtdO1xuICAgIG1ldGhvZHNDbGFzcz86IE9iamVjdFtdO1xuXG4gICAgLy9jb21tb25cbiAgICBwcm92aWRlcnM/OiBEZXBzW107XG5cbiAgICAvL21vZHVsZVxuICAgIGRlY2xhcmF0aW9ucz86IERlcHNbXTtcbiAgICBib290c3RyYXA/OiBEZXBzW107XG5cbiAgICBpbXBvcnRzPzogRGVwc1tdO1xuICAgIGV4cG9ydHM/OiBEZXBzW107XG5cbiAgICByb3V0ZXNUcmVlPztcbn1cblxuaW50ZXJmYWNlIFN5bWJvbERlcHMge1xuICAgIGZ1bGw6IHN0cmluZztcbiAgICBhbGlhczogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzIHtcblxuICAgIHByaXZhdGUgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIGVuZ2luZTogYW55O1xuICAgIHByaXZhdGUgX19jYWNoZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSBfX25zTW9kdWxlOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHVua25vd24gPSAnPz8/JztcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihmaWxlczogc3RyaW5nW10sIG9wdGlvbnM6IGFueSkge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zcGlsZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRzLlNjcmlwdFRhcmdldC5FUzUsXG4gICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogb3B0aW9ucy50c2NvbmZpZ0RpcmVjdG9yeVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHRoaXMuZmlsZXMsIHRyYW5zcGlsZU9wdGlvbnMsIGNvbXBpbGVySG9zdCh0cmFuc3BpbGVPcHRpb25zKSk7XG4gICAgICAgIHRoaXMudHlwZUNoZWNrZXIgPSB0aGlzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIGxldCBkZXBzOiBhbnkgPSB7XG4gICAgICAgICAgICAnbW9kdWxlcyc6IFtdLFxuICAgICAgICAgICAgJ21vZHVsZXNGb3JHcmFwaCc6IFtdLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnOiBbXSxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcyc6IFtdLFxuICAgICAgICAgICAgJ3BpcGVzJzogW10sXG4gICAgICAgICAgICAnZGlyZWN0aXZlcyc6IFtdLFxuICAgICAgICAgICAgJ3JvdXRlcyc6IFtdLFxuICAgICAgICAgICAgJ2NsYXNzZXMnOiBbXSxcbiAgICAgICAgICAgICdpbnRlcmZhY2VzJzogW10sXG4gICAgICAgICAgICAnbWlzY2VsbGFuZW91cyc6IHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IFtdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uczogW10sXG4gICAgICAgICAgICAgICAgdHlwZWFsaWFzZXM6IFtdLFxuICAgICAgICAgICAgICAgIGVudW1lcmF0aW9uczogW10sXG4gICAgICAgICAgICAgICAgdHlwZXM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHNvdXJjZUZpbGVzID0gdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkgfHwgW107XG5cbiAgICAgICAgc291cmNlRmlsZXMubWFwKChmaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IGZpbGUuZmlsZU5hbWU7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLnRzJykge1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuZC50cycpID09PSAtMSAmJiBmaWxlUGF0aC5sYXN0SW5kZXhPZignc3BlYy50cycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygncGFyc2luZycsIGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VGaWxlRGVjb3JhdG9ycyhmaWxlLCBkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUsIGZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkZXBzO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEVuZCBvZiBmaWxlIHNjYW5uaW5nXG4gICAgICAgIC8vIFRyeSBtZXJnaW5nIGluc2lkZSB0aGUgc2FtZSBmaWxlIGRlY2xhcmF0ZWQgdmFyaWFibGVzICYgbW9kdWxlcyB3aXRoIGltcG9ydHMgfCBleHBvcnRzIHwgZGVjbGFyYXRpb25zIHwgcHJvdmlkZXJzXG5cbiAgICAgICAgaWYgKGRlcHNbJ21pc2NlbGxhbmVvdXMnXS52YXJpYWJsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZGVwc1snbWlzY2VsbGFuZW91cyddLnZhcmlhYmxlcy5mb3JFYWNoKF92YXJpYWJsZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1ZhciA9IFtdO1xuICAgICAgICAgICAgICAgICgoX3ZhciwgX25ld1ZhcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBnZXRUeXBlIHByIHJlY29uc3RydWlyZS4uLi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF92YXIuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdmFyLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF92YXIuaW5pdGlhbGl6ZXIuZWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdmFyLmluaXRpYWxpemVyLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdWYXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVsZW1lbnQudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlKGVsZW1lbnQudGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KShfdmFyaWFibGUsIG5ld1Zhcik7XG5cbiAgICAgICAgICAgICAgICBsZXQgb25MaW5rID0gKG1vZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobW9kLmZpbGUgPT09IF92YXJpYWJsZS5maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJvY2VzcyA9IChpbml0aWFsQXJyYXksIF92YXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXhUb0NsZWFuID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluZFZhcmlhYmxlSW5BcnJheSA9IChlbCwgaW5kZXgsIHRoZUFycmF5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbC5uYW1lID09PSBfdmFyLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4VG9DbGVhbiA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxBcnJheS5mb3JFYWNoKGZpbmRWYXJpYWJsZUluQXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFuIGluZGV4ZXMgdG8gcmVwbGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQXJyYXkuc3BsaWNlKGluZGV4VG9DbGVhbiwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB2YXJpYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdWYXIuZm9yRWFjaCgobmV3RWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIF8uZmluZChpbml0aWFsQXJyYXksIHsgJ25hbWUnOiBuZXdFbGUubmFtZX0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxBcnJheS5wdXNoKG5ld0VsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MobW9kLmltcG9ydHMsIF92YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzKG1vZC5leHBvcnRzLCBfdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcyhtb2QuZGVjbGFyYXRpb25zLCBfdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcyhtb2QucHJvdmlkZXJzLCBfdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwc1snbW9kdWxlcyddLmZvckVhY2gob25MaW5rKTtcbiAgICAgICAgICAgICAgICBkZXBzWydtb2R1bGVzRm9yR3JhcGgnXS5mb3JFYWNoKG9uTGluayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLnByaW50TW9kdWxlc1JvdXRlcygpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5wcmludFJvdXRlcygpO1xuXG4gICAgICAgIC8qaWYgKFJvdXRlclBhcnNlci5pbmNvbXBsZXRlUm91dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmIChkZXBzWydtaXNjZWxsYW5lb3VzJ11bJ3ZhcmlhYmxlcyddLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuZml4SW5jb21wbGV0ZVJvdXRlcyhkZXBzWydtaXNjZWxsYW5lb3VzJ11bJ3ZhcmlhYmxlcyddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSovXG5cbiAgICAgICAgLy8kY29tcG9uZW50c1RyZWVFbmdpbmUuY3JlYXRlVHJlZXNGb3JDb21wb25lbnRzKCk7XG5cbiAgICAgICAgUm91dGVyUGFyc2VyLmxpbmtNb2R1bGVzQW5kUm91dGVzKCk7XG4gICAgICAgIFJvdXRlclBhcnNlci5jb25zdHJ1Y3RNb2R1bGVzVHJlZSgpO1xuXG4gICAgICAgIGRlcHMucm91dGVzVHJlZSA9IFJvdXRlclBhcnNlci5jb25zdHJ1Y3RSb3V0ZXNUcmVlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRlcHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTb3VyY2VGaWxlRGVjb3JhdG9ycyhzcmNGaWxlOiB0cy5Tb3VyY2VGaWxlLCBvdXRwdXRTeW1ib2xzOiBPYmplY3QpOiB2b2lkIHtcblxuICAgICAgICBsZXQgY2xlYW5lciA9IChwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXApLnJlcGxhY2UoL1xcXFwvZywgJy8nKSxcbiAgICAgICAgICAgIGZpbGUgPSBzcmNGaWxlLmZpbGVOYW1lLnJlcGxhY2UoY2xlYW5lciwgJycpO1xuXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChzcmNGaWxlLCAobm9kZTogdHMuTm9kZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZGVwczogRGVwcyA9IDxEZXBzPnt9O1xuICAgICAgICAgICAgaWYgKG5vZGUuZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGxldCB2aXNpdE5vZGUgPSAodmlzaXRlZE5vZGUsIGluZGV4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gbm9kZS5kZWNvcmF0b3JzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wcyA9IHRoaXMuZmluZFByb3BzKHZpc2l0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzcmNGaWxlLCBub2RlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc01vZHVsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ21vZHVsZS0nICsgbmFtZSArICctJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHRoaXMuZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0czogdGhpcy5nZXRNb2R1bGVJbXBvcnRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzOiB0aGlzLmdldE1vZHVsZUV4cG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb3RzdHJhcDogdGhpcy5nZXRNb2R1bGVCb290c3RyYXAocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChSb3V0ZXJQYXJzZXIuaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzKGRlcHMuaW1wb3J0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlV2l0aFJvdXRlcyhuYW1lLCB0aGlzLmdldE1vZHVsZUltcG9ydHNSYXcocHJvcHMpLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRNb2R1bGUobmFtZSwgZGVwcy5pbXBvcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21vZHVsZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbW9kdWxlc0ZvckdyYXBoJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzQ29tcG9uZW50KG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChwcm9wcywgeyBzaG93SGlkZGVuOiB0cnVlLCBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29tcG9uZW50LScgKyBuYW1lICsgJy0nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiB0aGlzLmdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jYXBzdWxhdGlvbjogdGhpcy5nZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VudHJ5Q29tcG9uZW50cz86IHN0cmluZzsgLy8gVE9ETyB3YWl0aW5nIGRvYyBpbmZvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiB0aGlzLmdldENvbXBvbmVudEV4cG9ydEFzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0OiB0aGlzLmdldENvbXBvbmVudEhvc3QocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogdGhpcy5nZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSWQ6IHRoaXMuZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHRoaXMuZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9xdWVyaWVzPzogRGVwc1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHRoaXMuZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlVXJsczogdGhpcy5nZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogdGhpcy5nZXRDb21wb25lbnRTdHlsZXMocHJvcHMpLCAvLyBUT0RPIGZpeCBhcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0aGlzLmdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNDbGFzczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzQ2xhc3M6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YW1wbGVVcmxzOiBfdGhpcy5nZXRDb21wb25lbnRFeGFtcGxlVXJscyhzcmNGaWxlLmdldFRleHQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHNDbGFzcyA9IGNsZWFuTGlmZWN5Y2xlSG9va3NGcm9tTWV0aG9kcyhkZXBzLm1ldGhvZHNDbGFzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSU8uanNkb2N0YWdzICYmIElPLmpzZG9jdGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5qc2RvY3RhZ3MgPSBJTy5qc2RvY3RhZ3NbMF0udGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoSU8uY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmNvbnN0cnVjdG9yT2JqID0gSU8uY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSU8uZXh0ZW5kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZXh0ZW5kcyA9IElPLmV4dGVuZHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSU8uaW1wbGVtZW50cyAmJiBJTy5pbXBsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmltcGxlbWVudHMgPSBJTy5pbXBsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBvbmVudHNUcmVlRW5naW5lLmFkZENvbXBvbmVudChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NvbXBvbmVudHMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNJbmplY3RhYmxlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnaW5qZWN0YWJsZS0nICsgbmFtZSArICctJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBJTy5tZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKElPLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW5qZWN0YWJsZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNQaXBlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncGlwZS0nICsgbmFtZSArICctJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKElPLmpzZG9jdGFncyAmJiBJTy5qc2RvY3RhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuanNkb2N0YWdzID0gSU8uanNkb2N0YWdzWzBdLnRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3BpcGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzRGlyZWN0aXZlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkaXJlY3RpdmUtJyArIG5hbWUgKyAnLScgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLmdldENvbXBvbmVudFNlbGVjdG9yKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFtcGxlVXJsczogX3RoaXMuZ2V0Q29tcG9uZW50RXhhbXBsZVVybHMoc3JjRmlsZS5nZXRUZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKElPLmpzZG9jdGFncyAmJiBJTy5qc2RvY3RhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuanNkb2N0YWdzID0gSU8uanNkb2N0YWdzWzBdLnRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5pbXBsZW1lbnRzICYmIElPLmltcGxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuY29uc3RydWN0b3JPYmogPSBJTy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2RpcmVjdGl2ZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fY2FjaGVbbmFtZV0gPSBkZXBzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBmaWx0ZXJCeURlY29yYXRvcnMgPSAobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uICYmIG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLyhOZ01vZHVsZXxDb21wb25lbnR8SW5qZWN0YWJsZXxQaXBlfERpcmVjdGl2ZSkvLnRlc3Qobm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIG5vZGUuZGVjb3JhdG9yc1xuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGZpbHRlckJ5RGVjb3JhdG9ycylcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2godmlzaXROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5zeW1ib2wuZmxhZ3MgPT09IHRzLlN5bWJvbEZsYWdzLkNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDbGFzc0lPKGZpbGUsIHNyY0ZpbGUsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY2xhc3MtJyArIG5hbWUgKyAnLScgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSBJTy5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChJTy5leHRlbmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmV4dGVuZHMgPSBJTy5leHRlbmRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChJTy5pbXBsZW1lbnRzICYmIElPLmltcGxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5pbXBsZW1lbnRzID0gSU8uaW1wbGVtZW50cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobm9kZS5zeW1ib2wuZmxhZ3MgPT09IHRzLlN5bWJvbEZsYWdzLkludGVyZmFjZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0SW50ZXJmYWNlSU8oZmlsZSwgc3JjRmlsZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdpbnRlcmZhY2UtJyArIG5hbWUgKyAnLScgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5pbmRleFNpZ25hdHVyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW5kZXhTaWduYXR1cmVzID0gSU8uaW5kZXhTaWduYXR1cmVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMua2luZCA9IElPLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSBJTy5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2ludGVyZmFjZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdEZ1bmN0aW9uRGVjbGFyYXRpb24obm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzID0gdGhpcy52aXNpdEZ1bmN0aW9uRGVjbGFyYXRpb25KU0RvY1RhZ3Mobm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gaW5mb3MubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudmlzaXRFbnVtQW5kRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuYXJncyA9IGluZm9zLmFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ3MgJiYgdGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmpzZG9jdGFncyA9IHRhZ3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbWlzY2VsbGFuZW91cyddLmZ1bmN0aW9ucy5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkVudW1EZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkczogaW5mb3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy52aXNpdEVudW1BbmRGdW5jdGlvbkRlY2xhcmF0aW9uRGVzY3JpcHRpb24obm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbWlzY2VsbGFuZW91cyddLmVudW1lcmF0aW9ucy5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRSb3V0ZUlPKGZpbGUsIHNyY0ZpbGUpO1xuICAgICAgICAgICAgICAgIGlmKElPLnJvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Um91dGVzO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um91dGVzID0gUm91dGVyUGFyc2VyLmNsZWFuUmF3Um91dGVQYXJzZWQoSU8ucm91dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdSb3V0ZXMgcGFyc2luZyBlcnJvciwgbWF5YmUgYSB0cmFpbGluZyBjb21tYSBvciBhbiBleHRlcm5hbCB2YXJpYWJsZSwgdHJ5aW5nIHRvIGZpeCB0aGF0IGxhdGVyIGFmdGVyIHNvdXJjZXMgc2Nhbm5pbmcuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3V0ZXMgPSBJTy5yb3V0ZXMucmVwbGFjZSgvIC9nbSwgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkSW5jb21wbGV0ZVJvdXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBuZXdSb3V0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSA9IFsuLi5vdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSwgLi4ubmV3Um91dGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDbGFzc0lPKGZpbGUsIHNyY0ZpbGUsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY2xhc3MtJyArIG5hbWUgKyAnLScgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uaW5kZXhTaWduYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmluZGV4U2lnbmF0dXJlcyA9IElPLmluZGV4U2lnbmF0dXJlcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IElPLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKElPLmV4dGVuZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZXh0ZW5kcyA9IElPLmV4dGVuZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKElPLmltcGxlbWVudHMgJiYgSU8uaW1wbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmltcGxlbWVudHMgPSBJTy5pbXBsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NsYXNzZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvb3RzdHJhcE1vZHVsZVJlZmVyZW5jZSA9ICdib290c3RyYXBNb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgdGhlIHJvb3QgbW9kdWxlIHdpdGggYm9vdHN0cmFwTW9kdWxlIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgLy8xLiBmaW5kIGEgc2ltcGxlIGNhbGwgOiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vMi4gb3IgaW5zaWRlIGEgY2FsbCA6XG4gICAgICAgICAgICAgICAgICAgIC8vICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vMy4gd2l0aCBhIGNhdGNoIDogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgLy80LiB3aXRoIHBhcmFtZXRlcnMgOiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSwge30pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgLy9GaW5kIHJlY3VzaXZlbHkgaW4gZXhwcmVzc2lvbiBub2RlcyBvbmUgd2l0aCBuYW1lICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgICAgICAgICAgICAgIGxldCByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNyY0ZpbGUudGV4dC5pbmRleE9mKGJvb3RzdHJhcE1vZHVsZVJlZmVyZW5jZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IHRoaXMuZmluZEV4cHJlc3Npb25CeU5hbWVJbkV4cHJlc3Npb25zKG5vZGUuZXhwcmVzc2lvbiwgJ2Jvb3RzdHJhcE1vZHVsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24uYXJndW1lbnRzICYmIG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbkFyZ3VtZW50cyhub2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLCAnYm9vdHN0cmFwTW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzdWx0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUuYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3VsdE5vZGUuYXJndW1lbnRzLCBmdW5jdGlvbihhcmd1bWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJndW1lbnQudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBhcmd1bWVudC50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLnNldFJvb3RNb2R1bGUocm9vdE1vZHVsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQgJiYgIXRoaXMuaXNWYXJpYWJsZVJvdXRlcyhub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBpbmZvcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXBzLnR5cGUgPSAoaW5mb3MudHlwZSkgPyBpbmZvcy50eXBlIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcy5kZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVmYXVsdFZhbHVlID0gaW5mb3MuZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcy5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5pbml0aWFsaXplciA9IGluZm9zLmluaXRpYWxpemVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmpzRG9jICYmIG5vZGUuanNEb2MubGVuZ3RoID4gMCAmJiBub2RlLmpzRG9jWzBdLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSBtYXJrZWQobm9kZS5qc0RvY1swXS5jb21tZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtaXNjZWxsYW5lb3VzJ10udmFyaWFibGVzLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHlwZUFsaWFzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdFR5cGVEZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBpbmZvcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtaXNjZWxsYW5lb3VzJ10udHlwZXMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGluZm9zLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnZpc2l0RW51bUFuZEZ1bmN0aW9uRGVjbGFyYXRpb25EZXNjcmlwdGlvbihub2RlKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcy5hcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmFyZ3MgPSBpbmZvcy5hcmdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS5mdW5jdGlvbnMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHM6IGluZm9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudmlzaXRFbnVtQW5kRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS5lbnVtZXJhdGlvbnMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9XG4gICAgcHJpdmF0ZSBkZWJ1ZyhkZXBzOiBEZXBzKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnZm91bmQnLCBgJHtkZXBzLm5hbWV9YCk7XG4gICAgICAgIFtcbiAgICAgICAgICAgICdpbXBvcnRzJywgJ2V4cG9ydHMnLCAnZGVjbGFyYXRpb25zJywgJ3Byb3ZpZGVycycsICdib290c3RyYXAnXG4gICAgICAgIF0uZm9yRWFjaChzeW1ib2xzID0+IHtcbiAgICAgICAgICAgIGlmIChkZXBzW3N5bWJvbHNdICYmIGRlcHNbc3ltYm9sc10ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYC0gJHtzeW1ib2xzfTpgKTtcbiAgICAgICAgICAgICAgICBkZXBzW3N5bWJvbHNdLm1hcChpID0+IGkubmFtZSkuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCcnLCBgXFx0LSAke2R9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhcmlhYmxlUm91dGVzKG5vZGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICBpZiggbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zICkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlLnR5cGVOYW1lICYmIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlLnR5cGVOYW1lLnRleHQgPT09ICdSb3V0ZXMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbnMoZW50cnlOb2RlLCBuYW1lKSB7XG4gICAgICAgIGxldCByZXN1bHQsXG4gICAgICAgICAgICBsb29wID0gZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiAhbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcChub2RlLmV4cHJlc3Npb24sIG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uLm5hbWUudGV4dCA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3Aobm9kZS5leHByZXNzaW9uLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgbG9vcChlbnRyeU5vZGUsIG5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZEV4cHJlc3Npb25CeU5hbWVJbkV4cHJlc3Npb25Bcmd1bWVudHMoYXJnLCBuYW1lKSB7XG4gICAgICAgIGxldCByZXN1bHQsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gYXJnLmxlbmd0aCxcbiAgICAgICAgICAgIGxvb3AgPSBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5ib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmJvZHkuc3RhdGVtZW50cyAmJiBub2RlLmJvZHkuc3RhdGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZyA9IG5vZGUuYm9keS5zdGF0ZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoajsgajxsZW5nOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGF0LmZpbmRFeHByZXNzaW9uQnlOYW1lSW5FeHByZXNzaW9ucyhub2RlLmJvZHkuc3RhdGVtZW50c1tqXSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBsb29wKGFyZ1tpXSwgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlRGVjb3JhdG9ycyhkZWNvcmF0b3JzLCB0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICBpZiAoZGVjb3JhdG9ycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBfLmZvckVhY2goZGVjb3JhdG9ycywgZnVuY3Rpb24oZGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRlY29yYXRvcnNbMF0uZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvcnNbMF0uZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzQ29tcG9uZW50KG1ldGFkYXRhcykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnQ29tcG9uZW50Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1BpcGUobWV0YWRhdGFzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdQaXBlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0RpcmVjdGl2ZShtZXRhZGF0YXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWNvcmF0b3JzKG1ldGFkYXRhcywgJ0RpcmVjdGl2ZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJbmplY3RhYmxlKG1ldGFkYXRhcykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnSW5qZWN0YWJsZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNNb2R1bGUobWV0YWRhdGFzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdOZ01vZHVsZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VHlwZShuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlO1xuICAgICAgICBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2NvbXBvbmVudCcpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnY29tcG9uZW50JztcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZigncGlwZScpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAncGlwZSc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ21vZHVsZScpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnbW9kdWxlJztcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignZGlyZWN0aXZlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdkaXJlY3RpdmUnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0eXBlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sZU5hbWUobm9kZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFNlbGVjdG9yKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc2VsZWN0b3InKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEV4cG9ydEFzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZXhwb3J0QXMnKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZVByb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3Byb3ZpZGVycycpLm1hcCgocHJvdmlkZXJOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihwcm92aWRlck5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRQcm9wcyh2aXNpdGVkTm9kZSkge1xuICAgICAgICBpZih2aXNpdGVkTm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRlZE5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMucG9wKCkucHJvcGVydGllcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2RlY2xhcmF0aW9ucycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNvbXBvbmVudCA9IHRoaXMuZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWUpO1xuXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlSW1wb3J0c1Jhdyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwc1Jhdyhwcm9wcywgJ2ltcG9ydHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUltcG9ydHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdpbXBvcnRzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVFeHBvcnRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZXhwb3J0cycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50SG9zdChwcm9wczogTm9kZU9iamVjdFtdKTogT2JqZWN0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwc09iamVjdChwcm9wcywgJ2hvc3QnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUJvb3RzdHJhcChwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2Jvb3RzdHJhcCcpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50SW5wdXRzTWV0YWRhdGEocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2lucHV0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RGVjb3JhdG9yT2ZUeXBlKG5vZGUsIGRlY29yYXRvclR5cGUpIHtcbiAgICAgIHZhciBkZWNvcmF0b3JzID0gbm9kZS5kZWNvcmF0b3JzIHx8IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlY29yYXRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoZGVjb3JhdG9yc1tpXS5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgaWYgKGRlY29yYXRvcnNbaV0uZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09IGRlY29yYXRvclR5cGUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JzW2ldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0SW5wdXQocHJvcGVydHksIGluRGVjb3JhdG9yLCBzb3VyY2VGaWxlPykge1xuICAgICAgICB2YXIgaW5BcmdzID0gaW5EZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHMsXG4gICAgICAgICAgICBfcmV0dXJuID0ge307XG4gICAgICAgIF9yZXR1cm4ubmFtZSA9IChpbkFyZ3MubGVuZ3RoID4gMCkgPyBpbkFyZ3NbMF0udGV4dCA6IHByb3BlcnR5Lm5hbWUudGV4dDtcbiAgICAgICAgX3JldHVybi5kZWZhdWx0VmFsdWUgPSBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByb3BlcnR5LnN5bWJvbCkge1xuICAgICAgICAgICAgX3JldHVybi5kZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX3JldHVybi5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5LmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmpzRG9jLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0eS5qc0RvY1swXS5jb21tZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybi5kZXNjcmlwdGlvbiA9IG1hcmtlZChwcm9wZXJ0eS5qc0RvY1swXS5jb21tZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfcmV0dXJuLmxpbmUgPSB0aGlzLmdldFBvc2l0aW9uKHByb3BlcnR5LCBzb3VyY2VGaWxlKS5saW5lICsgMTtcbiAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUpIHtcbiAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGhhbmRsZSBOZXdFeHByZXNzaW9uXG4gICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5OZXdFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuLnR5cGUgPSBwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFR5cGUobm9kZSkge1xuICAgICAgICBsZXQgX3JldHVybiA9ICd2b2lkJztcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgX3JldHVybiA9IG5vZGUudHlwZU5hbWUudGV4dDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZS5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gPSBraW5kVG9UeXBlKG5vZGUudHlwZS5raW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZS50eXBlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuID0gbm9kZS50eXBlLnR5cGVOYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUudHlwZUFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9ICc8JztcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcmd1bWVudCBvZiBub2RlLnR5cGUudHlwZUFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50LmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9IGtpbmRUb1R5cGUoYXJndW1lbnQua2luZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnQudHlwZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9IGFyZ3VtZW50LnR5cGVOYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSAnPic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmVsZW1lbnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgX3JldHVybiA9IGtpbmRUb1R5cGUobm9kZS5lbGVtZW50VHlwZS5raW5kKSArIGtpbmRUb1R5cGUobm9kZS5raW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlcyAmJiBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVW5pb25UeXBlKSB7XG4gICAgICAgICAgICAgICAgX3JldHVybiA9ICcnO1xuICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgbGVuID0gbm9kZS50eXBlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0ga2luZFRvVHlwZShub2RlLnR5cGVzW2ldLmtpbmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaTxsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSAnfCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZG90RG90RG90VG9rZW4pIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0gJ2FueVtdJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3JldHVybiA9IGtpbmRUb1R5cGUobm9kZS5raW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlLnR5cGVBcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuICs9ICc8JztcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFyZ3VtZW50IG9mIG5vZGUudHlwZUFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9IGtpbmRUb1R5cGUoYXJndW1lbnQua2luZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0gJz4nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmV0dXJuO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRPdXRwdXQocHJvcGVydHksIG91dERlY29yYXRvciwgc291cmNlRmlsZT8pIHtcbiAgICAgICAgdmFyIGluQXJncyA9IG91dERlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cyxcbiAgICAgICAgICAgIF9yZXR1cm4gPSB7fTtcbiAgICAgICAgX3JldHVybi5uYW1lID0gKGluQXJncy5sZW5ndGggPiAwKSA/IGluQXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0O1xuICAgICAgICBfcmV0dXJuLmRlZmF1bHRWYWx1ZSA9IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAocHJvcGVydHkuc3ltYm9sKSB7XG4gICAgICAgICAgICBfcmV0dXJuLmRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHByb3BlcnR5LnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9yZXR1cm4uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5qc0RvYykge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5qc0RvYy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkuanNEb2NbMF0uY29tbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4uZGVzY3JpcHRpb24gPSBtYXJrZWQocHJvcGVydHkuanNEb2NbMF0uY29tbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX3JldHVybi5saW5lID0gdGhpcy5nZXRQb3NpdGlvbihwcm9wZXJ0eSwgc291cmNlRmlsZSkubGluZSArIDE7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUpIHtcbiAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGhhbmRsZSBOZXdFeHByZXNzaW9uXG4gICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5OZXdFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuLnR5cGUgPSBwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1B1YmxpYyhtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHVibGljOiBib29sZWFuID0gbWVtYmVyLm1vZGlmaWVycy5zb21lKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzUHVibGljKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUHJpdmF0ZShtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJpdmF0ZTogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkKTtcbiAgICAgICAgICAgIGlmIChpc1ByaXZhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc0hpZGRlbk1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJbnRlcm5hbChtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaW50ZXJuYWwnXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSGlkZGVuTWVtYmVyKG1lbWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpbnRlcm5hbFRhZ3M6IHN0cmluZ1tdID0gWydoaWRkZW4nXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWV0aG9kTmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTID0gW1xuICAgICAgICAgICAgJ25nT25Jbml0JywgJ25nT25DaGFuZ2VzJywgJ25nRG9DaGVjaycsICduZ09uRGVzdHJveScsICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJyxcbiAgICAgICAgICAgICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJywgJ3dyaXRlVmFsdWUnLCAncmVnaXN0ZXJPbkNoYW5nZScsICdyZWdpc3Rlck9uVG91Y2hlZCcsICdzZXREaXNhYmxlZFN0YXRlJ1xuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUy5pbmRleE9mKG1ldGhvZE5hbWUpID49IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlPykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgbmFtZTogJ2NvbnN0cnVjdG9yJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3MobWV0aG9kKSxcblxuXG5cbiAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVyS2luZCA9IG1ldGhvZC5tb2RpZmllcnNbMF0ua2luZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yUHJvcGVydGllcyhtZXRob2QpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAobWV0aG9kLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIHZhciBfcGFyYW1ldGVycyA9IFtdLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG1ldGhvZC5wYXJhbWV0ZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5pc1B1YmxpYyhtZXRob2QucGFyYW1ldGVyc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3BhcmFtZXRlcnMucHVzaCh0aGF0LnZpc2l0QXJndW1lbnQobWV0aG9kLnBhcmFtZXRlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3BhcmFtZXRlcnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q2FsbERlY2xhcmF0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSksXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfSxcbiAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyhtZXRob2QpO1xuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEluZGV4RGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlPykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSksXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb24obm9kZSwgc291cmNlRmlsZSk6IHRzLkxpbmVBbmRDaGFyYWN0ZXIge1xuICAgICAgICB2YXIgcG9zaXRpb246dHMuTGluZUFuZENoYXJhY3RlcjtcbiAgICAgICAgaWYgKG5vZGVbJ25hbWUnXSAmJiBub2RlWyduYW1lJ10uZW5kKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNvdXJjZUZpbGUsIG5vZGVbJ25hbWUnXS5lbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBub2RlLnBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRNZXRob2REZWNsYXJhdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IG1ldGhvZC5uYW1lLnRleHQsXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpLFxuICAgICAgICAgICAgbGluZTogdGhpcy5nZXRQb3NpdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpLmxpbmUgKyAxXG4gICAgICAgIH0sXG4gICAgICAgICAgICBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKG1ldGhvZCk7XG5cbiAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QuZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgcmVzdWx0LmRlY29yYXRvcnMgPSB0aGlzLmZvcm1hdERlY29yYXRvcnMobWV0aG9kLmRlY29yYXRvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZXJLaW5kID0gbWV0aG9kLm1vZGlmaWVyc1swXS5raW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0QXJndW1lbnQoYXJnKSB7XG4gICAgICAgIGxldCBfcmVzdWx0ID0ge1xuICAgICAgICAgICAgbmFtZTogYXJnLm5hbWUudGV4dCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKGFyZylcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJnLmRvdERvdERvdFRva2VuKSB7XG4gICAgICAgICAgICBfcmVzdWx0LmRvdERvdERvdFRva2VuID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmcudHlwZSkge1xuICAgICAgICAgICAgaWYgKGFyZy50eXBlLmtpbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJnLnR5cGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5GdW5jdGlvblR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5mdW5jdGlvbiA9IGFyZy50eXBlLnBhcmFtZXRlcnMgPyBhcmcudHlwZS5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5hbWVzQ29tcGFyZUZuKG5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJ25hbWUnO1xuICAgICAgICB2YXIgdCA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZiAoYVtuYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhW25hbWVdLmxvY2FsZUNvbXBhcmUoYltuYW1lXSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZhbHNlJztcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZvcm1hdERlY29yYXRvcnMoZGVjb3JhdG9ycykge1xuICAgICAgICBsZXQgX2RlY29yYXRvcnMgPSBbXTtcblxuICAgICAgICBfLmZvckVhY2goZGVjb3JhdG9ycywgKGRlY29yYXRvcikgPT4ge1xuICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2RlY29yYXRvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBkZWNvcmF0b3IuZXhwcmVzc2lvbi50ZXh0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmFyZ3MgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfZGVjb3JhdG9ycy5wdXNoKGluZm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIF9kZWNvcmF0b3JzO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRQcm9wZXJ0eShwcm9wZXJ0eSwgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICBuYW1lOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShwcm9wZXJ0eSksXG4gICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgIGxpbmU6IHRoaXMuZ2V0UG9zaXRpb24ocHJvcGVydHksIHNvdXJjZUZpbGUpLmxpbmUgKyAxXG4gICAgICAgICB9LFxuICAgICAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyhwcm9wZXJ0eSk7XG5cbiAgICAgICAgIGlmIChwcm9wZXJ0eS5zeW1ib2wpIHtcbiAgICAgICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHByb3BlcnR5LmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICByZXN1bHQuZGVjb3JhdG9ycyA9IHRoaXMuZm9ybWF0RGVjb3JhdG9ycyhwcm9wZXJ0eS5kZWNvcmF0b3JzKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVycykge1xuICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZXJLaW5kID0gcHJvcGVydHkubW9kaWZpZXJzWzBdLmtpbmQ7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE1lbWJlcnMobWVtYmVycywgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5wdXRzID0gW10sXG4gICAgICAgICAgICBvdXRwdXRzID0gW10sXG4gICAgICAgICAgICBtZXRob2RzID0gW10sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0gW10sXG4gICAgICAgICAgICBpbmRleFNpZ25hdHVyZXMgPSBbXSxcbiAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICBpbnB1dERlY29yYXRvcixcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgb3V0RGVjb3JhdG9yO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVtYmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW5wdXREZWNvcmF0b3IgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnSW5wdXQnKTtcbiAgICAgICAgICAgIG91dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdPdXRwdXQnKTtcblxuICAgICAgICAgICAga2luZCA9IG1lbWJlcnNbaV0ua2luZDtcblxuICAgICAgICAgICAgaWYgKGlucHV0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRzLnB1c2godGhpcy52aXNpdElucHV0KG1lbWJlcnNbaV0sIGlucHV0RGVjb3JhdG9yLCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dERlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaCh0aGlzLnZpc2l0T3V0cHV0KG1lbWJlcnNbaV0sIG91dERlY29yYXRvciwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0hpZGRlbk1lbWJlcihtZW1iZXJzW2ldKSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCAodGhpcy5pc1ByaXZhdGUobWVtYmVyc1tpXSkgfHwgdGhpcy5pc0ludGVybmFsKG1lbWJlcnNbaV0pKSAmJiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCkge30gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kU2lnbmF0dXJlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wdXNoKHRoaXMudmlzaXRNZXRob2REZWNsYXJhdGlvbihtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5U2lnbmF0dXJlIHx8IG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5HZXRBY2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRQcm9wZXJ0eShtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0Q2FsbERlY2xhcmF0aW9uKG1lbWJlcnNbaV0sIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW5kZXhTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlcy5wdXNoKHRoaXMudmlzaXRJbmRleERlY2xhcmF0aW9uKG1lbWJlcnNbaV0sIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfY29uc3RydWN0b3JQcm9wZXJ0aWVzID0gdGhpcy52aXNpdENvbnN0cnVjdG9yUHJvcGVydGllcyhtZW1iZXJzW2ldKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW4gPSBfY29uc3RydWN0b3JQcm9wZXJ0aWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihqOyBqPGxlbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKF9jb25zdHJ1Y3RvclByb3BlcnRpZXNbal0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSB0aGlzLnZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbihtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0cy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIG91dHB1dHMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuICAgICAgICBwcm9wZXJ0aWVzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgaW5kZXhTaWduYXR1cmVzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5wdXRzLFxuICAgICAgICAgICAgb3V0cHV0cyxcbiAgICAgICAgICAgIG1ldGhvZHMsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzLFxuICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdERpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICB2YXIgZXhwb3J0QXM7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcHJvcGVydGllcyA9IGRlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50c1swXS5wcm9wZXJ0aWVzO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lLnRleHQgPT09ICdzZWxlY3RvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG9ubHkgd29yayBpZiBzZWxlY3RvciBpcyBpbml0aWFsaXplZCBhcyBhIHN0cmluZyBsaXRlcmFsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lLnRleHQgPT09ICdleHBvcnRBcycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG9ubHkgd29yayBpZiBzZWxlY3RvciBpcyBpbml0aWFsaXplZCBhcyBhIHN0cmluZyBsaXRlcmFsXG4gICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgIGV4cG9ydEFzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1BpcGVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIHJldHVybiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikgPyBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJyA6IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNNb2R1bGVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIHJldHVybiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikgPyBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdOZ01vZHVsZScgOiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgdmFyIGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0O1xuICAgICAgICAgICAgcmV0dXJuIGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID09PSAnRGlyZWN0aXZlJyB8fCBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0NvbXBvbmVudCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlzU2VydmljZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSA/IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0luamVjdGFibGUnIDogZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZU5hbWUsIGNsYXNzRGVjbGFyYXRpb24sIHNvdXJjZUZpbGU/KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBzeW1ib2wgPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oY2xhc3NEZWNsYXJhdGlvbi5uYW1lKTtcbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgIGlmIChzeW1ib2wpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzRGVjbGFyYXRpb24ubmFtZS50ZXh0O1xuICAgICAgICB2YXIgZGlyZWN0aXZlSW5mbztcbiAgICAgICAgdmFyIG1lbWJlcnM7XG4gICAgICAgIHZhciBpbXBsZW1lbnRzRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdmFyIGV4dGVuZHNFbGVtZW50O1xuICAgICAgICB2YXIganNkb2N0YWdzID0gW107XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0cy5nZXRDbGFzc0ltcGxlbWVudHNIZXJpdGFnZUNsYXVzZUVsZW1lbnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFyIGltcGxlbWVudGVkVHlwZXMgPSB0cy5nZXRDbGFzc0ltcGxlbWVudHNIZXJpdGFnZUNsYXVzZUVsZW1lbnRzKGNsYXNzRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgaWYgKGltcGxlbWVudGVkVHlwZXMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGxlbiA9IGltcGxlbWVudGVkVHlwZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsZW1lbnRlZFR5cGVzW2ldLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcGxlbWVudHNFbGVtZW50cy5wdXNoKGltcGxlbWVudGVkVHlwZXNbaV0uZXhwcmVzc2lvbi50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdHMuZ2V0Q2xhc3NFeHRlbmRzSGVyaXRhZ2VDbGF1c2VFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFyIGV4dGVuZHNUeXBlcyA9IHRzLmdldENsYXNzRXh0ZW5kc0hlcml0YWdlQ2xhdXNlRWxlbWVudChjbGFzc0RlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGlmIChleHRlbmRzVHlwZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kc1R5cGVzLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kc0VsZW1lbnQgPSBleHRlbmRzVHlwZXMuZXhwcmVzc2lvbi50ZXh0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN5bWJvbCkge1xuICAgICAgICAgICAgaWYgKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyhzeW1ib2wudmFsdWVEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5mbyA9IHRoaXMudmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogbWVtYmVycy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBtZW1iZXJzLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXM6IG1lbWJlcnMuaW5kZXhTaWduYXR1cmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc2RvY3RhZ3M6IGpzZG9jdGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c0VsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU2VydmljZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXM6IG1lbWJlcnMuaW5kZXhTaWduYXR1cmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkgfHwgdGhpcy5pc01vZHVsZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzZG9jdGFnczoganNkb2N0YWdzXG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2N1c3RvbSBkZWNvcmF0b3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzOiBtZW1iZXJzLmluZGV4U2lnbmF0dXJlcyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBtZW1iZXJzLmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxuICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzLCBzb3VyY2VGaWxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlczogbWVtYmVycy5pbmRleFNpZ25hdHVyZXMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZCxcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcjogbWVtYmVycy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcbiAgICAgICAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzRWxlbWVudHNcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRUeXBlRGVjbGFyYXRpb24odHlwZSkge1xuICAgICAgICB2YXIgcmVzdWx0OmFueSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiB0eXBlLm5hbWUudGV4dFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3ModHlwZSk7XG5cbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICBsZXQgbWFwVHlwZXMgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDk0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ051bGwnO1xuICAgICAgICAgICAgICAgIGNhc2UgMTE4OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0FueSc7XG4gICAgICAgICAgICAgICAgY2FzZSAxMjE6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnQm9vbGVhbic7XG4gICAgICAgICAgICAgICAgY2FzZSAxMjk6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnTmV2ZXInO1xuICAgICAgICAgICAgICAgIGNhc2UgMTMyOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ051bWJlcic7XG4gICAgICAgICAgICAgICAgY2FzZSAxMzQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICAgICAgICAgICAgICBjYXNlIDEzNzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdVbmRlZmluZWQnO1xuICAgICAgICAgICAgICAgIGNhc2UgMTU3OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1R5cGVSZWZlcmVuY2UnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCB2aXNpdEFyZ3VtZW50ID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0OiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogYXJnLm5hbWUudGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChhcmcudHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50eXBlID0gbWFwVHlwZXMoYXJnLnR5cGUua2luZCk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZy50eXBlLmtpbmQgPT09IDE1Nykge1xuICAgICAgICAgICAgICAgICAgICAvL3RyeSByZXBsYWNlIFR5cGVSZWZlcmVuY2Ugd2l0aCB0eXBlTmFtZVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJnLnR5cGUudHlwZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC50eXBlID0gYXJnLnR5cGUudHlwZU5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0OmFueSA9IHtcbiAgICAgICAgICAgIG5hbWU6IG1ldGhvZC5uYW1lLnRleHQsXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXVxuICAgICAgICB9LFxuICAgICAgICBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKG1ldGhvZCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QudHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdC5yZXR1cm5UeXBlID0gdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZXJLaW5kID0gbWV0aG9kLm1vZGlmaWVyc1swXS5raW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmKCBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMgKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLm5hbWUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIgPyB0aGlzLnN0cmluZ2lmeURlZmF1bHRWYWx1ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuaW5pdGlhbGl6ZXIgPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC50eXBlID0gdGhpcy52aXNpdFR5cGUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEZ1bmN0aW9uRGVjbGFyYXRpb25KU0RvY1RhZ3Mobm9kZSk6IHN0cmluZyB7XG4gICAgICAgIGxldCBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKG5vZGUpLFxuICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RW51bUFuZEZ1bmN0aW9uRGVjbGFyYXRpb25EZXNjcmlwdGlvbihub2RlKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uOnN0cmluZyA9ICcnO1xuICAgICAgICBpZiAobm9kZS5qc0RvYykge1xuICAgICAgICAgICAgaWYgKG5vZGUuanNEb2MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS5qc0RvY1swXS5jb21tZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG1hcmtlZChub2RlLmpzRG9jWzBdLmNvbW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzY3JpcHRpb247XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEVudW1EZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXSxcbiAgICAgICAgaWYoIG5vZGUubWVtYmVycyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLm1lbWJlcnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbWVtYmVyID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLm1lbWJlcnNbaV0ubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLm1lbWJlcnNbaV0uaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyLnZhbHVlID0gbm9kZS5tZW1iZXJzW2ldLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1lbWJlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RW51bURlY2xhcmF0aW9uRm9yUm91dGVzKGZpbGVOYW1lLCBub2RlKSB7XG4gICAgICAgIGlmKCBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMgKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUgJiYgbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUudGV4dCA9PT0gJ1JvdXRlcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gZ2VuZXJhdGUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZFJvdXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFJvdXRlclBhcnNlci5jbGVhblJhd1JvdXRlKGRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJvdXRlSU8oZmlsZW5hbWUsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRFbnVtRGVjbGFyYXRpb25Gb3JSb3V0ZXMoZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50SU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSwgbm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVtZW50LnBvcyA9PT0gbm9kZS5wb3MgJiYgc3RhdGVtZW50LmVuZCA9PT0gbm9kZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsYXNzSU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSwgbm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVtZW50LnBvcyA9PT0gbm9kZS5wb3MgJiYgc3RhdGVtZW50LmVuZCA9PT0gbm9kZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEludGVyZmFjZUlPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUsIG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQucG9zID09PSBub2RlLnBvcyAmJiBzdGF0ZW1lbnQuZW5kID09PSBub2RlLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50LCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnb3V0cHV0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRWaWV3UHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndmlld1Byb3ZpZGVycycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RGlyZWN0aXZlcyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2RpcmVjdGl2ZXMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgICAgIGlkZW50aWZpZXIuc2VsZWN0b3IgPSB0aGlzLmZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lKTtcbiAgICAgICAgICAgIGlkZW50aWZpZXIubGFiZWwgPSAnJztcbiAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEV4YW1wbGVVcmxzID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdmFyIGV4YW1wbGVVcmxzTWF0Y2hlcyA9IHRleHQubWF0Y2goLzxleGFtcGxlLXVybD4oLio/KTxcXC9leGFtcGxlLXVybD4vZyk7XG4gICAgICAgIHZhciBleGFtcGxlVXJscyA9IG51bGw7XG4gICAgICAgIGlmIChleGFtcGxlVXJsc01hdGNoZXMgJiYgZXhhbXBsZVVybHNNYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgZXhhbXBsZVVybHMgPSBleGFtcGxlVXJsc01hdGNoZXMubWFwKGZ1bmN0aW9uKHZhbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbC5yZXBsYWNlKC88XFwvP2V4YW1wbGUtdXJsPi9nLCcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleGFtcGxlVXJscztcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGxldCBuc01vZHVsZSA9IG5hbWUuc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIHR5cGUgPSB0aGlzLmdldFR5cGUobmFtZSk7XG4gICAgICAgIGlmIChuc01vZHVsZS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgIC8vIGNhY2hlIGRlcHMgd2l0aCB0aGUgc2FtZSBuYW1lc3BhY2UgKGkuZSBTaGFyZWQuKilcbiAgICAgICAgICAgIGlmICh0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXS5wdXNoKG5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dID0gW25hbWVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5zOiBuc01vZHVsZVswXSxcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd0ZW1wbGF0ZVVybCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIGxldCB0ID0gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGUnLCB0cnVlKS5wb3AoKVxuICAgICAgICBpZih0KSB7XG4gICAgICAgICAgICB0ID0gZGV0ZWN0SW5kZW50KHQsIDApO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvXFxuLywgJycpO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvICskL2dtLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlVXJscycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRNb2R1bGVJZChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ21vZHVsZUlkJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdjaGFuZ2VEZXRlY3Rpb24nKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2VuY2Fwc3VsYXRpb24nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhbml0aXplVXJscyh1cmxzOiBzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gdXJscy5tYXAodXJsID0+IHVybC5yZXBsYWNlKCcuLycsICcnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IE9iamVjdCB7XG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwYXJzZVByb3BlcnRpZXMgPSAobm9kZTogTm9kZU9iamVjdCk6IE9iamVjdCA9PiB7XG4gICAgICAgICAgICBsZXQgb2JqID0ge307XG4gICAgICAgICAgICAobm9kZS5pbml0aWFsaXplci5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgb2JqW3Byb3AubmFtZS50ZXh0XSA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZGVwcy5tYXAocGFyc2VQcm9wZXJ0aWVzKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogYW55IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZXBzIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwcyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgaWYgKHByb3BzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gW107IH1cblxuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xUZXh0ID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICBdO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBidWlsZElkZW50aWZpZXJOYW1lID0gKG5vZGU6IE5vZGVPYmplY3QsIG5hbWUgPSAnJykgPT4ge1xuXG4gICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUgPyBgLiR7bmFtZX1gIDogbmFtZTtcblxuICAgICAgICAgICAgICAgIGxldCBub2RlTmFtZSA9IHRoaXMudW5rbm93bjtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5leHByZXNzaW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYobm9kZS5leHByZXNzaW9uLmVsZW1lbnRzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLmV4cHJlc3Npb24uZWxlbWVudHMubWFwKCBlbCA9PiBlbC50ZXh0ICkuam9pbignLCAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IGBbJHtub2RlTmFtZX1dYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gIHRzLlN5bnRheEtpbmQuU3ByZWFkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYC4uLiR7bm9kZU5hbWV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2J1aWxkSWRlbnRpZmllck5hbWUobm9kZS5leHByZXNzaW9uLCBub2RlTmFtZSl9JHtuYW1lfWBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke25vZGUudGV4dH0uJHtuYW1lfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24gPSAobzogTm9kZU9iamVjdCk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOlxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy8nIH0sXG4gICAgICAgICAgICAvLyBvclxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiAnRGF0ZScsIHVzZUZhY3Rvcnk6IChkMSwgZDIpID0+IG5ldyBEYXRlKCksIGRlcHM6IFsnZDEnLCAnZDInXSB9XG5cbiAgICAgICAgICAgIGxldCBfZ2VuUHJvdmlkZXJOYW1lOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IF9wcm92aWRlclByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAoby5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAnJHtpZGVudGlmaWVyfSdgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGxhbWJkYSBmdW5jdGlvbiAoaS5lIHVzZUZhY3RvcnkpXG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaW5pdGlhbGl6ZXIuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0gKHByb3AuaW5pdGlhbGl6ZXIucGFyYW1ldGVycyB8fCA8YW55PltdKS5tYXAoKHBhcmFtczogTm9kZU9iamVjdCkgPT4gcGFyYW1zLm5hbWUudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgKCR7cGFyYW1zLmpvaW4oJywgJyl9KSA9PiB7fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZmFjdG9yeSBkZXBzIGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cyB8fCBbXSkubWFwKChuOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJyR7bi50ZXh0fSdgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGBbJHtlbGVtZW50cy5qb2luKCcsICcpfV1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF9wcm92aWRlclByb3BzLnB1c2goW1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBwcm92aWRlXG4gICAgICAgICAgICAgICAgICAgIHByb3AubmFtZS50ZXh0LFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBPcGFxdWVUb2tlbiBvciAnU3RyaW5nVG9rZW4nXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcblxuICAgICAgICAgICAgICAgIF0uam9pbignOiAnKSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYHsgJHtfcHJvdmlkZXJQcm9wcy5qb2luKCcsICcpfSB9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbEVsZW1lbnRzID0gKG86IE5vZGVPYmplY3QgfCBhbnkpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogQW5ndWxhckZpcmVNb2R1bGUuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbiAgICAgICAgICAgIGlmIChvLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSBidWlsZElkZW50aWZpZXJOYW1lKG8uZXhwcmVzc2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMgY291bGQgYmUgcmVhbGx5IGNvbXBsZXhlLiBUaGVyZSBhcmUgc29cbiAgICAgICAgICAgICAgICAvLyBtYW55IHVzZSBjYXNlcyB0aGF0IHdlIGNhbid0IGhhbmRsZS4gSnVzdCBwcmludCBcImFyZ3NcIiB0byBpbmRpY2F0ZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2UgaGF2ZSBhcmd1bWVudHMuXG5cbiAgICAgICAgICAgICAgICBsZXQgZnVuY3Rpb25BcmdzID0gby5hcmd1bWVudHMubGVuZ3RoID4gMCA/ICdhcmdzJyA6ICcnO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gYCR7Y2xhc3NOYW1lfSgke2Z1bmN0aW9uQXJnc30pYDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogU2hhcmVkLk1vZHVsZVxuICAgICAgICAgICAgZWxzZSBpZiAoby5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBidWlsZElkZW50aWZpZXJOYW1lKG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gby50ZXh0ID8gby50ZXh0IDogcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24obyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9scyA9IChub2RlOiBOb2RlT2JqZWN0KTogc3RyaW5nW10gPT4ge1xuXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBwYXJzZVN5bWJvbEVsZW1lbnRzKG5vZGUuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMubWFwKHBhcnNlU3ltYm9sRWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVN5bWJvbHMpLnBvcCgpIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlW25hbWVdO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHByb21pc2VTZXF1ZW50aWFsKHByb21pc2VzKSB7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvbWlzZXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZCB0byBiZSBhbiBhcnJheSBvZiBQcm9taXNlcycpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICBjb25zdCBpdGVyYXRlZUZ1bmMgPSAocHJldmlvdXNQcm9taXNlLCBjdXJyZW50UHJvbWlzZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQrKyAhPT0gMCkgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50UHJvbWlzZShyZXN1bHQsIHJlc3VsdHMsIGNvdW50KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VzID0gcHJvbWlzZXMuY29uY2F0KCgpID0+IFByb21pc2UucmVzb2x2ZSgpKTtcblxuICAgICAgICBwcm9taXNlc1xuICAgICAgICAgICAgLnJlZHVjZShpdGVyYXRlZUZ1bmMsIFByb21pc2UucmVzb2x2ZShmYWxzZSkpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICAgICAgfSlcblxuICAgIH0pO1xufTtcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBMaXZlU2VydmVyIGZyb20gJ2xpdmUtc2VydmVyJztcbmltcG9ydCAqIGFzIFNoZWxsanMgZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBIdG1sRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2h0bWwuZW5naW5lJztcbmltcG9ydCB7IE1hcmtkb3duRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL21hcmtkb3duLmVuZ2luZSc7XG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWd1cmF0aW9uLmludGVyZmFjZSc7XG5pbXBvcnQgeyAkZGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuaW1wb3J0IHsgTmdkRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL25nZC5lbmdpbmUnO1xuaW1wb3J0IHsgU2VhcmNoRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3NlYXJjaC5lbmdpbmUnO1xuaW1wb3J0IHsgRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi9jb21waWxlci9kZXBlbmRlbmNpZXMnO1xuaW1wb3J0IHsgUm91dGVyUGFyc2VyIH0gZnJvbSAnLi4vdXRpbHMvcm91dGVyLnBhcnNlcic7XG5cbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5pbXBvcnQgeyBnZXRBbmd1bGFyVmVyc2lvbk9mUHJvamVjdCB9IGZyb20gJy4uL3V0aWxzL2FuZ3VsYXItdmVyc2lvbic7XG5cbmltcG9ydCB7IGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlLCBmaW5kTWFpblNvdXJjZUZvbGRlciB9IGZyb20gJy4uL3V0aWxpdGllcyc7XG5cbmltcG9ydCB7IHByb21pc2VTZXF1ZW50aWFsIH0gZnJvbSAnLi4vdXRpbHMvcHJvbWlzZS1zZXF1ZW50aWFsJztcblxuY29uc3QgZ2xvYjogYW55ID0gcmVxdWlyZSgnZ2xvYicpLFxuICAgICAgdHMgPSByZXF1aXJlKCd0eXBlc2NyaXB0JyksXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgICBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKSxcbiAgICAgIGNob2tpZGFyID0gcmVxdWlyZSgnY2hva2lkYXInKTtcblxubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLFxuICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCksXG4gICAgJGh0bWxlbmdpbmUgPSBuZXcgSHRtbEVuZ2luZSgpLFxuICAgICRmaWxlZW5naW5lID0gbmV3IEZpbGVFbmdpbmUoKSxcbiAgICAkbWFya2Rvd25lbmdpbmUgPSBuZXcgTWFya2Rvd25FbmdpbmUoKSxcbiAgICAkbmdkZW5naW5lID0gbmV3IE5nZEVuZ2luZSgpLFxuICAgICRzZWFyY2hFbmdpbmUgPSBuZXcgU2VhcmNoRW5naW5lKCksXG4gICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb24ge1xuICAgIC8qKlxuICAgICAqIEZpbGVzIHByb2Nlc3NlZCBkdXJpbmcgaW5pdGlhbCBzY2FubmluZ1xuICAgICAqL1xuICAgIGZpbGVzOiBBcnJheTxzdHJpbmc+O1xuICAgIC8qKlxuICAgICAqIEZpbGVzIHByb2Nlc3NlZCBkdXJpbmcgd2F0Y2ggc2Nhbm5pbmdcbiAgICAgKi9cbiAgICB1cGRhdGVkRmlsZXM6IEFycmF5PHN0cmluZz47XG4gICAgLyoqXG4gICAgICogRmlsZXMgY2hhbmdlZCBkdXJpbmcgd2F0Y2ggc2Nhbm5pbmdcbiAgICAgKi9cbiAgICB3YXRjaENoYW5nZWRGaWxlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIC8qKlxuICAgICAqIENvbXBvZG9jIGNvbmZpZ3VyYXRpb24gbG9jYWwgcmVmZXJlbmNlXG4gICAgICovXG4gICAgY29uZmlndXJhdGlvbjpDb25maWd1cmF0aW9uSW50ZXJmYWNlO1xuICAgIC8qKlxuICAgICAqIEJvb2xlYW4gZm9yIHdhdGNoaW5nIHN0YXR1c1xuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzV2F0Y2hpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBjb21wb2RvYyBhcHBsaWNhdGlvbiBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBvcHRpb25zIHRoYXQgc2hvdWxkIGJlIHVzZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86T2JqZWN0KSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gb3B0aW9ucyApIHtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZvciBkb2N1bWVudGF0aW9uTWFpbk5hbWUsIHByb2Nlc3MgaXQgb3V0c2lkZSB0aGUgbG9vcCwgZm9yIGhhbmRsaW5nIGNvbmZsaWN0IHdpdGggcGFnZXMgbmFtZVxuICAgICAgICAgICAgaWYob3B0aW9uID09PSAnbmFtZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbJ2RvY3VtZW50YXRpb25NYWluTmFtZSddID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRm9yIGRvY3VtZW50YXRpb25NYWluTmFtZSwgcHJvY2VzcyBpdCBvdXRzaWRlIHRoZSBsb29wLCBmb3IgaGFuZGxpbmcgY29uZmxpY3Qgd2l0aCBwYWdlcyBuYW1lXG4gICAgICAgICAgICBpZihvcHRpb24gPT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2MgcHJvY2Vzc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQuY2hhckF0KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArPSAnLyc7XG4gICAgICAgIH1cbiAgICAgICAgJGh0bWxlbmdpbmUuaW5pdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFja2FnZUpzb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2MgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB0ZXN0Q292ZXJhZ2UoKSB7XG4gICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGZpbGVzIGZvciBpbml0aWFsIHByb2Nlc3NpbmdcbiAgICAgKiBAcGFyYW0gIHtBcnJheTxzdHJpbmc+fSBmaWxlcyBGaWxlcyBmb3VuZCBkdXJpbmcgc291cmNlIGZvbGRlciBhbmQgdHNjb25maWcgc2NhblxuICAgICAqL1xuICAgIHNldEZpbGVzKGZpbGVzOkFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGZpbGVzIGZvciB3YXRjaCBwcm9jZXNzaW5nXG4gICAgICogQHBhcmFtICB7QXJyYXk8c3RyaW5nPn0gZmlsZXMgRmlsZXMgZm91bmQgZHVyaW5nIHNvdXJjZSBmb2xkZXIgYW5kIHRzY29uZmlnIHNjYW5cbiAgICAgKi9cbiAgICBzZXRVcGRhdGVkRmlsZXMoZmlsZXM6QXJyYXk8c3RyaW5nPikge1xuICAgICAgICB0aGlzLnVwZGF0ZWRGaWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGJvb2xlYW4gaW5kaWNhdGluZyBwcmVzZW5jZSBvZiBvbmUgVHlwZVNjcmlwdCBmaWxlIGluIHVwZGF0ZWRGaWxlcyBsaXN0XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gUmVzdWx0IG9mIHNjYW5cbiAgICAgKi9cbiAgICBoYXNXYXRjaGVkRmlsZXNUU0ZpbGVzKCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMudXBkYXRlZEZpbGVzLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGJvb2xlYW4gaW5kaWNhdGluZyBwcmVzZW5jZSBvZiBvbmUgcm9vdCBtYXJrZG93biBmaWxlcyBpbiB1cGRhdGVkRmlsZXMgbGlzdFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFJlc3VsdCBvZiBzY2FuXG4gICAgICovXG4gICAgaGFzV2F0Y2hlZEZpbGVzUm9vdE1hcmtkb3duRmlsZXMoKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICBfLmZvckVhY2godGhpcy51cGRhdGVkRmlsZXMsIChmaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLm1kJyAmJiBwYXRoLmRpcm5hbWUoZmlsZSkgPT09IHByb2Nlc3MuY3dkKCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFyIGZpbGVzIGZvciB3YXRjaCBwcm9jZXNzaW5nXG4gICAgICovXG4gICAgY2xlYXJVcGRhdGVkRmlsZXMoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlZEZpbGVzID0gW107XG4gICAgICAgIHRoaXMud2F0Y2hDaGFuZ2VkRmlsZXMgPSBbXTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFja2FnZUpzb24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgcGFja2FnZS5qc29uIGZpbGUnKTtcbiAgICAgICAgJGZpbGVlbmdpbmUuZ2V0KCdwYWNrYWdlLmpzb24nKS50aGVuKChwYWNrYWdlRGF0YSkgPT4ge1xuICAgICAgICAgICAgbGV0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHBhY2thZ2VEYXRhKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyc2VkRGF0YS5uYW1lICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID09PSBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPSBwYXJzZWREYXRhLm5hbWUgKyAnIGRvY3VtZW50YXRpb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLmRlc2NyaXB0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uID0gcGFyc2VkRGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbiA9IGdldEFuZ3VsYXJWZXJzaW9uT2ZQcm9qZWN0KHBhcnNlZERhdGEpO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhY2thZ2UuanNvbiBmaWxlIGZvdW5kJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzTWFya2Rvd25zKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnU2VhcmNoaW5nIFJFQURNRS5tZCwgQ0hBTkdFTE9HLm1kLCBDT05UUklCVVRJTkcubWQsIExJQ0VOU0UubWQsIFRPRE8ubWQgZmlsZXMnKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbWFya2Rvd25zID0gWydyZWFkbWUnLCAnY2hhbmdlbG9nJywgJ2NvbnRyaWJ1dGluZycsICdsaWNlbnNlJywgJ3RvZG8nXSxcbiAgICAgICAgICAgIG51bWJlck9mTWFya2Rvd25zID0gNSxcbiAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBudW1iZXJPZk1hcmtkb3ducykge1xuICAgICAgICAgICAgICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0VHJhZGl0aW9uYWxNYXJrZG93bihtYXJrZG93bnNbaV0udG9VcHBlckNhc2UoKSkudGhlbigocmVhZG1lRGF0YTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKG1hcmtkb3duc1tpXSA9PT0gJ3JlYWRtZScpID8gJ2luZGV4JyA6IG1hcmtkb3duc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnZ2V0dGluZy1zdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2dldHRpbmctc3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2Rvd246IHJlYWRtZURhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFya2Rvd25zW2ldID09PSAncmVhZG1lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yZWFkbWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1hcmtkb3ducy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbWFya2Rvd25zW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cHBlcm5hbWU6IG1hcmtkb3duc1tpXS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgJHttYXJrZG93bnNbaV0udG9VcHBlckNhc2UoKX0ubWQgZmlsZSBmb3VuZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYENvbnRpbnVpbmcgd2l0aG91dCAke21hcmtkb3duc1tpXS50b1VwcGVyQ2FzZSgpfS5tZCBmaWxlYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFya2Rvd25zW2ldID09PSAncmVhZG1lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlYnVpbGRSb290TWFya2Rvd25zKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUmVnZW5lcmF0aW5nIFJFQURNRS5tZCwgQ0hBTkdFTE9HLm1kLCBDT05UUklCVVRJTkcubWQsIExJQ0VOU0UubWQsIFRPRE8ubWQgcGFnZXMnKTtcblxuICAgICAgICBsZXQgYWN0aW9ucyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5yZXNldFJvb3RNYXJrZG93blBhZ2VzKCk7XG5cbiAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJvY2Vzc01hcmtkb3ducygpOyB9KTtcblxuICAgICAgICBwcm9taXNlU2VxdWVudGlhbChhY3Rpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWdlcygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJVcGRhdGVkRmlsZXMoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3JNZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBkZXBlbmRlbmN5IGRhdGEgZm9yIHNtYWxsIGdyb3VwIG9mIHVwZGF0ZWQgZmlsZXMgZHVyaW5nIHdhdGNoIHByb2Nlc3NcbiAgICAgKi9cbiAgICBnZXRNaWNyb0RlcGVuZGVuY2llc0RhdGEoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdHZXQgZGlmZiBkZXBlbmRlbmNpZXMgZGF0YScpO1xuICAgICAgICBsZXQgY3Jhd2xlciA9IG5ldyBEZXBlbmRlbmNpZXMoXG4gICAgICAgICAgdGhpcy51cGRhdGVkRmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS51cGRhdGUoZGVwZW5kZW5jaWVzRGF0YSk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlSnVzdEFGZXdUaGluZ3MoZGVwZW5kZW5jaWVzRGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVidWlsZCBleHRlcm5hbCBkb2N1bWVudGF0aW9uIGR1cmluZyB3YXRjaCBwcm9jZXNzXG4gICAgICovXG4gICAgcmVidWlsZEV4dGVybmFsRG9jdW1lbnRhdGlvbigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1JlYnVpbGQgZXh0ZXJuYWwgZG9jdW1lbnRhdGlvbicpO1xuXG4gICAgICAgIGxldCBhY3Rpb25zID0gW107XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLnJlc2V0QWRkaXRpb25hbFBhZ2VzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyAhPT0gJycpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVFeHRlcm5hbEluY2x1ZGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZVNlcXVlbnRpYWwoYWN0aW9ucylcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVXBkYXRlZEZpbGVzKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXNEYXRhKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRlcGVuZGVuY2llcyBkYXRhJyk7XG5cbiAgICAgICAgbGV0IGNyYXdsZXIgPSBuZXcgRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHRoaXMuZmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5pbml0KGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXNMZW5ndGggPSBSb3V0ZXJQYXJzZXIucm91dGVzTGVuZ3RoKCk7XG5cbiAgICAgICAgdGhpcy5wcmludFN0YXRpc3RpY3MoKTtcblxuICAgICAgICB0aGlzLnByZXBhcmVFdmVyeXRoaW5nKCk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUp1c3RBRmV3VGhpbmdzKGRpZmZDcmF3bGVkRGF0YSkge1xuICAgICAgICBsZXQgYWN0aW9ucyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5yZXNldFBhZ2VzKCk7XG5cbiAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZVJvdXRlcygpOyB9KTtcblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLm1vZHVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZU1vZHVsZXMoKTsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5jb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb21wb25lbnRzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5pbmplY3RhYmxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlSW5qZWN0YWJsZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLnBpcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVQaXBlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ2xhc3NlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuaW50ZXJmYWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlSW50ZXJmYWNlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy52YXJpYWJsZXMubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICAgZGlmZkNyYXdsZWREYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgIGRpZmZDcmF3bGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgIGRpZmZDcmF3bGVkRGF0YS5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICBkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy50eXBlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJVcGRhdGVkRmlsZXMoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3JNZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaW50U3RhdGlzdGljcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2plY3Qgc3RhdGlzdGljcyAnKTtcbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUubW9kdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgLSBtb2R1bGUgICAgIDogJHskZGVwZW5kZW5jaWVzRW5naW5lLm1vZHVsZXMubGVuZ3RofWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gY29tcG9uZW50ICA6ICR7JGRlcGVuZGVuY2llc0VuZ2luZS5jb21wb25lbnRzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAtIGRpcmVjdGl2ZSAgOiAkeyRkZXBlbmRlbmNpZXNFbmdpbmUuZGlyZWN0aXZlcy5sZW5ndGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gaW5qZWN0YWJsZSA6ICR7JGRlcGVuZGVuY2llc0VuZ2luZS5pbmplY3RhYmxlcy5sZW5ndGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucGlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gcGlwZSAgICAgICA6ICR7JGRlcGVuZGVuY2llc0VuZ2luZS5waXBlcy5sZW5ndGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgLSBjbGFzcyAgICAgIDogJHskZGVwZW5kZW5jaWVzRW5naW5lLmNsYXNzZXMubGVuZ3RofWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gaW50ZXJmYWNlICA6ICR7JGRlcGVuZGVuY2llc0VuZ2luZS5pbnRlcmZhY2VzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlc0xlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAtIHJvdXRlICAgICAgOiAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXNMZW5ndGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRXZlcnl0aGluZygpIHtcbiAgICAgICAgbGV0IGFjdGlvbnMgPSBbXTtcblxuICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlTW9kdWxlcygpOyB9KTtcbiAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKTsgfSk7XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRGlyZWN0aXZlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVJbmplY3RhYmxlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcyAmJiAkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcy5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlUm91dGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucGlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZVBpcGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ2xhc3NlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAkZGVwZW5kZW5jaWVzRW5naW5lLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAkZGVwZW5kZW5jaWVzRW5naW5lLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy50eXBlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgIT09ICcnKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRXh0ZXJuYWxJbmNsdWRlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvck1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUV4dGVybmFsSW5jbHVkZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdBZGRpbmcgZXh0ZXJuYWwgbWFya2Rvd24gZmlsZXMnKTtcbiAgICAgICAgLy9TY2FuIGluY2x1ZGUgZm9sZGVyIGZvciBmaWxlcyBkZXRhaWxlZCBpbiBzdW1tYXJ5Lmpzb25cbiAgICAgICAgLy9Gb3IgZWFjaCBmaWxlLCBhZGQgdG8gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFkZGl0aW9uYWxQYWdlc1xuICAgICAgICAvL0VhY2ggZmlsZSB3aWxsIGJlIGNvbnZlcnRlZCB0byBodG1sIHBhZ2UsIGluc2lkZSBDT01QT0RPQ19ERUZBVUxUUy5hZGRpdGlvbmFsRW50cnlQYXRoXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICRmaWxlZW5naW5lLmdldCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgKyBwYXRoLnNlcCArICdzdW1tYXJ5Lmpzb24nKS50aGVuKChzdW1tYXJ5RGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbjogc3VtbWFyeS5qc29uIGZpbGUgZm91bmQnKTtcblxuICAgICAgICAgICAgICAgbGV0IHBhcnNlZFN1bW1hcnlEYXRhID0gSlNPTi5wYXJzZShzdW1tYXJ5RGF0YSksXG4gICAgICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgbGVuID0gcGFyc2VkU3VtbWFyeURhdGEubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJG1hcmtkb3duZW5naW5lLmdldCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgKyBwYXRoLnNlcCArIHBhcnNlZFN1bW1hcnlEYXRhW2ldLmZpbGUpLnRoZW4oKG1hcmtlZERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRBZGRpdGlvbmFsUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBhcnNlZFN1bW1hcnlEYXRhW2ldLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBjbGVhbk5hbWVXaXRob3V0U3BhY2VBbmRUb0xvd2VyQ2FzZShwYXJzZWRTdW1tYXJ5RGF0YVtpXS50aXRsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2FkZGl0aW9uYWwtcGFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzRm9sZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQYWdlOiBtYXJrZWREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuICYmIHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmcgPSBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbi5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wQ2hpbGQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIGogPD0gbGVuZy0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRtYXJrZG93bmVuZ2luZS5nZXQodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICsgcGF0aC5zZXAgKyBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbltqXS5maWxlKS50aGVuKChtYXJrZWREYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkQWRkaXRpb25hbFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuW2pdLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbltqXS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UocGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW5bal0udGl0bGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdhZGRpdGlvbmFsLXBhZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc0ZvbGRlciArICcvJyArIGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlKHBhcnNlZFN1bW1hcnlEYXRhW2ldLnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUGFnZTogbWFya2VkRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wQ2hpbGQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcENoaWxkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNb2R1bGVzKHNvbWVNb2R1bGVzPykge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtb2R1bGVzJyk7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIF9tb2R1bGVzID0gKHNvbWVNb2R1bGVzKSA/IHNvbWVNb2R1bGVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMgPSBfbW9kdWxlcy5tYXAobmdNb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIFsnZGVjbGFyYXRpb25zJywgJ2Jvb3RzdHJhcCcsICdpbXBvcnRzJywgJ2V4cG9ydHMnXS5mb3JFYWNoKG1ldGFkYXRhVHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlW21ldGFkYXRhVHlwZV0gPSBuZ01vZHVsZVttZXRhZGF0YVR5cGVdLmZpbHRlcihtZXRhRGF0YUl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtZXRhRGF0YUl0ZW0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldERpcmVjdGl2ZXMoKS5zb21lKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUubmFtZSA9PT0gbWV0YURhdGFJdGVtLm5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tcG9uZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q29tcG9uZW50cygpLnNvbWUoY29tcG9uZW50ID0+IGNvbXBvbmVudC5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2R1bGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCkuc29tZShtb2R1bGUgPT4gbW9kdWxlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BpcGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRQaXBlcygpLnNvbWUocGlwZSA9PiBwaXBlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBuZ01vZHVsZS5wcm92aWRlcnMgPSBuZ01vZHVsZS5wcm92aWRlcnMuZmlsdGVyKHByb3ZpZGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5qZWN0YWJsZXMoKS5zb21lKGluamVjdGFibGUgPT4gaW5qZWN0YWJsZS5uYW1lID09PSBwcm92aWRlci5uYW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmdNb2R1bGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgaWQ6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXJrZG93bmVuZ2luZS5oYXNOZWlnaGJvdXJSZWFkbWVGaWxlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLmZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLm5hbWV9IGhhcyBhIFJFQURNRSBmaWxlLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXS5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVQaXBlcyA9IChzb21lUGlwZXM/KSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIHBpcGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcyA9IChzb21lUGlwZXMpID8gc29tZVBpcGVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRQaXBlcygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihpIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc05laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLmZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5uYW1lfSBoYXMgYSBSRUFETUUgZmlsZSwgaW5jbHVkZSBpdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWFkbWUgPSAkbWFya2Rvd25lbmdpbmUucmVhZE5laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLmZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAncGlwZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ3BpcGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVDbGFzc2VzID0gKHNvbWVDbGFzc2VzPykgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjbGFzc2VzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzID0gKHNvbWVDbGFzc2VzKSA/IHNvbWVDbGFzc2VzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDbGFzc2VzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXJrZG93bmVuZ2luZS5oYXNOZWlnaGJvdXJSZWFkbWVGaWxlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzW2ldLmZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzW2ldLm5hbWV9IGhhcyBhIFJFQURNRSBmaWxlLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXS5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlSW50ZXJmYWNlcyhzb21lSW50ZXJmYWNlcz8pIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW50ZXJmYWNlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcyA9IChzb21lSW50ZXJmYWNlcykgPyBzb21lSW50ZXJmYWNlcyA6ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW50ZXJmYWNlcygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuaGFzTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5maWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5uYW1lfSBoYXMgYSBSRUFETUUgZmlsZSwgaW5jbHVkZSBpdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWFkbWUgPSAkbWFya2Rvd25lbmdpbmUucmVhZE5laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXNbaV0uZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXNbaV0ucmVhZG1lID0gbWFya2VkKHJlYWRtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2ludGVyZmFjZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyZmFjZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlTWlzY2VsbGFuZW91cyhzb21lTWlzYz8pIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgbWlzY2VsbGFuZW91cycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubWlzY2VsbGFuZW91cyA9IChzb21lTWlzYykgPyBzb21lTWlzYyA6ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0TWlzY2VsbGFuZW91cygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ21pc2NlbGxhbmVvdXMnLFxuICAgICAgICAgICAgICAgIGlkOiAnbWlzY2VsbGFuZW91cycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21pc2NlbGxhbmVvdXMnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlQ29tcG9uZW50cyhzb21lQ29tcG9uZW50cz8pIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY29tcG9uZW50cycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cyA9IChzb21lQ29tcG9uZW50cykgPyBzb21lQ29tcG9uZW50cyA6ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q29tcG9uZW50cygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgobWFpblJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlVGVtcGxhdGV1cmwgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGVQYXRoID0gcGF0aC5yZXNvbHZlKGRpcm5hbWUgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnRlbXBsYXRlVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRlbXBsYXRlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZSh0ZW1wbGF0ZVBhdGgsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0udGVtcGxhdGVEYXRhID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYENhbm5vdCByZWFkIHRlbXBsYXRlIGZvciAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc05laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZX0gaGFzIGEgUkVBRE1FIGZpbGUsIGluY2x1ZGUgaXRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVhZG1lRmlsZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lfSBoYXMgYSB0ZW1wbGF0ZVVybCwgaW5jbHVkZSBpdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVUZW1wbGF0ZXVybCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lfSBoYXMgYSB0ZW1wbGF0ZVVybCwgaW5jbHVkZSBpdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVUZW1wbGF0ZXVybCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW5SZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRGlyZWN0aXZlcyA9IChzb21lRGlyZWN0aXZlcz8pID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgZGlyZWN0aXZlcycpO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzID0gKHNvbWVEaXJlY3RpdmVzKSA/IHNvbWVEaXJlY3RpdmVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXJrZG93bmVuZ2luZS5oYXNOZWlnaGJvdXJSZWFkbWVGaWxlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldLmZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldLm5hbWV9IGhhcyBhIFJFQURNRSBmaWxlLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVJbmplY3RhYmxlcyhzb21lSW5qZWN0YWJsZXM/KSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGluamVjdGFibGVzJyk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzID0gKHNvbWVJbmplY3RhYmxlcykgPyBzb21lSW5qZWN0YWJsZXMgOiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuaGFzTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0uZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLm5hbWV9IGhhcyBhIFJFQURNRSBmaWxlLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0uZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLnJlYWRtZSA9IG1hcmtlZChyZWFkbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0YWJsZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZVJvdXRlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3Mgcm91dGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldFJvdXRlcygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncm91dGVzJyxcbiAgICAgICAgICAgICAgICBpZDogJ3JvdXRlcycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3JvdXRlcycsXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIFJvdXRlclBhcnNlci5nZW5lcmF0ZVJvdXRlc0luZGV4KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQsIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCcgUm91dGVzIGluZGV4IGdlbmVyYXRlZCcpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIChlKSA9PsKge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVDb3ZlcmFnZSgpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSByZXBvcnQnKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIGxvb3Agd2l0aCBjb21wb25lbnRzLCBjbGFzc2VzLCBpbmplY3RhYmxlcywgaW50ZXJmYWNlcywgcGlwZXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGZpbGVzID0gW10sXG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgZ2V0U3RhdHVzID0gZnVuY3Rpb24ocGVyY2VudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudCA8PSAyNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ2xvdyc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDI1ICYmIHBlcmNlbnQgPD0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdtZWRpdW0nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBlcmNlbnQgPiA1MCAmJiBwZXJjZW50IDw9IDc1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1cztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMsIChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MgfHxcbiAgICAgICAgICAgICAgICAgICAgIWNvbXBvbmVudC5tZXRob2RzQ2xhc3MgfHxcbiAgICAgICAgICAgICAgICAgICAgIWNvbXBvbmVudC5pbnB1dHNDbGFzcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY29tcG9uZW50Lm91dHB1dHNDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNsOmFueSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBjb21wb25lbnQuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29tcG9uZW50Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQubWV0aG9kc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5pbnB1dHNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQub3V0cHV0c0NsYXNzLmxlbmd0aCArIDE7IC8vICsxIGZvciBjb21wb25lbnQgZGVjb3JhdG9yIGNvbW1lbnRcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29uc3RydWN0b3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29uc3RydWN0b3JPYmogJiYgY29tcG9uZW50LmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICYmIGNvbXBvbmVudC5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZGVzY3JpcHRpb24gJiYgY29tcG9uZW50LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gJiYgcHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnICYmIHByb3BlcnR5Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQubWV0aG9kc0NsYXNzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAmJiBtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnICYmIG1ldGhvZC5tb2RpZmllcktpbmQgIT09IDExMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50LmlucHV0c0NsYXNzLCAoaW5wdXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihpbnB1dC5kZXNjcmlwdGlvbiAmJiBpbnB1dC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgaW5wdXQubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MsIChvdXRwdXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYob3V0cHV0LmRlc2NyaXB0aW9uICYmIG91dHB1dC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgb3V0cHV0Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLCAoY2xhc3NlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc2UucHJvcGVydGllcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY2xhc3NlLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjbDphbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2xhc3NlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY2xhc3NlLnByb3BlcnRpZXMubGVuZ3RoICsgY2xhc3NlLm1ldGhvZHMubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGNsYXNzIGl0c2VsZlxuXG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5jb25zdHJ1Y3Rvck9iaikge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5jb25zdHJ1Y3Rvck9iaiAmJiBjbGFzc2UuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gJiYgY2xhc3NlLmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5kZXNjcmlwdGlvbiAmJiBjbGFzc2UuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UucHJvcGVydGllcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gJiYgcHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnICYmIHByb3BlcnR5Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWluamVjdGFibGUucHJvcGVydGllcyB8fFxuICAgICAgICAgICAgICAgICAgICAhaW5qZWN0YWJsZS5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGluamVjdGFibGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGluamVjdGFibGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBpbmplY3RhYmxlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmplY3RhYmxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGluamVjdGFibGUubWV0aG9kcy5sZW5ndGggKyAxOyAvLyArMSBmb3IgaW5qZWN0YWJsZSBpdHNlbGZcblxuICAgICAgICAgICAgICAgIGlmIChpbmplY3RhYmxlLmNvbnN0cnVjdG9yT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0YWJsZS5jb25zdHJ1Y3Rvck9iaiAmJiBpbmplY3RhYmxlLmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICYmIGluamVjdGFibGUuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5qZWN0YWJsZS5kZXNjcmlwdGlvbiAmJiBpbmplY3RhYmxlLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAmJiBwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGluamVjdGFibGUubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzLCAoaW50ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWludGVyLnByb3BlcnRpZXMgfHxcbiAgICAgICAgICAgICAgICAgICAgIWludGVyLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjbDphbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGludGVyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rdHlwZTogaW50ZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGludGVyLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW50ZXIucHJvcGVydGllcy5sZW5ndGggKyBpbnRlci5tZXRob2RzLmxlbmd0aCArIDE7IC8vICsxIGZvciBpbnRlcmZhY2UgaXRzZWxmXG5cbiAgICAgICAgICAgICAgICBpZiAoaW50ZXIuY29uc3RydWN0b3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnRlci5jb25zdHJ1Y3Rvck9iaiAmJiBpbnRlci5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAmJiBpbnRlci5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbnRlci5kZXNjcmlwdGlvbiAmJiBpbnRlci5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICYmIHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJyAmJiBwcm9wZXJ0eS5tb2RpZmllcktpbmQgIT09IDExMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW50ZXIubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcywgKHBpcGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHBpcGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHBpcGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwaXBlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gMTtcbiAgICAgICAgICAgICAgICBpZiAocGlwZS5kZXNjcmlwdGlvbiAmJiBwaXBlLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmaWxlcyA9IF8uc29ydEJ5KGZpbGVzLCBbJ2ZpbGVQYXRoJ10pO1xuICAgICAgICAgICAgdmFyIGNvdmVyYWdlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjb3VudDogKGZpbGVzLmxlbmd0aCA+IDApID8gTWF0aC5mbG9vcih0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkIC8gZmlsZXMubGVuZ3RoKSA6IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvdmVyYWdlRGF0YS5zdGF0dXMgPSBnZXRTdGF0dXMoY292ZXJhZ2VEYXRhLmNvdW50KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY292ZXJhZ2UnLFxuICAgICAgICAgICAgICAgIGlkOiAnY292ZXJhZ2UnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVzLFxuICAgICAgICAgICAgICAgIGRhdGE6IGNvdmVyYWdlRGF0YSxcbiAgICAgICAgICAgICAgICBkZXB0aDogMCxcbiAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5ST09UXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRodG1sZW5naW5lLmdlbmVyYXRlQ292ZXJhZ2VCYWRnZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCBjb3ZlcmFnZURhdGEpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZVRlc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoY292ZXJhZ2VEYXRhLmNvdW50ID49IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZVRlc3RUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gY292ZXJhZ2UgaXMgb3ZlciB0aHJlc2hvbGQnKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSBpcyBub3Qgb3ZlciB0aHJlc2hvbGQnKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFnZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2VzJyk7XG4gICAgICAgIGxldCBwYWdlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5wYWdlcztcbiAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBwYWdlcy5tYXAoKHBhZ2UsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlJywgcGFnZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxEYXRhID0gJGh0bWxlbmdpbmUucmVuZGVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YSwgcGFnZSlcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2UucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2UucGF0aCArICcvJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5pbmRleFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3M6IHBhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZmluYWxQYXRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nICcgKyBwYWdlLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24odGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBZGRpdGlvbmFsUGFnZXMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Fzc2V0c0ZvbGRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1Jlc291cmNlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIChlKSA9PiDCoHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NBZGRpdGlvbmFsUGFnZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGFkZGl0aW9uYWwgcGFnZXMnKTtcbiAgICAgICAgbGV0IHBhZ2VzID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFkZGl0aW9uYWxQYWdlc1xuICAgICAgICBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIHBhZ2VzLm1hcCgocGFnZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2UnLCBwYWdlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxEYXRhID0gJGh0bWxlbmdpbmUucmVuZGVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YSwgcGFnZXNbaV0pXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWdlc1tpXS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZXNbaV0ucGF0aCArICcvJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZXNbaV0uZmlsZW5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICAkc2VhcmNoRW5naW5lLmluZGV4UGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvczogcGFnZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZmluYWxQYXRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nICcgKyBwYWdlc1tpXS5uYW1lICsgJyBwYWdlIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAkc2VhcmNoRW5naW5lLmdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUmVzb3VyY2VzKCk7XG4gICAgICAgICAgICB9LCAoZSkgPT7CoHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NBc3NldHNGb2xkZXIoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb3B5IGFzc2V0cyBmb2xkZXInKTtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcikpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgUHJvdmlkZWQgYXNzZXRzIGZvbGRlciAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXJ9IGRpZCBub3QgZXhpc3RgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpLCBwYXRoLnJlc29sdmUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NSZXNvdXJjZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb3B5IG1haW4gcmVzb3VyY2VzJyk7XG5cbiAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBmaW5hbFRpbWUgPSAobmV3IERhdGUoKSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gZ2VuZXJhdGVkIGluICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgJyBpbiAnICsgZmluYWxUaW1lICsgJyBzZWNvbmRzIHVzaW5nICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudGhlbWUgKyAnIHRoZW1lJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnNlcnZlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHRoaXMucnVuV2ViU2VydmVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBmaW5hbE91dHB1dCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG5cbiAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvcmVzb3VyY2VzLycpLCBwYXRoLnJlc29sdmUoZmluYWxPdXRwdXQpLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpLCBwYXRoLnJlc29sdmUoZmluYWxPdXRwdXQgKyAnL3N0eWxlcy8nKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGV4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5IHN1Y2NlZWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzR3JhcGhzKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnR3JhcGggZ2VuZXJhdGlvbiBkaXNhYmxlZCcpO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1haW4gZ3JhcGgnKTtcbiAgICAgICAgICAgIGxldCBtb2R1bGVzID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMsXG4gICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbW9kdWxlIGdyYXBoJywgbW9kdWxlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluYWxQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnbW9kdWxlcy8nICsgbW9kdWxlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgIGxldCBfcmF3TW9kdWxlID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRSYXdNb2R1bGUobW9kdWxlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jhd01vZHVsZS5kZWNsYXJhdGlvbnMubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmJvb3RzdHJhcC5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUuaW1wb3J0cy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUuZXhwb3J0cy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUucHJvdmlkZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJG5nZGVuZ2luZS5yZW5kZXJHcmFwaChtb2R1bGVzW2ldLmZpbGUsIGZpbmFsUGF0aCwgJ2YnLCBtb2R1bGVzW2ldLm5hbWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJG5nZGVuZ2luZS5yZWFkR3JhcGgocGF0aC5yZXNvbHZlKGZpbmFsUGF0aCArIHBhdGguc2VwICsgJ2RlcGVuZGVuY2llcy5zdmcnKSwgbW9kdWxlc1tpXS5uYW1lKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc1tpXS5ncmFwaCA9IDxzdHJpbmc+ZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGdyYXBoIHJlYWQ6ICcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBmaW5hbE1haW5HcmFwaFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgaWYoZmluYWxNYWluR3JhcGhQYXRoLmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZmluYWxNYWluR3JhcGhQYXRoICs9ICcvJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnZ3JhcGgnO1xuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucmF3TW9kdWxlc0Zvck92ZXJ2aWV3Lmxlbmd0aCA+IDE1MCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGBUb28gbWFueSBtb2R1bGVzICgkeyRkZXBlbmRlbmNpZXNFbmdpbmUucmF3TW9kdWxlc0Zvck92ZXJ2aWV3Lmxlbmd0aH0pLCBtYWluIGdyYXBoIGdlbmVyYXRpb24gZGlzYWJsZWRgKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZU1haW5HcmFwaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZywgcGF0aC5yZXNvbHZlKGZpbmFsTWFpbkdyYXBoUGF0aCksICdwJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRuZ2RlbmdpbmUucmVhZEdyYXBoKHBhdGgucmVzb2x2ZShmaW5hbE1haW5HcmFwaFBhdGggKyBwYXRoLnNlcCArICdkZXBlbmRlbmNpZXMuc3ZnJyksICdNYWluIGdyYXBoJykudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1haW5HcmFwaCA9IDxzdHJpbmc+ZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggcmVhZDogJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBncmFwaCBnZW5lcmF0aW9uOiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcnVuV2ViU2VydmVyKGZvbGRlcikge1xuICAgICAgICBpZighdGhpcy5pc1dhdGNoaW5nKSB7XG4gICAgICAgICAgICBMaXZlU2VydmVyLnN0YXJ0KHtcbiAgICAgICAgICAgICAgICByb290OiBmb2xkZXIsXG4gICAgICAgICAgICAgICAgb3BlbjogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4sXG4gICAgICAgICAgICAgICAgcXVpZXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbG9nTGV2ZWw6IDAsXG4gICAgICAgICAgICAgICAgd2FpdDogMTAwMCxcbiAgICAgICAgICAgICAgICBwb3J0OiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucG9ydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS53YXRjaCAmJiAhdGhpcy5pc1dhdGNoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bldhdGNoKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLndhdGNoICYmIHRoaXMuaXNXYXRjaGluZykge1xuICAgICAgICAgICAgbGV0IHNyY0ZvbGRlciA9IGZpbmRNYWluU291cmNlRm9sZGVyKHRoaXMuZmlsZXMpO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYEFscmVhZHkgd2F0Y2hpbmcgc291cmNlcyBpbiAke3NyY0ZvbGRlcn0gZm9sZGVyYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW5XYXRjaCgpIHtcbiAgICAgICAgbGV0IHNvdXJjZXMgPSBbZmluZE1haW5Tb3VyY2VGb2xkZXIodGhpcy5maWxlcyldLFxuICAgICAgICAgICAgd2F0Y2hlclJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5pc1dhdGNoaW5nID0gdHJ1ZTtcblxuICAgICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hpbmcgc291cmNlcyBpbiAke2ZpbmRNYWluU291cmNlRm9sZGVyKHRoaXMuZmlsZXMpfSBmb2xkZXJgKTtcblxuICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc1Jvb3RNYXJrZG93bnMoKSkge1xuICAgICAgICAgICAgc291cmNlcyA9IHNvdXJjZXMuY29uY2F0KCRtYXJrZG93bmVuZ2luZS5saXN0Um9vdE1hcmtkb3ducygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgIT09ICcnKSB7XG4gICAgICAgICAgICBzb3VyY2VzID0gc291cmNlcy5jb25jYXQodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3YXRjaGVyID0gY2hva2lkYXIud2F0Y2goc291cmNlcywge1xuICAgICAgICAgICAgICAgIGF3YWl0V3JpdGVGaW5pc2g6IHRydWUsXG4gICAgICAgICAgICAgICAgaWdub3JlSW5pdGlhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpZ25vcmVkOiAvKHNwZWN8XFwuZClcXC50cy9cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGltZXJBZGRBbmRSZW1vdmVSZWYsXG4gICAgICAgICAgICB0aW1lckNoYW5nZVJlZixcbiAgICAgICAgICAgIHdhaXRlckFkZEFuZFJlbW92ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJBZGRBbmRSZW1vdmVSZWYpO1xuICAgICAgICAgICAgICAgIHRpbWVyQWRkQW5kUmVtb3ZlUmVmID0gc2V0VGltZW91dChydW5uZXJBZGRBbmRSZW1vdmUsIDEwMDApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5lckFkZEFuZFJlbW92ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YWl0ZXJDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2hhbmdlUmVmKTtcbiAgICAgICAgICAgICAgICB0aW1lckNoYW5nZVJlZiA9IHNldFRpbWVvdXQocnVubmVyQ2hhbmdlLCAxMDAwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uZXJDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZWRGaWxlcyh0aGlzLndhdGNoQ2hhbmdlZEZpbGVzKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNXYXRjaGVkRmlsZXNUU0ZpbGVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRNaWNyb0RlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzV2F0Y2hlZEZpbGVzUm9vdE1hcmtkb3duRmlsZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYnVpbGRSb290TWFya2Rvd25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkRXh0ZXJuYWxEb2N1bWVudGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB3YXRjaGVyXG4gICAgICAgICAgICAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghd2F0Y2hlclJlYWR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdGNoZXJSZWFkeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHdhdGNoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignYWRkJywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYEZpbGUgJHtmaWxlfSBoYXMgYmVlbiBhZGRlZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlc3QgZXh0ZW5zaW9uLCBpZiB0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2NhbiBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGVyQWRkQW5kUmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignY2hhbmdlJywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYEZpbGUgJHtmaWxlfSBoYXMgYmVlbiBjaGFuZ2VkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVzdCBleHRlbnNpb24sIGlmIHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzY2FuIG9ubHkgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnIHx8IHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy5tZCcgfHwgcGF0aC5leHRuYW1lKGZpbGUpID09PSAnLmpzb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hDaGFuZ2VkRmlsZXMucHVzaChwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0ZXJDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCd1bmxpbmsnLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgRmlsZSAke2ZpbGV9IGhhcyBiZWVuIHJlbW92ZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXN0IGV4dGVuc2lvbiwgaWYgdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNjYW4gZXZlcnl0aGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRlckFkZEFuZFJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYXBwbGljYXRpb24gLyByb290IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBnZXQgYXBwbGljYXRpb24oKTpBcHBsaWNhdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgZ2V0IGlzQ0xJKCk6Ym9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBnbG9iID0gcmVxdWlyZSgnZ2xvYicpO1xuXG5leHBvcnQgbGV0IEV4Y2x1ZGVQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBsZXQgX2V4Y2x1ZGUsXG4gICAgICAgIF9jd2QsXG4gICAgICAgIF9nbG9iRmlsZXMgPSBbXTtcblxuICAgIGxldCBfaW5pdCA9IGZ1bmN0aW9uKGV4Y2x1ZGU6IHN0cmluZ1tdLCBjd2Q6IHN0cmluZykge1xuICAgICAgICAgICAgX2V4Y2x1ZGUgPSBleGNsdWRlO1xuICAgICAgICAgICAgX2N3ZCA9IGN3ZDtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBleGNsdWRlLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgX2dsb2JGaWxlcyA9IFsuLi5fZ2xvYkZpbGVzLCAuLi5nbG9iLnN5bmMoZXhjbHVkZVtpXSwgeyBjd2Q6IF9jd2QgfSldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF90ZXN0RmlsZSA9IChmaWxlOiBzdHJpbmcpOmJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IF9leGNsdWRlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBmaWxlQmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2xvYi5oYXNNYWdpYyhfZXhjbHVkZVtpXSkgJiYgX2dsb2JGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHRHbG9iU2VhcmNoID0gX2dsb2JGaWxlcy5maW5kSW5kZXgoKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5iYXNlbmFtZShlbGVtZW50KSA9PT0gZmlsZUJhc2VuYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdEdsb2JTZWFyY2ggIT09IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZpbGVCYXNlbmFtZSA9PT0gcGF0aC5iYXNlbmFtZShfZXhjbHVkZVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdCkge2JyZWFrO31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQ6IF9pbml0LFxuICAgICAgICB0ZXN0RmlsZTogX3Rlc3RGaWxlXG4gICAgfVxufSkoKTtcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9hcHAvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgcmVhZENvbmZpZywgaGFuZGxlUGF0aCB9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHsgRXhjbHVkZVBhcnNlciB9IGZyb20gJy4vdXRpbHMvZXhjbHVkZS5wYXJzZXInO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBvcyA9IHJlcXVpcmUoJ29zJyksXG4gICAgb3NOYW1lID0gcmVxdWlyZSgnb3MtbmFtZScpLFxuICAgIGZpbGVzID0gW10sXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxucHJvY2Vzcy5zZXRNYXhMaXN0ZW5lcnMoMCk7XG5cbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChlcnIpID0+IHtcbiAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICBsb2dnZXIuZXJyb3IoJ1NvcnJ5LCBidXQgdGhlcmUgd2FzIGEgcHJvYmxlbSBkdXJpbmcgcGFyc2luZyBvciBnZW5lcmF0aW9uIG9mIHRoZSBkb2N1bWVudGF0aW9uLiBQbGVhc2UgZmlsbCBhbiBpc3N1ZSBvbiBnaXRodWIuIChodHRwczovL2dpdGh1Yi5jb20vY29tcG9kb2MvY29tcG9kb2MvaXNzdWVzL25ldyknKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG59KTtcblxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSA9PiB7XG4gICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgbG9nZ2VyLmVycm9yKCdTb3JyeSwgYnV0IHRoZXJlIHdhcyBhIHByb2JsZW0gZHVyaW5nIHBhcnNpbmcgb3IgZ2VuZXJhdGlvbiBvZiB0aGUgZG9jdW1lbnRhdGlvbi4gUGxlYXNlIGZpbGwgYW4gaXNzdWUgb24gZ2l0aHViLiAoaHR0cHM6Ly9naXRodWIuY29tL2NvbXBvZG9jL2NvbXBvZG9jL2lzc3Vlcy9uZXcpJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBDbGlBcHBsaWNhdGlvbiBleHRlbmRzIEFwcGxpY2F0aW9uXG57XG4gICAgLyoqXG4gICAgICogUnVuIGNvbXBvZG9jIGZyb20gdGhlIGNvbW1hbmQgbGluZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gbGlzdCh2YWwpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWwuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2dyYW1cbiAgICAgICAgICAgIC52ZXJzaW9uKHBrZy52ZXJzaW9uKVxuICAgICAgICAgICAgLnVzYWdlKCc8c3JjPiBbb3B0aW9uc10nKVxuICAgICAgICAgICAgLm9wdGlvbignLXAsIC0tdHNjb25maWcgW2NvbmZpZ10nLCAnQSB0c2NvbmZpZy5qc29uIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLWQsIC0tb3V0cHV0IFtmb2xkZXJdJywgJ1doZXJlIHRvIHN0b3JlIHRoZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiAoZGVmYXVsdDogLi9kb2N1bWVudGF0aW9uKScsIENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcilcbiAgICAgICAgICAgIC5vcHRpb24oJy15LCAtLWV4dFRoZW1lIFtmaWxlXScsICdFeHRlcm5hbCBzdHlsaW5nIHRoZW1lIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLW4sIC0tbmFtZSBbbmFtZV0nLCAnVGl0bGUgZG9jdW1lbnRhdGlvbicsIENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKVxuICAgICAgICAgICAgLm9wdGlvbignLWEsIC0tYXNzZXRzRm9sZGVyIFtmb2xkZXJdJywgJ0V4dGVybmFsIGFzc2V0cyBmb2xkZXIgdG8gY29weSBpbiBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiBmb2xkZXInKVxuICAgICAgICAgICAgLm9wdGlvbignLW8sIC0tb3BlbicsICdPcGVuIHRoZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbicsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXQsIC0tc2lsZW50JywgJ0luIHNpbGVudCBtb2RlLCBsb2cgbWVzc2FnZXMgYXJlblxcJ3QgbG9nZ2VkIGluIHRoZSBjb25zb2xlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctcywgLS1zZXJ2ZScsICdTZXJ2ZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiAoZGVmYXVsdCBodHRwOi8vbG9jYWxob3N0OjgwODAvKScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXIsIC0tcG9ydCBbcG9ydF0nLCAnQ2hhbmdlIGRlZmF1bHQgc2VydmluZyBwb3J0JywgQ09NUE9ET0NfREVGQVVMVFMucG9ydClcbiAgICAgICAgICAgIC5vcHRpb24oJy13LCAtLXdhdGNoJywgJ1dhdGNoIHNvdXJjZSBmaWxlcyBhZnRlciBzZXJ2ZSBhbmQgZm9yY2UgZG9jdW1lbnRhdGlvbiByZWJ1aWxkJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRoZW1lIFt0aGVtZV0nLCAnQ2hvb3NlIG9uZSBvZiBhdmFpbGFibGUgdGhlbWVzLCBkZWZhdWx0IGlzIFxcJ2dpdGJvb2tcXCcgKGxhcmF2ZWwsIG9yaWdpbmFsLCBwb3N0bWFyaywgcmVhZHRoZWRvY3MsIHN0cmlwZSwgdmFncmFudCknKVxuICAgICAgICAgICAgLm9wdGlvbignLS1oaWRlR2VuZXJhdG9yJywgJ0RvIG5vdCBwcmludCB0aGUgQ29tcG9kb2MgbGluayBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRvZ2dsZU1lbnVJdGVtcyA8aXRlbXM+JywgJ0Nsb3NlIGJ5IGRlZmF1bHQgaXRlbXMgaW4gdGhlIG1lbnUgKGRlZmF1bHQgW1xcJ2FsbFxcJ10pIHZhbHVlcyA6IFtcXCdhbGxcXCddIG9yIG9uZSBvZiB0aGVzZSBbXFwnbW9kdWxlc1xcJyxcXCdjb21wb25lbnRzXFwnLFxcJ2RpcmVjdGl2ZXNcXCcsXFwnY2xhc3Nlc1xcJyxcXCdpbmplY3RhYmxlc1xcJyxcXCdpbnRlcmZhY2VzXFwnLFxcJ3BpcGVzXFwnLFxcJ2FkZGl0aW9uYWxQYWdlc1xcJ10nLCBsaXN0LCBDT01QT0RPQ19ERUZBVUxUUy50b2dnbGVNZW51SXRlbXMpXG4gICAgICAgICAgICAub3B0aW9uKCctLWluY2x1ZGVzIFtwYXRoXScsICdQYXRoIG9mIGV4dGVybmFsIG1hcmtkb3duIGZpbGVzIHRvIGluY2x1ZGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1pbmNsdWRlc05hbWUgW25hbWVdJywgJ05hbWUgb2YgaXRlbSBtZW51IG9mIGV4dGVybmFscyBtYXJrZG93biBmaWxlcyAoZGVmYXVsdCBcIkFkZGl0aW9uYWwgZG9jdW1lbnRhdGlvblwiKScsIENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeU5hbWUpXG4gICAgICAgICAgICAub3B0aW9uKCctLWNvdmVyYWdlVGVzdCBbdGhyZXNob2xkXScsICdUZXN0IGNvbW1hbmQgb2YgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSB3aXRoIGEgdGhyZXNob2xkIChkZWZhdWx0IDcwKScpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiIGFuZCBsaW5rcyB0byBzb3VyY2UgY29kZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlR3JhcGgnLCAnRG8gbm90IGFkZCB0aGUgZGVwZW5kZW5jeSBncmFwaCcsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlQ292ZXJhZ2UnLCAnRG8gbm90IGFkZCB0aGUgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSByZXBvcnQnLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCcsICdEbyBub3Qgc2hvdyBwcml2YXRlLCBAaW50ZXJuYWwgb3IgQW5ndWxhciBsaWZlY3ljbGUgaG9va3MgaW4gZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24nLCBmYWxzZSlcbiAgICAgICAgICAgIC5wYXJzZShwcm9jZXNzLmFyZ3YpO1xuXG4gICAgICAgIGxldCBvdXRwdXRIZWxwID0gKCkgPT4ge1xuICAgICAgICAgICAgcHJvZ3JhbS5vdXRwdXRIZWxwKClcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCA9IHByb2dyYW0ub3V0cHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZXh0VGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSA9IHByb2dyYW0uZXh0VGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS50aGVtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRoZW1lID0gcHJvZ3JhbS50aGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPSBwcm9ncmFtLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5hc3NldHNGb2xkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgPSBwcm9ncmFtLmFzc2V0c0ZvbGRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vcGVuID0gcHJvZ3JhbS5vcGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0udG9nZ2xlTWVudUl0ZW1zKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudG9nZ2xlTWVudUl0ZW1zID0gcHJvZ3JhbS50b2dnbGVNZW51SXRlbXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlcykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICA9IHByb2dyYW0uaW5jbHVkZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlc05hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc05hbWUgID0gcHJvZ3JhbS5pbmNsdWRlc05hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5zaWxlbnQpIHtcbiAgICAgICAgICAgIGxvZ2dlci5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUgID0gcHJvZ3JhbS5zZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0ID0gcHJvZ3JhbS5wb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ud2F0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS53YXRjaCA9IHByb2dyYW0ud2F0Y2g7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHByb2dyYW0uaGlkZUdlbmVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgPSBwcm9ncmFtLmluY2x1ZGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXNOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXNOYW1lID0gcHJvZ3JhbS5pbmNsdWRlc05hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5jb3ZlcmFnZVRlc3QpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZVRlc3QgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdFRocmVzaG9sZCA9ICh0eXBlb2YgcHJvZ3JhbS5jb3ZlcmFnZVRlc3QgPT09ICdzdHJpbmcnKSA/IHBhcnNlSW50KHByb2dyYW0uY292ZXJhZ2VUZXN0KSA6IENPTVBPRE9DX0RFRkFVTFRTLmRlZmF1bHRDb3ZlcmFnZVRocmVzaG9sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoID0gcHJvZ3JhbS5kaXNhYmxlR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UgPSBwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0ID0gcHJvZ3JhbS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzV2F0Y2hpbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc3JjL3Jlc291cmNlcy9pbWFnZXMvYmFubmVyJykpLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGtnLnZlcnNpb24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE5vZGUuanMgdmVyc2lvbiA6ICR7cHJvY2Vzcy52ZXJzaW9ufWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE9wZXJhdGluZyBzeXN0ZW0gOiAke29zTmFtZShvcy5wbGF0Zm9ybSgpLCBvcy5yZWxlYXNlKCkpfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUgJiYgIXByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIC1zICYgLWQsIHNlcnZlIGl0XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS5vdXRwdXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGAke3Byb2dyYW0ub3V0cHV0fSBmb2xkZXIgZG9lc24ndCBleGlzdGApO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7cHJvZ3JhbS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9ncmFtLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgc3VwZXIucnVuV2ViU2VydmVyKHByb2dyYW0ub3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmICFwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgLy8gaWYgb25seSAtcyBmaW5kIC4vZG9jdW1lbnRhdGlvbiwgaWYgb2sgc2VydmUsIGVsc2UgZXJyb3IgcHJvdmlkZSAtZFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignUHJvdmlkZSBvdXRwdXQgZ2VuZXJhdGVkIGZvbGRlciB3aXRoIC1kIGZsYWcnKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmhpZGVHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnID0gcHJvZ3JhbS50c2NvbmZpZztcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS50c2NvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBcIiR7cHJvZ3JhbS50c2NvbmZpZ31cIiBmaWxlIHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2ZpbGUgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5iYXNlbmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IF9maWxlLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgdHNDb25maWdGaWxlID0gcmVhZENvbmZpZyhfZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gdHNDb25maWdGaWxlLmZpbGVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gaGFuZGxlUGF0aChmaWxlcywgY3dkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlID0gdHNDb25maWdGaWxlLmV4Y2x1ZGUgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRXhjbHVkZVBhcnNlci5pbml0KGV4Y2x1ZGUsIGN3ZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaW5kZXIgPSByZXF1aXJlKCdmaW5kaXQnKShjd2QgfHwgJy4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdkaXJlY3RvcnknLCBmdW5jdGlvbiAoZGlyLCBzdGF0LCBzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2UgPSBwYXRoLmJhc2VuYW1lKGRpcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UgPT09ICcuZ2l0JyB8fCBiYXNlID09PSAnbm9kZV9tb2R1bGVzJykgc3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdmaWxlJywgKGZpbGUsIHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoLyhzcGVjfFxcLmQpXFwudHMvLnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKEV4Y2x1ZGVQYXJzZXIudGVzdEZpbGUoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0V4Y2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSW5jbHVkaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRlci5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlci5nZW5lcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXBlci5nZW5lcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCAmJiBwcm9ncmFtLmNvdmVyYWdlVGVzdCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdSdW4gZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSB0ZXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnID0gcHJvZ3JhbS50c2NvbmZpZztcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS50c2NvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBcIiR7cHJvZ3JhbS50c2NvbmZpZ31cIiBmaWxlIHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2ZpbGUgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIHBhdGguZGlybmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpKSxcbiAgICAgICAgICAgICAgICAgICAgICBwYXRoLmJhc2VuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBvZiB0c2NvbmZpZy5qc29uIGFzIGEgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgICAgY3dkID0gX2ZpbGUuc3BsaXQocGF0aC5zZXApLnNsaWNlKDAsIC0xKS5qb2luKHBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1VzaW5nIHRzY29uZmlnJywgX2ZpbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0c0NvbmZpZ0ZpbGUgPSByZWFkQ29uZmlnKF9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSB0c0NvbmZpZ0ZpbGUuZmlsZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBoYW5kbGVQYXRoKGZpbGVzLCBjd2QpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSB0c0NvbmZpZ0ZpbGUuZXhjbHVkZSB8fCBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRXhjbHVkZVBhcnNlci5pbml0KGV4Y2x1ZGUsIGN3ZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaW5kZXIgPSByZXF1aXJlKCdmaW5kaXQnKShjd2QgfHwgJy4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdkaXJlY3RvcnknLCBmdW5jdGlvbiAoZGlyLCBzdGF0LCBzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2UgPSBwYXRoLmJhc2VuYW1lKGRpcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UgPT09ICcuZ2l0JyB8fCBiYXNlID09PSAnbm9kZV9tb2R1bGVzJykgc3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdmaWxlJywgKGZpbGUsIHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoLyhzcGVjfFxcLmQpXFwudHMvLnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKEV4Y2x1ZGVQYXJzZXIudGVzdEZpbGUoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0V4Y2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSW5jbHVkaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRlci5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlci50ZXN0Q292ZXJhZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuc2V0RmlsZXMoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBzdXBlci50ZXN0Q292ZXJhZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xuICAgICAgICAgICAgICAgIGxldCBzb3VyY2VGb2xkZXIgPSBwcm9ncmFtLmFyZ3NbMF07XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNvdXJjZUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBzb3VyY2UgZm9sZGVyICR7c291cmNlRm9sZGVyfSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1VzaW5nIHByb3ZpZGVkIHNvdXJjZSBmb2xkZXInKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS50c2NvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgXCIke3Byb2dyYW0udHNjb25maWd9XCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRzQ29uZmlnRmlsZSA9IHJlYWRDb25maWcocHJvZ3JhbS50c2NvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZSA9IHRzQ29uZmlnRmlsZS5leGNsdWRlIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBFeGNsdWRlUGFyc2VyLmluaXQoZXhjbHVkZSwgY3dkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbmRlciA9IHJlcXVpcmUoJ2ZpbmRpdCcpKHBhdGgucmVzb2x2ZShzb3VyY2VGb2xkZXIpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdkaXJlY3RvcnknLCBmdW5jdGlvbiAoZGlyLCBzdGF0LCBzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2UgPSBwYXRoLmJhc2VuYW1lKGRpcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UgPT09ICcuZ2l0JyB8fCBiYXNlID09PSAnbm9kZV9tb2R1bGVzJykgc3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdmaWxlJywgKGZpbGUsIHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoLyhzcGVjfFxcLmQpXFwudHMvLnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKEV4Y2x1ZGVQYXJzZXIudGVzdEZpbGUoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0V4Y2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSW5jbHVkaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRlci5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlci5nZW5lcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcigndHNjb25maWcuanNvbiBmaWxlIHdhcyBub3QgZm91bmQsIHBsZWFzZSB1c2UgLXAgZmxhZycpO1xuICAgICAgICAgICAgICAgIG91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJwa2ciLCJfIiwiSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciIsIkhhbmRsZWJhcnMuVXRpbHMiLCJIYW5kbGViYXJzLlNhZmVTdHJpbmciLCJwYXRoIiwicmVzb2x2ZSIsImZzLnJlYWRGaWxlIiwicGF0aC5yZXNvbHZlIiwiSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwiLCJIYW5kbGViYXJzLmNvbXBpbGUiLCJmcy5vdXRwdXRGaWxlIiwicGF0aC5zZXAiLCJtYXJrZWQiLCJkaXJuYW1lIiwicGF0aC5kaXJuYW1lIiwicGF0aC5iYXNlbmFtZSIsImZzLnJlYWRGaWxlU3luYyIsImZzLmV4aXN0c1N5bmMiLCJ0cyIsInBhdGguaXNBYnNvbHV0ZSIsInBhdGguam9pbiIsInNlcCIsInBhdGguZXh0bmFtZSIsImN3ZCIsImZzLmNvcHkiLCJMaXZlU2VydmVyLnN0YXJ0IiwiZ2xvYiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDckIsSUFBSUEsS0FBRyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXJDLElBQUssS0FLSjtBQUxELFdBQUssS0FBSztJQUNULGlDQUFJLENBQUE7SUFDSixtQ0FBSyxDQUFBO0lBQ0YsbUNBQUssQ0FBQTtJQUNMLGlDQUFJLENBQUE7Q0FDUCxFQUxJLEtBQUssS0FBTCxLQUFLLFFBS1Q7QUFFRDtJQU9DO1FBQ0MsSUFBSSxDQUFDLElBQUksR0FBR0EsS0FBRyxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHQSxLQUFHLENBQUMsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztLQUNuQjtJQUVELHFCQUFJLEdBQUo7UUFBSyxjQUFPO2FBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztZQUFQLHlCQUFPOztRQUNYLElBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFD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LEVBQUUsU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQ3BFLEtBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkNBLEdBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFDLFNBQVM7Z0JBQ3hDLElBQUksTUFBTSxHQUFHQSxHQUFDLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQ3BFLEtBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcENBLEdBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxVQUFDLFVBQVU7Z0JBQzFDLElBQUksTUFBTSxHQUFHQSxHQUFDLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQ3RFLEtBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQ3pDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkNBLEdBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFDLEdBQUc7Z0JBQ2xDLElBQUksTUFBTSxHQUFHQSxHQUFDLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7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
