var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var HID = require('node-hid'); // Module for USB scanning devices
var AdmZip = require('adm-zip'); // Module for unzipping files
var fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Set up scanning
var scan = {};
scan.currentScan = '';
scan.symbology = '';
var devices = HID.devices();
var device = null;
try {
	// Create device - Adaptus handheld scanner
	device = new HID.HID(1334, 1095);	
} catch(err) {
	console.log(err);
}

// On USB Scanned Data
device.on('data', function(data) {	
	// Add badge data	
	scan.currentScan += data.toString('utf8', 5, data.length - 3);

	// Detect symbology
	if (data[3] === 65){
		scan.symbology = '1D';
	} else if (data[3] === 81) {
		scan.symbology = 'QR';
	} else if (data[3] === 76) {
		scan.symbology = 'PDF417';
	} else {
		scan.symbology = 'unknown';
	}

	// Detect if more data is coming
	if(data[data.length-1] === 0){
		// No more data coming
		mainWindow.webContents.send('new-scan', scan);
		scan.currentScan = '';
		scan.symbology = '';
	}		
	return;
});





//Contact to renderer
var ipcMain = require('electron').ipcMain;
ipcMain.on('change-event', function(event, arg) {
	//alert('file://'+__dirname + '/events/' + arg + '/v1/index.html');
	console.log('file://' + app.getPath('userData') + '/events/' + arg + '/v1/index.html');
	mainWindow.loadURL(app.getPath('userData') + '/events/' + arg + '/v1/index.html');
	//mainWindow.loadURL('file://'+__dirname + '/events/' + arg + '/v1/index.html');
	//event.sender.send('change-reply', 'changing');
});

ipcMain.on('download-event', function(event, arg) {
	var zip = new AdmZip(arg.data);
	zip.extractAllTo(app.getPath('userData') + '/events/' + arg.name + '/v1/', false);
});

ipcMain.on('new-save', function(event, arg) {
	console.log("new save");
	event.sender.send('save-reply', 'saved record!');
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 625});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.webContents.openDevTools();

 // console.log(HID.devices());

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
