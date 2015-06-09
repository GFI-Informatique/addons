	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")
	
	selectionTest = function (map,control){
		// var cadastre1=map.getLayersByName("geo_parcelle");
		  styleFeatures = new OpenLayers.StyleMap(new OpenLayers.Style({ // param config
				fillColor:"${getFill}",
                strokeColor: "#000000",
				strokeWidth:"0.5",
                pointRadius: 6,
				pointerEvents: "visiblePainted",
				label:"${getId}", 
				fontSize: "10px" 
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
						fill = "#F7BE81";
						if(feature.state == "1") 
							fill = "#FFFF00";
						if(feature.state == "2") 
							fill = "#81BEF7"; 
						return fill;
						}
				}
			}));

		var cadastre = new OpenLayers.Layer.Vector(
            "parcelle",
            {
                strategies: [new OpenLayers.Strategy.Fixed()]
                , projection: new OpenLayers.Projection("EPSG:4326")
                , protocol: new OpenLayers.Protocol.WFS({
                    version: "1.1.0",
                    url: "http://gd-cms-crai-001.fasgfi.fr/geoserver/qgis/wfs", // param config
                    featurePrefix: 'qgis', //geoserver worspace name
                    featureType: "geo_parcelle", //geoserver Layer Name
                    featureNS: "qgis", // Edit Workspace Namespace URI
                    geometryName: "geom" // field in Feature Type details with type "Geometry"
                }),
				 styleMap:styleFeatures
            });


		map.addLayers([cadastre]);
		var select = new OpenLayers.Control.SelectFeature(cadastre);
		map.addControl(select);
		select.activate();
		cadastre.events.on({
                'featureselected': function(e) {
					if(e.feature.state == "2")
						return;
                    e.feature.state = "1";
					cadastre.drawFeature(e.feature);
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
			selctedFeatures = [];
			var layer=map.getLayersByName("parcelle")[0];
            var features = layer.features;
            var  feat2, isIntersects;
			for(var j=0; j<features.length; j++) {
				feat2 = features[j];
				isIntersects = feature.geometry.intersects(feat2.geometry);
				if (isIntersects) {
					selctedFeatures.push(feat2);
					feat2.state = "2";
					layer.drawFeature(feat2);
				}
				
				
			}
			console.log("appel de la fonction qui gère l'état 2 de(s) entité(s): ");
			console.log(selctedFeatures);
			return selctedFeatures;
    }
	
