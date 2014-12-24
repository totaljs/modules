/**
 * @module Translation
 * @version v1.00
 * @author Valdas Barakasuaks
 */

var FILE_CACHE = 'translation.cache';
var VERSION = 'v1.00';

var fs = require('fs');

function Translation() {

    this.options = null;
    this.translations = null;

}

Translation.prototype.call = function() {
    var key = arguments[1];
    var collection = this.options.collection;
    var language = this.options.language;
    var params = {};

    if (!this.isNull(arguments[2])) {
        collection = arguments[2];
    }
    if (!this.isNull(arguments[3])) {
        language = arguments[3];
    }
    if (!this.isNull(arguments[4])) {
        params = arguments[4];
    }

    return this.translate(key, collection, language, params);
}

/**
 * @param element
 *
 * @return {boolean}
 */
Translation.prototype.isNull = function(element) {
    if (element === null) {
        return true;
    }
    if (element === undefined) {
        return true;
    }
    return false;
}

/**
 * @param {String} key
 * @param {String} collection
 * @param {String} language
 * @param {Object} params
 *
 * @return {String}
 */
Translation.prototype.translate = function(key, collection, language, params) {
    if (
        !this.isNull(this.translations[language])
        && !this.isNull(this.translations[language][collection])
        && !this.isNull(this.translations[language][collection][key])
    ) {
        translation = this.translations[language][collection][key];
    } else if (
        !this.isNull(this.translations[language])
        && !this.isNull(this.translations[language][this.options.collection])
        && !this.isNull(this.translations[language][this.options.collection][key])
    ) {
        translation = this.translations[language][this.options.collection][key];
    } else if (
        !this.isNull(this.translations[this.options.language])
        && !this.isNull(this.translations[this.options.language][collection])
        && !this.isNull(this.translations[this.options.language][collection][key])
    ) {
        translation = this.translations[this.options.language][collection][key];
    } else if (
        !this.isNull(this.translations[this.options.language])
        && !this.isNull(this.translations[this.options.language][this.options.collection])
        && !this.isNull(this.translations[this.options.language][this.options.collection][key])
    ) {
        translation = this.translations[this.options.language][this.options.collection][key];
    } else {
        translation = key;
    }

    var keys = translation.match(/@?@{[\w,]+}/g);

    while (!this.isNull(keys)) {
        for (var i = 0; i < keys.length; i++) {
            if (keys[i][1] == '{') {
                var key = keys[i].match(/[\w]+/g);
                var value = '';
                if (!this.isNull(params[key])) {
                    value = params[key];
                }
                translation = translation.replace(keys[i], value);
            } else {
                var parts = keys[i].match(/[\w]+/g);
                if (this.isNull(parts[1])) {
                    parts[1] = collection;
                }
                if (this.isNull(parts[2])) {
                    parts[2] = language;
                }
                translation = translation.replace(keys[i], this.translate(parts[0], parts[1], parts[2], params));
            }
        }
        keys = translation.match(/@?@{[\w,]+}/g);
    }

    return translation;
};

Translation.prototype.load = function() {
    var filename = framework.path.databases(FILE_CACHE);
    var self = this;
    fs.readFile(filename, function(err, data) {
        if (err) {
            return;
        }
        try {
            self.translations = utils.copy(JSON.parse(data.toString('utf8')));
        } catch (ex) {
        }
    });
}

var translation = new Translation();

exports.name = 'translation';
exports.version = VERSION;

exports.install = function(framework, options) {
    translation.options = Utils.extend({language: 'en', collection: 'default'}, options);
    framework.helpers.translate = translation;
    translation.load();
};

module.exports.uninstall = function(framework, options) {
    delete framework.helpers.translate;
};