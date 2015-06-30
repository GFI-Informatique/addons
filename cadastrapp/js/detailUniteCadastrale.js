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
	
	//variables de l'onglet propriétaire
	var compteproprietaire ='';
	var qualiteabregee ='';
	var nomdusage ='';
	var prenomdusage ='';
	var mentioncomplement ='';
	var nomcomplement ='';
	var prenomcomplement ='';
	var adressehabitation ='';
	var lieunaissance ='';
	var datenaissance ='';
	var codedroitreel ='';
	var libellecodedroitreel ='';

	
	
	//variables de l'onglet batiment
	var niveau ='';
	var porte ='';
	var type ='';
	var date ='';
	var revenu ='';
	var compteprop ='';
	var nom ='';
	var prenom ='';
	var nomcplt ='';
	var prenomcplt ='';

	
	//variables de l'onglet subdivision fiscales
	var lettreindic= '';
	var contenance = '';
	var terrain = '';
	var revenu = '';
	//variables de l'onglet historique de mutation
	var 	dateacte = '';
	var	referenceparcelle = '';		
     var  typemutation = '';
	
	//Declaration des data

	var FiucParcelleData =[];
	var FiucProprietaireData=['','','','','','','','','','',''];
	var FiucBatimentData=[];
	var FiucSubdivData =[];
	var FiucHistomutData = [];

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
 //   FiucProprietaireData = [{codedroitreel,compteproprietaire,nomdusage,prenomdusage,mentioncomplement,nomcomplement,prenomcomplement,adressehabitation,datenaissance,lieunaissance,libellecodedroitreel}];

 
    var FiucProprietaireStore = new Ext.data.JsonStore({
		
		url : getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=1",
	//	root : "",
		autoLoad : true,
	    
       //root : 'rowsproprietaire',
        //totalProperty : 'total',
        //idProperty : 'compteproprietaire',
        //remoteSort : false,
        //autoDestroy : true,

			fields : ['ccodro', 'dnupro', 'dnomlp', 'dprnlp', 'expnee', 'dnomcp', 'dprncp', 
			   {   name : 'adress',
			        convert : function (v, rec) {return  rec.dlign3 + rec.dlign4 + rec.dlign5 + rec.dlign6}
				},
			            'jdatnss', 'dldnss', 'ccodro_lib'],
		
		});
	

/*Ext.Ajax.request({

        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=1",

        method: 'GET',   
        //params: params,
        success: function(response) {
            console.log(response.responseText);
			console.log(rowIndex);
            var result = eval(response.responseText);
			console.log(result.length);
            codedroitreel = result[0].ccodro;
			
            compteproprietaire = result[0].dnupro;
			
            nomdusage = result[0].dnomlp;
			
            prenomdusage = result[0].dprnlp;
			
            mentioncomplement = result[0].expnee;
			
            nomcomplement = result[0].dnomcp;
			
            prenomcomplement = result[0].dprncp;
			
            adressehabitation = result[0].dlign3 + result[0].dlign4+ result[0].dlign5 + result[0].dlign6;
			
           datenaissance = result[0].jdatnss ;
		   
           lieunaissance = result[0].dldnss ;
		   
           libellecodedroitreel = result[0].ccpdro_lib ;
			           
			FiucProprietaireData = [{codedroitreel,compteproprietaire,nomdusage,prenomdusage,mentioncomplement,nomcomplement,prenomcomplement,adressehabitation,datenaissance,lieunaissance,libellecodedroitreel}];
             console.log(FiucProprietaireData);
            FiucProprietaireStore.loadData(FiucProprietaireData,false);
			
            //data : FiucProprietaireData;
        }
    });  			
*/
    var proprietaireDownloadPdfButton = new Ext.ButtonGroup({
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
                sortable : false,
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
                dataIndex : 'expnee'
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

		
        fields : [ 'dniv', 'dpor','cconlc_lib', 'dvlrt', 'jdatat', 'dnupro', 'dnomlp', 'dprnlp','epxnee','dnomcp','dprncp'],
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
    ],
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : false,
            },
            columns : [ {

                header : '',
                // selModel: sm,
                width : 50,
                dataIndex : 'col1'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.batiment_niveau'),
                dataIndex : 'dniv'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.batiment_porte'),
                dataIndex : 'dpor'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.batiment_type'),
                dataIndex : 'cconlc_lib'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.batiment_date'),
                dataIndex : 'jdatat'
            }, {
                header : OpenLayers.i18n('cadastrapp.duc.batiment_revenu'),
                dataIndex : 'dvlrt'
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
                header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                dataIndex : 'epxnee'

            }, {
                header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                dataIndex : 'dnomcp'

            }, {
                header : OpenLayers.i18n('cadastrapp.duc.prenom'),
                dataIndex : 'dprncp'

            } ]
        })
    });

    // ONGLET 4
 /*   var FiucSubdivfiscData = [ [ 'Lettre indicative', '067AP' ],
            [ 'Contenance', '067AP' ], [ 'Nature de culture', '067AP' ],
            [ 'Revenu au 01-01', '067AP' ] ];*/
    var FiucSubdivfiscStore = new Ext.data.JsonStore({
		autoLoad : true,
		 
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=3",
        method: 'GET',
        fields : [  'ccosub','dcntsf ','grnum_lib','drcsub'],
          });
					
/*		 Ext.Ajax.request({
 
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=3",
        method: 'GET',
   
        //params: params,
        success: function(response) {
            //console.log(response.responseText);
            var result = eval(response.responseText);
			lettreindic = result[0].ccosub;
			
            contenance = result[0].dcntsf;
			
            terrain = result[0].grnum_lib;
			
            revenu = result[0].drcsub;

            //console.log(lettreindic);
           
            FiucSubdivData =[{
										name : 'lettreindic',
										name : 'contenance',
										name : 'terrain',
										name : ' revenu' }
									];
            FiucSubdivfiscStore.loadData(FiucSubdivData,false);
			
             data : FiucSubdivData;
			 
		}

    });*/
    
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
            sortable : false,
            },
			

           columns : [
                  {header: "Lettre indicative", dataIndex: 'ccosub'},
                  {header: "Contenance", dataIndex: 'dcntsf'},
                  {header: "Nature de culture", dataIndex: 'grnum_lib'},
                  {header: "Revenu au 01/01", dataIndex: 'drcsub'},
            ]
        }),

    });

    // ONGLET 5

    var FiucHistomutStore = new Ext.data.ArrayStore({
		autoLoad : true,
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=4",
        method: 'GET',
        fields : [  'jdatat',
				{   name : 'referenceparcelle',
			        convert : function (v, rec) {return  rec.ccocom   + ' '+rec.ccoprem  + ' '+rec.ccosecm  + ' '+ rec.dnuplam}
				},'type_filiation',]

				});
/*		 Ext.Ajax.request({
 
        url: getWebappURL() + 'getFIC?parcelle='+parcelleId+"&onglet=4",
        method: 'GET',
   
        //params: params,
        success: function(response) {
            console.log(response.responseText);
            var result = eval(response.responseText);
			dateacte = result[0].jdatat;
			
            referenceparcelle = result[0].ccocom  + ' ' +result[0].ccoprem +' '+result[0].ccosecm +' '+result[0].dnuplam;
			
            typemutation = result[0].type_filiation;
           
            FiucHistomutData =[{
										name : 'lettreindic',
										name : 'contenance',
										name : 'terrain',
										name : ' revenu' }
									];
            FiucHistomutStore.loadData(FiucHistomutData,false);
			
             data : FiucHistomutData
			}
			 
		});*/
			


    var FiucHistomutGrid = new Ext.grid.GridPanel({
        store : FiucHistomutStore,
        stateful : true,
        height : 500,
        name : 'Fiuc_Historique_Mutation',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : false,
            },
            columns : [ {
                header : OpenLayers.i18n('cadastrapp.duc.dateacte'),
                dataIndex : 'jdatat'
            }, {
                header : "Référence de la parcelle mère",
                dataIndex : 'referenceparcelle'
            }, {
                header : "Type de mutation",
                dataIndex : 'type_filiation'
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
				newGrid.idParcellesOuvertes.splice(index-1,1);
				newGrid.fichesOuvertes.splice(index-1,1);
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
                        // ONGLET 1
                        title : OpenLayers.i18n('cadastrapp.duc.parcelle'),
                        xtype : 'form',
                        items : [ parcelleDownloadPdfButton , FiucParcelleGrid ]
                    },
                    {
                        // ONGLET 2
                        title : OpenLayers.i18n('cadastrapp.duc.propietaire'),
                        xtype : 'form',
                        items : [ proprietaireDownloadPdfButton,
                                FiucProprietairesGrid ]
                    }, {
                        // ONGLET 3
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
                        // ONGLET 4
                        title : OpenLayers.i18n('cadastrapp.duc.subdiv'),
                        xtype : 'form',
                        items : [ FiucSubdivfiscGrid ]

                    }, {
                        // ONGLET 5
                        title : OpenLayers.i18n('cadastrapp.duc.histomut'),
                        xtype : 'form',
                        items : [ FiucHistomutGrid, // grille "historique de
                                                    // mutation"
                        ]
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
    //console.log(proprietaireSelected);

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
    FiucBatimentsStore.loadData(Data);
}

function loadbordereauParcellaire() {

    //console.log("download bordereau function");
    // TODO
    // onClickPrintBordereauParcellaireWindow(parcelleId);
}
