Ext.namespace("GEOR.Addons.Cadastre");

/**
 * 
 */
GEOR.Addons.Cadastre.ResultParcelleGrid = Ext.extend(Ext.grid.GridPanel, {
    detailParcelles : new Array(),
    fichesCOuvertes : new Array(),
    idParcellesCOuvertes : new Array(),
    fichesFOuvertes : new Array(),
    idParcellesFOuvertes : new Array(),
});

var resultParcelleWindow;

/**
 * public: method[onClickRechercheProprietaire] :param layer: Create ...TODO
 * 
 * @param: title
 * @param: result
 */
GEOR.Addons.Cadastre.addNewResultParcelle = function(title, result) {
    GEOR.Addons.Cadastre.addNewResult(title, result, OpenLayers.i18n('cadastrapp.parcelle.result.nodata'));
}

/**
 * 
 */
GEOR.Addons.Cadastre.addVoidResultParcelle = function() {
    GEOR.Addons.Cadastre.addNewResult(OpenLayers.i18n('cadastrapp.parcelle.result.selection.title'), null, OpenLayers.i18n('cadastrapp.parcelle.result.selection.content'));
}

/**
 * @param: title
 * @param: result
 * @param: message
 */
GEOR.Addons.Cadastre.addNewResult = function(title, result, message) {
    if (resultParcelleWindow == null) {
        GEOR.Addons.Cadastre.initResultParcelle();
    }

    resultParcelleWindow.show();
    tabs = resultParcelleWindow.items.items[0];
    // **********
    // lors du changement des onglets
    tabs.addListener('beforetabchange', function(tab, newTab, currentTab) {
        var store;
        if (currentTab) { // cad la table de resultats est
            // ouverte et on navigue entre les
            // onglets, sinon toute selection en
            // bleue sur la carte va redevenir
            // jaune
            if (currentTab.store) {
                store = currentTab.store.data.items;
                GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, "tmp"); // deselection
                // des
                // parcelles
            }

            if (newTab) {
                if (newTab.store) {
                    store = newTab.store.data.items;
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, "yellow"); // selection
                    // en
                    // jaune
                    var selectedRows = newTab.getSelectionModel().selections.items;
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(selectedRows, "blue"); // selection
                    // en bleue
                }
            }
        }
    });

    // **********
    var tabCounter = 1;
    tabCounter = tabCounter + 1;

    newGrid = new GEOR.Addons.Cadastre.ResultParcelleGrid({
        title : title,
        id : 'resultParcelleWindowTab' + tabCounter,
        height : 300,
        border : true,
        closable : true,

        store : (result != null) ? result : new Ext.data.Store(),

        colModel : GEOR.Addons.Cadastre.getResultParcelleColModel(),
        multiSelect : true,
        viewConfig : {
            deferEmptyText : false,
            emptyText : message
        },

        listeners : {
            close : function(grid) {
                // on ferme toutes les fenetres filles : detail parcelle
                for (var index = 0; index < grid.detailParcelles.length; index++) {
                    if (grid.detailParcelles[index] != undefined) {
                        grid.detailParcelles[index].close();
                    }
                }
                // on ferme la fenetre si c'est le dernier onglet
                if (tabs.items.length == 2) {
                    // si il ne reste que cet onglet et l'onglet '+',
                    // fermer la fenetre
                    resultParcelleWindow.close();
                } else {
                    // on selectionne manuellement le nouvel onglet à
                    // activer, pour eviter de tomber sur le '+' (qui va
                    // tenter de refaire un onglet et ça va faire
                    // nimporte quoi)
                    var index = tabs.items.findIndex('id', grid.id);
                    tabs.setActiveTab((index == 0) ? 1 : (index - 1));
                    // *************
                    // quand on ferme l'onglet on vire toutes les
                    // parcelles dependantes
                    store = grid.store.data.items;
                    GEOR.Addons.Cadastre.changeStateParcelleOfTab(store, "reset");
                    // *************
                }

            },
        }

    });
    newGrid.addListener("rowclick", function(grid, rowIndex, e) {
        // on parcourant le tableau de façon générique on gérera les cas de
        // selection/deselection simple/multiple pour tout les cliques sue les
        // lignes
        var selection = grid.getSelectionModel();
        var id, index, feature;
        // on parcour toutes les lignes
        for (var i = 0; i < grid.store.getCount(); i++) {
            id = grid.store.getAt(i).data.parcelle;
            feature = GEOR.Addons.Cadastre.getFeatureById(id);
            if (selection.isSelected(i)) { // si ligne selectionnée
                GEOR.Addons.Cadastre.openFoncierOrCadastre(id, grid);
                if (feature) {
                    GEOR.Addons.Cadastre.changeStateFeature(feature, -1, "blue");
                }
            } else {
                GEOR.Addons.Cadastre.closeFoncierAndCadastre(id, grid);
                if (feature) {
                    GEOR.Addons.Cadastre.changeStateFeature(feature, -1, "yellow");
                }

            }

        }

    });

    // lors d'une recherche de parcelle on envoie une requête attributtaire
    // pour selectionner les parcelle
    var parcelle;
    for (var i = 0; i < newGrid.getStore().totalLength; i++) {
        parcelle = newGrid.getStore().getAt(i);
        GEOR.Addons.Cadastre.getFeaturesWFSAttribute(parcelle.data.parcelle);
    }

    tabs.insert(0, newGrid);
    tabs.setActiveTab(0);
}

/** 
 * met à jour l'état des parcelles en fonction de l'évènement sur l'onglet
 * 
 * @param: store
 * @param: typeSelector
 * 
 */
GEOR.Addons.Cadastre.changeStateParcelleOfTab = function(store, typeSelector) {
    var id, index, feature;
    for (var i = 0; i < store.length; i++) { // selection
        id = store[i].data.parcelle;
        feature = getFeatureById(id);
        if (feature) {
            index = GEOR.Addons.Cadastre.indexFeatureSelected(feature);
            GEOR.Addons.Cadastre.changeStateFeature(feature, index, typeSelector);
        }
    }

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
            grid.detailParcelles.push(GEOR.Addons.Cadastre.onClickDisplayFIUC(id));
        }
        return "2";
    } else if (GEOR.Addons.Cadastre.isCadastre()) {
        if (!cadastreExiste) {
            grid.detailParcelles.push(GEOR.Addons.Cadastre.onClickDisplayFIUC(id));
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
 * 
 */
GEOR.Addons.Cadastre.initResultParcelle = function() {
    // fenêtre principale
    resultParcelleWindow = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.parcelle.result.title'),
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,

        border : false,
        width : 600,
        defaults : {
            autoHeight : true
        },

        listeners : {
            close : function(window) {

                // *********************
                // supprime tous les entités de la couche selection
                GEOR.Addons.Cadastre.clearLayerSelection();
                // ferme les fenêtres cadastrales et foncières
                GEOR.Addons.Cadastre.closeAllWindowFIUC();
                GEOR.Addons.Cadastre.closeAllWindowFIUF();
                // *********************
                resultParcelleWindow = null;
            },
            show : function(window) {
                // lors du changement entre onglets : deselection de toutes les
                // parcelles et selection de celles du nouvel onglet
            }
        },

        items : [ {
            xtype : 'tabpanel',

            items : [ {
                xtype : 'panel',
                title : '+',
                border : true,
                closable : false,

                listeners : {
                    activate : function(grid) {
                        GEOR.Addons.Cadastre.addVoidResultParcelle();
                    }
                }
            } ]
        } ],

        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.close'),
            listeners : {
                click : function(b, e) {
                    resultParcelleWindow.close();
                }
            }
        } ]
    });
};