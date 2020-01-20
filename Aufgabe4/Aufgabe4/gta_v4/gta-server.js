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
app.use(bodyParser.json());

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use('/javascripts',express.static(__dirname + '/javascripts'));
app.use('/stylesheets',express.static(__dirname + '/stylesheets'));
app.use('/images',express.static(__dirname + '/images'));


/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */
 
function geoTagObj(id,name,latitude,longitude,hash){
	this.id = id;
	this.name = name;
	this.latitude = latitude;
	this.longitude = longitude;
	this.hash = hash;
}

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
		getGeoTagByID: function(id){
			geoTagResult = [];
			if(id >= 0){
				for(var i = 0;i < tagStack.length; i++){
					if (tagStack[i].id == id) {
						return tagStack[i];
					}
					//result = new geoTagObj(tagStack[i].id,tagStack[i].name, tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash);
				}
			}
		},
		searchGeoRadius: function(latitude, longitude, radius){
			geoTagResult = [];
			for(var i = 0; i < tagStack.length; i++) {
				if( isInRadius(latitude, longitude, tagStack[i].latitude, tagStack[i].longitude, radius) ) {
					geoTagResult.push(new geoTagObj(tagStack[i].id, tagStack[i].name, tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash));
				}
			}
			return geoTagResult;
		
		},
		searchGeoName: function(name) {
			geoTagResult = [];
			if( name == ""){
				for(var i = 0; i < tagStack.length; i++){
					geoTagResult.push(new geoTagObj(tagStack[i].id, tagStack[i].name, tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash));
				}return geoTagResult;
			}
			for(var i = 0; i < tagStack.length; i++) {
				if( tagStack[i].name == name ) {
					geoTagResult.push(new geoTagObj(tagStack[i].id, tagStack[i].name, tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash));
				} else if (tagStack[i].hash == name) {
					geoTagResult.push(new geoTagObj(tagStack[i].id, tagStack[i].name, tagStack[i].latitude, tagStack[i].longitude, tagStack[i].hash));
				}
			}
			return geoTagResult;	
		},
		delGeoTag: function(name){
			for(var i = 0; i < tagStack.length; i++) {
                if( tagStack[i].name == name ) {
					tagStack.splice(i, 1);
                 	i--;
                 } else if (tagStack[i].hash == name) {
					tagStack.splice(i, 1);
					i--;
				 }
             }
		},
		addGeoTag: function(id, latitude, longitude, name, hash){
			tagStack.push(new geoTagObj(id, name,latitude,longitude,hash));
		},
		lastGeoTag: function(){
			if(tagStack.length > 0){
				var lastElNr = tagStack.length - 1;
				return {
					name: tagStack[lastElNr].name,
					latitude: tagStack[lastElNr].latitude,
					longitude: tagStack[lastElNr].longitude,
					hash: tagStack[lastElNr].hash
				};
			}else{
				// Setze Test TAG
				tagStack.push(new geoTagObj("Text","49.01379","8.390071","#Test"));
			}
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
		inStack: function(name){
			if(tagStack.length > 0){
				for(var i = 0; i < tagStack.length; i++){
					if(tagStack[i].name == name){
						return i;
					}
				}
			}return null;
		},
		retFullStack: function(){
			return tagStack;
		},
		/* DEBUGGING */
		listStack: function(){
			console.log("[DEBUG] PLOTTING TAGSTACK");
			for(var i = 0;i < tagStack.length; i++){
				var stack = {
					id: tagStack[i].id,
					name: tagStack[i].name,
					latitude: tagStack[i].latitude,
					longitude: tagStack[i].longitude,
					hash: tagStack[i].hash
				};
				console.log(stack);
			}
			console.log("[DEBUG] END OF PLOT");
		},
		dbGeoStack: function(){
			if(tagStack.length>0){
				console.log("DEBUG");
				for(var i = 0; i<tagStack.length; i++){
					console.log(tagStack[i]);
				}
			}
			
		},
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
 *	REST
 */

// Add Geo Tags
app.post('/geotags', function(req, res){
	
	if(! (GeoTag.nameInTag(req.body.name,req.body.hash))){
		GeoTag.addGeoTag(tagStack.length + 1,req.body.latitude, req.body.longitude, req.body.name, req.body.hash);
	
		GeoTag.lastGeoTag();
	
		res.setHeader("Content-type", "application/json");
		res.location("/geotags"); // /" + tagStack.length);
		res.statusCode = 200;
		console.log(GeoTag.searchGeoRadius(req.body.latitude, req.body.longitude, 0.01));
		res.send(GeoTag.searchGeoRadius(req.body.latitude, req.body.longitude, 0.01));
		console.log("Location: /geotags/" + tagStack.length);
	}
});

app.get('/geotags/:id', function(req, res) {
	var geoTag = GeoTag.getGeoTagByID(req.params.id);
	if(geoTag == null){
		geoTag = "[]";
	}
	res.setHeader("Content-type", "application/json");
	res.statusCode = 200;
	res.send(geoTag);
});

app.get('/geotags', function(req, res) {
	var name = req.query.search;
	var remove = req.query.remove;	
	if(name != undefined) {
		res.send(GeoTag.searchGeoName(name));
	} else if(remove != undefined) {
		
	} else {
		res.setHeader("Content-type", "application/json");
		res.location("/geotags");
		res.statusCode = 200;
		res.send(JSON.stringify(tagStack));
	}
});

//Put Geo Tag
app.put('/geotags',function(req, res){
	var changeTag = JSON.parse(req.query.change);
	if(GeoTag.inStack(changeTag.name, changeTag.hash) != null){
		res.location("/geotags");
		res.statusCode = 201;
		tagStack[i].latitude = changeTag.latitude;
		tagStack[i].longitude = changeTag.longitude;
	}
	console.log("[SERVER] PUT " + changeTag.hash);
});

app.put('/geotags/:id', function(req, res) {
	var i = req.params.id;
	var geoTag = GeoTag.getGeoTagByID(req.params.id);
	if(geoTag == null){
		geoTag = "[]";
	} else {
		res.location("/geotags/" + req.params.id);
		res.statusCode = 201;
		tagStack[i].latitude = req.body.latitude;
		tagStack[i].longitude = req.body.longitude;
	}
	res.send(tagStack[i]);
});

//Delete Geo Tag
app.delete('/geotags',function(req, res){
	if(GeoTag.inStack(req.query.remove) != null){
		res.location("/geotags");
		res.statusCode = 200;
		GeoTag.delGeoTag(req.query.remove);
		res.send(GeoTag.searchGeoName(req.query.remove));
	}
});

app.delete('/geotags/:id', function(req, res) {
	var geoTag = GeoTag.getGeoTagByID(req.params.id);
	if(geoTag != null){
		res.location("/geotags");
		res.statusCode = 200;
		GeoTag.delGeoTag(geoTag.name);
		res.send("Deleted GeoTag with ID " + req.params.id);
	}
});

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
