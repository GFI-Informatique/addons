Ext.namespace("GEOR.Addons.Cadastre");

// structure de l'enregistrement pour ajouter des lignes dans un tableau de
// résultats
GEOR.Addons.Cadastre.resultParcelleRecord = Ext.data.Record.create([ {
    name : 'adresse',
    mapping : 'adresse'
}, {
    name : 'cgocommune',
    mapping : 'cgocommune'
}, {
    name : 'cconvo',
    mapping : 'cconvo'
}, {
    name : 'ccopre',
    mapping : 'ccopre'
}, {
    name : 'ccosec',
    mapping : 'ccosec'
}, {
    name : 'dindic',
    mapping : 'dindic'
}, {
    name : 'dnupla',
    mapping : 'dnupla'
}, {
    name : 'dnvoiri',
    mapping : 'dnvoiri'
}, {
    name : 'dvoilib',
    mapping : 'dvoilib'
}, {
    name : 'parcelle',
    mapping : 'parcelle'
}, {
    name : 'surface',
    mapping : 'surface'
} ]);

/**
 * Init Global windows containing all tabs
 */
GEOR.Addons.Cadastre.initResultParcelle = function() {
    

    // fenêtre principale
    GEOR.Addons.Cadastre.result.plot.window = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.parcelle.result.title'),
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        border : false,
        width : 580,
        height : 200,
        boxMaxHeight : Ext.getBody().getViewSize().height - 200,
        listeners : {
            // Adding because autoheight and boxMaxHeight to not work together
            // on tabPanel
            afterlayout : function(window) {
                if (this.getHeight() > this.boxMaxHeight) {
                    this.setHeight(this.boxMaxHeight);
                }
            },
            close : function(window) {
                // *********************
                // supprime tous les entités de la couche selection
                GEOR.Addons.Cadastre.clearLayerSelection();
                // ferme les fenêtres cadastrales et foncières
                GEOR.Addons.Cadastre.closeAllWindowFIUC();
                GEOR.Addons.Cadastre.closeAllWindowFIUF();
                // *********************
                GEOR.Addons.Cadastre.result.plot.window = null;
            },
            show : function(window) {
                // lors du changement entre onglets : deselection de toutes les
                // parcelles et selection de celles du nouvel onglet
            }
        },
        items : [ {
            xtype : 'tabpanel',
            layoutOnTabChange : true,
            enableTabScroll : true,
            items : [ {
                xtype : 'panel',
                title : '+',
                border : true,
                closable : false,
                listeners : {
                    activate : function(grid) {
                        // Add void tab
                        GEOR.Addons.Cadastre.addNewResultParcelle(OpenLayers.i18n('cadastrapp.parcelle.result.selection.title'), null, OpenLayers.i18n('cadastrapp.parcelle.result.selection.content'));
                    }
                }
            } ]
        } ],

        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.result.parcelle.zoom.list'),
            listeners : {
                click : function(b, e) {
                    // zoom on plots from the active tab
                    var features = [];
                    GEOR.Addons.Cadastre.result.tabs.getActiveTab().getStore().each(function(item,index){
                        var parcelleId = item.data.parcelle;
                        features.push(GEOR.Addons.Cadastre.getFeatureById(parcelleId));
                    });
                    GEOR.Addons.Cadastre.zoomOnFeatures(features);
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.result.parcelle.zoom.selection'),
            listeners : {
                click : function(b, e) {
                    // zoom on selected plots from the active tab
                    var selection = GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().getSelections();

                    var features = [];
                    Ext.each(selection, function(item) {
                        var parcelleId = item.data.parcelle;
                        features.push(GEOR.Addons.Cadastre.getFeatureById(parcelleId));
                    });
                    if (features) {
                        GEOR.Addons.Cadastre.zoomOnFeatures(features);
                    }

                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.result.parcelle.delete'),
            listeners : {
                click : function(b, e) {
                    // remove selected plots from the active tab
                    // delete from store
                    var selection = GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().getSelections();

                    Ext.each(selection, function(item) {

                        // remove from store
                        GEOR.Addons.Cadastre.result.tabs.getActiveTab().store.remove(item);

                        var parcelleId = item.data.parcelle;
                        var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);

                        // Close open windows
                        GEOR.Addons.Cadastre.closeFoncierAndCadastre(parcelleId, GEOR.Addons.Cadastre.result.tabs.getActiveTab());

                        // Remove feature
                        if (feature) {
                            var index = GEOR.Addons.Cadastre.indexFeatureSelected(feature);
                            GEOR.Addons.Cadastre.changeStateFeature(feature, index, "reset");
                        }
                    });
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.result.parcelle.fiche'),
            listeners : {
                click : function(b, e) {

                    var selection = GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().getSelections();

                    Ext.each(selection, function(item) {
                        var parcelleId = item.data.parcelle;
                        var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                        var state = GEOR.Addons.Cadastre.selection.state.list;

                        // Si la fenêtre details cadastre ou foncier est déjà
                        // ouverte
                        if (GEOR.Addons.Cadastre.result.tabs.getActiveTab().idParcellesCOuvertes.indexOf(parcelleId) != -1 || GEOR.Addons.Cadastre.result.tabs.getActiveTab().idParcellesFOuvertes.indexOf(parcelleId) != -1) {
                            GEOR.Addons.Cadastre.closeFoncierAndCadastre(parcelleId, grid);
                        } else {
                            GEOR.Addons.Cadastre.openFoncierOrCadastre(parcelleId, GEOR.Addons.Cadastre.result.tabs.getActiveTab());
                            state = GEOR.Addons.Cadastre.selection.state.details;
                        }

                        // change selection color on map depending on state
                        if (feature) {
                            GEOR.Addons.Cadastre.changeStateFeature(feature, 0, state);
                        }
                    });
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.result.parcelle.export'),
            listeners : {
                click : function(b, e) {

                    // Export selected plots as csv
                    GEOR.Addons.Cadastre.exportPlotSelectionAsCSV();
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.close'),
            listeners : {
                click : function(b, e) {
                    // Close all tab and open windows
                    GEOR.Addons.Cadastre.result.plot.window.close();
                }
            }
        } ]
    });
};

/**
 * Result parcelle grid For each tab, contains gridPanel with value + list of
 * selection and open windows
 */
GEOR.Addons.Cadastre.resultParcelleGrid = Ext.extend(Ext.grid.GridPanel, {
    detailParcelles : new Array(),
    fichesCOuvertes : new Array(),
    idParcellesCOuvertes : new Array(),
    fichesFOuvertes : new Array(),
    idParcellesFOuvertes : new Array(),
    featuresList : new Array()
});

/**
 * public: method[addNewResultParcelle]
 * 
 * Add new parcelle(s) to resultwindow with a default message no result
 * 
 * @param: title -> title of the new tab
 * @param: result -> result to be used in the grid of this tab
 */
GEOR.Addons.Cadastre.addNewResultParcelle = function(title, result) {
    GEOR.Addons.Cadastre.addNewResult(title, result, OpenLayers.i18n('cadastrapp.parcelle.result.nodata'));
};

/**
 * public: method[addNewResult]
 * 
 * Call the initWindows method if windows do not exist then fill one tab with
 * given information or message
 * 
 * @param: title tab title
 * @param: result to be store in a grid
 * @param: message to replace data if not exist
 */
GEOR.Addons.Cadastre.addNewResult = function(title, result, message) {

    // If windows do not exist
    if (GEOR.Addons.Cadastre.result.plot.window == null) {
        GEOR.Addons.Cadastre.initResultParcelle();
    }

    // Get tab list
    GEOR.Addons.Cadastre.result.tabs = GEOR.Addons.Cadastre.result.plot.window.items.items[0];

    // **********
    // Listener
    GEOR.Addons.Cadastre.result.tabs.addListener('beforetabchange', function(tab, newTab, currentTab) {
        var store;
        if (currentTab) { // cad la table de resultats est ouverte et on
            // navigue entre les
            // onglets, sinon toute selection en bleue sur la carte va redevenir
            // jaune
            if (currentTab.store) {
                store = currentTab.store.data.items;
                // deselection des parcelles
                GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, "tmp");
            }

            if (newTab) {
                if (newTab.store) {
                    store = newTab.store.data.items;
                    // selection en jaune
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, GEOR.Addons.Cadastre.selection.state.list);
                    // selection en bleue
                    var selectedRows = newTab.getSelectionModel().selections.items;
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(selectedRows, GEOR.Addons.Cadastre.selection.state.selected);
                }
            }
        }
    });
    // **********

    var currentTabGrid = new GEOR.Addons.Cadastre.resultParcelleGrid({
        title : title,
        id : 'resultParcelleWindowTab' + GEOR.Addons.Cadastre.result.tabs.items.length,
        border : true,
        closable : true,
        store : (result != null) ? result : new Ext.data.Store(),
        colModel : GEOR.Addons.Cadastre.getResultParcelleColModel(),
        autoHeight : true,
        sm : new Ext.grid.RowSelectionModel({
            multiSelect : true,
            listeners : {
                // Add feature and change state when selected
                rowselect : function(grid, rowIndex, record) {
                    var parcelleId = record.data.parcelle;
                    var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                    if(feature){
                        GEOR.Addons.Cadastre.changeStateFeature(feature, 0, GEOR.Addons.Cadastre.selection.state.selected);
               
                    }
                },
                // Remove feature and change state when deselected
                rowdeselect : function(grid, rowIndex, record) {
                    var parcelleId = record.data.parcelle;
                    var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                    if(feature){
                        GEOR.Addons.Cadastre.changeStateFeature(feature, 0, GEOR.Addons.Cadastre.selection.state.list);
               
                    }
                }
            }
        }),
        viewConfig : {
            deferEmptyText : false,
            emptyText : message
        },
        listeners : {
            close : function(grid) {
                // on ferme toutes les fenetres filles : detail parcelle
                Ext.each(grid.detailParcelles, function(element, currentIndex) {
                    if (element) {
                        element.close()
                    }
                });

                // on ferme la fenetre si c'est le dernier onglet
                if (GEOR.Addons.Cadastre.result.tabs.items.length == 2) {
                    // si il ne reste que cet onglet et l'onglet '+', fermer la
                    // fenetre
                    GEOR.Addons.Cadastre.result.plot.window.close();
                } else {
                    // on selectionne manuellement le nouvel onglet à
                    // activer, pour eviter de tomber sur le '+' (qui va
                    // tenter de refaire un onglet et ça va faire
                    // nimporte quoi)
                    var index = GEOR.Addons.Cadastre.result.tabs.items.findIndex('id', grid.id);
                    GEOR.Addons.Cadastre.result.tabs.setActiveTab((index == 0) ? 1 : (index - 1));
                    // *************
                    // quand on ferme l'onglet on vire toutes les
                    // parcelles dependantes
                    store = grid.store.data.items;
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, "reset");
                    // *************
                }
            }
        }
    });

    // Add new panel at the end just before + and activate it
    var currentTabIndex = GEOR.Addons.Cadastre.result.tabs.items.length -1;
    GEOR.Addons.Cadastre.result.tabs.insert(currentTabIndex, currentTabGrid);
    GEOR.Addons.Cadastre.result.tabs.setActiveTab(currentTabIndex);

    // lors d'une recherche de parcelle on envoie une requête attributtaire pour stocker les features
    currentTabGrid.getStore().each(function(record) {
        GEOR.Addons.Cadastre.getFeaturesWFSAttribute(record.data.parcelle);
    });

    GEOR.Addons.Cadastre.result.plot.window.show();
}

/**
 * Method: showTabSelection
 * 
 * Affiche le tableau de résultat ou le met à jour
 * 
 * @param: parcelsIds
 * @param: selectRows
 */
GEOR.Addons.Cadastre.showTabSelection = function(parcelsIds) {

    // si il existe au moins une parcelle
    if (parcelsIds.length > 0) {

        // Vérifie si la parcelle n'est pas déjà dans le store
        if (GEOR.Addons.Cadastre.result.tabs.getActiveTab() && GEOR.Addons.Cadastre.result.tabs.getActiveTab().getStore()) {

            GEOR.Addons.Cadastre.result.tabs.getActiveTab().getStore().each(function(item) {

                // Si la parcelle est déja dans le store on la supprime de la liste
                // et on la change l'état de selection
                var index = parcelsIds.indexOf(item.data.parcelle);
                if (index > -1) {
                    parcelsIds.splice(index);
                    var rowIndex = GEOR.Addons.Cadastre.indexRowParcelle(item.data.parcelle);
                    if(GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().isSelected(rowIndex)){
                        GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().deselectRow(rowIndex, false);
                    }
                    else{
                        GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().selectRow(rowIndex, true);
                    }
                    
                }
            });
        }

        // all parcels could have been removed
        if (parcelsIds.length > 0) {
            // paramètres pour le getParcelle
            var params = {};
            params.parcelle = new Array();
            Ext.each(parcelsIds, function(parcelleId, currentIndex) {
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
                    if (!GEOR.Addons.Cadastre.result.plot.window || !GEOR.Addons.Cadastre.result.tabs || !GEOR.Addons.Cadastre.result.tabs.getActiveTab()) {

                        GEOR.Addons.Cadastre.addNewResultParcelle("Selection (" + parcelsIds.length + ")", GEOR.Addons.Cadastre.getResultParcelleStore(response.responseText, false));

                        GEOR.Addons.Cadastre.result.tabs.getActiveTab().on('viewready', function(view, firstRow, lastRow) {

                        });
                        // si la fenêtre est ouverte on ajoute les lignes
                    } else {
                        Ext.each(result, function(element, currentIndex) {
                            if (GEOR.Addons.Cadastre.indexRowParcelle(element.parcelle) == -1) {

                                // création de l'enregistrement
                                var newRecord = new GEOR.Addons.Cadastre.resultParcelleRecord({
                                    parcelle : element.parcelle,
                                    adresse : (element.adresse) ? element.adresse : element.dnvoiri + element.dindic + ' ' + element.cconvo + ' ' + element.dvoilib,
                                    cgocommune : element.cgocommune,
                                    ccopre : element.ccopre,
                                    ccosec : element.ccosec,
                                    dnupla : element.dnupla,
                                    dcntpa : element.dcntpa,
                                });
                                // ajout de la ligne
                                GEOR.Addons.Cadastre.result.tabs.getActiveTab().store.add(newRecord);
                                // Ajout à la selection
                                GEOR.Addons.Cadastre.getFeaturesWFSAttribute(element.parcelle);
                            }
                        });
                    }
                },
                failure : function(result) {
                    alert('ERROR-');
                }
            });
        }
    }
}

/**
 * met à jour l'état des parcelles en fonction de l'évènement sur l'onglet
 * 
 * @param: store
 * @param: typeSelector
 * 
 */
GEOR.Addons.Cadastre.changeStateParcelleOfTab = function(store, typeSelector) {

    Ext.each(store, function(element, currentIndex) {
        var id = element.data.parcelle;
        var feature = GEOR.Addons.Cadastre.getFeatureById(id);
        if (feature) {
            var index = GEOR.Addons.Cadastre.indexFeatureSelected(feature);
            GEOR.Addons.Cadastre.changeStateFeature(feature, index, typeSelector);
        }
    });
}

/**
 * en fonction des cases à cocher on ouvre la fenêtre cadastrale et/ou foncière
 * 
 * @param: id
 * @param: grid
 * 
 */
GEOR.Addons.Cadastre.openFoncierOrCadastre = function(id, grid) {

    cadastreExiste = (grid.idParcellesCOuvertes.indexOf(id) != -1)
    foncierExiste = (grid.idParcellesFOuvertes.indexOf(id) != -1)

    if (GEOR.Addons.Cadastre.isFoncier() && GEOR.Addons.Cadastre.isCadastre()) {
        if (!foncierExiste) {
            grid.detailParcelles.push(GEOR.Addons.Cadastre.onClickDisplayFIUF(id));
        }
        if (!cadastreExiste) {
            grid.detailParcelles.push(GEOR.Addons.Cadastre.displayFIUC(id));
        }
        return "2";
    } else if (GEOR.Addons.Cadastre.isCadastre()) {
        if (!cadastreExiste) {
            grid.detailParcelles.push(GEOR.Addons.Cadastre.displayFIUC(id));
        }
        return "F";
    } else if (GEOR.Addons.Cadastre.isFoncier()) {
        if (!foncierExiste) {
            grid.detailParcelles.push(GEOR.Addons.Cadastre.onClickDisplayFIUF(id));
        }
        return "C";
    }
    return "0";
}

/**
 * fermeture d'une fenêtre cadastre et foncière donnée par un id
 * 
 * @param: idParcelle
 * @param: grid
 */
GEOR.Addons.Cadastre.closeFoncierAndCadastre = function(idParcelle, grid) {

    cadastreExiste = (grid.idParcellesCOuvertes.indexOf(idParcelle) != -1)
    foncierExiste = (grid.idParcellesFOuvertes.indexOf(idParcelle) != -1)

    if (cadastreExiste) {
        GEOR.Addons.Cadastre.closeWindowFIUC(idParcelle, grid);
    }
    if (foncierExiste) {
        GEOR.Addons.Cadastre.closeWindowFIUF(idParcelle, grid);
    }
}

/**
 * Method: closeWindowFIUC
 * 
 * Ferme la fenetre de fiche cadastrale
 * 
 * @param: idParcelle
 * @param: grid
 */
GEOR.Addons.Cadastre.closeWindowFIUC = function(idParcelle, grid) {
    var index = grid.idParcellesCOuvertes.indexOf(idParcelle);
    var ficheCourante = grid.fichesCOuvertes[index];
    if (ficheCourante) {
        ficheCourante.close();
    }
}

/**
 * Method: closeWindowFIUF
 * 
 * Ferme la fenetre de fiche foncière
 * 
 * @param: idParcelle
 * @param: grid
 */
GEOR.Addons.Cadastre.closeWindowFIUF = function(idParcelle, grid) {
    var index = grid.idParcellesFOuvertes.indexOf(idParcelle);
    var ficheCourante = grid.fichesFOuvertes[index];
    if (ficheCourante) {
        ficheCourante.close();
    }
}

/**
 * Method: closeAllWindowFIUC
 * 
 * Ferme toutes les fenêtres de fiches cadastrales
 * 
 */
GEOR.Addons.Cadastre.closeAllWindowFIUC = function() {
    Ext.each(GEOR.Addons.Cadastre.result.tabs.getActiveTab().fichesCOuvertes, function(ficheCadastreOuverte, currentIndex) {
        ficheCadastreOuverte.close();
    });
    GEOR.Addons.Cadastre.result.tabs.getActiveTab().fichesCOuvertes = [];
    GEOR.Addons.Cadastre.result.tabs.getActiveTab().idParcellesCOuvertes = [];
}

/**
 * Method: closeAllWindowFIUF
 * 
 * Ferme toutes les fenêtres de fiches foncière
 * 
 */
GEOR.Addons.Cadastre.closeAllWindowFIUF = function() {
    Ext.each(GEOR.Addons.Cadastre.result.tabs.getActiveTab().fichesFOuvertes, function(fichesFOuverte, currentIndex) {
        fichesFOuverte.close();
    });
    GEOR.Addons.Cadastre.result.tabs.getActiveTab().fichesFOuvertes = [];
    GEOR.Addons.Cadastre.result.tabs.getActiveTab().idParcellesFOuvertes = [];
}

/**
 * Export selection of currentTab as CSV using webapp service
 */
GEOR.Addons.Cadastre.exportPlotSelectionAsCSV = function() {

    if (GEOR.Addons.Cadastre.result.tabs && GEOR.Addons.Cadastre.result.tabs.getActiveTab()) {
        var selection = GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().getSelections();

        if (selection && selection.length > 0) {
            var parcelleIds = [];
            Ext.each(selection, function(item) {
                parcelleIds.push(item.data.parcelle);
            });

            // PARAMS
            var params = {
                data : parcelleIds
            }
            var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'exportAsCsv?' + Ext.urlEncode(params);

            Ext.DomHelper.useDom = true;

            // Directly download file, without and call service without ogcproxy
            Ext.DomHelper.append(document.body, {
                tag : 'iframe',
                id : 'downloadIframe',
                frameBorder : 0,
                width : 0,
                height : 0,
                css : 'display:none;visibility:hidden;height:0px;',
                src : url
            });
        } else {
            Ext.Msg.alert('Status', OpenLayers.i18n('cadastrapp.result.no.selection'));
        }
    } else {
        Ext.Msg.alert('Status', OpenLayers.i18n('cadastrapp.result.no.search'));
    }
}

/**
 * Print bordereau parcellaire of selected plots
 */
GEOR.Addons.Cadastre.printSelectedBordereauParcellaire = function() {

    if (GEOR.Addons.Cadastre.result.tabs && GEOR.Addons.Cadastre.result.tabs.getActiveTab()) {
        var selection = GEOR.Addons.Cadastre.result.tabs.getActiveTab().getSelectionModel().getSelections();

        if (selection && selection.length > 0) {
            var parcelleIds = [];
            Ext.each(selection, function(item) {
                parcelleIds.push(item.data.parcelle);
            });
            
            GEOR.Addons.Cadastre.onClickPrintBordereauParcellaireWindow(parcelleIds);
        } else {
            Ext.Msg.alert('Status', OpenLayers.i18n('cadastrapp.result.no.selection'));
        }
    } else {
        Ext.Msg.alert('Status', OpenLayers.i18n('cadastrapp.result.no.search'));

    }

}
