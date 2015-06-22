	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")
	// créer le control de selection et la couche des parcelle à partir du wfs et appliquer le control à la couche
	createSelectionControl = function (map){
		// style à appliquer sur la couche cadastre
		var style=GEOR.custom.defautStyleParcelle;
		var selectedStyle =GEOR.custom.selectedStyle;
		  styleFeatures = new OpenLayers.StyleMap(new OpenLayers.Style({ // param config
				fillColor:"${getFillColor}", // couleur des entités en fonction de l'état
                strokeColor: "${getStrokeColor}",
				strokeWidth:"${getstrokeWidth}",
				fillOpacity:"${getFillOpacity}",
                pointRadius: style.pointRadius,
				pointerEvents: style.pointerEvents,
				fontSize: style.fontSize
            },
			{
				context: {
					getFillColor: function(feature) {
						fill = selectedStyle.defautColor;
						if(feature.state == "1") 
							fill = selectedStyle.colorSelected1;
						if(feature.state == "2") 
							fill = selectedStyle.colorSelected2; 
						return fill;
						},
					getFillOpacity: function(feature) {
						opacity = 1;
						if(!feature.state)
							opacity = 0;
						if(feature.state == "1" || feature.state == "2") 
							opacity = selectedStyle.opacity;
						return opacity;
						},	
					getStrokeColor: function(feature) {
						color = style.strokeColor;
						if(feature.state == "1") 
							color = selectedStyle.colorSelected1;
						if(feature.state == "2") 
							color = selectedStyle.colorSelected2; 
						return color;
						},	
					getstrokeWidth: function(feature) {
						width = style.strokeWidth;
						if(feature.state == "1" || feature.state == "2") 
							width = selectedStyle.strokeWidth;
						return width;
						},	
		
				}
			}));
		
		selectLayer = new OpenLayers.Layer.Vector("selection");
		selectLayer.styleMap=styleFeatures;
		var state;
		map.addLayer(selectLayer);
		OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                }, 

                trigger: function(e) {
					lonlat = map.getLonLatFromPixel(e.xy);
					getFeaturesWFSSpatial("Point", lonlat.lon+","+lonlat.lat, "clickSelector");
                }

            });
			 var click = new OpenLayers.Control.Click();
             map.addControl(click);
             click.activate();

		
	}
	getFeaturesWFSSpatial=	function (typeGeom, coords, typeSelector) {
		var filter;
		var WFSLayerSetting = GEOR.custom.WFSLayerSetting;
		var polygoneElements="", endPolygoneElements="";
		if(typeGeom == "Polygon") {
			polygoneElements = "<gml:outerBoundaryIs><gml:LinearRing>";
			endPolygoneElements = "</gml:LinearRing></gml:outerBoundaryIs>";
		}
		filter = '<Filter xmlns:gml="http://www.opengis.net/gml"><Intersects><PropertyName>'+WFSLayerSetting.geometryField+'</PropertyName><gml:'+typeGeom+'>'+polygoneElements+'<gml:coordinates>'+coords+'</gml:coordinates>'+endPolygoneElements+'</gml:'+typeGeom+'></Intersects></Filter>';

		var wfsUrl = WFSLayerSetting.wfsUrl ;
		var featureJson = "";
		Ext.Ajax.request({
		  url : wfsUrl,
		  method: 'GET',
		  headers: { 'Content-Type': 'application/json' },                     
		  params : { 
				"request" : WFSLayerSetting.request,
				"version" : WFSLayerSetting.version,
				"service" : WFSLayerSetting.service,
				"typename" : WFSLayerSetting.typename,
				"outputFormat" : WFSLayerSetting.outputFormat,
				"filter": filter
		  },
		  success: function (response) {
				featureJson = response.responseText;
				var geojson_format = new OpenLayers.Format.GeoJSON();
				var resultSelection = geojson_format.read(featureJson);
				var feature, state;
				var parcelsIds = [], codComm = null;
				
				for(var i=0; i<resultSelection.length; i++) {
					feature = geojson_format.read(featureJson)[i];
					if(feature) {
						var exist = false;
						var j = -1;
						for (j=0; j < selectedFeatures.length && !exist; j++){
							 // if(selectedFeatures[j].attributes.geo_parcelle == feature.attributes.geo_parcelle) { //renvoie des cas errronnées psk la géométrie est dupliquer pour quelques parcelles
							 if(selectedFeatures[j].fid == feature.fid) { // remplacer par cette ligne
									exist = true;
									if (exist){
										feature = selectedFeatures[j];
									}		
								}
						}
						if(!exist) {
							selectLayer.addFeatures(feature);
							selectedFeatures.push(feature);
						}
						
						state = changeStateFeature(feature, j-1, typeSelector);
						if(state == "2") {
							parcelsIds.push(feature.attributes.id_parc);
							codComm = feature.attributes.codcomm;
							//console.log(codComm);
						}
							
					}
				}
				
				showTabSelection(codComm, parcelsIds);
				
		},
		  failure: function (response) {
			  console.log("Error ",response.responseText);
			   }
		 });
	}
	
	getFeaturesWFSAttribute = function (idParcelle) {
		var filter;
		var WFSLayerSetting = GEOR.custom.WFSLayerSetting
		filter = ""+WFSLayerSetting.nameFieldIdParcelle+"='"+idParcelle+"'";
		var wfsUrl = WFSLayerSetting.wfsUrl ;
		var featureJson = "";
		Ext.Ajax.request({
		  url : wfsUrl,
		  method: 'GET',
		  headers: { 'Content-Type': 'application/json' },                     
		  params : { 
				"request" : WFSLayerSetting.request,
				"version" : WFSLayerSetting.version,
				"service" : WFSLayerSetting.service,
				"typename" : WFSLayerSetting.typename,
				"outputFormat" : WFSLayerSetting.outputFormat,
				"cql_filter": filter
		  },
		  success: function (response) {
				featureJson = response.responseText;
				var geojson_format = new OpenLayers.Format.GeoJSON();
				var resultSelection = geojson_format.read(featureJson);
				var feature = geojson_format.read(featureJson)[0];
				if(feature) {
					selectLayer.addFeatures(feature);
					selectedFeatures.push(feature);
					
					changeStateFeature(feature, null, "searchSelector");
				}
			},
			  failure: function (response) {
				  console.log("Error ",response.responseText);
				}
		 });
	}
	
	showTabSelection = function (codComm, parcelsIds) {
		if(parcelsIds.length > 0) {
			//var params = {"ccoinsee" : "630103"};
			// var params = {"ccoinsee" : codComm};
			// params.details = 1;
			// var cityCode = params.ccoinsee;
			// params.ccodep = cityCode.substring(0,2);
			// params.ccodir = cityCode.substring(2,3);
			// params.ccocom = cityCode.substring(3,6);
			
			var params = {"code" : parcelsIds[0]};
			params.details = 1;
			var cityCode = params.code;
			params.ccodep = cityCode.substring(0,2);
			params.ccodir = cityCode.substring(2,3);
			params.ccocom = cityCode.substring(3,6);
			params.ccopre = cityCode.substring(6,9);
			params.ccosec = cityCode.substring(9,11);
			params.dnupla = cityCode.substring(11,15);


			
			//liste des parcelles
			//parcelle: Ext.util.JSON.encode(Ext.pluck(parcelleGrid.getStore().getRange(), 'data'))
			params.parcelle = new Array();
			for(var i=0; i < parcelsIds.length; i++)
				params.parcelle.push(parcelsIds[i]);							
			
			//envoi la liste de resultat
			Ext.Ajax.request({
				method: 'GET',
				url: getWebappURL() + 'getParcelle',
				params: params,
				username : "testadmin",
				password : "testadmin",
				success: function(result,opt) {
					var jsonData = Ext.decode(result.responseText);
					addNewResultParcelle("result selection ("+parcelsIds.length+")", getResultParcelleStore(result.responseText, false));
				},
				failure: function(result) {
					alert('ERROR');
				}
			});

			
		}
	}
	
	getFeatureById = function (idParcelle) {
		for (var i=0; i < selectedFeatures.length; i++) { 
			if(selectedFeatures[i].attributes.id_parc == idParcelle)
				return selectedFeatures[i];
		}
		return null;
	}
	
	setState = function (feature, state) {
		feature.state = state;
		selectLayer.drawFeature(feature);
	}
	
	changeStateFeature = function (feature, index, typeSelector) {
		var state = null;
		if(typeSelector == "clickSelector") {
			if (feature.state == "1")
			{
				state = "2";
				
			}else if (feature.state == "2") {
				selectedFeatures.splice(index, 1);
				selectLayer.removeFeatures([feature]);
				// selectLayer.drawFeature(feature);
			}
			else {
				state = "1";
			}
		}
		else if(typeSelector == "featureSelector") {
			state = "2";
		}
		else if(typeSelector == "searchSelector") {
			state = "1";
		}
		
		setState(feature, state);
		return state;
		
		// console.dir(selectedFeatures);
	}
	// rechange le style et vide le tableau des entités selectionnées
	clearLayerSelection=function () {
		// for (i = 0; i < selectedFeatures.length; i++) { // remise à zero des entités selectionnées
				// selectedFeatures[i].state= null;
				// selectLayer.drawFeature(selectedFeatures[i]);
		// }
		selectedFeatures = [];
		selectLayer.removeAllFeatures();
		
	}
	selectFeatureIntersection=	function (feature) {
		var typeGeom = feature.geometry.id.split('_')[2];
		var coords = "";
		if(typeGeom == "Point") {
			coords = feature.geometry.x+","+feature.geometry.y;
		} else {
			var components = feature.geometry.components;
			if(typeGeom == "Polygon")
				components = components[0].components;
			coords = components[0].x+","+components[0].y;
			for(var i=1; i<components.length; i++) {
				coords += " "+components[i].x+","+components[i].y;
			}
		}
		getFeaturesWFSSpatial(typeGeom, coords, "featureSelector");

    }
	
	getLayerByName=function(layerName){
		var map=GeoExt.MapPanel.guess().map;
		var layer=map.getLayersByName(layerName)[0];
		return layer;
	}

	zoomToSelectedFeatures =function() { // zoom sur les entités selectionnées etat 2 

		 if (selectedFeatures.length>0){ 
		 // récupération des bordure de  l'enveloppe des entités selectionnées
			var minLeft=selectedFeatures[0].geometry.bounds.left;
			maxRight=selectedFeatures[0].geometry.bounds.right;
			minBottom=selectedFeatures[0].geometry.bounds.bottom;
			maxTop=selectedFeatures[0].geometry.bounds.top;
			 for (i = 0; i < selectedFeatures.length; i++) {
				minLeft=Math.min(minLeft,selectedFeatures[i].geometry.bounds.left)
				maxRight=Math.max(maxRight,selectedFeatures[i].geometry.bounds.right)
				minBottom=Math.min(minBottom,selectedFeatures[i].geometry.bounds.bottom)
				maxTop=Math.max(maxTop,selectedFeatures[i].geometry.bounds.top)
			 }
			 map=GeoExt.MapPanel.guess().map;
			 map.zoomToExtent([minLeft,minBottom,maxRight,maxTop]); //zoom sur l'enveloppe
		 }else 
				console.log("pas d'entité selectionnée");
	}
