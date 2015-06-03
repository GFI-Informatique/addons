
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")


  	 /** public: method[onClickDisplayFIUC]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickDisplayFIUC = function(){
		//déclaration des variables relatives aux données cadastrales
		var ccodep, ccodir, ccocom, gcopre, ccosec, dnupla, dnupro, dnomlp, dprnlp, expnee, dnomcp, dprncp, adressehabitation , jdatnss , dldnss, ccodro_lib, dnvoiri, dindic, natvoiriv_lib, dvoilib, dcntpa, supf, gparbat, gurbpa;
		var dniv, dpor, cconlc_lib, dvlrt, jdatat, dnupro, dnomlp, dprnlp, expnee, dnomcp, dprncp
		
		//variable userrole: niveau de droits de l'utilisateur
		var userrole;
		

    var FiucParcelleData = [ 
								[ 'Parcelle 1' ], 
                                [ 'Parcelle 2' ]
                               ];
    var FiucProrietaireData = [ 
  								 [ 'Proprietaire 1' ], 
                                 [ 'Proprietaire 2' ]
                               ];
    var FiucBatimentsData = [ 
   								[ 'Batiment 1' ], 
                                [ 'Batiment 2' ]
                               ];
    var FiucSubdivfiscData = [ 
 								 [ 'Subdivision fiscale 1' ], 
                                 [ 'Subdivision fiscale 2' ]
                               ];
    var FiucHistomutData = [ 
								 [ 'Histo 1' ], 
                                 [ 'Histo 2' ]
                               ];


    var FiucParcelleStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'parcelle'
        }],
        data : FiucParcelleData
    });


    var FiucProprietaireStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'proprietaire'
        }],
        data : FiucProrietaireData
    });
  	
    var FiucBatimentsStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'batiments'
        }],
        data : FiucBatimentsData
    });
  	
    var FiucSubdivfiscStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'subdivfisc'
        }],
        data : FiucSubdivfiscData
    });
  	
    var FiucHistomutStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'histomutations'
        }],
        data : FiucHistomutData
    });
  		
    FiucParcelleGrid = new Ext.grid.GridPanel({
        store : FiucParcelleStore,
        stateful : true,
        name : 'Fiuc_Parcelle',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
            	header: OpenLayers.i18n('cadastrapp.bordereau.parcellaire'),
                width : 150,
                dataIndex : 'parcelle'
            }],
        }),
        height : 100,
        width : 150,
        border : true,
    });
	
    FiucProprietairesGrid = new Ext.grid.GridPanel({
        store : FiucProprietaireStore,
        stateful : true,
        name : 'Fiuc_Proprietaire',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
            	header: OpenLayers.i18n('cadastrapp.CoProprietaire'),
                width : 150,
                dataIndex : 'proprietaire'
            }, ],
        }),
        height : 100,
        width : 150,
        border : true,
    });
	
    FiucBatimentsGrid = new Ext.grid.GridPanel({
        store : FiucBatimentsStore,
        stateful : true,
        name : 'Fiuc_Batiments',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
            	header: OpenLayers.i18n('cadastrapp.CoProprietaire'),
                width : 150,
                dataIndex : 'batiments'
            }, ],
        }),
        height : 100,
        width : 150,
        border : true,
    });
	
    FiucSubdivfiscGrid = new Ext.grid.GridPanel({
        store : FiucSubdivfiscStore,
        stateful : true,
        name : 'Fiuc_Subdivisions_fiscales',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
            	header: OpenLayers.i18n('cadastrapp.CoProprietaire'),
                width : 150,
                dataIndex : 'subdivisions_fiscales'
            }, ],
        }),
        height : 100,
        width : 150,
        border : true,
    });

	
    FiucHistomutGrid = new Ext.grid.GridPanel({
        store : FiucHistomutStore,
        stateful : true,
        name : 'Fiuc_Historique_Mutation',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
            	header: OpenLayers.i18n('cadastrapp.CoProprietaire'),
                width : 150,
                dataIndex : 'historique_mutation'
            }, ],
        }),
        height : 100,
        width : 150,
        border : true,
    });

					

  		//Construction de la fenêtre principale
		var windowFIUC;
			windowFIUC = new Ext.Window({
            title: 'TODO',
			frame: true,
			autoScroll:true,
			minimizable: false,
			closable: true,
			resizable: false,
			draggable : true,
			constrainHeader: true,
			
			border:false,
			labelWidth: 100,
			width: 450,
			defaults: {autoHeight: true, bodyStyle:'padding:10px', flex: 1},

			listeners: {
				close(window) {
					windowFIUC = null;
				}
			},
			
			items: [{

				xtype: 'tabpanel', width:600, height: 600,	
				activeTab: 0,				
					items: [{
					//ONGLET 1
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab1'),
					xtype:'form',
					items: [
						FiucParcelleGrid
							]
						},{
					//ONGLET 2
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab1'),
					xtype:'form',
					items: [
						FiucProprietairesGrid
							]
						},{
					//ONGLET 3
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab1'),
					xtype:'form',
					items: [
						FiucBatimentsGrid
							]
						},{
					//ONGLET 4
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab1'),
					xtype:'form',
					items: [
						FiucSubdivfiscGrid
							]

						},
						{
						//ONGLET 5
						title:'Historique de mutation',
						id: 'Form5',
						xtype: 'form',						
						items: [
								FiucHistomutGrid,	//grille "historique de mutation"
								]
						}]
					}]
			
			});
		windowFIUC.show();
    console.log("displayFIUC onClick")
	};
	
	
