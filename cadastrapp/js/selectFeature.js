Ext.namespace("GEOR.Addons.Cadastre");


GEOR.Addons.Cadastre.selection=[];
GEOR.Addons.Cadastre.selection.state1 = "yellow";
GEOR.Addons.Cadastre.selection.state2 = "blue";

//structure de l'enregistrement pour ajouter des lignes dans un tableau de résultats
// TODO change scope probably namespace
var TopicRecord = Ext.data.Record.create([
            {name: 'adresse', mapping: 'adresse'},
            {name: 'cgocommune', mapping: 'cgocommune'},
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

/**
 * Method: createSelectionControl
 *
 * Créé le controle de sélection et la couche des parcelles à partir du wfs 
 * 
 * @param: style
 * @param:selectedStyle
 * 
 */
GEOR.Addons.Cadastre.createSelectionControl = function(style, selectedStyle) {
   
    var map = layer.map;

    var styleFeatures = new OpenLayers.StyleMap(new OpenLayers.Style({ // param config
        fillColor : "${getFillColor}", // style des entités en fonction de l'état
        strokeColor : "${getStrokeColor}",
        strokeWidth : "${getstrokeWidth}",
        fillOpacity : "${getFillOpacity}",
        pointRadius : style.pointRadius,
        pointerEvents : style.pointerEvents,
        fontSize : style.fontSize,
        graphicZIndex : 1000
    }, {
        context : {
            getFillColor : function(feature) {
                var fill = selectedStyle.defautColor;
                if (feature.state == "1"){
                    fill = selectedStyle.colorSelected1;
                }
                if (feature.state == "2"){
                    fill = selectedStyle.colorSelected2;
                }
                return fill;
            },
            getFillOpacity : function(feature) {
                var opacity = 1;
                if (!feature.state){
                    opacity = 0;
                }
                if (feature.state == "1" || feature.state == "2"){
                    opacity = selectedStyle.opacity;
                }
                return opacity;
            },
            getStrokeColor : function(feature) {
                var color = style.strokeColor;
                if (feature.state == "1"){
                    color = selectedStyle.colorSelected1;
                }
                if (feature.state == "2"){
                    color = selectedStyle.colorSelected2;
                }
                return color;
            },
            getstrokeWidth : function(feature) {
                var width = style.strokeWidth;
                if (feature.state == "1" || feature.state == "2"){
                    width = selectedStyle.strokeWidth;
                }
                return width;
            },
        }
    }));
    
    // création de la couche des entités selectionnées
    GEOR.Addons.Cadastre.selectLayer = new OpenLayers.Layer.Vector("selection" , {displayInLayerSwitcher: false});
    GEOR.Addons.Cadastre.selectLayer.styleMap = styleFeatures;
   
    // ajout de la couche à la carte
    map.addLayer(GEOR.Addons.Cadastre.selectLayer);
    GEOR.Addons.Cadastre.selectLayer.setZIndex(1001);
    
    // création de la classe de l'écouteur clique
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions : {
            'single' : true,
            'double' : false,
            'pixelTolerance' : 0,
            'stopSingle' : false,
            'stopDouble' : false
        },
        initialize : function(options) {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.handler = new OpenLayers.Handler.Click(this, {
                'click' : this.trigger
            }, this.handlerOptions);
        },
        trigger : function(e) {
            // récupération de la longitude et latitude à partir du clique
            lonlat = map.getLonLatFromPixel(e.xy);
            GEOR.Addons.Cadastre.getFeaturesWFSSpatial("Point", lonlat.lon + "," + lonlat.lat, "clickSelector");
        }
    });
    
    // TODO check this part
    GEOR.Addons.Cadastre.click = new OpenLayers.Control.Click();
    // ajout et activation du controleur de click
    map.addControl(GEOR.Addons.Cadastre.click);
    GEOR.Addons.Cadastre.click.activate();
}


/**
 * Method: addPopupOnhover
 *
 * Créé un popup lorsque l'on survole la map
 * 
 * @param: popuConfig
 * 
 */
GEOR.Addons.Cadastre.addPopupOnhover = function(popupConfig) {
    var map = layer.map;

    // comme pour le clique , on crée la classe du controleur hover
    OpenLayers.Control.Hover = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions : {
            'delay' : 200,
            'pixelTolerance' : null,
            'stopMove' : false
        },
        initialize : function(options) {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.handler = new OpenLayers.Handler.Hover(this, {
                'pause' : this.onPause,
                'move' : this.onMove
            }, this.handlerOptions);
        },
        onPause : function(evt) {
            var zoom = map.getZoom();
            // affichage si niveau de zoom convenable
            if (zoom > popupConfig.minZoom) {
                var lonlat = map.getLonLatFromPixel(evt.xy);
                var coords = lonlat.lon + "," + lonlat.lat;
                GEOR.Addons.Cadastre.getFeaturesWFSSpatial("Point", coords, "infoBulle");
            }
        },
        onMove : function(evt) {
            // if this control sent an Ajax request (e.g. GetFeatureInfo) when
            // the mouse pauses the onMove callback could be used to abort that
            // request.
        }
    });
    // création du controleur de survol
    var infoControls = {
        'hover' : new OpenLayers.Control.Hover({
            handlerOptions : {
                // delai d'affichage du popup
                'delay' : popupConfig.timeToShow
            }
        })
    };
    map.addControl(infoControls["hover"]);
    infoControls["hover"].activate();
}

/**
 * Method: getFeaturesWFSSpatial
 *
 * Envoie une requête au geoserveur pour faire une intersection de la couche wms avec la géométrie 
 * donnée en paramètres
 * 
 * @param: typeGeom
 * @param: coords
 * @param: typeSelector
 * 
 * 
 */
GEOR.Addons.Cadastre.getFeaturesWFSSpatial = function(typeGeom, coords, typeSelector) {
    
    var filter;
    var selectRows = false; // ligne dans le resultat de recherche doit être sélectionnée si etat =2
    var polygoneElements = "";
    var endPolygoneElements = "";

    if (typeGeom == "Polygon") {
        polygoneElements = "<gml:outerBoundaryIs><gml:LinearRing>";
        endPolygoneElements = "</gml:LinearRing></gml:outerBoundaryIs>";
    }
    
    filter = '<Filter xmlns:gml="http://www.opengis.net/gml"><Intersects><PropertyName>' + GEOR.Addons.Cadastre.WFSLayerSetting.geometryField + '</PropertyName><gml:' + typeGeom + '>' + polygoneElements + '<gml:coordinates>' + coords + '</gml:coordinates>' + endPolygoneElements + '</gml:' + typeGeom + '></Intersects></Filter>';
   
    Ext.Ajax.request({
        async: false,
        url: GEOR.Addons.Cadastre.WFSLayerSetting.wfsUrl,
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json'
        },
        params : {
            "request": GEOR.Addons.Cadastre.WFSLayerSetting.request,
            "version": GEOR.Addons.Cadastre.WFSLayerSetting.version,
            "service": GEOR.Addons.Cadastre.WFSLayerSetting.service,
            "typename": GEOR.Addons.Cadastre.WFSLayerSetting.typename,
            "outputFormat": GEOR.Addons.Cadastre.WFSLayerSetting.outputFormat,
            "filter": filter
        },
        success: function(response) {

            // champ identifiant de parcelle dans geoserver
            var idField = GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle; 
            var resultSelection;
           
            var getIndex = function(result, str) {
                var index = -1;
                Ext.each(result, function(element, currentIndex){
                    if (element.attributes[idField] == str){
                        index = currentIndex;
                        return false;  // this breaks out of the 'each' loop
                    }
                });           
                return index;
            }
            
            var geojson_format = new OpenLayers.Format.GeoJSON();
           
            // dans cette variable on peut avoir plusieurs résultat pour la même parcelle
            var result = geojson_format.read(response.responseText);
           
            // !! récupère de façon unique les parcelles résultat
            resultSelection = result.filter(function(itm, i, result) {
                return i == getIndex(result, itm.attributes[idField]);
            });
            
            if (typeSelector != "infoBulle") {
                
                // If result windows is not opened, create it
                if (!GEOR.Addons.Cadastre.result.window){
                    GEOR.Addons.Cadastre.addNewResultParcelle("Sélection", null);
                }
                
                var feature, state;
                var parcelsIds = [], codComm = null;
                
                Ext.each(resultSelection, function(feature, currentIndexI){
                    if (feature) {
                        var exist = false;
                        index = -1;

                        // on teste si l'entité est déja selectionnée
                        Ext.each(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures, function(selectedFeature, currentIndexJ){
                            if (selectedFeature.fid == feature.fid) { 
                                exist = true;
                                feature = selectedFeature;
                                index = currentIndexJ;
                                return false;  // this breaks out of the 'each' loop
                            }
                        });
                        
                        // on l'ajoute à la selection si elle n'est pas trouvée
                        if (!exist) {
                            GEOR.Addons.Cadastre.selectLayer.addFeatures(feature);
                            GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures.push(feature);
                        }
                        
                        // on met à jour son état
                        state = GEOR.Addons.Cadastre.changeStateFeature(feature, index - 1, typeSelector);
                        var id = feature.attributes[idField];
                        
                        // si la parcelle est selectionnée on récupère son id
                        // pour le getParcelle pour le tableau
                        if (state == "1" || state == "2") {
                            parcelsIds.push(id);
                        } else {
                            // sinon on la supprime du tableau et on ferme les fenêtres de détail
                            GEOR.Addons.Cadastre.result.tabs.activeTab.store.removeAt(GEOR.Addons.Cadastre.indexRowParcelle(id));
                            GEOR.Addons.Cadastre.closeWindowFIUC(id, GEOR.Addons.Cadastre.result.tabs.activeTab);
                            GEOR.Addons.Cadastre.closeWindowFIUF(id, GEOR.Addons.Cadastre.result.tabs.activeTab);
                        }
                    }
                });
                if (state == "2") {
                    selectRows = true;
                }
                GEOR.Addons.Cadastre.showTabSelection(parcelsIds, selectRows);
                // si la méthode est appelée pour afficher l'infobulle
            } else {
                // si on survole la couche et pas le fond de carte pour avoir l'infobulle
                if (resultSelection.length > 0) {
                    var map = GeoExt.MapPanel.guess().map;
                    var idParcelle = resultSelection[0].attributes[idField];
                    var lonlat = new OpenLayers.LonLat(coords.split(",")[0], coords.split(",")[1])
                    GEOR.Addons.Cadastre.displayInfoBulle(map, idParcelle, lonlat);
                }
            }
        },
        failure : function(response) {
            console.log("Error ", response.responseText);
        }
    });
}


/**
 *  Method: indexFeatureSelected
 * 
 *  Récupère l'index de l'entité selectionnée dans la couche selection
 *  
 *  @param: feature
 *  
 */
GEOR.Addons.Cadastre.indexFeatureSelected = function(feature) {

    var idField = GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle;
    var index = -1;
    
    Ext.each(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures, function(selectedFeature, currentIndex){
        if (selectedFeature.attributes[idField] == feature.attributes[idField]){
            index = currentIndex;
            return false;  // this breaks out of the 'each' loop
        }
    });
    return index;
}


/**
 *  Method: closeWindowFIUC
 * 
 *  Ferme la fenetre de fiche cadastrale
 * 
 *  @param: idParcelle
 *  @param: grid
 */
GEOR.Addons.Cadastre.closeWindowFIUC = function(idParcelle, grid) {
    var index = grid.idParcellesCOuvertes.indexOf(idParcelle);
    var ficheCourante = grid.fichesCOuvertes[index];
    if (ficheCourante){
        ficheCourante.close();
    }
}

/**
 *  Method: closeWindowFIUF
 *  
 *  Ferme la fenetre de fiche foncière
 * 
 *  @param: idParcelle
 *  @param: grid
 */
GEOR.Addons.Cadastre.closeWindowFIUF = function(idParcelle, grid) {
    var index = grid.idParcellesFOuvertes.indexOf(idParcelle);
    var ficheCourante = grid.fichesFOuvertes[index];
    if (ficheCourante){
        ficheCourante.close();
    }
}

/**
 * Method: closeAllWindowFIUC
 * 
 *  Ferme toutes les fenêtres de fiches cadastrales
 * 
 */
GEOR.Addons.Cadastre.closeAllWindowFIUC = function() {
    Ext.each(GEOR.Addons.Cadastre.result.tabs.activeTab.fichesCOuvertes, function(ficheCadastreOuverte, currentIndex){
        ficheCadastreOuverte.close();
    });
    GEOR.Addons.Cadastre.result.tabs.activeTab.fichesCOuvertes = [];
    GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesCOuvertes = [];
}

/**
 *  Method: closeAllWindowFIUF
 *
 * Ferme toutes les fenêtres de fiches foncière
 * 
 */
GEOR.Addons.Cadastre.closeAllWindowFIUF = function() {
    Ext.each(GEOR.Addons.Cadastre.result.tabs.activeTab.fichesFOuvertes, function(fichesFOuverte, currentIndex){
        fichesFOuverte.close();
    });
    GEOR.Addons.Cadastre.result.tabs.activeTab.fichesFOuvertes = [];
    GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesFOuvertes = [];
}


/**
 * Method: indexRowParcelle
 *  
 *  Récupère l'index de la ligne d'une parcelle dans le tableau
 * 
 * @param: idParcelle
 */
GEOR.Addons.Cadastre.indexRowParcelle = function(idParcelle) {
    var rowIndex = GEOR.Addons.Cadastre.result.tabs.activeTab.getStore().find('parcelle', idParcelle);
    return rowIndex;
}

/**
 * Method: showTabSelection
 * 
 * Affiche le tableau de résultat ou le met à jour
 * 
 * @param: parcelsIds
 * @param: selectRows
 */
GEOR.Addons.Cadastre.showTabSelection = function(parcelsIds, selectRows) {
    
    // si il existe au moins une parcelle
    if (parcelsIds.length > 0) {
        
        // paramètres pour le getParcelle
        var params = {};
        params.parcelle = new Array();
        Ext.each(parcelsIds, function(parcelleId, currentIndex){
            params.parcelle.push(parcelleId);
        });
        
        // envoi la liste de resultat
        Ext.Ajax.request({
            method : 'GET',
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
            params : params,
            success : function(response) {
                
                var result = Ext.decode(response.responseText);
                var rowIndex;
                
                // si la fenetre de recherche n'est pas ouverte
                if (!GEOR.Addons.Cadastre.result.window || !GEOR.Addons.Cadastre.result.tabs || !GEOR.Addons.Cadastre.result.tabs.activeTab) { 
                   
                    GEOR.Addons.Cadastre.addNewResultParcelle("Selection (" + parcelsIds.length + ")", GEOR.Addons.Cadastre.getResultParcelleStore(response.responseText, false));
                    
                    GEOR.Addons.Cadastre.result.tabs.activeTab.on('viewready', function(view, firstRow, lastRow) {
                        if (selectRows) {
                            Ext.each(result, function(element, currentIndex){
                                rowIndex = GEOR.Addons.Cadastre.indexRowParcelle(element.parcelle);
                                GEOR.Addons.Cadastre.result.tabs.activeTab.getSelectionModel().selectRow(rowIndex, true);
                                GEOR.Addons.Cadastre.openFoncierOrCadastre(element.parcelle, GEOR.Addons.Cadastre.result.tabs.activeTab);

                            });
                        }
                    });
                 // si la fenêtre est ouverte on ajoute les lignes
                } else { 
                    Ext.each(result, function(element, currentIndex){
                        if (GEOR.Addons.Cadastre.indexRowParcelle(element.parcelle) == -1) {
                            
                            // création de l'enregistrement
                           var newRecord = new TopicRecord({
                                parcelle : element.parcelle,
                                adresse : (element.adresse) ? element.adresse : element.dnvoiri + element.dindic +' '+element.cconvo  +' ' + element.dvoilib,
                                cgocommune : element.cgocommune,
                                ccopre : element.ccopre,
                                ccosec : element.ccosec,
                                dnupla : element.dnupla,   
                                dcntpa : element.dcntpa,
                            });
                            // ajout de la ligne
                            GEOR.Addons.Cadastre.result.tabs.activeTab.store.add(newRecord);
                            // Ajout à la selection
                            GEOR.Addons.Cadastre.getFeaturesWFSAttribute(element.parcelle);
                        }
                    });
                    if (selectRows) { // si les lignes doivent être selectionnées
                        Ext.each(result, function(element, currentIndex){
                            rowIndex = GEOR.Addons.Cadastre.indexRowParcelle(element.parcelle);
                            GEOR.Addons.Cadastre.result.tabs.activeTab.getSelectionModel().selectRow(rowIndex, true);
                            GEOR.Addons.Cadastre.openFoncierOrCadastre(element.parcelle, GEOR.Addons.Cadastre.result.tabs.activeTab);
                        });
                    }
                }
            },
            failure : function(result) {
                alert('ERROR-');
            }
        });
    }
}

/**
 * Method: getFeaturesWFSAttribute
 * 
 * Envoie une requete selon un filtre attributaire
 * 
 * @param: idParcelle
 */
GEOR.Addons.Cadastre.getFeaturesWFSAttribute = function(idParcelle) {

    var filter = "" + GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle + "='" + idParcelle + "'";
    var featureJson = "";
    
    Ext.Ajax.request({
        url : GEOR.Addons.Cadastre.WFSLayerSetting.wfsUrl,
        method : 'GET',
        headers : {
            'Content-Type' : 'application/json'
        },
        params : {
            "request" : GEOR.Addons.Cadastre.WFSLayerSetting.request,
            "version" : GEOR.Addons.Cadastre.WFSLayerSetting.version,
            "service" : GEOR.Addons.Cadastre.WFSLayerSetting.service,
            "typename" : GEOR.Addons.Cadastre.WFSLayerSetting.typename,
            "outputFormat" : GEOR.Addons.Cadastre.WFSLayerSetting.outputFormat,
            "cql_filter" : filter
        },
        success : function(response) {
            featureJson = response.responseText;
            var geojson_format = new OpenLayers.Format.GeoJSON();
            var resultSelection = geojson_format.read(featureJson);
            var feature = geojson_format.read(featureJson)[0];
            if (feature) {
                if (GEOR.Addons.Cadastre.indexFeatureSelected(feature) == -1) {
                    GEOR.Addons.Cadastre.selectLayer.addFeatures(feature);
                    GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures.push(feature);
                    GEOR.Addons.Cadastre.changeStateFeature(feature, null, "searchSelector");
                }
            }
        },
        failure : function(response) {
            console.log("Error ", response.responseText);
        }
    });
}

/**
 * Method: getFeatureById
 * 
 * Retourne une entité en prenant son id
 * 
 * @param: idParcelle
 * @return feature with id parcell = idParcelle
 */
GEOR.Addons.Cadastre.getFeatureById = function(idParcelle) {
  
    var idField = GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle;
    var feature;

    Ext.each(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures, function(selectedFeature, currentIndex){
        if (selectedFeature.attributes[idField] == idParcelle){
            feature= selectedFeature;
            return false;
        }
    });
    return feature;
}



/**
 * Method: setState
 * 
 *  Change l'etat sur la carte et mis à jour le dessin
 * 
 * @param: feature
 * @param: state
 * 
 */
GEOR.Addons.Cadastre.setState = function(feature, state) {
    feature.state = state;
    GEOR.Addons.Cadastre.selectLayer.drawFeature(feature);
}

/**
 * Method: changeStateFeature
 *  
 *  Gestion du changement d'état lors du click sur l'entitée
 * 
 * @param: feature
 * @param: index
 * @param: typeSelector
 * 
 */
GEOR.Addons.Cadastre.changeStateFeature = function(feature, index, typeSelector) {
    var state = null;
    switch (typeSelector) {
    // le cas le plus fréquent ou la fonction est appelé par un click simple sur
    // la carte
    case "clickSelector":
        if (feature.state == "1") {
            state = "2";
        } else if (feature.state == "2") {
            GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures.splice(index, 1);
            GEOR.Addons.Cadastre.selectLayer.destroyFeatures([ feature ]);
        } else {
            state = "1";
        }
        break;
    case GEOR.Addons.Cadastre.selection.state2:
        state = "2";
        GEOR.Addons.Cadastre.click.activate();
        break;
    case GEOR.Addons.Cadastre.selection.state1:
    case "searchSelector":
        state = "1";
        break;

    case "reset":
        GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures.splice(index, 1);
        GEOR.Addons.Cadastre.selectLayer.destroyFeatures([ feature ]);
        break;

    case "tmp":
        state = null;
        break;

    }
    GEOR.Addons.Cadastre.setState(feature, state);
    return state;
}


/**
 * Method: clearLayerSelection
 * 
 *  Vide le tableau des entités selectionnées
 *
 */
GEOR.Addons.Cadastre.clearLayerSelection = function() {
    GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures = [];
    GEOR.Addons.Cadastre.selectLayer.removeAllFeatures();
}

/**
 * Method: selectFeatureIntersection
 * 
 *  Récupère les coordonnées et la géométrie de l'entité dessinée et envoie une requête au serveur
 *
 * @param: feature
 */
GEOR.Addons.Cadastre.selectFeatureIntersection = function(feature) {
    
    // on récupère le type de la geomètrie dessinée 
    var typeGeom = feature.geometry.id.split('_')[2];
    var coords = "";
    
    if (typeGeom == "Point") {
        coords = feature.geometry.x + "," + feature.geometry.y;
        GEOR.Addons.Cadastre.click.deactivate();
    } else {
        var components = feature.geometry.components;
        if (typeGeom == "Polygon")
            components = components[0].components;
        coords = components[0].x + "," + components[0].y;
        Ext.each(components, function(component, currentIndex){
            coords += " " + component.x + "," + component.y;
        });
    }
    GEOR.Addons.Cadastre.getFeaturesWFSSpatial(typeGeom, coords, GEOR.Addons.Cadastre.selection.state2);
}


/**
 * Method: getLayerByName
 * 
 *  retourne la couche en prenant le nom
 *
 * @param: layerName
 */
GEOR.Addons.Cadastre.getLayerByName = function(layerName) {
    var map = GeoExt.MapPanel.guess().map;
    var layer1 = map.getLayersByName(layerName)[0];
    return layer1;
}

/**
 * Method: zoomToSelectedFeatures
 * 
 *  zoom sur les entités selectionnées etat 1 ou 2 
 *
 * @param: layerName
 */
GEOR.Addons.Cadastre.zoomToSelectedFeatures = function() { 
    // zoom sur les entités selectionnées etat 2 
    if (GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures.length > 0) {
        // récupération des bordure de  l'enveloppe des entités selectionnées
        var minLeft = GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures[0].geometry.bounds.left;
        var maxRight = GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures[0].geometry.bounds.right;
        var minBottom = GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures[0].geometry.bounds.bottom;
        var maxTop = GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures[0].geometry.bounds.top;
        // on calcule l'enveloppe maximale des entités de la couche slection
        Ext.each(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures, function(selectedFeature, currentIndex){
            minLeft = Math.min(minLeft, selectedFeature.geometry.bounds.left)
            maxRight = Math.max(maxRight, selectedFeature.geometry.bounds.right)
            minBottom = Math.min(minBottom, selectedFeature.geometry.bounds.bottom)
            maxTop = Math.max(maxTop, selectedFeature.geometry.bounds.top)
        });
        var map = GeoExt.MapPanel.guess().map;
        map.zoomToExtent([ minLeft, minBottom, maxRight, maxTop ]); //zoom sur l'emprise
    } else{
        console.log("pas d'entité selectionnée pour zoomer dessus");
    }
}

/**
 * Method: addWMSLayer
 * 
 *  ajout de la couche WMS à la carte 
 *
 * @param: wmsSetting
 */
GEOR.Addons.Cadastre.addWMSLayer = function(wmsSetting) {
    
    // Show layer in switcher only if it has a name set by administrator
    var isDisplayInLayerSwitcher = false;  
    if(wmsSetting.layerNameInPanel.length > 0){
        isDisplayInLayerSwitcher = true;
    }

    GEOR.Addons.Cadastre.WMSLayer = new OpenLayers.Layer.WMS(
            // paramètres de la requête wms
            wmsSetting.layerNameInPanel, 
            wmsSetting.url, {
                LAYERS : wmsSetting.layerNameGeoserver,
                transparent : wmsSetting.transparent,
                format : wmsSetting.format,
            }, { 
                // options carte
                displayInLayerSwitcher: isDisplayInLayerSwitcher,
                isBaseLayer : false,
                queryable : true,
            });
   
    // Remove existing Layer if already exist.
    var layer1 = layer.map.getLayersByName(wmsSetting.layerNameInPanel)[0];
    if (layer1) {
        layer1.destroy();
    }
    layer.map.addLayer(GEOR.Addons.Cadastre.WMSLayer); // ajout de la couche à la carte	*/
}

