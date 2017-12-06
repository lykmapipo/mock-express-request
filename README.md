# mock-express-request

[![Build Status](https://travis-ci.org/lykmapipo/mock-express-request.svg?branch=master)](https://travis-ci.org/lykmapipo/mock-express-request)

Nodejs library to mock [expressjs](https://github.com/strongloop/express/) http request based on [mock-req](https://github.com/diachedelic/mock-req)

See [mock-express-response](https://github.com/lykmapipo/mock-express-response) to mock express http response.

*Note: The mocked request instance have the same properties and methods as an instance of express http request*

## Installation
```sh
$ npm install --save-dev mock-express-request
```

## Usage
```js
var MockExpressRequest = require('mock-express-request');

// Basic usage
var request = new MockExpressRequest();

// With options
var request = new MockExpressRequest({
    method: 'PUT',
    url: '/stuff?q=thing',
    cookies: { token: "MYTOKEN" },
    headers: {
        'Accept': 'text/plain'
    }
    ...
});

//access express request methods
//and properties
var host = request.hostname
var path = request.path
var q = request.param('q');
//etc

...

```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```

* Then run test
```sh
$ npm test
```


## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.


## Licence
The MIT License (MIT)

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
