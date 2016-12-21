var express = require('express');
var app = express();

app.use(express.static('./static'));

app.use('/:songID', function (req, res) {
    var songID = req.params.songID;
    
    
});

app.listen(80, function() {
    console.log('Server started');
});