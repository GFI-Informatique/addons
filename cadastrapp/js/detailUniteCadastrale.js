/**
 * api: (define) api: (define) module = GEOR class = Cadastrapp base_link = *
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

/**
 * public: method[onClickDisplayFIUC] :param layer: Create ...TODO
 */



onClickDisplayFIUC = function(parcelleId) {
	//titre de la fenetre
	var titleFIUC ='';
	//variables de l'onglet parcelle
	var commune ='';
	var section ='';
	var parcelle ='';
	var voie ='';
	var adresse ='';
	var contenanceDGFiP ='';
	var contenancecalculee ='';
	var parcellebatie ='';
	var secteururbain ='';	

	//Declaration des data

	var FiucParcelleData =[];


    // ONGLET 1		
var FiucParcelleStore = new Ext.data.ArrayStore({
                        fields : [ {
                            name : 'designation'
                        }, {
                            name : 'valeur'
                        }, ],
                        data : FiucParcelleData
                    });
					
		 Ext.Ajax.request({
		//A remplacer par getFIC
        //url: getWebappURL() + 'getParcelle?parcelle='+parcelleId+"&details=1",
        //method: 'GET',
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=0",
        method: 'GET',   
        //params: params,
        success: function(response) {
            //console.log(response.responseText);
            var result = eval(response.responseText);
            commune = result[0].ccodep + result[0].ccodir + result[0].ccocom;
			
            section = result[0].ccopre + result[0].ccosec;
			
            parcelle = result[0].dnupla;
			
            voie = result[0].dnvoiri + result[0].dindic;
			
            adresse = result[0].cconvo + result[0].dvoilib;
			
            contenanceDGFiP = result[0].dcntpa;
			
            contenancecalculee = result[0].supf;
			
            parcellebatie = result[0].gparbat ;
			
            secteururbain = result[0].gurbpa;
            //console.log(commune);
           
            FiucParcelleData = [[ 'Commune', commune ],
                                 [ 'Section', section ],
                                 [ 'Parcelle', parcelle ],
								[ 'Voie (Code fantoir)', voie ] ,
								[ 'Adresse', adresse ] ,
								[ 'Contenance DGFiP', contenanceDGFiP ] ,
								[ 'Contenance calculée', contenancecalculee ] ,
								[ 'Parcelle bâtie', parcellebatie ] ,
								[ 'Secteur urbain', secteururbain ] 
								];
            FiucParcelleStore.loadData(FiucParcelleData,false);
			
            data : FiucParcelleData;
			 
			//titre de la fenetre
			titleFIUC =result[0].ccodep + result[0].ccodir + result[0].ccocom + '-'+result[0].ccopre + result[0].ccosec+'-'+result[0].dnupla;
           
        }
    });  			
	
									
    var parcelleDownloadPdfButton = new Ext.ButtonGroup({
    	bodyBorder:false,
    	border:false,
    	hideBorders:true,
    	frame : false,
    	items :[
    	        {
    	        	xtype : 'button', 
					scale : 'small',
			        name : 'proprietaireDownloadPdfButton',
			        iconCls : "pdf-button",
			        handler : function () {
			        	// TODO : call PDF function with selected propriete
			        	// see below funtion 
			        	
			        	Ext.Ajax.request({
			        		   url: getWebappURL() + 'createBordereauParcellaire?parcelle='+parcelleId ,
			        		   failure: function(){alert("erreur lors de la création du "+OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'))},
			        		   params: { }
		        		});
			        }
    	        }, 
    	        {
    	        	xtype : 'label', 
			        text : OpenLayers.i18n('cadastrapp.duc.bordereau.parcellaire'),
    	        }, 
    ]
    });
    var FiucParcelleGrid = new Ext.grid.GridPanel({
        store : FiucParcelleStore,
        stateful : true,
        height : 500,
        title : 'Bordereau parcellaire',
        name : 'Fiuc_Parcelle',
        xtype : 'editorgrid',

           columns : [
                  {header: "Description", dataIndex: 'designation'},
                  {header: "Valeur", dataIndex: 'valeur'}
              ]


    });


    // ONGLET 2
 
    var FiucProprietaireStore = new Ext.data.JsonStore({
		
		url : getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=1",
	//	root : "",
		autoLoad : true,
	    
       //root : 'rowsproprietaire',
        //totalProperty : 'total',
        //idProperty : 'compteproprietaire',
        //remoteSort : false,
        //autoDestroy : true,

			fields : ['ccodro', 'dnupro', 'dnomlp', 'dprnlp', 'epxnee', 'dnomcp', 'dprncp', 
			   {   name : 'adress',
			        convert : function (v, rec) {return  rec.dlign3 + rec.dlign4 + rec.dlign5 + rec.dlign6}
				},
			            'jdatnss', 'dldnss', 'ccodro_lib'],
		
		});
	

    var proprietaireDownloadPdfButton = new Ext.ButtonGroup({
		//setSize: {width: 16px, height: 16px},
    	bodyBorder:false,
    	border:false,
    	hideBorders:true,
    	frame : false,
    	items :[
    	        {
    	        	xtype : 'button', 
					scale : 'small',
			        name : 'proprietaireDownloadPdfButton',
			        iconCls : "pdf-button",
			        handler : function () {
			        	//createReleveDePropriete();
			        	// see below funtion 
			        }
    	        }, 
    	        {
    	        	xtype : 'label', 
			        text : OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
    	        }, 
    ]
    });

    var sm = new Ext.grid.CheckboxSelectionModel();
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

    FiucProprietairesGrid = new Ext.grid.GridPanel({
        store : FiucProprietaireStore,
        stateful : true,
        height : 500,
        title : 'Relevé de propriété',
        name : 'Fiuc_Proprietaire',
        xtype : 'editorgrid',
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
            },{
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

    // ONGLET 3

    var FiucBatimentsStore = new Ext.data.JsonStore({
				
		url : getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=2",
		//	root : "",
		autoLoad : true,
	    
       //root : 'rowsproprietaire',
        //totalProperty : 'total',
        //idProperty : 'compteproprietaire',
        //remoteSort : false,
        //autoDestroy : true,
		
        fields : [ 'dniv', 'dpor','cconlc_lib', 'dvlrt', 'jdatat', 'dnupro',  'ddenom','dnomlp', 'dprnlp','epxnee','dnomcp','dprncp'],
    });
    
    var batimentsList = [];
    for (var i=1; i<= 3 ; i++){
        batimentsList.push("A"+i);
    }
    //var batimentsList = ["A1","A2","A3"];
    var buttonBatimentList = [];
    
    for ( var i=0; i< batimentsList.length ; i++ ) {
        //console.log('batiment : ' + batimentsList[i]);
        var buttonBatiment = new Ext.Button({
            id:batimentsList[i],
            text : batimentsList[i],
            margins :'0 10 0 10',
            handler : function (e){ reloadBatimentStore(e.text); }
        });
        buttonBatimentList.push(buttonBatiment);

    }
	
	    var descriptifHabitationDetailsButton = new Ext.ButtonGroup({
    	bodyBorder:false,
    	border:false,
    	hideBorders:true,
    	frame : false,
    	items :[
    	        {
    	        	xtype : 'button', 
			        name : 'descriptifHabitationDetailsButton',
					scale : 'small',
			        iconCls : "house",
			        handler : function () {
			        	//createReleveDePropriete();
			        	// see below funtion 
			        }
    	        }, 
    	        {
    	        	xtype : 'label', 
			        text : OpenLayers.i18n('cadastrapp.duc.batiment_descriptif'),
    	        }, 
    ]
    });

    var FiucBatimentsGrid = new Ext.grid.GridPanel({
        store : FiucBatimentsStore,
        stateful : true,
        height : 500,
        title : 'batiment(s)',
        name : 'Fiuc_Batiments',
        xtype : 'editorgrid',
		
		/*
		items :[{
    	        	xtype : 'button', 
					scale : 'small',
			        name : 'proprietaireDownloadPdfButton',
			        iconCls : "pdf-button",
			        handler : function () {
			        	//createReleveDePropriete();
			        	// see below funtion 
			        }
    	        }, 
    	        {
    	        	xtype : 'label', 
			        text : OpenLayers.i18n('cadastrapp.duc.releve.depropriete'),
    	        }, 
    	        {
    	        	xtype : 'button', 
					scale : 'small',
			        name : 'descriptifHabitationDetailsButton',
			        iconCls : "house",
			        handler : function () {
			        	//createReleveDePropriete();
			        	// see below funtion 
			        }
    	        }, 
    	        {
    	        	xtype : 'label', 
			        text : 'Descriptif',
    	        }, 
    ],*/
        colModel : new Ext.grid.ColumnModel({
            defaults : {
            sortable : true,
            },
            columns : [ {

                selModel: sm,
                width : 50,
                //dataIndex : 'col1'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.batiment_niveau'),
                dataIndex : 'dniv'
            }, {
                header : "Porte",
                dataIndex : 'dpor'
            }, {
                header : "Type",
                dataIndex : 'cconlc_lib'
            }, {
                header : "Date",
                dataIndex : 'jdatat'
            }, {
                header : "Revenu",
                dataIndex : 'dvlrt'
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

            } ]
        })
    });

    // ONGLET 4

    var FiucSubdivfiscStore = new Ext.data.JsonStore({
		autoLoad : true,
		 
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=3",
        method: 'GET',
        fields : [  'ccosub', 
				{   name : 'contenance',
			        convert : function (v, rec) {return  rec.dcntsf}
				},
				'cgrnum_lib','drcsub'],
          });
					    
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
			

           columns : [
                  {header: "Lettre indicative", dataIndex: 'ccosub'},
                  {header: "Contenance", dataIndex: 'contenance'},
                  {header: "Nature de culture", dataIndex: 'cgrnum_lib'},
                  {header: "Revenu au 01/01", dataIndex: 'drcsub'},
            ]
        }),

    });

    // ONGLET 5

    var FiucHistomutStore = new Ext.data.ArrayStore({
		autoLoad : true,
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=4",
        method: 'GET',
        fields : [  
				{   name : 'date',
			        convert : function (v, rec) {return  rec.jdatat}
				},
				{   name : 'referenceparcelle',
			        convert : function (v, rec) {return  rec.ccocomm   + ' '+rec.ccoprem  + ' '+rec.ccosecm  + ' '+ rec.dnuplam}
				},
				{   name : 'filiation',
			        convert : function (v, rec) {return  rec.type_filiation}
				}]

				});


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
    var windowFIUC;
    windowFIUC = new Ext.Window({
        title : titleFIUC,
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
				var rowIndex = indexRowParcelle(parcelleId);
				newGrid.getSelectionModel().deselectRow(rowIndex);
				// mise à jour des tableau de fenêtres ouvertes
				var index =newGrid.idParcellesOuvertes.indexOf(parcelleId);
				newGrid.idParcellesOuvertes.splice(index,1);
				newGrid.fichesOuvertes.splice(index,1);
				var feature = getFeatureById(parcelleId);
				if (feature)
					changeStateFeature(feature, -1, "yellow");
				// FIN AJOUT	
                windowFIUC = null;
            }
        },

        items : [ {
            //autoHeight : true,
            xtype : 'tabpanel',
            width : 800,
            height : 800,
            activeTab : 0,
            items : [
                    {
                        // ONGLET 1: Parcelle
                        title : OpenLayers.i18n('cadastrapp.duc.parcelle'),
                        xtype : 'form',
                        items : [ parcelleDownloadPdfButton , FiucParcelleGrid ]
                    },
                    {
                        // ONGLET 2: Propriétaire
                        title : OpenLayers.i18n('cadastrapp.duc.propietaire'),
                        xtype : 'form',
                        items : [ proprietaireDownloadPdfButton,
                                FiucProprietairesGrid ]
                    }, {
                        // ONGLET 3: Batiment
                        title : OpenLayers.i18n('cadastrapp.duc.batiment'),
                        xtype : 'form',
                        items : [ 
                                  { 
                                      xtype: 'buttongroup', 
                                      frame : false,
                                      items : buttonBatimentList
                                    },
									
                                   FiucBatimentsGrid ]
                    }, {
                        // ONGLET 4: Subivision fiscale
                        title : OpenLayers.i18n('cadastrapp.duc.subdiv'),
                        xtype : 'form',
                        items : [ FiucSubdivfiscGrid ]

                    }, {
                        // ONGLET 5: Historique de mutation
                        title : OpenLayers.i18n('cadastrapp.duc.histomut'),
                        xtype : 'form',
                        items : [ FiucHistomutGrid]
                    } ]
        } ]

    });
    windowFIUC.show();
	newGrid.fichesOuvertes.push(windowFIUC);
	newGrid.idParcellesOuvertes.push(parcelleId);
	// window=FiucParcelleGrid.findParentByType("window");
    //console.log("displayFIUC onClick")
}

// return checked rows on proprietaie grid
function getSelectedProprietaire() {
    var proprietaireSelected = grid.getSelectionModel().getSelections();
    console.log(proprietaireSelected);

}
// return checked rows on batiment grid
function getSelectedBatiment() {
    var batimentSelected = grid.getSelectionModel().getSelections();
    console.log(proprietaireSelected);

}
// TODO mettre ca sur utils

function reloadBatimentStore(bat) {
    //console.log( bat);
    var FiucBatiments1Data = [
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '1', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ] ];
    var FiucBatiments2Data = [
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '2', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ] ];
    var FiucBatiments3Data = [
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ],
            [ '3', 'APP', '01/01/2014', '852', 'R0026', 'DUPOND', 'PRENOM' ] ];
    
    var Data = []; 
    if (bat == "A1") {
        Data = FiucBatiments1Data;
    } else if(bat == "A2") {
        Data = FiucBatiments2Data;
    } else if(bat == "A3") {
        Data = FiucBatiments3Data;
    }
    //FiucBatimentsStore.loadData(Data);
}

function loadbordereauParcellaire() {

    //console.log("download bordereau function");
    // TODO
    // onClickPrintBordereauParcellaireWindow(parcelleId);
}
