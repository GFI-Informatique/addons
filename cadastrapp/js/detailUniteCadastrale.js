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

    // Titre de la fiche d'information cadastrale
    var titleFIUC = parcelleId;
    
    // TabPanel to be include in main windwos panel
    var cadastreTabPanel = new Ext.TabPanel({
        width : 800,
        height : 275,
        items:[]
    });
    
    // Construction de la fenêtre principale
    var windowFIUC = new Ext.Window({
        title : titleFIUC,
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        labelWidth : 400,
        width : 850,
        autoHeight : true,
        defaults : {
            bodyStyle : 'padding:10px',
            flex : 1
        },

        listeners : {
            close : function(window) {
                // deselection de la ligne
                var rowIndex = GEOR.Addons.Cadastre.indexRowParcelle(parcelleId);
                GEOR.Addons.Cadastre.newGrid.getSelectionModel().deselectRow(rowIndex);

                // mise à jour des tableau de fenêtres ouvertes
                var index = GEOR.Addons.Cadastre.newGrid.idParcellesCOuvertes.indexOf(parcelleId);
                GEOR.Addons.Cadastre.newGrid.idParcellesCOuvertes.splice(index, 1);
                GEOR.Addons.Cadastre.newGrid.fichesCOuvertes.splice(index, 1);
                var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                if (feature){
                    GEOR.Addons.Cadastre.changeStateFeature(feature, -1, "yellow");
                }

                // on ferme la fenêtre foncière si ouverte
                GEOR.Addons.Cadastre.closeWindowFIUF(parcelleId, GEOR.Addons.Cadastre.newGrid);
                windowFIUC = null;
            }
        },
        items : cadastreTabPanel
    });


    // Declaration des data pour le modèle de données pour l'onglet Parcelle
    var FiucParcelleData = [];

    // ---------- ONGLET Parcelle ------------------------------

    // Déclaration du modèle de données pour l'onglet Parcelle.
    var FiucParcelleStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'designation'
        }, {
            name : 'valeur'
        }, ],
        data : FiucParcelleData
    });

    // Requete Ajax pour aller chercher dans la webapp les données relatives à
    // la parcelle
    // Les informations affichées sont
    Ext.Ajax.request({
        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=0",
        method : 'GET',
        success : function(response) {
            var result = eval(response.responseText);
            // Remplissage du tableau de données
            // TODO: remplacer les libellés par les i18n correspondants
            FiucParcelleData = [ [ 'Commune', result[0].ccodep + result[0].ccodir + result[0].ccocom ], 
                                 [ 'Section', result[0].ccopre + result[0].ccosec ],
                                 [ 'Parcelle', result[0].dnupla ], 
                                 [ 'Voie (Code fantoir)', result[0].dnvoiri + result[0].dindic ], 
                                 [ 'Adresse', result[0].cconvo + result[0].dvoilib ], 
                                 [ 'Contenance DGFiP en m²', result[0].dcntpa.toLocaleString() ], 
                                 [ 'Contenance calculée en m²', result[0].surfc.toLocaleString() ],
                                 [ 'Parcelle bâtie', result[0].gparbat ], 
                                 [ 'Secteur urbain', result[0].gurbpa ] ];

            // Chargement des données
            FiucParcelleStore.loadData(FiucParcelleData);
            data: FiucParcelleData;
        }
    });

    // La variable FiucParcelleGrid est consititué d'un objet grid.GridPanel
    // Elle constitue de tableau de données à afficher pour l'onglet parcelle
    var FiucParcelleGrid = new Ext.grid.GridPanel({
        store : FiucParcelleStore,
        stateful : true,
        autoHeight : true,
        name : 'Fiuc_Parcelle',
        xtype : 'editorgrid',
        columns : [ {
            header : "Description",
            dataIndex : 'designation',
            width: 150
        }, {
            header : "Valeur",
            dataIndex : 'valeur',
            width: 300
        } ],
        // inline toolbars
        tbar:[{
            text:OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'),
            tooltip:'Création du bordereau parcellaire',
            iconCls:'small-pdf-button',
            handler : function() {
                Ext.Ajax.request({
                    url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createBordereauParcellaire?parcelle=' + parcelleId,
                    failure : function() {
                        alert("Erreur lors de la création du " + OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'))
                    },
                    params : {}
                });
            }
        }]
    });
    
    cadastreTabPanel.add({
     // ONGLET 1: Parcelle
        title : OpenLayers.i18n('cadastrapp.duc.parcelle'),
        xtype : 'form',
        items : [FiucParcelleGrid ],
        layout:'fit'
    });
    cadastreTabPanel.doLayout();
    windowFIUC.doLayout();
    // ---------- FIN ONGLET Parcelle ------------------------------

    // ---------- ONGLET Propriétaire ------------------------------
    //Seulement pour Cnil1 et Cnil2 
    if(GEOR.Addons.Cadastre.isCNIL1() || GEOR.Addons.Cadastre.isCNIL2()){ 
        //
        // 
        // Déclaration du modèle de données pour l'onglet Propriétaire.
        // réalise l'appel à la webapp
        var FiucProprietaireStore = new Ext.data.JsonStore({
    
            // Appel à la webapp
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=1",
            autoLoad : true,
    
            // Champs constituant l'onglet propîétaire
            fields : [ 'ccodro', 'dnupro', 'dnomlp', 'dprnlp', 'epxnee', 'dnomcp', 'dprncp', {
                // Le champ adress est l'addition des champs dlign3,dlign4,
                // dlign5, dlign6
                name : 'adress',
                convert : function(v, rec) {
                    return rec.dlign3 + rec.dlign4 + rec.dlign5 + rec.dlign6
                }
            }, 'jdatnss', 'dldnss', 'ccodro_lib' ],
        });
    
        // Déclaration de la bottom bar (25 propiétaires par page)
        var bbar = new Ext.PagingToolbar({
            pageSize : 25,
            store : FiucProprietaireStore,
            displayInfo : true,
            displayMsg : 'Affichage {0} - {1} of {2}',
            emptyMsg : "Pas de propriétaire a afficher",
        });
    
        // Déclaration du tableau de propriétaires
        // Constitué des colonnes "Code du droit réel", "Nom,"Prénom", "Mention
        // du complément",
        // "Nom complement", "Prénom complément","adresse", "date","Libellé -
        // Code du droit réel"
        FiucProprietairesGrid = new Ext.grid.GridPanel({
            store : FiucProprietaireStore,
            stateful : true,
            name : 'Fiuc_Proprietaire',
            xtype : 'editorgrid',
            bbar : bbar,
            autoExpandMax:825,
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    border : true,
                    sortable : true,
                },
                columns : [{
                    header : OpenLayers.i18n('cadastrapp.proprietaires.ccodro'),
                    dataIndex : 'ccodro',
                    width: 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.compte'),
                    dataIndex : 'dnupro',
                    width: 50
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nom'),
                    dataIndex : 'dnomlp',
                    width: 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                    dataIndex : 'dprnlp',
                    width: 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.mentioncpl'),
                    dataIndex : 'epxnee',
                    width: 75
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nomcpl'),
                    dataIndex : 'dnomcp',
                    width: 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenomcpl'),
                    dataIndex : 'dprncp',
                    width: 100
                        
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.adresse'),
                    dataIndex : 'adress',
                    width: 200
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.datenaissance'),
                    dataIndex : 'jdatnss',
                    width: 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.lieunaissance'),
                    dataIndex : 'dldnss',
                    width: 100
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.cco_lib'),
                    dataIndex : 'ccodro_lib',
                    width: 100
                } ]
            }),
            // inline toolbars
            tbar:[{
                text:OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
                tooltip:'Création du releve de propriete',
                iconCls:'small-pdf-button',
                handler : function() {
                    Ext.Ajax.request({
                        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createRelevePropriete?parcelle=' + parcelleId,
                        failure : function() {
                            alert("Erreur lors de la création du " + OpenLayers.i18n('cadastrapp.duc.releve.depropriete'))
                        },
                        params : {}
                    });
                }
            }]
        });

        cadastreTabPanel.add({
            // ONGLET 2: Propriétaire
            title : OpenLayers.i18n('cadastrapp.duc.propietaire'),
            xtype : 'form',
            items : [FiucProprietairesGrid ],
            layout:'fit'
           });
        windowFIUC.doLayout();
    // ---------- FIN ONGLET Propriétaire ------------------------------
    }
    
    // ---------- ONGLET Batiment ------------------------------
    if(GEOR.Addons.Cadastre.isCNIL2()){ 
   
        // Modèle de donnée pour l'onglet batiment
        var FiucBatimentsStore = new Ext.data.JsonStore({
            // Appel à la webapp
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=2",
            autoLoad : true,
            fields : [ 'dniv', 'dpor', 'cconlc_lib', 'dvlrt', 'jdatat', 'dnupro', 'ddenom', 'dnomlp', 'dprnlp', 'epxnee', 'dnomcp', 'dprncp' ],
    
        });
    
        // Déclaration des boutons "lA1, A2, A3"
        var batimentsList = [];
        for (var i = 1; i <= 3; i++) {
            batimentsList.push("A" + i);
        }
    
        var buttonBatimentList = [];
    
        // Création des boutons correspondants
        for (var i = 0; i < batimentsList.length; i++) {
    
            var buttonBatiment = new Ext.Button({
                id : batimentsList[i],
                text : batimentsList[i],
                margins : '0 10 0 10',
                handler : function(e) {
                    reloadBatimentStore(e.text);
                }
            });
            buttonBatimentList.push(buttonBatiment);
    
        }
    
        // Déclaration du tableau
        var FiucBatimentsGrid = new Ext.grid.GridPanel({
            store : FiucBatimentsStore,
            stateful : true,
            hideHeaders: true,
            name : 'Fiuc_Batiments',
            xtype : 'editorgrid',
            bbar : bbar,
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    sortable : true,
                },
                columns : [ {
                    header : OpenLayers.i18n('cadastrapp.duc.batiment_niveau'),
                    dataIndex : 'dniv',
                }, {
                    // TODO: mettre les i18n correspondants
                    // numéro de porte
                    header : "Porte",
                    dataIndex : 'dpor',
                }, {
                    header : "Type",
                    dataIndex : 'cconlc_lib',
                }, {
                    header : "Date",
                    dataIndex : 'jdatat',
                }, {
                    header : "Revenu",
                    dataIndex : 'dvlrt',
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.compte'),
                    dataIndex : 'dnupro'
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.denomination'),
                    dataIndex : 'ddenom'
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nom'),
                    dataIndex : 'dnomlp'
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                    dataIndex : 'dprnlp'
    
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.mentioncpl'),
                    dataIndex : 'epxnee'
    
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.nomcpl'),
                    dataIndex : 'dnomcp'
    
                }, {
                    header : OpenLayers.i18n('cadastrapp.duc.prenomcp'),
                    dataIndex : 'dprncp'
    
                }, {
                    bbar : bbar,
                } ]
            }),
            // inline toolbars
            tbar:[{
                text:OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
                tooltip:'Création du releve de propriete',
                iconCls:'small-pdf-button',
                handler : function() {
                    Ext.Ajax.request({
                        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createRelevePropriete?parcelle=' + parcelleId,
                        failure : function() {
                            alert("Erreur lors de la création du " + OpenLayers.i18n('cadastrapp.duc.releve.depropriete'))
                        },
                        params : {}
                    });
                }
                }, '-', {
                text:OpenLayers.i18n('cadastrapp.duc.batiment_descriptif'),
                tooltip:'Création du releve de propriete',
                iconCls:'house-button',
                handler : function() {
                    Ext.Ajax.request({
                        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createRelevePropriete?parcelle=' + parcelleId,
                        failure : function() {
                            alert("Erreur lors de la création du " + OpenLayers.i18n('cadastrapp.duc.batiment_descriptif'))
                        },
                        params : {}
                    });
                }
             }],
             autoHeight : true
        });

        cadastreTabPanel.add({
            // ONGLET 3: Batiment
            title : OpenLayers.i18n('cadastrapp.duc.batiment'),
            xtype : 'form',
            items : [ {
                xtype : 'buttongroup',
                title: 'Batiment(s)',
                frame : false,
                items : buttonBatimentList
                }, FiucBatimentsGrid ],
            layout:'fit'
           });
        windowFIUC.doLayout();
        // ---------- FIN ONGLET Batiment ------------------------------

        // ---------- ONGLET Subdivision fiscale ------------------------------
        //
        // Modèle de données pour l'onglet subdivision fiscale
        var FiucSubdivfiscStore = new Ext.data.JsonStore({
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
        var FiucSubdivfiscGrid = new Ext.grid.GridPanel({
            store : FiucSubdivfiscStore,
            stateful : true,
            autoHeight : true,
            title : 'Subdivisions fiscales',
            name : 'Fiuc_Subdivisions_fiscales',
            xtype : 'editorgrid',
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
            items : [ FiucSubdivfiscGrid ],
            layout:'fit'
           });
        windowFIUC.doLayout();
        // ---------- FIN ONGLET Subdivision fiscale ------------------------------

        // ---------- ONGLET historique de mutation ------------------------------

        // Modèle de données de l'onglet historique de mutation
        var FiucHistomutStore = new Ext.data.ArrayStore({
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
                    return rec.ccocomm + ' ' + rec.ccoprem + ' ' + rec.ccosecm + ' ' + rec.dnuplam
                }
            }, {
                name : 'filiation',
                convert : function(v, rec) {
                    return rec.type_filiation
                }
            } ]
        });
    
        // Tableau des données de l'historique de mutation
        var FiucHistomutGrid = new Ext.grid.GridPanel({
            store : FiucHistomutStore,
            stateful : true,
            autoHeight : true,
            name : 'Fiuc_Historique_Mutation',
            xtype : 'editorgrid',
            colModel : new Ext.grid.ColumnModel({
                defaults : {
                    sortable : true,
                },
                columns : [ {
                    header : OpenLayers.i18n('cadastrapp.duc.dateacte'),
                    dataIndex : 'date'
                }, {
                    header : "Référence de la parcelle mère",
                    dataIndex : 'referenceparcelle'
                }, {
                    header : "Type de mutation",
                    dataIndex : 'filiation'
                } ]
            }),
    
        });
        
        cadastreTabPanel.add({
         // ONGLET 5: Historique de mutation
            title : OpenLayers.i18n('cadastrapp.duc.histomut'),
            xtype : 'form',
            items : [ FiucHistomutGrid ],
            layout:'fit'
           });
        cadastreTabPanel.doLayout();
        windowFIUC.doLayout();
    }
    
    // add windows in manager and show it
    GEOR.Addons.Cadastre.newGrid.fichesCOuvertes.push(windowFIUC);
    GEOR.Addons.Cadastre.newGrid.idParcellesCOuvertes.push(parcelleId);
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


//TODO Remove when service available
function reloadBatimentStore(bat) {
    // console.log( bat);
    var FiucBatiments1Data = [ [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ] ];
    var FiucBatiments2Data = [ [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ] ];
    var FiucBatiments3Data = [ [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ], [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ] ];

    var Data = [];
    if (bat == "A1") {
        Data = FiucBatiments1Data;
    } else if (bat == "A2") {
        Data = FiucBatiments2Data;
    } else if (bat == "A3") {
        Data = FiucBatiments3Data;
    }
    // FiucBatimentsStore.loadData(Data);
}

/**
 * 
 */
function loadbordereauParcellaire() {

    // console.log("download bordereau function");
    // TODO
    // onClickPrintBordereauParcellaireWindow(parcelleId);
}
