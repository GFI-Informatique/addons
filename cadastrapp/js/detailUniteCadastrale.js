Ext.namespace("GEOR.Addons.Cadastre");

/**
 * public: method[displayFIUC] 
 * 
 * @param parcelleId Identifiant de parcelle ex :20148301032610C0012
 * 
 * Création d'une fenêtre de détails présentant les informations cadastrale à parti d'un id de parcelle
 * 
 * Cette fenêtre comprend 5 onglets :
 *          Parcelle
 *          Propriétaire -> uniqument visible si droit CNIL1 et CNIL2
 *          Batiment -> uniqument visible si droit CNIL2
 *          Subdivision fiscale -> uniqument visible si droit CNIL2
 *          Historique de mutation
 *          
 * Chaque onglet cherche ses données dans la webapp via utilisation de la méthode getFIC
 * 
 *  Il est possible de lancer la création en format pdf, le bordereau parcellaire par l'onglet
 * parcelle ou proriétaire, et le relevé de propriété par l'onglet batiment
 * 
 * 
 * Description le résultat: La fiche d'information cadastrale est affichée
 */
GEOR.Addons.Cadastre.displayFIUC = function(parcelleId) {

    // TabPanel to be include in main windwos panel
    var cadastreTabPanel = new Ext.TabPanel({
        items : [],
    });

    // Construction de la fenêtre principale
    var windowFIUC = new Ext.Window({
        title : parcelleId,
        frame : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        width : 825,
        items : cadastreTabPanel,
        listeners : {
            close : function(window) {
                // deselection de la ligne
                var rowIndex = GEOR.Addons.Cadastre.indexRowParcelle(parcelleId);
                GEOR.Addons.Cadastre.result.tabs.activeTab.getSelectionModel().deselectRow(rowIndex);

                // mise à jour des tableau de fenêtres ouvertes
                var index = GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesCOuvertes.indexOf(parcelleId);
                GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesCOuvertes.splice(index, 1);
                GEOR.Addons.Cadastre.result.tabs.activeTab.fichesCOuvertes.splice(index, 1);
                var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                if (feature) {
                    GEOR.Addons.Cadastre.changeStateFeature(feature, -1, GEOR.Addons.Cadastre.selection.state.list);
                }

                // on ferme la fenêtre foncière si ouverte
                GEOR.Addons.Cadastre.closeWindowFIUF(parcelleId, GEOR.Addons.Cadastre.result.tabs.activeTab);
                windowFIUC = null;
            }
        },

    });

    // Declaration des data pour le modèle de données pour l'onglet Parcelle
    var fiucParcelleData = [];

    // ---------- ONGLET Parcelle ------------------------------

    // Déclaration du modèle de données pour l'onglet Parcelle.
    var fiucParcelleStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'designation'
        }, {
            name : 'valeur'
        }, ],
        data : fiucParcelleData
    });

    // Requete Ajax pour aller chercher dans la webapp les données relatives à
    // la parcelle
    // Les informations affichées sont
    Ext.Ajax.request({
        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=0",
        method : 'GET',
        success : function(response) {
            var result = Ext.decode(response.responseText);
            // Remplissage du tableau de données
            // TODO: remplacer les libellés par les i18n correspondants
            fiucParcelleData = [ [ 'Commune', result[0].cgocommune ], [ 'Section', result[0].ccopre + result[0].ccosec ], [ 'Parcelle', result[0].dnupla ], [ 'Voie (Code fantoir)', result[0].dnvoiri + result[0].dindic ], [ 'Adresse', result[0].cconvo + result[0].dvoilib ], [ 'Contenance DGFiP en m²', result[0].dcntpa.toLocaleString() ],
                    [ 'Contenance calculée en m²', result[0].surfc.toLocaleString() ], [ 'Parcelle bâtie', result[0].gparbat ], [ 'Secteur urbain', result[0].gurbpa ] ];

            // Chargement des données
            fiucParcelleStore.loadData(fiucParcelleData);
            cadastreTabPanel.activate(0);
        }
    });

    // La variable FiucParcelleGrid est consititué d'un objet grid.GridPanel
    // Elle constitue de tableau de données à afficher pour l'onglet parcelle
    var fiucParcelleGrid = new Ext.grid.GridPanel({
        store : fiucParcelleStore,
        stateful : true,
        name : 'Fiuc_Parcelle',
        xtype : 'editorgrid',
        autoHeight : true,
        columns : [ {
            header : "Description",
            dataIndex : 'designation',
            width : 150
        }, {
            header : "Valeur",
            dataIndex : 'valeur',
            width : 300
        } ],
        // inline toolbars
        tbar : new Ext.Toolbar({
            items : [ {
                xtype : 'button',
                width : 30,
                iconCls : 'small-pdf-button',
                handler : function() {
                    GEOR.Addons.Cadastre.onClickPrintBordereauParcellaireWindow(parcelleId);
                }
            }, {
                text : OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'),
                handler : function() {
                    GEOR.Addons.Cadastre.onClickPrintBordereauParcellaireWindow(parcelleId);
                }
            } ]
        })
    });

    cadastreTabPanel.add({
        // ONGLET 1: Parcelle
        title : OpenLayers.i18n('cadastrapp.duc.parcelle'),
        xtype : 'form',
        items : [ fiucParcelleGrid ],
        layout : 'fit'
    });
    // ---------- FIN ONGLET Parcelle ------------------------------

    // ---------- ONGLET Propriétaire ------------------------------
    //Seulement pour Cnil1 et Cnil2 
    if (GEOR.Addons.Cadastre.isCNIL1() || GEOR.Addons.Cadastre.isCNIL2()) {

        // Déclaration du modèle de données pour l'onglet Propriétaire.
        // réalise l'appel à la webapp
        var fiucProprietaireStore = new Ext.data.JsonStore({

            // Appel à la webapp
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=1",
            autoLoad : true,

            // Champs constituant l'onglet propriétaire
            fields : [ 'comptecommunal', 'ccodro', 'dnupro', 'dnomlp', 'dprnlp', 'epxnee', 'dnomcp', 'dprncp', {
                // Le champ adress est l'addition des champs dlign3,dlign4,dlign5, dlign6
                name : 'adress',
                convert : function(v, rec) {
                    return rec.dlign3 + rec.dlign4 + rec.dlign5 + rec.dlign6
                }
            }, 'jdatnss', 'dldnss', 'ccodro_lib' ],
        });

        // Déclaration de la bottom bar (25 propiétaires par page)
        var bbar = new Ext.PagingToolbar({
            pageSize : 25,
            store : fiucProprietaireStore,
            displayInfo : true,
            displayMsg : 'Affichage {0} - {1} of {2}',
            emptyMsg : "Pas de propriétaire a afficher",
        });

        var fiucProprietairesSM = new Ext.grid.CheckboxSelectionModel();
        
        // Déclaration du tableau de propriétaires
        var fiucProprietairesGrid = new Ext.grid.GridPanel({
            store : fiucProprietaireStore,
            stateful : true,
            name : 'Fiuc_Proprietaire',
            xtype : 'editorgrid',
            bbar : bbar,
            autoExpandMax : 825,
            height : 300,
            sm : fiucProprietairesSM,
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    border : true,
                    sortable : true,
                },
                columns : [ fiucProprietairesSM, {
                    header : 'Compte communal',
                    dataIndex : 'comptecommunal',
                    width : 100,
                    hidden : true
                }, {
                    header : OpenLayers.i18n('cadastrapp.proprietaires.ccodro'),
                    dataIndex : 'ccodro',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.compte'),
                    dataIndex : 'dnupro',
                    width : 50
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nom'),
                    dataIndex : 'dnomlp',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                    dataIndex : 'dprnlp',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.mentioncpl'),
                    dataIndex : 'epxnee',
                    width : 75
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nomcpl'),
                    dataIndex : 'dnomcp',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenomcpl'),
                    dataIndex : 'dprncp',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.adresse'),
                    dataIndex : 'adress',
                    width : 200
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.datenaissance'),
                    dataIndex : 'jdatnss',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.lieunaissance'),
                    dataIndex : 'dldnss',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.cco_lib'),
                    dataIndex : 'ccodro_lib',
                    width : 100
                } ]
            }),
            // inline toolbars
            tbar : [ {
                iconCls : 'small-pdf-button',
                handler : function() {
                    var selectedRecordsArray = fiucProprietairesGrid.getSelectionModel().getSelections();
                    
                    // check if at least one row is check
                    if (selectedRecordsArray.length > 0 && selectedRecordsArray.length < GEOR.Addons.Cadastre.relevePropriete.maxProprietaire) {
                        var comptecommunaux = []
                        Ext.each(selectedRecordsArray, function(selection, index){
                            // only add comptecommunal if not in the list
                            if(comptecommunaux.indexOf(selection.data.comptecommunal) == -1){
                                comptecommunaux.push(selection.data.comptecommunal);
                            }
                        })
                        GEOR.Addons.Cadastre.onClickPrintRelevePropriete(comptecommunaux);
                    } else if (selectedRecordsArray.length >= GEOR.Addons.Cadastre.relevePropriete.maxProprietaire){
                        Ext.Msg.alert('Vous ne pouvez pas sélectionner plus de '+ GEOR.Addons.Cadastre.relevePropriete.maxProprietaire +' proprietaires');
                        // TODO see if we remove selection
                    }else {
                        Ext.Msg.alert('Vous devez d\'abord sélectionner au moins un proprietaire');
                    }
                }
            }, {
                text : OpenLayers.i18n('cadastrapp.duc.releve.depropriete'), handler : function() {
                    var selectedRecordsArray = fiucProprietairesGrid.getSelectionModel().getSelections();
                    
                    // check if at least one row is check
                    if (selectedRecordsArray.length > 0 && selectedRecordsArray.length < GEOR.Addons.Cadastre.relevePropriete.maxProprietaire) {
                        var comptecommunaux = []
                        Ext.each(selectedRecordsArray, function(selection, index){
                            // only add comptecommunal if not in the list
                            if(comptecommunaux.indexOf(selection.data.comptecommunal) == -1){
                                comptecommunaux.push(selection.data.comptecommunal);
                            }
                        })
                        GEOR.Addons.Cadastre.onClickPrintRelevePropriete(comptecommunaux);
                    } else if (selectedRecordsArray.length >= GEOR.Addons.Cadastre.relevePropriete.maxProprietaire){
                        Ext.Msg.alert('Vous ne pouvez pas sélectionner plus de '+ GEOR.Addons.Cadastre.relevePropriete.maxProprietaire +' proprietaires');
                        // TODO see if we remove selection
                    }else {
                        Ext.Msg.alert('Vous devez d\'abord sélectionner au moins un proprietaire');
                    }
                }
            } ]
        });

        cadastreTabPanel.add({
            // ONGLET 2: Propriétaire
            title : OpenLayers.i18n('cadastrapp.duc.propietaire'),
            xtype : 'form',
            items : [ fiucProprietairesGrid ],
            layout : 'fit'
        });

        // ---------- FIN ONGLET Propriétaire ------------------------------
    }

    // ---------- ONGLET Batiment ------------------------------
    if (GEOR.Addons.Cadastre.isCNIL2()) {

        // Ext.Buttons Arrays to be fill when service returns values
        var buttonToolBar = new Ext.Toolbar({
            xtype : 'buttongroup',
            items : [ {
                text : 'Batiment(s) : '
            } ]
        });

        // Workaround toogleGroup not working
        var buttonList = [];

        // Modèle de donnée pour l'onglet batiment
        var fiucBatimentsStore = new Ext.data.JsonStore({
            proxy : new Ext.data.HttpProxy({
                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getBatiments',
                autoLoad : false,
                method : 'GET'
            }),
            fields : [ 'comptecommunal', 'dniv', 'dpor', 'ccoaff_lib', 'annee', 'dnupro', 'ddenom', 'dnomlp', 'dprnlp', 'epxnee', 'dnomcp', 'dprncp', 'invar' ]
        });

        // Récupère la liste des batiments de la parcelle
        Ext.Ajax.request({
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=2",
            method : 'GET',
            success : function(response) {
                var result = Ext.decode(response.responseText);

                Ext.each(result, function(element, index) {

                    if (element.dnubat != undefined && element.dnubat != null && element.dnubat.length > 0) {

                        var buttonBatiment = new Ext.Button({
                            id : element.dnubat,
                            text : element.dnubat,
                            margins : '0 10 0 10',
                            toogleGroup : 'batButToggleGroup',
                            enableToggle : true,
                            toggleHandler : function(btn, pressed) {
                                console.log('toggle', btn.text, pressed);
                                if (pressed) {
                                    fiucBatimentsStore.load({
                                        params : {
                                            'dnubat' : btn.text,
                                            'parcelle' : parcelleId
                                        }
                                    });
                                    console.log('Pressed');
                                }
                                // Workaround toogleGroup not working
                                Ext.each(buttonList, function(button, index) {
                                    if (button && button.text != btn.text) {
                                        button.toggle(false, true);
                                        console.log(button.text + ' Toggle false');
                                    }
                                });
                            }

                        });

                        // load first batiment information
                        if (index == 0) {
                            buttonBatiment.toggle();
                        }
                        buttonList.push(buttonBatiment);
                    } else {
                        console.log("Pas de batiments sur la parcelle");
                    }
                });
                buttonToolBar.add(buttonList);
                buttonToolBar.doLayout();
            }
        });

        // Déclaration du tableau

        var fiucBatimentsGrid = new Ext.grid.GridPanel({
            store : fiucBatimentsStore,
            stateful : true,
            name : 'Fiuc_Batiments',
            xtype : 'gridview',
            autoExpandMax : 825,
            height : 280,
            autoScroll : true,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true
            }),
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    sortable : true,
                },
                columns : [ {
                    header : 'Compte communal',
                    dataIndex : 'comptecommunal',
                    width : 100,
                    hidden : true
                },{
                    header : OpenLayers.i18n('cadastrapp.duc.batiment_niveau'),
                    dataIndex : 'dniv',
                    width : 40
                }, {
                    header : "Porte",
                    dataIndex : 'dpor',
                    width : 40
                }, {
                    header : "Type",
                    dataIndex : 'ccoaff_lib',
                    width : 70
                }, {
                    header : "Date",
                    dataIndex : 'annee',
                    width : 40
                }, {
                    header : "Revenu",
                    dataIndex : 'dvlrt',
                    width : 60
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.compte'),
                    dataIndex : 'dnupro',
                    width : 60
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.denomination'),
                    dataIndex : 'ddenom',
                    width : 200
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nom'),
                    dataIndex : 'dnomlp',
                    width : 200
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                    dataIndex : 'dprnlp',
                    width : 150
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.mentioncpl'),
                    dataIndex : 'epxnee',
                    width : 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nomcpl'),
                    dataIndex : 'dnomcp',
                    width : 200
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenomcpl'),
                    dataIndex : 'dprncp',
                    width : 150
                }, {
                    header : 'Invar',
                    dataIndex : 'invar',
                    width : 150
                } ]
            }),
            // inline toolbars
            tbar : [ {
                iconCls : 'small-pdf-button',
                handler : function() {
                    var selectedRecordsArray = fiucBatimentsGrid.getSelectionModel().getSelected();
                    
                    if (selectedRecordsArray){
                        GEOR.Addons.Cadastre.onClickPrintRelevePropriete(selectedRecordsArray.data.comptecommunal);
                    }else {
                        Ext.Msg.alert('Vous devez d\'abord sélectionner un propriétaire');
                }
            }}, {
                text : OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
                handler : function() {
                    var selectedRecordsArray = fiucBatimentsGrid.getSelectionModel().getSelected();
                    
                    if (selectedRecordsArray){
                        GEOR.Addons.Cadastre.onClickPrintRelevePropriete(selectedRecordsArray.data.comptecommunal);
                    }else {
                        Ext.Msg.alert('Vous devez d\'abord sélectionner un propriétaire');
                }
                }
            }, {
                iconCls : 'house-button',
                handler : function() {
                    var selectedRecordsArray = fiucBatimentsGrid.getSelectionModel().getSelected();

                    if (selectedRecordsArray) {
                        GEOR.Addons.Cadastre.showHabitationDetails('A', selectedRecordsArray.data.dniv, selectedRecordsArray.data.dpor, selectedRecordsArray.data.annee, selectedRecordsArray.data.invar);
                    } else {
                        Ext.Msg.alert('Vous devez d\'abord sélectionner un batiment');
                    }
                }
            }, {
                text : OpenLayers.i18n('cadastrapp.duc.batiment_descriptif'),
                handler : function() {
                    selectedRecordsArray = fiucBatimentsGrid.getSelectionModel().getSelected();

                    if (selectedRecordsArray) {
                        GEOR.Addons.Cadastre.showHabitationDetails('A', selectedRecordsArray.data.dniv, selectedRecordsArray.data.dpor, selectedRecordsArray.data.annee, selectedRecordsArray.data.invar);
                    } else {
                        Ext.Msg.alert('Vous devez d\'abord sélectionner un batiment');
                    }
                }
            } ]
        });

        cadastreTabPanel.add({
            // ONGLET 3: Batiment
            title : OpenLayers.i18n('cadastrapp.duc.batiment'),
            xtype : 'form',
            items : [ buttonToolBar, fiucBatimentsGrid ]
        });

        // ---------- FIN ONGLET Batiment ------------------------------

        // ---------- ONGLET Subdivision fiscale ------------------------------
        //
        // Modèle de données pour l'onglet subdivision fiscale
        var fiucSubdivfiscStore = new Ext.data.JsonStore({
            autoLoad : true,
            // Appel à la webapp
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=3",
            method : 'GET',
            fields : [ 'ccosub', {
                name : 'contenance',
                convert : function(v, rec) {
                    return rec.dcntsf
                }
            }, 'cgrnum_lib', 'drcsub' ],
        });

        // Déclaration du tableau pour l'onglet subdivision fiscale
        var fiucSubdivfiscGrid = new Ext.grid.GridPanel({
            store : fiucSubdivfiscStore,
            stateful : true,
            title : 'Subdivisions fiscales',
            name : 'Fiuc_Subdivisions_fiscales',
            xtype : 'editorgrid',
            autoHeight : true,
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    border : true,
                    sortable : true,
                },
                columns : [ {
                    header : "Lettre indicative",
                    dataIndex : 'ccosub'
                }, {
                    header : "Contenance",
                    dataIndex : 'contenance'
                }, {
                    header : "Nature de culture",
                    dataIndex : 'cgrnum_lib'
                }, {
                    header : "Revenu au 01/01",
                    dataIndex : 'drcsub'
                }, ]
            }),

        });

        cadastreTabPanel.add({
            // ONGLET 4: Subivision fiscale
            title : OpenLayers.i18n('cadastrapp.duc.subdiv'),
            xtype : 'form',
            items : [ fiucSubdivfiscGrid ],
            layout : 'fit'
        });

        // ---------- FIN ONGLET Subdivision fiscale ------------------------------

        // ---------- ONGLET historique de mutation ------------------------------

        // Modèle de données de l'onglet historique de mutation
        var fiucHistomutStore = new Ext.data.ArrayStore({
            autoLoad : true,
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=4",
            method : 'GET',
            fields : [ {
                name : 'date',
                convert : function(v, rec) {
                    return rec.jdatat
                }
            }, {
                name : 'referenceparcelle',
                convert : function(v, rec) {
                    reference = '';
                    if (rec.ccocomm != undefined) {
                        reference = reference + ' ' + rec.ccocomm;
                    }
                    if (rec.ccoprem != undefined) {
                        reference = reference + ' ' + rec.ccoprem;
                    }
                    if (rec.ccosecm != undefined) {
                        reference = reference + ' ' + rec.ccosecm;
                    }
                    if (rec.dnuplam != undefined) {
                        reference = reference + ' ' + rec.dnuplam;
                    }
                    return reference;
                }
            }, {
                name : 'filiation',
                convert : function(v, rec) {
                    return rec.type_filiation
                }
            } ]
        });

        // Tableau des données de l'historique de mutation
        var fiucHistomutGrid = new Ext.grid.GridPanel({
            store : fiucHistomutStore,
            stateful : true,
            name : 'Fiuc_Historique_Mutation',
            xtype : 'editorgrid',
            autoHeight : true,
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    sortable : true,
                },
                columns : [ {
                    header : OpenLayers.i18n('cadastrapp.duc.dateacte'),
                    dataIndex : 'date',
                    width : 75
                }, {
                    header : "Référence de la parcelle mère",
                    dataIndex : 'referenceparcelle',
                    width : 170
                }, {
                    header : "Type de mutation",
                    dataIndex : 'filiation',
                    width : 100
                } ]
            }),

        });

        cadastreTabPanel.add({
            // ONGLET 5: Historique de mutation
            title : OpenLayers.i18n('cadastrapp.duc.histomut'),
            xtype : 'form',
            items : [ fiucHistomutGrid ],
            layout : 'fit'
        });
    }

    // add windows in manager and show it
    GEOR.Addons.Cadastre.result.tabs.activeTab.fichesCOuvertes.push(windowFIUC);
    GEOR.Addons.Cadastre.result.tabs.activeTab.idParcellesCOuvertes.push(parcelleId);
    windowFIUC.show();

}

/**
 *  return checked rows on proprietaie grid
 *  
 */
function getSelectedProprietaire() {
    var proprietaireSelected = grid.getSelectionModel().getSelections();
    console.log(proprietaireSelected);
}

// 
/**
 * return checked rows on batiment grid
 */
function getSelectedBatiment() {
    var batimentSelected = grid.getSelectionModel().getSelections();
    console.log(proprietaireSelected);

}
