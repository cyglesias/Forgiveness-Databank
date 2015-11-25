var levelup = require('levelup');
var express = require('express');
var app = express();
var server = app.listen(3000);
console.log("server running http://localhost:3000");
app.use(express.static('public'));

var io = require('socket.io')(server);

// 1) Create our database, supply location and options. 
//    This will create or open the underlying LevelDB store. 
var db = levelup('./mydb')
var i = 1;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
            socket.on('message', function(msg) {
                console.log(msg);
                i = i + 1;

                db.put(i, msg, function(err) {
                if (err) return console.log('Ooops!', err) // some kind of I/O error 
                console.log(db.db.getProperty('leveldb.num-files-at-level1'))
                // 3) fetch by key 
                db.get(i, function(err, value) {
                    if (err) return console.log('Ooops!', err) // likely the key was not found 
                    // ta da! 
                    io.sockets.emit('data', {
                        val: value
                    });
                    
                })
            })


            });
          });
