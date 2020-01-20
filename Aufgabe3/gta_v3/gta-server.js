/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

//express.static(path);
app.use('/javascripts',express.static(__dirname + '/javascripts'));
app.use('/stylesheets',express.static(__dirname + '/stylesheets'));
app.use('/images',express.static(__dirname + '/images'));
//console.log(path);

// TODO: CODE ERGÄNZEN

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */
 
function geoTagObj(name,latitude,longitude,hash){
	this.name = name;
	this.latitude = latitude;
	this.longitude = longitude;
	this.hash = hash;
}


// TODO: CODE ERGÄNZEN

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var GeoTag = (function(){
	tagStack = [];
	var isInRadius = function(lat1, long1, lat2, long2, radius) {
		return radius >= Math.sqrt( Math.pow(lat1 - lat2, 2) 
								+ Math.pow(long1 - long2, 2))
	 }
	return{
		searchGeoRadius: function(latitude, longitude, radius){
			geoTagResult = [];
			for(var i = 0; i < tagStack.length; i++) {
				if( isInRadius(latitude, longitude, tagStack[i].latitude, tagStack[i].longitude, radius) ) {
					geoTagResult.push(new geoTagObj(tagStack[i].name, tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash));
				}
			}
			return geoTagResult;
		
		},
		searchGeoName: function(name) {
			geoTagResult = [];
			for(var i = 0; i < tagStack.length; i++) {
				if( tagStack[i].name == name || tagStack[i].hash == name) {
					geoTagResult.push(new geoTagObj(tagStack[i].name,tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash));
				}
			}
			return geoTagResult;	
		},
		delGeoTag: function(name){
			for(var i = 0; i < tagStack.length; i++) {
                if( tagStack[i].name == name ) {
					tagStack.splice(i, 1);
                 	//i--;
                 }
             }
		},
		addGeoTag: function(latitude, longitude, name, hash){
			tagStack.push(new geoTagObj(name,latitude,longitude,hash));
		},
		nameInTag: function(name, hash){
			if(tagStack.length > 0){
				for(var i = 0;i < tagStack.length; i++){
					if(tagStack[i].name == name && tagStack[i].hash == hash){
						return true;
					}
				}return false;
			}return false;
		},
		//DEBUG
		dbGeoStack: function(){
			if(tagStack.length>0){
				console.log("DEBUG");
				for(var i = 0; i<tagStack.length; i++){
					console.log(tagStack[i]);
				}
			}
			
		},
		retFullStack: function(){
			return tagStack;
		}
	};
 })();


/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: [],
		latitude: "", 
		longitude: ""
    });
});



/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */
app.post('/tagging', function(req, res){
	if (!(GeoTag.nameInTag(req.body.i_name,req.body.i_hash))){
		GeoTag.addGeoTag(req.body.i_lati, req.body.i_long, req.body.i_name, req.body.i_hash);
		console.log("\n[Server] added new GeoTag: ");
		console.log(req.body);
		console.log("\n");
	}
	res.render('gta', {
		taglist: GeoTag.searchGeoRadius(req.body.i_lati, req.body.i_long, 1),
		latitude: req.body.i_lati,
		longitude: req.body.i_long
	});
});
// TODO: CODE ERGÄNZEN START

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */
app.post('/discovery', function(req, res){	
	newTagList = undefined;
	console.log(req.body);
	if(req.body.btn_remove != undefined){
		GeoTag.delGeoTag(req.body.i_search);
		console.log("\n[Server] deleted entrys named [" + req.body.i_search + "]\n");
	}else{
		if(req.body.i_search == ""){
			newTagList = GeoTag.retFullStack();
		}else{
			newTagList = GeoTag.searchGeoName(req.body.i_search);
		}		
		console.log("\n[Server] listing all entrys named [" + req.body.i_search + "]\n");
	}
	res.render('gta', {
		taglist: newTagList,
		latitude: "",
		longitude: ""
	});
});
// TODO: CODE ERGÄNZEN

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
