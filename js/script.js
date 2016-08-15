var shell = require('shell'); // Electron's UI library.

$(function(){
    var http = require('http');
    var AdmZip = require('adm-zip');
    var fs = require('fs');
    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.on('change-reply', function(event, arg) {
       console.log(arg);
    });

    ipcRenderer.on('new-scan', function(event, arg) {
        console.log('new scan on the scan event page');
        console.log(arg);
    });

    $('.get-box').append('<button id="testPull">Test Pull</button>');
    $('#testPull').on('click', function() {
        http.get('http://crodgers.corp.validar.com:8080/testEvent.zip', function(res){
            console.log(res);
            var data = [];
            var dataLength = 0;
            res.on('data', function(chunk) {
                data.push(chunk);
                dataLength += chunk.length;
            }).on('end', function() {
                console.log(data.length);
                var buf = new Buffer(dataLength);
                for(var i = 0, len = data.length, pos = 0; i < len; i++) {
                    data[i].copy(buf, pos);
                    pos += data[i].length;
                }
                var eventName = "123458298-182384-1823849232";
                var goto = document.createElement('a');
                goto.setAttribute('id', 'goTo');
                goto.textContent = "Go To Event";
                $(goto).on('click', function() {
                    ipcRenderer.send('change-event', eventName);
                });
                $('.get-box').append(goto);

                
                ipcRenderer.send('download-event', {
                    data : buf,
                    name : eventName
                });
                
            });
        });
    });
    

    // Display some statistics about this computer, using node's os module.

    var os = require('os');
    var prettyBytes = require('pretty-bytes');

    $('.stats').append('Number of cpu cores: <span>' + os.cpus().length + '</span>');
    $('.stats').append('Free memory: <span>' + prettyBytes(os.freemem())+ '</span>');
 
});