'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.set('port', process.env.PORT || 8081);

app.get('/', function (req, res) {
    res.send('Express Works');
});

app.listen(app.get('port'), function () {
    console.log('Express started press Ctrl-C to terminate');
});

//# sourceMappingURL=server-compiled.js.map