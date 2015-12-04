
var express = require('express');
var app = express();
var server = app.listen(3000);
console.log("server running http://localhost:3000");
app.use(express.static('public'));

var io = require('socket.io')(server);

var GoogleSpreadsheet = require("google-spreadsheet");

// pull in our local config file
var config = require("./config.js");

// create the reference to our spreadsheet
var my_sheet = new GoogleSpreadsheet(config.SPREADSHEET_ID);

var displayrow = null;

my_sheet.useServiceAccountAuth(config, function(err){
    if (err) {
      throw err;
    }
    else {
        console.log("logged into google")
        my_sheet.getRows ( 1, {
        },
        function(err, row_data){
            var a;
            var f;
            for (var i = row_data.length - 1; i >= 0; i--) {
                
                 a = row_data[i].apology;
                 f = row_data[i].forgiveness;
                 // console.log (a, f);
                 if (a != '' && f!='') {
                    displayrow = {
                        "apology": a,
                        "forgiveness": f
                    };
                    console.log (displayrow);
                    return;
                 }
            };




       
        
        // do something...
        });
        }
});



app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/display', function(req, res) {
    res.sendFile(__dirname + '/display.html');
});



function finduncompletedrow (cb) {
    my_sheet.getRows( 1, {
        // start: 100,          // start index
        // num: 100,              // number of rows to pull
        // orderby: 'name'  // column to order results by
     },
     function(err, row_data){
        var a;
        var f;
        console.log (err);
        console.log(row_data);
        for (var i = row_data.length - 1; i >= 0; i--) {
            
             a = row_data[i].apology;
             f = row_data[i].forgiveness;
             // console.log (a, f);
             if (f == '') {
                console.log (a);
                cb(a);
                return;
             }
        };
        // do something...
    });

}

function completerow (apologytext, forgivenesstext) {
    my_sheet.getRows( 1, {
        // start: 100,          // start index
        // num: 100,              // number of rows to pull
        // orderby: 'name'  // column to order results by
   

        
    }, function(err, row_data){
        var a;
        var f;
        console.log (err);
        console.log(row_data);
        for (var i = row_data.length - 1; i >= 0; i--) {
            
             a = row_data[i].apology;
             f = row_data[i].forgiveness;
             // console.log (a, f);
             if (a == apologytext) {
                row_data[i].forgiveness= forgivenesstext;
                row_data[i].save();
                console.log (a);
                displayrow.apology = a;
                displayrow.forgiveness = row_data[i].forgiveness;
                io.emit ("displayrow", displayrow);
                return;
             }
        };
        
    });

}

io.on('connection', function(socket) {
//listens for apology and adds to new row in spreadsheet
    socket.on('apology', function(apologytext) {
        console.log(apologytext);
        // looks for apology without forgiveness, finds it, sends it to the browser (called apologyprompt)
        finduncompletedrow (function(a){
            socket.emit ("apologyprompt", a) 
            my_sheet.addRow(1, { apology: apologytext} );

        }); 

    });


    socket.on('forgiveness', function(forgivenesstext, apologytext) {
        console.log(forgivenesstext, apologytext);
        completerow (apologytext, forgivenesstext);

    });

socket.emit("displayrow", displayrow);


});        


     // this.getCells = function (opts, cb) {
  //   spreadsheet.getCells( self.id, opts, cb );
  // }
    // });
    //               });
               

                // db.put(i, msg, function(err) {
                // if (err) return console.log('Ooops!', err) // some kind of I/O error 
                // console.log(db.db.getProperty('leveldb.num-files-at-level1'))
                // // 3) fetch by key 
                // db.get(i, function(err, value) {
                //     if (err) return console.log('Ooops!', err) // likely the key was not found 
                //     // ta da! 
                //     io.sockets.emit('data', {
                //         val: value
                //     });
                    
                // })





// pull in our local credentials
//var creds = require('./service_account_credentials.json');

// authenticate with google

       
