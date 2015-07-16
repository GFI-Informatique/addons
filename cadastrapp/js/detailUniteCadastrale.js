/**
 * api: (define) api: (define) module = GEOR class = Cadastrapp base_link = *
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR.Addons.Cadastre");

/**
 * public: method[onClickDisplayFIUC] :param parcelleId
 * 
 * Cette methode construit la fiche d'information cadastralle pour une parcelle
 * donnée (parcelleId) Cette fiche comprend les onglets Parcelle, Propriétaire,
 * Batiment, Subdivision fiscale et Historique de mutation Chaque onglet cherche
 * ses données dans la webapp via utilisation de la méthode getFIC Il est
 * possible de créer en format pdf, le bordereau parcellaire par l'onglet
 * parcelle ou proriétaire, et le relevé de propriété par l'onglet batiment
 * 
 * ParcelleId est l'identifiant de la parcelle (exemple: 20148301032610C0012)
 * 
 * Description le résultat: La fiche d'information cadastrale est affichée
 */
GEOR.Addons.Cadastre.onClickDisplayFIUC = function(parcelleId) {

    // Titre de la fiche d'information cadastrale
    var titleFIUC = parcelleId;

    // Declaration des data pour le modèle de données pour l'onglet Parcelle
    var FiucParcelleData = [];

    // ---------- ONGLET Parcelle ------------------------------
    // Cet onglet permet de créer le bordereau parcellaire correspondant la
    // parcelle choisie
    // Une requete vers la webapp cherche les informations nécessaires puis
    // sont affichées

    // Déclaration du modèle de données pour l'onglet Parcelle. Il comprend
    // les colonnes Désignation et Valeur
    // chargement des datas
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

            // Evaluation de la réponse de la requete à la webapp
            var result = eval(response.responseText);

            // la variable commune est construite par addition des champs "Code
            // département","Code Direction" et "Code commune"
            var commune = result[0].ccodep + result[0].ccodir + result[0].ccocom;

            // la variable section est construite par addition des champs
            // "Préfixe de section" et "Code section"
            var section = result[0].ccopre + result[0].ccosec;

            // la variable parcelle represente le "Numéro de plan de la
            // parcelle"
            var parcelle = result[0].dnupla;

            // la variable voie est construite par addition des champs "Numéro
            // de voirie" et "Indice de répétition"
            var voie = result[0].dnvoiri + result[0].dindic;

            // la variable adresse est construite par addition des champs "Code
            // nature de la voie" et "Libellé de la voie"
            var adresse = result[0].cconvo + result[0].dvoilib;

            // la variable contenanceDGFiP represente la "Contenance DGFIP"
            var contenanceDGFiP = result[0].dcntpa;

            // la variable contenanceCalculee represente la "Surface SIG
            // calculée en m2"
            var contenanceCalculee = result[0].supf;

            // la variable parcelleBatie represente le champ "Parcelle bâtie"
            var parcelleBatie = result[0].gparbat;

            // la variable secteurUrbain represente le champ "Secteur urbain"
            var secteurUrbain = result[0].gurbpa;

            // Remplissage du tableau de données
            // TODO: remplacer les libellés par les i18n correspondants
            FiucParcelleData = [ [ 'Commune', commune ], [ 'Section', section ], [ 'Parcelle', parcelle ], [ 'Voie (Code fantoir)', voie ], [ 'Adresse', adresse ], [ 'Contenance DGFiP', contenanceDGFiP ], [ 'Contenance calculée', contenanceCalculee ], [ 'Parcelle bâtie', parcelleBatie ], [ 'Secteur urbain', secteurUrbain ] ];

            // Chargement du tableau de données relative à la parcelle dans le
            // modèle de données correspondant à la parcelle
            FiucParcelleStore.loadData(FiucParcelleData, false);
            data: FiucParcelleData;

            // Le titre de la fiche d'information cadastrale est construit par
            // l'addition des champs suivants:
            // "Code département","Code Direction" et "Code commune", suivi
            // d'un tiret, ainsi que par l'addition des champs suivants:
            // "Préfixe de section", "Code section" et "Numéro de plan de la
            // parcelle"
            titleFIUC = result[0].ccodep + result[0].ccodir + result[0].ccocom + '-' + result[0].ccopre + result[0].ccosec + '-' + result[0].dnupla;
            // console.log(titleFIUC);
        }
    });

    // La variable parcelleDownloadPdfButton est consititué d'un objet bouton
    // Sur appui sur celui-ci l'appel à la fonction permettant la création du
    // bordereau parcellaire est effectué
    //	
    var parcelleDownloadPdfButton = new Ext.ButtonGroup({
        bodyBorder : false,
        border : false,
        hideBorders : true,
        frame : false,
        items : [ {
            xtype : 'button',
            scale : 'small',
            name : 'proprietaireDownloadPdfButton',
            iconCls : "pdf-button",
            handler : function() {
                // TODO : call PDF function with selected
                // propriete
                // see below funtion
                Ext.Ajax.request({
                    url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createBordereauParcellaire?parcelle=' + parcelleId,
                    failure : function() {
                        alert("erreur lors de la création du " + OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'))
                    },
                    params : {}
                });
            }
        }, {
            xtype : 'label',
            text : OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'),
        } ]
    });

    // La variable FiucParcelleGrid est consititué d'un objet grid.GridPanel
    // Elle constitue de tableau de données à afficher pour l'onglet parcelle
    var FiucParcelleGrid = new Ext.grid.GridPanel({
        store : FiucParcelleStore,
        stateful : true,
        height : 500,
        title : 'Bordereau parcellaire',
        name : 'Fiuc_Parcelle',
        xtype : 'editorgrid',

        columns : [ {
            header : "Description",
            dataIndex : 'designation'
        }, {
            header : "Valeur",
            dataIndex : 'valeur'
        } ]

    });
    // ---------- FIN ONGLET Parcelle ------------------------------

    // ---------- ONGLET Propriétaire ------------------------------
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

    // Déclaration du bouton permettant la création du relevé de propriété
    // (fichier pdf)
    var proprietaireDownloadPdfButton = new Ext.ButtonGroup({
        // setSize: {width: 16px, height: 16px},
        bodyBorder : false,
        border : false,
        hideBorders : true,
        frame : false,
        items : [ {
            xtype : 'button',
            scale : 'small',
            name : 'proprietaireDownloadPdfButton',
            iconCls : "pdf-button",
            handler : function() {
                // TODO: action sur le bouton relevé de proriété
                // createReleveDePropriete();
                // see below funtion
            }
        }, {
            xtype : 'label',
            text : OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
        }, ]
    });

    // TODO: sm A� revoir (probleme de compatibite)
    var sm = new Ext.grid.CheckboxSelectionModel();

    // Déclaration de la bottom bar (25 propiétaires par page)
    var bbar = new Ext.PagingToolbar({
        pageSize : 25,
        store : FiucProprietaireStore,
        displayInfo : true,
        displayMsg : 'Displaying topics {0} - {1} of {2}',
        emptyMsg : "No topics to display",
        items : [ {
            pressed : true,
            enableToggle : true,
            text : 'Show Preview',
            cls : 'x-btn-text-icon details',
            toggleHandler : function(btn, pressed) {
                var view = grid.getView();
                view.showPreview = pressed;
                view.refresh();
            }
        } ]
    });

    // Déclaration du tableau de propriétaires
    // Constitué des colonnes "Code du droit réel", "Nom,"Prénom", "Mention
    // du complément",
    // "Nom complement", "Prénom complément","adresse", "date","Libellé -
    // Code du droit réel"
    FiucProprietairesGrid = new Ext.grid.GridPanel({
        store : FiucProprietaireStore,
        stateful : true,
        height : 500,
        title : 'Relevé de propriété',
        name : 'Fiuc_Proprietaire',
        xtype : 'editorgrid',

        // TODO Revoir sm, problème de compatibilité
        selModel : sm,
        bbar : bbar,
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                border : true,
                sortable : true,
            },
            columns : [ sm, {
                header : OpenLayers.i18n('cadastrapp.proprietaires.ccodro'),
                dataIndex : 'ccodro'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.compte'),
                dataIndex : 'dnupro'
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
                header : OpenLayers.i18n('cadastrapp.duc.prenomcpl'),
                dataIndex : 'dprncp'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.adresse'),
                dataIndex : 'adress'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.datenaissance'),
                dataIndex : 'jdatnss'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.lieunaissance'),
                dataIndex : 'dldnss'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.cco_lib'),
                dataIndex : 'ccodro_lib'
            } ]
        }),
    });

    // ---------- FIN ONGLET Propriétaire ------------------------------
    //
    // 	
    // ---------- ONGLET Batiment ------------------------------
    //
    // Modèle de donnée pour l'onglet batiment
    var FiucBatimentsStore = new Ext.data.JsonStore({
        // Appel à la webapp
        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getFIC?parcelle=' + parcelleId + "&onglet=2",
        // root : "",
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
        // console.log('batiment : ' + batimentsList[i]);
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

    // Déclaration du boution de création du décriptif d'habitation
    var descriptifHabitationDetailsButton = new Ext.ButtonGroup({
        bodyBorder : false,
        border : false,
        hideBorders : true,
        frame : false,
        items : [ {
            xtype : 'button',
            name : 'descriptifHabitationDetailsButton',
            scale : 'small',
            iconCls : "house",
            handler : function() {
                // createReleveDePropriete();
                // see below funtion
            }
        }, {
            xtype : 'label',
            text : OpenLayers.i18n('cadastrapp.duc.batiment_descriptif'),
        }, ]
    });

    // Déclaration du tableau
    var FiucBatimentsGrid = new Ext.grid.GridPanel({
        store : FiucBatimentsStore,
        stateful : true,
        height : 500,
        title : 'batiment(s)',
        name : 'Fiuc_Batiments',
        xtype : 'editorgrid',
        selModel : sm,
        bbar : bbar,

        items : [ {
            // bouton de création de rélévé de propriété
            xtype : 'button',
            scale : 'small',
            name : 'proprietaireDownloadPdfButton',
            iconCls : "pdf-button",
            margins : '0 10 0 10',
            handler : function() {
                // createReleveDePropriete();
                // see below funtion
            }
        }, {
            xtype : 'label',
            text : OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
        }, {
            // Bouton ouvrant le déscriptif détaillé de l'habitation
            xtype : 'button',
            scale : 'small',
            name : 'descriptifHabitationDetailsButton',
            iconCls : "house",
            handler : function() {
                // descriptifHabitationDetails();
                // see below funtion
            }
        }, {
            xtype : 'label',
            text : 'Descriptif',
        }, ],
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : true,
            },
            // TODO Revoir sm: pb compatibilité
            columns : [ sm, {
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
        })
    });

    // ---------- FIN ONGLET Batiment ------------------------------
    //
    // 
    // ---------- ONGLET Subdivision fiscale ------------------------------
    //
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
        height : 500,
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
    // ---------- FIN ONGLET Subdivision fiscale ------------------------------
    //
    // 
    // ---------- ONGLET historique de mutation ------------------------------
    //
    // 
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
        height : 500,
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

    // FiucReleveCadastralPdfButton = new Ext.Button({
    // name : 'FiucReleveCadastralPdfButton',
    // cls : "pdf_button"
    //        
    // });
    // 
    // FiucReleveDeProprietePdfButton = new Ext.Button({
    // name : 'FiucReleveDeProprietePdfButton',
    // cls : "pdf_button",
    // text : OpenLayers.i18n("cadastrapp.duc.releve.depropriete")
    // });

    // Construction de la fenêtre principale
    var windowFIUC = new Ext.Window({
        // TODO: titre de la fenetre à afficher
        title : 'titleFIUC',
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        border : false,
        labelWidth : 400,
        width : 850,
        defaults : {
            autoHeight : true,
            bodyStyle : 'padding:10px',
            flex : 1
        },

        listeners : {
            close : function(window) {
                // AJOUT HAMZA
                // deselection de la ligne
                var rowIndex = GEOR.Addons.Cadastre.indexRowParcelle(parcelleId);
                newGrid.getSelectionModel().deselectRow(rowIndex);

                // mise à jour des tableau de fenêtres ouvertes
                var index = newGrid.idParcellesCOuvertes.indexOf(parcelleId);
                newGrid.idParcellesCOuvertes.splice(index, 1);
                newGrid.fichesCOuvertes.splice(index, 1);
                var feature = GEOR.Addons.Cadastre.getFeatureById(parcelleId);
                if (feature){
                    GEOR.Addons.Cadastre.changeStateFeature(feature, -1, "yellow");
                }

                // on ferme la fenêtre foncière si ouverte
                GEOR.Addons.Cadastre.closeWindowFIUF(parcelleId, newGrid);

                // FIN AJOUT
                windowFIUC = null;
            }
        },
        items : [ {
            // autoHeight : true,
            xtype : 'tabpanel',
            width : 800,
            height : 800,
            activeTab : 0,
            items : [ {

                // ONGLET 1: Parcelle
                title : OpenLayers.i18n('cadastrapp.duc.parcelle'),
                xtype : 'form',
                items : [ parcelleDownloadPdfButton, FiucParcelleGrid ]
            }, {

                // ONGLET 2: Propriétaire
                title : OpenLayers.i18n('cadastrapp.duc.propietaire'),
                xtype : 'form',
                items : [ proprietaireDownloadPdfButton, FiucProprietairesGrid ]
            }, {

                // ONGLET 3: Batiment
                title : OpenLayers.i18n('cadastrapp.duc.batiment'),
                xtype : 'form',
                items : [ {
                    xtype : 'buttongroup',
                    frame : false,
                    items : buttonBatimentList
                }, FiucBatimentsGrid ]
            }, {
                // ONGLET 4: Subivision fiscale
                title : OpenLayers.i18n('cadastrapp.duc.subdiv'),
                xtype : 'form',
                items : [ FiucSubdivfiscGrid ]
            }, {
                // ONGLET 5: Historique de mutation
                title : OpenLayers.i18n('cadastrapp.duc.histomut'),
                xtype : 'form',
                items : [ FiucHistomutGrid ]
            } ]
        } ]

    });
    windowFIUC.show();
    newGrid.fichesCOuvertes.push(windowFIUC);
    newGrid.idParcellesCOuvertes.push(parcelleId);

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
