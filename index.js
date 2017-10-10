'use strict';

//dependencies
var _ = require('lodash');
var MockRequest = require('mock-req');
var util = require('util');
var accepts = require('accepts');
var isIP = require('net').isIP;
var typeis = require('type-is');
var fresh = require('fresh');
var parseRange = require('range-parser');
var parse = require('parseurl');


/**
 * @constructor
 * @description Express request mock
 * @public
 */
function MockExpressRequest(options) {
    //TODO add more default headers
    //
    //defaults headers
    var headers = {
        'Host': 'www.localhost.com',
        'Content-Type': 'application/json',
        'Content-Length': 8190,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    };

    //default connection properties
    var connection = {
        encrypted: false,
        ip: 'localhost'
    };

    //default app settings
    var app = {
        'subdomain offset': 2
    };

    //defaults res
    var res = {};

    options = options || {};

    //extend header options
    options.headers = _.merge(headers, options.headers || {});

    //extend connection settings
    options.connection = _.merge(connection, options.connection || {});

    //extend app settings
    options.app = _.merge(app, options.app || {});

    //extend res
    options.res = _.merge(res, options.res || {});

    // default query property
    options.query = options.query || {};


    MockRequest.call(this, options);

    // Cookies may be passed in directly.
    // If not, we provide an empty stub.
    if (!this.cookies) {
      this.cookies = {};
    }
}
util.inherits(MockExpressRequest, MockRequest);

//------------------------------------------------------------------------------
// Express request methods
//------------------------------------------------------------------------------

/**
 * Return request header.
 *
 * The `Referrer` header field is special-cased,
 * both `Referrer` and `Referer` are interchangeable.
 *
 * Examples:
 *
 *     req.get('Content-Type');
 *     // => "text/plain"
 *
 *     req.get('content-type');
 *     // => "text/plain"
 *
 *     req.get('Something');
 *     // => undefined
 *
 * Aliased as `req.header()`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */
MockExpressRequest.prototype.get =
    MockExpressRequest.prototype.header = function(name) {
        name = name.toLowerCase();

        switch (name) {
            case 'referer':
            case 'referrer':
                return this.headers.referrer || this.headers.referer;
            default:
                return this.headers[name];
        }
    };


/**
 * To do: update docs.
 *
 * Check if the given `type(s)` is acceptable, returning
 * the best match when true, otherwise `undefined`, in which
 * case you should respond with 406 "Not Acceptable".
 *
 * The `type` value may be a single MIME type string
 * such as "application/json", an extension name
 * such as "json", a comma-delimited list such as "json, html, text/plain",
 * an argument list such as `"json", "html", "text/plain"`,
 * or an array `["json", "html", "text/plain"]`. When a list
 * or array is given, the _best_ match, if any is returned.
 *
 * Examples:
 *
 *     // Accept: text/html
 *     req.accepts('html');
 *     // => "html"
 *
 *     // Accept: text/*, application/json
 *     req.accepts('html');
 *     // => "html"
 *     req.accepts('text/html');
 *     // => "text/html"
 *     req.accepts('json, text');
 *     // => "json"
 *     req.accepts('application/json');
 *     // => "application/json"
 *
 *     // Accept: text/*, application/json
 *     req.accepts('image/png');
 *     req.accepts('png');
 *     // => undefined
 *
 *     // Accept: text/*;q=.5, application/json
 *     req.accepts(['html', 'json']);
 *     req.accepts('html', 'json');
 *     req.accepts('html, json');
 *     // => "json"
 *
 * @param {String|Array} type(s)
 * @return {String}
 * @api public
 */
MockExpressRequest.prototype.accepts = function() {
    var accept = accepts(this);
    return accept.types.apply(accept, arguments);
};


/**
 * Check if the given `encoding`s are accepted.
 *
 * @param {String} ...encoding
 * @return {Boolean}
 * @api public
 */

MockExpressRequest.prototype.acceptsEncodings = function() {
    var accept = accepts(this);
    return accept.encodings.apply(accept, arguments);
};


/**
 * Check if the given `charset`s are acceptable,
 * otherwise you should respond with 406 "Not Acceptable".
 *
 * @param {String} ...charset
 * @return {Boolean}
 * @api public
 */
MockExpressRequest.prototype.acceptsCharsets = function() {
    var accept = accepts(this);
    return accept.charsets.apply(accept, arguments);
};


/**
 * Check if the given `lang`s are acceptable,
 * otherwise you should respond with 406 "Not Acceptable".
 *
 * @param {String} ...lang
 * @return {Boolean}
 * @api public
 */
MockExpressRequest.prototype.acceptsLanguages = function() {
    var accept = accepts(this);
    return accept.languages.apply(accept, arguments);
};


/**
 * Parse Range header field,
 * capping to the given `size`.
 *
 * Unspecified ranges such as "0-" require
 * knowledge of your resource length. In
 * the case of a byte range this is of course
 * the total number of bytes. If the Range
 * header field is not given `null` is returned,
 * `-1` when unsatisfiable, `-2` when syntactically invalid.
 *
 * NOTE: remember that ranges are inclusive, so
 * for example "Range: users=0-3" should respond
 * with 4 users when available, not 3.
 *
 * @param {Number} size
 * @return {Array}
 * @api public
 */
MockExpressRequest.prototype.range = function(size) {
    var range = this.get('Range');
    if (!range) {
        return;
    } else {
        return parseRange(size, range);
    }
};


/**
 * Return the value of param `name` when present or `defaultValue`.
 *
 *  - Checks route placeholders, ex: _/user/:id_
 *  - Checks body params, ex: id=12, {"id":12}
 *  - Checks query string params, ex: ?id=12
 *
 * To utilize request bodies, `req.body`
 * should be an object. This can be done by using
 * the `bodyParser()` middleware.
 *
 * @param {String} name
 * @param {Mixed} [defaultValue]
 * @return {String}
 * @api public
 */
MockExpressRequest.prototype.param = function param(name, defaultValue) {
    //TODO parse url params
    var params = this.params || {};
    var body = this.body || {};
    var query = this.query || {};

    //TODO Fix this
    // var args = arguments.length === 1 ? 'name' : 'name, default';
    // deprecate('req.param(' + args + '): Use req.params, req.body, or req.query instead');

    if (_.has(params, name)) {
        return params[name];
    }
    if (_.has(body, name)) {
        return body[name];
    }
    if (_.has(query, name)) {
        return query[name];
    }

    return defaultValue;
};


/**
 * Check if the incoming request contains the "Content-Type"
 * header field, and it contains the give mime `type`.
 *
 * Examples:
 *
 *      // With Content-Type: text/html; charset=utf-8
 *      req.is('html');
 *      req.is('text/html');
 *      req.is('text/*');
 *      // => true
 *
 *      // When Content-Type is application/json
 *      req.is('json');
 *      req.is('application/json');
 *      req.is('application/*');
 *      // => true
 *
 *      req.is('html');
 *      // => false
 *
 * @param {String} type
 * @return {Boolean}
 * @api public
 */
MockExpressRequest.prototype.is = function(types) {
    if (!Array.isArray(types)) {
        types = [].slice.call(arguments);
    }

    return typeis(this, types);
};


/**
 * Helper function for creating a getter on an object.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} getter
 * @api private
 */
function defineGetter(obj, name, getter) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        get: getter
    });
}


/**
 * Return the protocol string "http" or "https"
 * when requested with TLS. When the "trust proxy"
 * setting trusts the socket address, the
 * "X-Forwarded-Proto" header field will be trusted
 * and used if present.
 *
 * If you're running behind a reverse proxy that
 * supplies https for you this may be enabled.
 *
 * @return {String}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'protocol', function protocol() {
    var proto = this.connection.encrypted ? 'https' : 'http';

    //TODO fix this
    // var trust = this.app.get('trust proxy fn');

    // if (!trust(this.connection.remoteAddress, 0)) {
    //     return proto;
    // }

    // Note: X-Forwarded-Proto is normally only ever a
    //       single value, but this is to be safe.
    // proto = this.get('X-Forwarded-Proto') || proto;
    // return proto.split(/\s*,\s*/)[0];
    return proto;
});


/**
 * Short-hand for:
 *
 *    req.protocol == 'https'
 *
 * @return {Boolean}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'secure', function secure() {
    return 'https' === this.protocol;
});

/**
 * Return the remote address from the trusted proxy.
 *
 * The is the remote address on the socket unless
 * "trust proxy" is set.
 *
 * @return {String}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'ip', function ip() {
    return this.connection.ip;

    // TODO fix this
    // var trust = this.app.get('trust proxy fn');
    // return proxyaddr(this, trust);
});


/**
 * When "trust proxy" is set, trusted proxy addresses + client.
 *
 * For example if the value were "client, proxy1, proxy2"
 * you would receive the array `["client", "proxy1", "proxy2"]`
 * where "proxy2" is the furthest down-stream and "proxy1" and
 * "proxy2" were trusted.
 *
 * @return {Array}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'ips', function ips() {
    return [this.connection.ip];

    //TODO fix this
    // var trust = this.app.get('trust proxy fn');
    // var addrs = proxyaddr.all(this, trust);
    // return addrs.slice(1).reverse();
});


/**
 * Return subdomains as an array.
 *
 * Subdomains are the dot-separated parts of the host before the main domain of
 * the app. By default, the domain of the app is assumed to be the last two
 * parts of the host. This can be changed by setting "subdomain offset".
 *
 * For example, if the domain is "tobi.ferrets.example.com":
 * If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
 * If "subdomain offset" is 3, req.subdomains is `["tobi"]`.
 *
 * @return {Array}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'subdomains', function subdomains() {
    var hostname = this.hostname;

    if (!hostname) {
        return [];
    }

    var offset = this.app['subdomain offset'];
    var _subdomains = !isIP(hostname) ? hostname.split('.').reverse() : [hostname];

    return _subdomains.slice(offset);
});


/**
 * Short-hand for `url.parse(req.url).pathname`.
 *
 * @return {String}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'path', function path() {
    return parse(this).pathname;
});


/**
 * Parse the "Host" header field to a hostname.
 *
 * When the "trust proxy" setting trusts the socket
 * address, the "X-Forwarded-Host" header field will
 * be trusted.
 *
 * @return {String}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'hostname', function hostname() {
    //TODO fix this
    // var trust = this.app.get('trust proxy fn');
    var host = this.get('host');

    // if (!host || !trust(this.connection.remoteAddress, 0)) {
    //     host = this.get('Host');
    // }

    if (!host) {
        return;
    }

    // IPv6 literal support
    var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
    var index = host.indexOf(':', offset);

    /*jshint bitwise:false*/
    return ~index ? host.substring(0, index) : host;
    /*jshint bitwise:true*/
});

// TODO: change req.host to return host in next major
defineGetter(MockExpressRequest.prototype, 'host', function host() {
    return this.hostname;
});


/**
 * Check if the request is fresh, aka
 * Last-Modified and/or the ETag
 * still match.
 *
 * @return {Boolean}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'fresh', function() {
    var method = this.method;
    var s = this.res ? this.res.statusCode : 200;

    // GET or HEAD for weak freshness validation only
    if ('GET' !== method && 'HEAD' !== method) {
        return false;
    }

    // 2xx or 304 as per rfc2616 14.26
    if ((s >= 200 && s < 300) || 304 === s) {
        return fresh(this.headers, (this.res._headers || {}));
    }

    return false;
});

/**
 * Check if the request is stale, aka
 * "Last-Modified" and / or the "ETag" for the
 * resource has changed.
 *
 * @return {Boolean}
 * @api public
 */
defineGetter(MockRequest.prototype, 'stale', function stale() {
    return !this.fresh;
});


/**
 * Check if the request was an _XMLHttpRequest_.
 *
 * @return {Boolean}
 * @api public
 */
defineGetter(MockExpressRequest.prototype, 'xhr', function xhr() {
    var val = this.get('X-Requested-With') || '';
    return 'xmlhttprequest' === val.toLowerCase();
});


/**
 * @description export MockExpressRequest
 * @type {[type]}
 */
module.exports = MockExpressRequest;
