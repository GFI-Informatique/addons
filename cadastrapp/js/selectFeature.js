	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")
	// créer le control de selection et la couche des parcelle à partir du wfs et appliquer le control à la couche
	createSelectionControl = function (map){
		// style à appliquer sur la couche cadastre
		var style=GEOR.custom.ADDONS[2].defautStyleParcelle;
		var selectedStyle =GEOR.custom.ADDONS[2].selectedStyle;
		  styleFeatures = new OpenLayers.StyleMap(new OpenLayers.Style({ // param config
				fillColor:"${getFill}", // couleur des entités en fonction de l'état
                strokeColor: style.strokeColor,
				strokeWidth:style.strokeWidth,
                pointRadius: style.pointRadius,
				pointerEvents: style.pointerEvents,
				label:"${getId}",  // étiquette : attribut "tex"
				fontSize: style.fontSize
            },
			{
				context: {
					 getId: function(feature) {
						label = "";
						if(map.getZoom() > 16 && feature.attributes.tex) // param config
							label = feature.attributes.tex; // param config
						return label;
						},
					getFill: function(feature) {
						fill = selectedStyle.defautColor;
						if(feature.state == "1") 
							fill = selectedStyle.colorSelected1;
						if(feature.state == "2") 
							fill = selectedStyle.colorSelected2; 
						return fill;
						}
				}
			}));
		var WFSLayerSetting =GEOR.custom.ADDONS[2].WFSLayerSetting;
		var cadastre = new OpenLayers.Layer.Vector( // création de la couche à partir du WFS
            WFSLayerSetting.layerName, // nom visible sur le panel
            {
                strategies: [new OpenLayers.Strategy.Fixed()]
                , projection: new OpenLayers.Projection(WFSLayerSetting.srsName) // système de coordonnées
                , protocol: new OpenLayers.Protocol.WFS({
                    version: WFSLayerSetting.version, 
                    url: WFSLayerSetting.url, // param config
                    featurePrefix: WFSLayerSetting.featurePrefix, //geoserver worspace name
                    featureType:WFSLayerSetting.featureType, //geoserver Layer Name
                    featureNS: WFSLayerSetting.featureNS, // Edit Workspace Namespace URI
                    geometryName: WFSLayerSetting.geometryName// field in Feature Type details with type "Geometry"
                }),
				 styleMap:styleFeatures // association du style 
            });


		map.addLayers([cadastre]); // ajout de la couche à la carte
		var select = new OpenLayers.Control.SelectFeature(cadastre); //création du controleur de selection
		map.addControl(select);
		select.activate();
		cadastre.events.on({ 
                'featureselected': function(e) { 
					if(e.feature.state == "2") // si l'entité est dans l'etat 2 (cad fiche affichée) 
						return;
                    e.feature.state = "1"; //sinon (cad etat==null) )on change l'etat
					cadastre.drawFeature(e.feature); // mise à jour du dessin
					console.log("appel de la fonction qui gère l'état 1 de l'entité: ");
					console.log(e.feature);
                },
                'featureunselected': function(e) {
					if(e.feature.state == "2")
						return;
					e.feature.state = null;
					cadastre.drawFeature(e.feature);
                }
        });	 
		return select;	
	}
	selectFeatureIntersection=	function (map,feature) {

		var layer=map.getLayersByName("parcelle")[0];
        var features = layer.features;
        var  feat2, isIntersects;
		for (i = 0; i < selctedFeatures.length; i++) { // remise à zero des entités selectionnées
				selctedFeatures[i].state= null;
				layer.drawFeature(selctedFeatures[i]);
		}
		selctedFeatures = [];
		for(var j=0; j<features.length; j++) {
			feat2 = features[j];
			isIntersects = feature.geometry.intersects(feat2.geometry); //intersection entre l'entité dessinée feature et les entités de la couche
			if (isIntersects) {
					selctedFeatures.push(feat2);
					feat2.state = "2";
					layer.drawFeature(feat2);
					console.log(feat2.attributes.geo_parcelle);
			}				
		}
		console.log("appel de la fonction qui gère l'état 2 de(s) entité(s): ");
		console.log(selctedFeatures);
		return selctedFeatures;
    }
	
	modifyStyle=function(idParcelle,etatFeature) {
		var map=GeoExt.MapPanel.guess().map;
		var layer=map.getLayersByName("parcelle")[0];
		var feature = layer.getFeaturesByAttribute("geo_parcelle",idParcelle)
		feature.state = etatFeature;
		layer.drawFeature(feature);
	}
	zoomToSelectedFeatures =function() { // zoom sur les entités selectionnées etat 2 

		 if (selctedFeatures.length>0){ 
		 // récupération des bordure de  l'enveloppe des entités selectionnées
			var minLeft=selctedFeatures[0].geometry.bounds.left;
			maxRight=selctedFeatures[0].geometry.bounds.right;
			minBottom=selctedFeatures[0].geometry.bounds.bottom;
			maxTop=selctedFeatures[0].geometry.bounds.top;
			 for (i = 0; i < selctedFeatures.length; i++) {
				minLeft=Math.min(minLeft,selctedFeatures[i].geometry.bounds.left)
				maxRight=Math.max(maxRight,selctedFeatures[i].geometry.bounds.right)
				minBottom=Math.min(minBottom,selctedFeatures[i].geometry.bounds.bottom)
				maxTop=Math.max(maxTop,selctedFeatures[i].geometry.bounds.top)
			 }
			 map=GeoExt.MapPanel.guess().map;
			 map.zoomToExtent([minLeft,minBottom,maxRight,maxTop]); //zoom sur l'enveloppe
		 }else 
				console.log("pas d'entité selectionnée");
	}
