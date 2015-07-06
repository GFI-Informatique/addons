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
				fillColor:"${getFillColor}", // style des entités en fonction de l'état
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
		
		selectLayer = new OpenLayers.Layer.Vector("selection"); // création de la couche des entités selectionnées 
		//selectLayer.displayInLayerSwitcher=false;
		selectLayer.styleMap=styleFeatures;
		var state; // l'état de selection de chaque entité : null=non séléctionnée, 1=sélection jaune, 2 = sélection bleue
		map.addLayer(selectLayer); // ajout de la couche à la carte
		OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, { //création de la classe de l'écouteur   clique              
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
					lonlat = map.getLonLatFromPixel(e.xy); //récupération de la longitude et latitude à partir du clique
					getFeaturesWFSSpatial("Point", lonlat.lon+","+lonlat.lat, "clickSelector");
                }

            });
			 click = new OpenLayers.Control.Click(); 
			  // ajout et activation du controleur de click
             map.addControl(click);
             click.activate();
	}

	//créer un popup quand on survole la map
	addPopupOnhover=function(map){
		// class definition
		var popup;
		var popupConfig =GEOR.custom.popup;
		//comme pour le clique , on crée la classe du controleur hover
		OpenLayers.Control.Hover = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'delay': 200,
                    'pixelTolerance': null,
                    'stopMove': false
                },
                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Hover(
                        this,
                        {'pause': this.onPause, 'move': this.onMove},
                        this.handlerOptions
                    );
                }, 
                onPause: function(evt) {
					//var map=GeoExt.MapPanel.guess().map;
					zoom = map.getZoom();
					//suppression du popup s'il existe
					if (popup) 
							popup.destroy();
					// affichage si niveau de zoom convenable		
					if (zoom > popupConfig.minZoom) {
						lonlat = map.getLonLatFromPixel(evt.xy);
						popup = new GeoExt.Popup({
							map:map,
							anchored: true,
							title: "My Popup",
							location: lonlat,
							width: 200,
							html: "<div>TODO TODO</div>",
							collapsible: true
						});
						
						popup.show();
						document.body.onmousemove = function(e) {
						//quand on bouge on supprime le popup
							popup.destroy()
						}
					}
                },
                onMove: function(evt) {
                    // if this control sent an Ajax request (e.g. GetFeatureInfo) when
                    // the mouse pauses the onMove callback could be used to abort that
                    // request.
                }
            });
			// création du controleur de survol
			var infoControls = {
                    'hover': new OpenLayers.Control.Hover({
                        handlerOptions: {
						//delai d'affichage du popup
                            'delay': popupConfig.timeToShow
                        }
                    })
			};

			map.addControl(infoControls["hover"]); 
			infoControls["hover"].activate();
	}


	// envoie une requete au geoserveur pour faire une intersection de la couche wms avec la géométrie donnée en paramètres
	getFeaturesWFSSpatial=	function (typeGeom, coords, typeSelector) {
		var filter; 
		var selectRows=false; // ligne dans le resultat de recherche doit être selectionnée si etat =2
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
				var WFSLayerSetting = GEOR.custom.WFSLayerSetting; 
				var idField = WFSLayerSetting.nameFieldIdParcelle; // champ identifiant de parcelle dans geoserver
				var getIndex=function(result, str){
					exist=false;
				   for (j=0; j < result.length && !exist; j++){
						 // if(selectedFeatures[j].attributes.geo_parcelle == feature.attributes.geo_parcelle) { //renvoie des cas errronnées psk la géométrie est dupliquer pour quelques parcelles
						if(result[j].attributes[idField] == str) { // remplacer par cette ligne
							exist = true;
							if (exist)
								return j;			
						}
					}
					return -1;
				}
				featureJson = response.responseText;
				var geojson_format = new OpenLayers.Format.GeoJSON();
				var result = geojson_format.read(featureJson);
				var resultSelection=result.filter(function(itm,i,result){
					return i==getIndex(result, itm.attributes[idField]);
				});

				var feature, state;
				var parcelsIds = [], codComm = null;
				
				for(var i=0; i<resultSelection.length; i++) {
					// feature = geojson_format.read(featureJson)[i];
					feature = resultSelection[i];
					if(feature) {
						var exist = false;
						var j = -1;
						// on teste si l'entité est déja selectionnée
						for (j=0; j < selectedFeatures.length && !exist; j++){
							 // if(selectedFeatures[j].attributes.geo_parcelle == feature.attributes.geo_parcelle) { //renvoie des cas errronnées psk la géométrie est dupliquer pour quelques parcelles
							 if(selectedFeatures[j].fid == feature.fid) { // remplacer par cette ligne
									exist = true;
									if (exist){
										feature = selectedFeatures[j];
									}		
								}
						}
						// on l'ajoute à la selection si elle n'est pas trouvée
						if(!exist ) {
							selectLayer.addFeatures(feature);
							selectedFeatures.push(feature);
						}
						// on met à jour son état
						state = changeStateFeature(feature, j-1, typeSelector);
						var id=feature.attributes[idField];
						// si la parcelle est selectionnée on récupère son id pour le getParcelle pour le tableau
						if(state == "1" || state == "2") {
							parcelsIds.push(id);
						}else {
						//sinon on la vire du tableau et on ferme les fenêtres de détail
							// newGrid.getStore().removeAt(indexRowParcelle(id));
							tabs.activeTab.store.removeAt(indexRowParcelle(id));
							closeWindowFIUC(id,newGrid);
							closeWindowFIUF(id,newGrid);
						}
							
					}
				}
				if (state == "2"){
					selectRows=true;
				}	

				showTabSelection( parcelsIds,selectRows);
				
			},
			callback : function() {
			},
			failure: function (response) {
				console.log("Error ",response.responseText);
			}
		 });
	}
	//récupère l'index de l'entité selectionnée dans la couche selection
	indexFeatureSelected =function(feature){
		var WFSLayerSetting = GEOR.custom.WFSLayerSetting;
		var idField = WFSLayerSetting.nameFieldIdParcelle;
		var exist = false;
		for (j=0; j < selectedFeatures.length && !exist; j++){
			 // if(selectedFeatures[j].attributes.geo_parcelle == feature.attributes.geo_parcelle) { //renvoie des cas errronnées psk la géométrie est dupliquer pour quelques parcelles
			if(selectedFeatures[j].attributes[idField] == feature.attributes[idField]) { // remplacer par cette ligne
				exist = true;
				if (exist)
					return j;			
			}
		}
		return -1;
	}
	//ferme la fenetre de fiche cadastrale
	closeWindowFIUC = function (idParcelle,grid){	
		var index =grid.idParcellesCOuvertes.indexOf(idParcelle);
		var ficheCourante =grid.fichesCOuvertes[index];
		if (ficheCourante)
			ficheCourante.close();
	}
		//ferme la fenetre de fiche foncière
	closeWindowFIUF = function (idParcelle,grid){	
		var index =grid.idParcellesFOuvertes.indexOf(idParcelle);
		var ficheCourante =grid.fichesFOuvertes[index];
		if (ficheCourante)
			ficheCourante.close();
	}
	//ferme toutes les fenêtres de fiches cadastrales
	closeAllWindowFIUC  = function (){
		for (var j=newGrid.fichesCOuvertes.length-1; j>=0; j--){
			newGrid.fichesCOuvertes[j].close();
		}
		newGrid.fichesCOuvertes = [];
		newGrid.idParcellesCOuvertes = [];
	}
	//ferme toutes les fenêtres de fiches foncières
	closeAllWindowFIUF  = function (){
		for (var j=newGrid.fichesFOuvertes.length-1; j>=0; j--){
			newGrid.fichesFOuvertes[j].close();
		}
		newGrid.fichesFOuvertes = [];
		newGrid.idParcellesFOuvertes = [];
	}
	//récupère l'index de la ligne d'une parcelle dans le tableau
	indexRowParcelle = function (idParcelle){	
		var rowIndex = newGrid.getStore().find('parcelle', idParcelle);
		// var rowIndex = tabs.activeTab.store.find('parcelle', idParcelle);
		return 	rowIndex;
	}
	//structure de l'enregistrement pour ajouter des lignes dans un tableau de résultats
	var TopicRecord = Ext.data.Record.create([
				{name: 'adresse', mapping: 'adresse'},
				{name: 'ccocom', mapping: 'ccocom'},
				{name: 'ccoinsee', mapping: 'ccoinsee'},
				{name: 'ccodep', mapping: 'ccodep'},
				{name: 'ccodir', mapping: 'ccodir'},
				{name: 'ccoinsee', mapping: 'ccoinsee'},
				{name: 'cconvo', mapping: 'cconvo'},
				{name: 'ccopre', mapping: 'ccopre'},
				{name: 'ccosec', mapping: 'ccosec'},
				{name: 'dindic', mapping: 'dindic'},
				{name: 'dnupla', mapping: 'dnupla'},
				{name: 'dnvoiri', mapping: 'dnvoiri'},
				{name: 'dvoilib', mapping: 'dvoilib'},
				{name: 'parcelle', mapping: 'parcelle'},
				{name: 'surface', mapping: 'surface'}
		]);			
	var geojson_format = new OpenLayers.Format.JSON();
	//affiche le tabelau de résultat ou le met à jour
	showTabSelection = function (parcelsIds,selectRows) {

		if(parcelsIds.length > 0) {
		// paramètres pour le getPArcelle
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
					var data = geojson_format.read(result.responseText);
					if (!tabs || !tabs.activeTab) { // si la fenetre de recherche n'est pas ouverte
						addNewResultParcelle("result selection ("+parcelsIds.length+")", getResultParcelleStore(result.responseText, false));
						newGrid.on('viewready', function(view,firstRow,lastRow){
							if (selectRows ) {
								for(var i=0; i < data.length; i++){
									id = data[i].parcelle;
									rowIndex = indexRowParcelle(id);
									newGrid.getSelectionModel().selectRow(rowIndex,true);
									openFoncierOrCadastre(id,newGrid);
									
								}
							}
						}); 
					}
					else { // si la fenêtre est ouverte on ajoute les lignes
						var ccoinsee ="";
						for(var i=0; i < data.length; i++){
							if (indexRowParcelle(data[i].parcelle) == -1) {
								ccoinsee = data[i].ccodep+data[i].ccodir+data[i].ccocom;
								//création de l'enregistrement
								newRecord = new TopicRecord({
									adresse	:	(data[i].adresse)?data[i].adresse:data[i].dvoilib,
									ccocom	:	data[i].ccocom,
									ccoinsee:	ccoinsee,
									ccodep	:	data[i].ccodep,
									ccodir	:	data[i].ccodir,
									cconvo	:	data[i].cconvo,
									ccopre	:	data[i].ccopre,
									ccosec	:	data[i].ccosec,
									dindic	:	data[i].dindic,
									dnupla	:	data[i].dnupla,
									dnvoiri	:	data[i].dnvoiri,
									dvoilib	:	data[i].dvoilib,
									parcelle:	data[i].parcelle,
									surface	:	data[i].surface,
								});
								//ajout de la ligne
								tabs.activeTab.store.add(newRecord);
							
							}
						}
						if (selectRows  ) { // si les lignes doivent être selectionnées
							for(var i=0; i < data.length; i++){
								id = data[i].parcelle;
								rowIndex = indexRowParcelle(id);
								newGrid.getSelectionModel().selectRow(rowIndex,true);
								// newGrid.detailParcelles.push( //affichage de la fenêtre cadastrale
									// onClickDisplayFIUC(data[i].parcelle)
								// );
								openFoncierOrCadastre(id,newGrid); 
							}
						}
					}
					//newGrid.getSelectionModel().mode ="MULTI";
					// newGrid.getSelectionModel().allowDeselect =false;
					
				},
				failure: function(result) {
					alert('ERROR-');
				}
			});

			
		}
	}

	//envoie une requete selon un filtre attributaire 
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
					if (indexFeatureSelected(feature) == -1) {
						selectLayer.addFeatures(feature);
						selectedFeatures.push(feature);
						changeStateFeature(feature, null, "searchSelector");
					}	
				}
			},
			  failure: function (response) {
				  console.log("Error ",response.responseText);
				}
		 });
	}
	

	// retourne une entité en prenant son id
	getFeatureById = function (idParcelle) {
		var WFSLayerSetting = GEOR.custom.WFSLayerSetting;
		var idField = WFSLayerSetting.nameFieldIdParcelle;
		for (var i=0; i < selectedFeatures.length; i++) { 
			if(selectedFeatures[i].attributes[idField] == idParcelle)
				return selectedFeatures[i];
		}
		return null;
	}
	//change l'etat sur la carte et mis à jour le dessin
	setState = function (feature, state) {
		feature.state = state;
		selectLayer.drawFeature(feature);
	}
	// en fonction de type d'appel elle gère le changement d'état 
	changeStateFeature = function (feature, index, typeSelector) {
		var state = null;
		switch(typeSelector) {
				// le cas le plus fréquent ou la fonction est appelé par un click simple sur la carte
				case  "clickSelector":
										if (feature.state == "1"){
											state = "2";	
										}else if (feature.state == "2") {
											selectedFeatures.splice(index, 1);
											selectLayer.destroyFeatures([feature]);
										}
										else {
											state = "1";
										}
										
										break;
				case "blue":
										state = "2";
										click.activate();
										break;
				case "yellow":
				case "searchSelector":
										state = "1";
										break;
										
				case "reset":			selectedFeatures.splice(index, 1);
										selectLayer.destroyFeatures([feature]);
										break;
										
				case "tmp":				state = null;
										break;

		}
	
		setState(feature, state);
		return state;
		
		// console.dir(selectedFeatures);
	}
	// vide le tableau des entités selectionnées
	clearLayerSelection=function () {
		selectedFeatures = [];
		selectLayer.removeAllFeatures();	
	}
	// récupère les coordonnées et la géométrie de l'entité dessinée et envoie une requête au serveur
	selectFeatureIntersection=	function (feature) {
		var typeGeom = feature.geometry.id.split('_')[2];
		var coords = "";
		if(typeGeom == "Point") {
			coords = feature.geometry.x+","+feature.geometry.y;
			click.deactivate();
		} else {
			var components = feature.geometry.components;
			if(typeGeom == "Polygon")
				components = components[0].components;
			coords = components[0].x+","+components[0].y;
			for(var i=1; i<components.length; i++) {
				coords += " "+components[i].x+","+components[i].y;
			}
		}
		getFeaturesWFSSpatial(typeGeom, coords, "blue");
		

    }
	//retourne la couche en prenant le nom
	getLayerByName=function(layerName){
		var map=GeoExt.MapPanel.guess().map;
		var layer=map.getLayersByName(layerName)[0];
		return layer;
	}
	// zoom sur les entités selectionnées etat 1 ou 2 
	zoomToSelectedFeatures =function() { // zoom sur les entités selectionnées etat 2 

		 if (selectedFeatures.length>0){ 
		 // récupération des bordure de  l'enveloppe des entités selectionnées
			var minLeft=selectedFeatures[0].geometry.bounds.left;
			maxRight=selectedFeatures[0].geometry.bounds.right;
			minBottom=selectedFeatures[0].geometry.bounds.bottom;
			maxTop=selectedFeatures[0].geometry.bounds.top;
			// on calcule l'enveloppe maximale des entités de la couche slection
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
	// ajout de la couche WMS à la carte 
	addWMSLayer=function(map){
		var wmsSetting = GEOR.custom.wmsLayer; 
		var cadastre = new OpenLayers.Layer.WMS(
			wmsSetting.layerNameInPanel,wmsSetting.url, {
			LAYERS: wmsSetting.layerNameGeoserver,
			transparent: wmsSetting.transparent,
			format: wmsSetting.format,
			}, {
				isBaseLayer: false,
				//singleTile: true,
				queryable:true
				}
		);
		layer1 =map.getLayersByName(wmsSetting.layerNameInPanel)[0];	
		if (layer1) 
			map.removeLayer(layer1)	
		map.addLayer(cadastre); // ajout de la couche à la carte	*/
	}
