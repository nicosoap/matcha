'use strict';

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    handleRequest: function handleRequest(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });

        var path = _url2.default.parse(request.url).pathname;
        switch (path) {
            case '/':
        }
    }
};

//# sourceMappingURL=app-compiled.js.map