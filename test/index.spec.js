'use strict';

//dependencies
var path = require('path');
var expect = require('chai').expect;
var MockExpressRequest = require(path.join(__dirname, '..', 'index'));


describe('MockExpressRequest', function() {
    it('should be a function constructor', function(done) {
        expect(MockExpressRequest).to.be.a('function');
        done();
    });


    it('should be able to instantiate it', function(done) {
        var request = new MockExpressRequest({
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': 10
            }
        });

        expect(request.headers['content-type']).to.be.equal('text/plain');
        expect(request.headers['content-length']).to.be.equal('10');

        done();
    });


    it('should be able to `get` request header', function(done) {
        var request = new MockExpressRequest({
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': 10
            }
        });

        expect(request.get('Content-Type')).to.equal('text/plain');
        expect(request.header('Content-Type')).to.equal('text/plain');

        done();
    });


    it('should be able to check if the given `type(s)` is acceptable', function(done) {
        var request = new MockExpressRequest({
            headers: {
                'Accept': '*/*'
            }
        });

        expect(request.accepts()).to.be.eql(['*/*']);
        expect(request.accepts('html')).to.be.equal('html');
        expect(request.accepts(['html', 'json'])).to.be.equal('html');

        done();
    });


    it('should be able to check if the given `encoding`s are accepted', function(done) {
        var request = new MockExpressRequest();

        expect(request.acceptsEncodings('zip')).to.be.false;
        expect(request.acceptsEncodings('deflate')).to.be.equal('deflate');
        expect(request.acceptsEncodings('gzip')).to.be.equal('gzip');

        done();
    });


    it('should be able to check if given `charset`s are acceptable', function(done) {
        var request = new MockExpressRequest();

        expect(request.acceptsCharsets('utf-8')).to.be.equal('utf-8');

        done();
    });


    it('should be able to check if the given `lang`s are acceptable', function(done) {
        var request = new MockExpressRequest();

        expect(request.acceptsCharsets('en-US')).to.be.equal('en-US');

        done();
    });


    it('should be able to parse Range header field, * capping to the given `size`', function(done) {
        var request = new MockExpressRequest({
            headers: {
                'Range': 'bytes=0-1024'
            }
        });

        expect(request.range()[0]).to.be.eql({
            start: 0,
            end: 1024
        });

        done();
    });

    it('should have an empty query', function() {
      var req = new MockExpressRequest();
      expect(req).to.have.property('query');
    });

    it('should expose query parameters as properties', function() {
      var req = new MockExpressRequest({
        query: {
          id: 20
        }
      });

      expect(req.query).to.have.property('id', 20);
    });

    it('should be able to return the value of param `name` when present or `defaultValue`.', function(done) {
        var request = new MockExpressRequest({
            body: {
                id: 103
            },
            params: {
                limit: 10
            },
            query: {
                where: {
                    id: 103
                }
            }
        });

        expect(request.param('id')).to.be.equal(103);
        expect(request.param('limit')).to.be.eql(10);
        expect(request.param('where')).to.be.eql({
            id: 103
        });

        done();
    });


    it('should be able to check if the incoming request contains the `Content-Type` header field, and it contains the give mime `type`', function(done) {

        var request = new MockExpressRequest();

        expect(request.is('html')).to.be.false;
        expect(request.is('json')).to.be.equal('json');
        expect(request.is('application/json')).to.be.equal('application/json');

        done();

    });


    it('should be able return request protocol', function(done) {

        //default with connection not encypted
        var request = new MockExpressRequest();
        expect(request.protocol).to.be.equal('http');

        //when connection encrypted
        var _request = new MockExpressRequest({
            connection: {
                encrypted: true
            }
        });
        expect(_request.protocol).to.be.equal('https');


        done();

    });


    it('should be able check if request use secure protocol', function(done) {

        //default with connection not encypted
        var request = new MockExpressRequest();
        expect(request.secure).to.be.false;

        //when connection encrypted
        var _request = new MockExpressRequest({
            connection: {
                encrypted: true
            }
        });
        expect(_request.secure).to.be.true;

        done();

    });


    it('should be able to return the remote address from the trusted proxy', function(done) {
        var request = new MockExpressRequest();
        expect(request.ip).to.be.equal('localhost');

        var _request = new MockExpressRequest({
            connection: {
                ip: '192.56.56.7'
            }
        });
        expect(_request.ip).to.be.eql('192.56.56.7');

        done();
    });


    it('should be able to return trusted proxy addresses + client', function(done) {
        var request = new MockExpressRequest();
        expect(request.ips).to.be.eql(['localhost']);

        var _request = new MockExpressRequest({
            connection: {
                ip: '192.56.56.7'
            }
        });
        expect(_request.ips).to.be.eql(['192.56.56.7']);
        done();
    });



    it('should be able to return subdomains as an array.', function(done) {
        var request = new MockExpressRequest();
        expect(request.subdomains).to.be.eql(['www']);

        var _request = new MockExpressRequest({
            headers: {
                Host: 'demo.static.localhost.com'
            }
        });
        expect(_request.subdomains).to.be.eql(['static', 'demo']);
        done();
    });


    it('should be able to parse the "Host" header field to a hostname', function(done) {
        var request = new MockExpressRequest();
        expect(request.hostname).to.be.equal('www.localhost.com');

        var _request = new MockExpressRequest({
            headers: {
                Host: 'demo.localhost.com'
            }
        });
        expect(_request.hostname).to.be.equal('demo.localhost.com');
        expect(_request.host).to.be.equal('demo.localhost.com');
        done();
    });


    it('should be able to parse request url to obtain path', function(done) {
        var request = new MockExpressRequest({
            url: 'users?id=1234566'
        });
        expect(request.path).to.be.equal('users');

        done();
    });


    it('should be able to check if the request is fresh', function(done) {
        var request = new MockExpressRequest();
        expect(request.fresh).to.be.false;

        done();
    });


    it('should be able to check if the request is stale', function(done) {
        var request = new MockExpressRequest();
        expect(request.stale).to.be.true;

        done();
    });


    it('should be able to check if the request was an _XMLHttpRequest_', function(done) {
        var request = new MockExpressRequest();
        expect(request.xhr).to.be.false;

        var _request = new MockExpressRequest({
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        expect(_request.xhr).to.be.true;

        done();
    });


});
