/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...



/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator() {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
		if(document.getElementById("i_lati").value == "")
			return position.coords.latitude;
		else
			return document.getElementById("i_lati").value;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
		if(document.getElementById("i_long").value == "")
			return position.coords.longitude;
		else
			return document.getElementById("i_long").value;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "w2L46ajAEHGP3Ws5UBI9WezNMA0FDVjE";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
	};

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function () {
            if(document.getElementById("i_lati").value == "" && document.getElementById("i_long").value == ""){

                tryLocate(function (position){
                    if (document.getElementById("result-img").getAttribute("data-tags") == ""){
                        var dataTagArray = undefined;
                    }else{
                        var dataTagArray = JSON.parse(document.getElementById("result-img").getAttribute("data-tags"));
                    }
                
                    if(document.getElementById("i_lati").value == "" && document.getElementById("i_long").value == ""){
                        document.getElementById("i_lati").value = getLatitude(position);
                        document.getElementById("i_long").value = getLongitude(position);
                        document.getElementById("i_hlati").value = getLatitude(position);
                        document.getElementById("i_hlong").value = getLongitude(position);
                    }
                
                    document.getElementById("result-img").src = getLocationMapSrc(getLatitude(position), getLongitude(position),dataTagArray, 16);
                    },
                function () {
                    alert("Position konnte nicht ermittelt werden!")
                });
            }
        }

    }; // ... Ende öffentlicher Teil
})();

/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function () {
    gtaLocator.updateLocation()
	
    // TODO Hier den Aufruf für updateLocation einfügen
});
