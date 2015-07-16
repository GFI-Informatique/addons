Ext.namespace("GEOR.Addons.Cadastre");

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

/**
 * Method: createSelectionControl
 *
 * Créé le controle de sélection et la couche des parcelles à partir du wfs 
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
                if (feature.state == "1")
                    fill = selectedStyle.colorSelected1;
                if (feature.state == "2")
                    fill = selectedStyle.colorSelected2;
                return fill;
            },
            getFillOpacity : function(feature) {
                var opacity = 1;
                if (!feature.state)
                    opacity = 0;
                if (feature.state == "1" || feature.state == "2")
                    opacity = selectedStyle.opacity;
                return opacity;
            },
            getStrokeColor : function(feature) {
                var color = style.strokeColor;
                if (feature.state == "1")
                    color = selectedStyle.colorSelected1;
                if (feature.state == "2")
                    color = selectedStyle.colorSelected2;
                return color;
            },
            getstrokeWidth : function(feature) {
                var width = style.strokeWidth;
                if (feature.state == "1" || feature.state == "2")
                    width = selectedStyle.strokeWidth;
                return width;
            },
        }
    }));
    // création de la couche des entités selectionnées
    selectLayer = new OpenLayers.Layer.Vector("selection");
    selectLayer.styleMap = styleFeatures;
    // l'état de selection de chaque entité : null=non séléctionnée, 1=sélection
    // jaune, 2 = sélection bleue
    var state;
    // ajout de la couche à la carte
    map.addLayer(selectLayer);
    selectLayer.setZIndex(1001);
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
    click = new OpenLayers.Control.Click();
    // ajout et activation du controleur de click
    map.addControl(click);
    click.activate();
}


/**
 * Method: addPopupOnhover
 *
 * Créé un popup lorsque l'on survole la map
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

// envoie une requete au geoserveur pour faire une intersection de la couche wms
// avec la géométrie donnée en paramètres

/**
 * Method: addPopupOnhover
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
    var selectRows = false; // ligne dans le resultat de recherche doit être
                            // selectionnée si etat =2

    var polygoneElements = "", endPolygoneElements = "";
    var wfsUrl = GEOR.Addons.Cadastre.WFSLayerSetting.wfsUrl;
    var featureJson = "";
    if (typeGeom == "Polygon") {
        polygoneElements = "<gml:outerBoundaryIs><gml:LinearRing>";
        endPolygoneElements = "</gml:LinearRing></gml:outerBoundaryIs>";
    }
    filter = '<Filter xmlns:gml="http://www.opengis.net/gml"><Intersects><PropertyName>' + GEOR.Addons.Cadastre.WFSLayerSetting.geometryField + '</PropertyName><gml:' + typeGeom + '>' + polygoneElements + '<gml:coordinates>' + coords + '</gml:coordinates>' + endPolygoneElements + '</gml:' + typeGeom + '></Intersects></Filter>';
    Ext.Ajax.request({
        async : false,
        url : wfsUrl,
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
            "filter" : filter
        },
        success : function(response) {

            var idField = GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle; // champ
                                                                                    // identifiant
                                                                                    // de
                                                                                    // parcelle
                                                                                    // dans
                                                                                    // geoserver
            var result, resultSelection, geojson_format;
            var getIndex = function(result, str) {
                var exist = false;
                for (j = 0; j < result.length && !exist; j++) {
                    // renvoie des cas errronnées psk la géométrie est dupliquer
                    // pour quelques parcelles
                    // if(selectedFeatures[j].attributes.geo_parcelle ==
                    // feature.attributes.geo_parcelle) {
                    // remplacer par cette ligne
                    if (result[j].attributes[idField] == str) {
                        exist = true;
                        if (exist)
                            return j;
                    }
                }
                return -1;
            }
            featureJson = response.responseText;
            geojson_format = new OpenLayers.Format.GeoJSON();
            // dans cette variable on peut avoir plusieurs résultat pour la même
            // parcelle
            result = geojson_format.read(featureJson);
            // !! récupère de façon unique les parcelles résultat
            resultSelection = result.filter(function(itm, i, result) {
                return i == getIndex(result, itm.attributes[idField]);
            });
            if (typeSelector != "infoBulle") {
                var feature, state;
                var parcelsIds = [], codComm = null;
                for (var i = 0; i < resultSelection.length; i++) {
                    feature = resultSelection[i];
                    if (feature) {
                        var exist = false;
                        var j = -1;
                        // on teste si l'entité est déja selectionnée
                        for (j = 0; j < selectedFeatures.length && !exist; j++) {
                            // if(selectedFeatures[j].attributes.geo_parcelle ==
                            // feature.attributes.geo_parcelle) { //renvoie des
                            // cas errronnées psk la géométrie est dupliquer
                            // pour quelques parcelles
                            if (selectedFeatures[j].fid == feature.fid) { // remplacer
                                                                            // par
                                                                            // cette
                                                                            // ligne
                                exist = true;
                                if (exist) {
                                    feature = selectedFeatures[j];
                                }
                            }
                        }
                        // on l'ajoute à la selection si elle n'est pas trouvée
                        if (!exist) {
                            selectLayer.addFeatures(feature);
                            selectedFeatures.push(feature);
                        }
                        // on met à jour son état
                        state = GEOR.Addons.Cadastre.changeStateFeature(feature, j - 1, typeSelector);
                        var id = feature.attributes[idField];
                        // si la parcelle est selectionnée on récupère son id
                        // pour le getParcelle pour le tableau
                        if (state == "1" || state == "2") {
                            parcelsIds.push(id);
                        } else {
                            // sinon on la vire du tableau et on ferme les
                            // fenêtres de détail
                            // newGrid.getStore().removeAt(indexRowParcelle(id));
                            tabs.activeTab.store.removeAt(indexRowParcelle(id));
                            GEOR.Addons.Cadastre.closeWindowFIUC(id, newGrid);
                            GEOR.Addons.Cadastre.closeWindowFIUF(id, newGrid);
                        }
                    }
                }
                if (state == "2") {
                    selectRows = true;
                }
                GEOR.Addons.Cadastre.showTabSelection(parcelsIds, selectRows);
                // si la méthoe est appelée pour afficher l'infobulle
            } else {
                // si on survole la couche et pas le fond de carte pour avoir
                // l'infobulle
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
 *  Récupère l'index de l'entité selectionnée dans la couche selection
 *  
 *  @param: feature
 *  
 */
GEOR.Addons.Cadastre.indexFeatureSelected = function(feature) {

    var idField = GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle;
    var exist = false;
    for (j = 0; j < selectedFeatures.length && !exist; j++) {
        // if(selectedFeatures[j].attributes.geo_parcelle ==
        // feature.attributes.geo_parcelle) { //renvoie des cas errronnées psk
        // la géométrie est dupliquer pour quelques parcelles
        if (selectedFeatures[j].attributes[idField] == feature.attributes[idField]) { // remplacer
                                                                                        // par
                                                                                        // cette
                                                                                        // ligne
            exist = true;
            if (exist)
                return j;
        }
    }
    return -1;
}


/**
 * Ferme la fenetre de fiche cadastrale
 * 
 *  @param: idParcelle
 *  @param: grid
 */
GEOR.Addons.Cadastre.closeWindowFIUC = function(idParcelle, grid) {
    var index = grid.idParcellesCOuvertes.indexOf(idParcelle);
    var ficheCourante = grid.fichesCOuvertes[index];
    if (ficheCourante)
        ficheCourante.close();
}

/**
 * Ferme la fenetre de fiche foncière
 * 
 *  @param: idParcelle
 *  @param: grid
 */
GEOR.Addons.Cadastre.closeWindowFIUF = function(idParcelle, grid) {
    var index = grid.idParcellesFOuvertes.indexOf(idParcelle);
    var ficheCourante = grid.fichesFOuvertes[index];
    if (ficheCourante)
        ficheCourante.close();
}

/**
 * Ferme toutes les fenêtres de fiches cadastrales
 * 
 */
GEOR.Addons.Cadastre.closeAllWindowFIUC = function() {
    for (var j = newGrid.fichesCOuvertes.length - 1; j >= 0; j--) {
        newGrid.fichesCOuvertes[j].close();
    }
    newGrid.fichesCOuvertes = [];
    newGrid.idParcellesCOuvertes = [];
}

/**
 * Ferme toutes les fenêtres de fiches foncière
 * 
 */
GEOR.Addons.Cadastre.closeAllWindowFIUF = function() {
    for (var j = newGrid.fichesFOuvertes.length - 1; j >= 0; j--) {
        newGrid.fichesFOuvertes[j].close();
    }
    newGrid.fichesFOuvertes = [];
    newGrid.idParcellesFOuvertes = [];
}


/**
 * Récupère l'index de la ligne d'une parcelle dans le tableau
 * 
 * @param: idParcelle
 */
GEOR.Addons.Cadastre.indexRowParcelle = function(idParcelle) {
    var rowIndex = newGrid.getStore().find('parcelle', idParcelle);
    return rowIndex;
}

/**
 * Affiche le tabelau de résultat ou le met à jour
 * 
 * @param: parcelsIds
 * @param: selectRows
 */
GEOR.Addons.Cadastre.showTabSelection = function(parcelsIds, selectRows) {
    if (parcelsIds.length > 0) {
        // paramètres pour le getPArcelle
        var params = {
            "code" : parcelsIds[0]
        };
        params.details = 1;
        var cityCode = params.code;
        params.ccodep = cityCode.substring(0, 2);
        params.ccodir = cityCode.substring(2, 3);
        params.ccocom = cityCode.substring(3, 6);
        params.ccopre = cityCode.substring(6, 9);
        params.ccosec = cityCode.substring(9, 11);
        params.dnupla = cityCode.substring(11, 15);

        // liste des parcelles
        params.parcelle = new Array();
        for (var i = 0; i < parcelsIds.length; i++)
            params.parcelle.push(parcelsIds[i]);
        // envoi la liste de resultat
        Ext.Ajax.request({
            method : 'GET',
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
            params : params,
            username : "testadmin",
            password : "testadmin",
            success : function(result, opt) {
                // pour lire le format JSON : openlayers reader
                var geojson_format = new OpenLayers.Format.JSON();
                var data = geojson_format.read(result.responseText);
                var id, rowIndex;
                if (!tabs || !tabs.activeTab) { // si la fenetre de recherche
                                                // n'est pas ouverte
                    GEOR.Addons.Cadastre.addNewResultParcelle("result selection (" + parcelsIds.length + ")", GEOR.Addons.Cadastre.getResultParcelleStore(result.responseText, false));
                    newGrid.on('viewready', function(view, firstRow, lastRow) {
                        if (selectRows) {
                            for (var i = 0; i < data.length; i++) {
                                id = data[i].parcelle;
                                rowIndex = indexRowParcelle(id);
                                newGrid.getSelectionModel().selectRow(rowIndex, true);
                                GEOR.Addons.Cadastre.openFoncierOrCadastre(id, newGrid);

                            }
                        }
                    });
                } else { // si la fenêtre est ouverte on ajoute les lignes
                    var ccoinsee = "", newRecord;
                    for (var i = 0; i < data.length; i++) {
                        if (indexRowParcelle(data[i].parcelle) == -1) {
                            ccoinsee = data[i].ccodep + data[i].ccodir + data[i].ccocom;
                            // création de l'enregistrement
                            newRecord = new TopicRecord({
                                adresse : (data[i].adresse) ? data[i].adresse : data[i].dvoilib,
                                ccocom : data[i].ccocom,
                                ccoinsee : ccoinsee,
                                ccodep : data[i].ccodep,
                                ccodir : data[i].ccodir,
                                cconvo : data[i].cconvo,
                                ccopre : data[i].ccopre,
                                ccosec : data[i].ccosec,
                                dindic : data[i].dindic,
                                dnupla : data[i].dnupla,
                                dnvoiri : data[i].dnvoiri,
                                dvoilib : data[i].dvoilib,
                                parcelle : data[i].parcelle,
                                surface : data[i].surface,
                            });
                            // ajout de la ligne
                            tabs.activeTab.store.add(newRecord);
                        }
                    }
                    if (selectRows) { // si les lignes doivent être
                                        // selectionnées
                        for (var i = 0; i < data.length; i++) {
                            id = data[i].parcelle;
                            rowIndex = indexRowParcelle(id);
                            newGrid.getSelectionModel().selectRow(rowIndex, true);
                            GEOR.Addons.Cadastre.openFoncierOrCadastre(id, newGrid);
                        }
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
 * Envoie une requete selon un filtre attributaire
 * 
 * @param: idParcelle
 */
GEOR.Addons.Cadastre.getFeaturesWFSAttribute = function(idParcelle) {

    var filter = "" + GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle + "='" + idParcelle + "'";
    var wfsUrl = GEOR.Addons.Cadastre.WFSLayerSetting.wfsUrl;
    var featureJson = "";
    Ext.Ajax.request({
        url : wfsUrl,
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
                    selectLayer.addFeatures(feature);
                    selectedFeatures.push(feature);
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
 * Retourne une entité en prenant son id
 * 
 * @param: idParcelle
 * 
 * @return feature with id parcell = idParcelle
 */
GEOR.Addons.Cadastre.getFeatureById = function(idParcelle) {

    var idField = GEOR.Addons.Cadastre.WFSLayerSetting.nameFieldIdParcelle;
    for (var i = 0; i < selectedFeatures.length; i++) {
        if (selectedFeatures[i].attributes[idField] == idParcelle)
            return selectedFeatures[i];
    }
    return null;
}


/**
 *  Change l'etat sur la carte et mis à jour le dessin
 * 
 * @param: feature
 * @param: state
 * 
 */
GEOR.Addons.Cadastre.setState = function(feature, state) {
    feature.state = state;
    selectLayer.drawFeature(feature);
}

/**
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
            selectedFeatures.splice(index, 1);
            selectLayer.destroyFeatures([ feature ]);
        } else {
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

    case "reset":
        selectedFeatures.splice(index, 1);
        selectLayer.destroyFeatures([ feature ]);
        break;

    case "tmp":
        state = null;
        break;

    }
    GEOR.Addons.Cadastre.setState(feature, state);
    return state;
}


/**
 *  Vide le tableau des entités selectionnées
 *
 * 
 */
GEOR.Addons.Cadastre.clearLayerSelection = function() {
    selectedFeatures = [];
    selectLayer.removeAllFeatures();
}

/**
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
        click.deactivate();
    } else {
        var components = feature.geometry.components;
        if (typeGeom == "Polygon")
            components = components[0].components;
        coords = components[0].x + "," + components[0].y;
        for (var i = 1; i < components.length; i++) {
            coords += " " + components[i].x + "," + components[i].y;
        }
    }
    GEOR.Addons.Cadastre.getFeaturesWFSSpatial(typeGeom, coords, "blue");
}


/**
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
 *  zoom sur les entités selectionnées etat 1 ou 2 
 *
 * @param: layerName
 */
GEOR.Addons.Cadastre.zoomToSelectedFeatures = function() { // zoom sur les entités selectionnées etat 2 
    if (selectedFeatures.length > 0) {
        // récupération des bordure de  l'enveloppe des entités selectionnées
        var minLeft = selectedFeatures[0].geometry.bounds.left;
        var maxRight = selectedFeatures[0].geometry.bounds.right;
        var minBottom = selectedFeatures[0].geometry.bounds.bottom;
        var maxTop = selectedFeatures[0].geometry.bounds.top;
        // on calcule l'enveloppe maximale des entités de la couche slection
        for (i = 0; i < selectedFeatures.length; i++) {
            minLeft = Math.min(minLeft, selectedFeatures[i].geometry.bounds.left)
            maxRight = Math.max(maxRight, selectedFeatures[i].geometry.bounds.right)
            minBottom = Math.min(minBottom, selectedFeatures[i].geometry.bounds.bottom)
            maxTop = Math.max(maxTop, selectedFeatures[i].geometry.bounds.top)
        }
        var map = GeoExt.MapPanel.guess().map;
        map.zoomToExtent([ minLeft, minBottom, maxRight, maxTop ]); //zoom sur l'emprise
    } else
        console.log("pas d'entité selectionnée pour zoomer dessus");
}

/**
 *  ajout de la couche WMS à la carte 
 *
 * @param: wmsSetting
 */
GEOR.Addons.Cadastre.addWMSLayer = function(wmsSetting) {

    var cadastre = new OpenLayers.Layer.WMS(
    // paramètres de la requête wms
    wmsSetting.layerNameInPanel, wmsSetting.url, {
        LAYERS : wmsSetting.layerNameGeoserver,
        transparent : wmsSetting.transparent,
        format : wmsSetting.format,
    }, { // options carte
        isBaseLayer : false,
        //singleTile: true,
        queryable : true,
    //rendererOptions:{zIndexing: true}
    });
    var map = layer.map;
    var layer1 = map.getLayersByName(wmsSetting.layerNameInPanel)[0];
    if (layer1) {
        map.removeLayer(layer1)
    }
    map.addLayer(cadastre); // ajout de la couche à la carte	*/
}
