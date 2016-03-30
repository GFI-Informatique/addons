Cadastrapp ADDON
==============  

Cet add-on est fait pour être intégré dans le visualiseur Mapfishapp de [geOrchestra](https://github.com/georchestra/georchestra). Il appelle des services de la webapp cadastrapp disponible ici : [https://github.com/GFI-Informatique/cadastrapp](https://github.com/GFI-Informatique/cadastrapp).

Les informations des services WMS et WFS sont à modifier en fonction du modèle utilisé (Qgis ou Arcopole).

Pour activer l'add-on cadastrapp, il faut modifier le fichier javascript GEOR_custom.js et ajouter dans la partie ADDONS: 

Attention pour la partie 
```
"options": { 
		"CNIL":{
			"cnil1RoleName" : 
```
Il faut rajouter ```ROLE_``` devant le nom du groupe ldap. Par exemple si votre groupe ldap CNIL1 est EL_CAD_CNIL1 alors la valeur de cnil1RoleName sera ROLE_EL_CAD_CNIL1

```js
	[{
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
	"options": { 
		"target": "tbar_12",
		"webapp":{
			"url" : "http://hostname/cadastrapp"
		}
		"WMSLayer":{
			"layerNameInPanel":"",
			"transparent":true,
			"format": "image/png"
		},
		"WFSLayerSetting": {
			"request" : "getfeature",
			"version" : "1.0.0",
			"service" : "wfs",
			"outputFormat" : "application/json",
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
			"colorState1":"#FFFF00", //selection niveau 1
			"colorState2":"#81BEF7", // selection niveau 2
			"colorState3":"#57D53B", // selection niveau 3
			"opacity":"0.4",
			"strokeWidth":"3"
		},
		"popup" : {
			"timeToShow": 5000,
			"minZoom":14
		} 
		},
	"preloaded": "true"
	}],
```

This project has been funded by : 

Union Européenne en Auvergne
![alt tag](https://cloud.githubusercontent.com/assets/3421760/14113246/5e8bdf2c-f5d2-11e5-86a1-638b191194d3.png)

Rennes Métropole
![alt tag](https://cloud.githubusercontent.com/assets/6370443/13951133/407ee162-f02f-11e5-8c70-a7b6cff7ba43.jpg)

Aménagement du territoire et gestion des risques
![alt tag](https://cloud.githubusercontent.com/assets/11499415/14116676/41fbce6c-f5e1-11e5-8863-2b1f4cd19034.jpg)

Conseil Départemental du Bas-Rhin
![alt tag](https://cloud.githubusercontent.com/assets/5012040/13945329/ac9a6786-f00c-11e5-8acc-b21705db585b.png)
