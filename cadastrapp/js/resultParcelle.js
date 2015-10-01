Ext.namespace("GEOR.Addons.Cadastre");


/**
 *  Init Global windows containing all tabs
 */
GEOR.Addons.Cadastre.initResultParcelle = function() {
    
    // fenêtre principale
    GEOR.Addons.Cadastre.result.window = new Ext.Window({
        title: OpenLayers.i18n('cadastrapp.parcelle.result.title'),
        frame: true,
        autoScroll: true,
        minimizable: false,
        closable: true,
        resizable: true,
        draggable: true,
        constrainHeader: true,
        border: false,
        width: 580,
        boxMaxHeight : Ext.getBody().getViewSize().height - 200,
        listeners: {
            // Adding because autoheight and boxMaxHeight to not work together on tabPanel
            afterlayout: function(window){
                if (this.getHeight() > this.boxMaxHeight) {
                    this.setHeight(this.boxMaxHeight);
                }
            },
            close: function(window) {
                // *********************
                // supprime tous les entités de la couche selection
                GEOR.Addons.Cadastre.clearLayerSelection();
                // ferme les fenêtres cadastrales et foncières
                GEOR.Addons.Cadastre.closeAllWindowFIUC();
                GEOR.Addons.Cadastre.closeAllWindowFIUF();
                // *********************
                GEOR.Addons.Cadastre.result.window = null;
            },
            show: function(window) {
                // lors du changement entre onglets : deselection de toutes les
                // parcelles et selection de celles du nouvel onglet
            }
        },
        items: [ {
            xtype: 'tabpanel',
            layoutOnTabChange : true,
            items: [ {
                xtype: 'panel',
                title: '+',
                border: true,
                closable: false,
                listeners: {
                    activate: function(grid) {
                        // Add void tab
                        GEOR.Addons.Cadastre.addNewResultParcelle(OpenLayers.i18n('cadastrapp.parcelle.result.selection.title'), null, OpenLayers.i18n('cadastrapp.parcelle.result.selection.content'));
                    }
                }
            } ]
        } ],

        buttons: [ {
            text: OpenLayers.i18n('cadastrapp.result.parcelle.zoom.list'),
            listeners: {
                click: function(b, e) {
                   // zoom on plots from the active tab
                    GEOR.Addons.Cadastre.zoomOnFeatures(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures);
                }
            }
        },{
            text: OpenLayers.i18n('cadastrapp.result.parcelle.zoom.selection'),
            listeners: {
                click: function(b, e) {
                 // zoom on selected plots from the active  tab
                    GEOR.Addons.Cadastre.zoomOnFeatures(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures);
                    
                }
            }
        },{
            text: OpenLayers.i18n('cadastrapp.result.parcelle.delete'),
            listeners: {
                click: function(b, e) {
                    // remove selected plots from the active tab
                    // delete from store
                    var selection = GEOR.Addons.Cadastre.result.tabs.activeTab.getSelectionModel().getSelections();
                    
                    Ext.each(selection, function (item) {
                        
                        // remove from store
                        GEOR.Addons.Cadastre.result.tabs.activeTab.store.remove(item);
                        
                        var parcelleId =item.data.parcelle;
                        var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);

                        // Close open windows
                        GEOR.Addons.Cadastre.closeFoncierAndCadastre(parcelleId, GEOR.Addons.Cadastre.result.tabs.activeTab);
                                               
                        // Remove feature
                        if (feature) {
                            var index = GEOR.Addons.Cadastre.indexFeatureSelected(feature);
                            GEOR.Addons.Cadastre.changeStateFeature(feature, index, "reset");
                        }
                     });
                }
            }
        } ,{
            text: OpenLayers.i18n('cadastrapp.result.parcelle.fiche'),
            listeners: {
                click: function(b, e) {
                    
                    var selection = GEOR.Addons.Cadastre.result.tabs.activeTab.getSelectionModel().getSelections();
                    
                    Ext.each(selection, function (item) {
                        var parcelleId =item.data.parcelle;
                        var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                        var state = GEOR.Addons.Cadastre.selection.state1;
                        
                        // Si la fenêtre details cadastre ou foncier est déjà ouverte
                        if(GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesCOuvertes.indexOf(parcelleId) != -1
                            || GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesFOuvertes.indexOf(parcelleId) != -1){
                            GEOR.Addons.Cadastre.closeFoncierAndCadastre(parcelleId, grid);
                        }
                        else{
                            GEOR.Addons.Cadastre.openFoncierOrCadastre(parcelleId, GEOR.Addons.Cadastre.result.tabs.activeTab);
                            state = GEOR.Addons.Cadastre.selection.state2;
                        }
                        
                        // change selection color on map depending on state
                        if (feature) {
                            var index = GEOR.Addons.Cadastre.indexFeatureSelected(feature);
                            GEOR.Addons.Cadastre.changeStateFeature(feature, index , GEOR.Addons.Cadastre.result.tabs.activeTab);
                        }
                     });
                }
            }
        },{
            text: OpenLayers.i18n('cadastrapp.result.parcelle.export'),
            listeners: {
                click: function(b, e) {
                 // Export selected plots as csv
                    
                }
            }
        },{
            text: OpenLayers.i18n('cadastrapp.close'),
            listeners: {
                click: function(b, e) {
                    // Close all tab and open windows
                    GEOR.Addons.Cadastre.result.window.close();
                }
            }
        } ]
    });
};

/**
 * Result parcelle grid
 * For each tab, contains gridPanel with value + list of selection and open windows
 */
GEOR.Addons.Cadastre.resultParcelleGrid = Ext.extend(Ext.grid.GridPanel, {
     detailParcelles : new Array(),
     fichesCOuvertes : new Array(),
     idParcellesCOuvertes : new Array(),
     fichesFOuvertes : new Array(),
     idParcellesFOuvertes : new Array(),
     selectedFeatures : new Array(),
     selectionFeatures : new Array()
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
 *  public: method[addNewResult] 
 *  
 *  Call the initWindows method if windows do not exist then fill one tab with given information or message
 *  
 * @param: title tab title
 * @param: result to be store in a grid
 * @param: message to replace data if not exist
 */
GEOR.Addons.Cadastre.addNewResult = function(title, result, message) {

    // If windows do not exist
    if (GEOR.Addons.Cadastre.result.window == null) {
        GEOR.Addons.Cadastre.initResultParcelle();
    }
    
    // Get tab list
    GEOR.Addons.Cadastre.result.tabs = GEOR.Addons.Cadastre.result.window.items.items[0];
   
    // **********
    // Listener
    GEOR.Addons.Cadastre.result.tabs.addListener('beforetabchange', function(tab, newTab, currentTab) {
        var store;
        if (currentTab) { // cad la table de resultats est ouverte et on navigue entre les
            // onglets, sinon toute selection en bleue sur la carte va redevenir jaune
            if (currentTab.store) {
                store = currentTab.store.data.items;
                // deselection des parcelles
                GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, "tmp"); 
            }

            if (newTab) {
                if (newTab.store) {
                    store = newTab.store.data.items;
                    // selection en jaune
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, GEOR.Addons.Cadastre.selection.state1); 
                    var selectedRows = newTab.getSelectionModel().selections.items;
                    // selection en bleue
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(selectedRows, GEOR.Addons.Cadastre.selection.state2); 
                }
            }
        }
    });
    // **********

    var currentTabGrid = new GEOR.Addons.Cadastre.resultParcelleGrid({
        title : title,
        id : 'resultParcelleWindowTab' +  GEOR.Addons.Cadastre.result.tabs.items.length,
        border : true,
        closable : true,
        store : (result != null) ? result : new Ext.data.Store(),
        colModel : GEOR.Addons.Cadastre.getResultParcelleColModel(),
        autoHeight : true,
        sm: new Ext.grid.RowSelectionModel({multiSelect:true}),
        viewConfig : {
            deferEmptyText : false,
            emptyText : message
        },
        listeners : {
            close : function(grid) {
                // on ferme toutes les fenetres filles : detail parcelle
                Ext.each(grid.detailParcelles, function(element, currentIndex)
                {
                    if(element){
                        element.close()
                    }
                });
                 
                // on ferme la fenetre si c'est le dernier onglet
                if (GEOR.Addons.Cadastre.result.tabs.items.length == 2) {
                    // si il ne reste que cet onglet et l'onglet '+', fermer la fenetre
                    GEOR.Addons.Cadastre.result.window.close();
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

    // lors d'une recherche de parcelle on envoie une requête attributtaire
    // pour selectionner les parcelles
    Ext.each(currentTabGrid.getStore(), function(element, currentIndex){
        GEOR.Addons.Cadastre.getFeaturesWFSAttribute(element.data.parcelle);
    });

    GEOR.Addons.Cadastre.result.tabs.insert(0,  currentTabGrid);
    GEOR.Addons.Cadastre.result.tabs.setActiveTab(0);
    GEOR.Addons.Cadastre.result.window.show();
}


/**
 * public: method[addNewDataResultParcelle] 
 * 
 * Add result for webservice to resultParcelle Panel and to selected feature list
 * 
 * @param result - Json result from ajax request
 */
GEOR.Addons.Cadastre.addNewDataResultParcelle = function(result) {
    Ext.each(result, function(element, index) {
        if (GEOR.Addons.Cadastre.indexRowParcelle(element.parcelle) == -1) {
           
            var newRecord = new TopicRecord({
                parcelle: element.parcelle,
                adresse: (element.adresse) ? element.adresse : element.dnvoiri + element.dindic +' '+element.cconvo  +' ' + element.dvoilib,
                cgocommune: element.cgocommune,
                ccopre: element.ccopre,
                ccosec: element.ccosec,
                dnupla: element.dnupla,   
                dcntpa: element.dcntpa
            });
            // ajout de la ligne
            GEOR.Addons.Cadastre.result.tabs.activeTab.store.add(newRecord);
           
            // Ajout de la parcelle à la liste de feature sélectionner pour le zoom et la sélection en jaune
            GEOR.Addons.Cadastre.getFeaturesWFSAttribute(element.parcelle);
        }
    });
}

/** 
 * met à jour l'état des parcelles en fonction de l'évènement sur l'onglet
 * 
 * @param: store
 * @param: typeSelector
 * 
 */
GEOR.Addons.Cadastre.changeStateParcelleOfTab = function(store, typeSelector) {
   
    Ext.each(store, function(element, currentIndex){
        var id = element.data.parcelle;
        var feature = GEOR.Addons.Cadastre.getFeatureById(id);
        if (feature) {
            var index = GEOR.Addons.Cadastre.indexFeatureSelected(feature);
            GEOR.Addons.Cadastre.changeStateFeature(feature, index, typeSelector);
        }
    });
}

/** en fonction des cases à cocher on ouvre la fenêtre cadastrale et/ou
 * foncière
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

