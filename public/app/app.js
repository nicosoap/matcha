import url from 'url'

module.exports  = {
    handleRequest: function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});

        var path = url.parse(request.url).pathname;
        switch (path) {
            case '/':
        }
    }
};
