Cadastrapp ADDON
==============  

Cet addon est fait pour être intégré dans le visualisatieur MapfishApp de georchestra, et appel des services de la webapp cadastrapp disponible ici : 

https://github.com/GFI-Informatique/cadastrapp

pour activer l'add-on cadastrapp, il faut modifier le fichier javascript GEOR_custom.js et rajouter dans la partie ADDONS: [

Les informations des services WMS et WFS sont à modifier en fonction d'une utilisation sur le modèle Qgis ou sur le modèle Arcopole

	{
	"id": "cadastrapp_0", 
	"name": "Cadastrapp", 
	"title": { 
		"fr": "Cadastrapp", 
		"en": "Cadastrapp", 
		"es": "Cadastrapp",
		"de": "Cadastrapp", 
	},
	 "description": { 
		"fr": "Une série d'outils pour exploiter pleinement les données cadastrales de la DGFiP", 
		"en": "A series of tools to fully exploit the cadastral data DGFiP", 
		"es": "Una serie de herramientas para aprovechar al máximo los datos catastrales DGFiP",
		"de": "TODO" },
	"options": { "target": "tbar_12" },
	"preloaded": "true"
	}],
    //**************************************
	// After addon information need for cadastrapp 
	"wmsLayer":{
		"layerNameInPanel":"geo_parcelle",
		"url": "http://hostname/geoserver/qgis/wms",
		"layerNameGeoserver": "qgis:geo_parcelle",
		"transparent":true,
		"format": "image/png"
	},
	"WFSLayerSetting": {
		"wfsUrl":"http://hostname/geoserver/wfs?",
		"request" : "getfeature",
		"version" : "1.0.0",
		"service" : "wfs",
		"typename" : "qgis:geo_parcelle",
		"outputFormat" : "application/json",
		"nameFieldIdParcelle": "geo_parcelle",
		"geometryField":"geom"
	},
	"defautStyleParcelle" :{
            "strokeColor": "#000000",
			"strokeWidth":"0.5",
            "pointRadius": 6,
			"pointerEvents": "visiblePainted",
			"fontSize": "10px" 
	},
	"selectedStyle" : {
		"defautColor":"#AAAAAA",
		"colorSelected1":"#FFFF00", //selection niveau 1
		"colorSelected2":"#81BEF7", // selection niveau 2
		"opacity":"0.4",
		"strokeWidth":"3"
	},
	"popup" : {
		"timeToShow": 5000,
		"minZoom":14
	},