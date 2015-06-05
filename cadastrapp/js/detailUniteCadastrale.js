
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
                                [ 'Commune','350250' ], 
                                [ 'Section','067AP' ] 
                            ];
    var FiucProrietaireData =  [ 'col1','P' , '067AP' ,'067AP' ,'067AP' ,'067AP' ,'067AP' ,'067AP' ,'067AP','067AP','067AP' ];
                            
    var FiucBatimentsData = [ 
                                   [ 'Batiment 1' ], 
                                [ 'Batiment 2' ]
                               ];
    var FiucSubdivfiscData =             [[ 'col1','P' ], 
                                         ['067AP' ,'067AP'],
                                         ['zret','azr']];
    var FiucHistomutData = [[ 'col1','P' ], 
                            ['067AP' ,'067AP'],
                            ['zret','azr']];


    var FiucParcelleStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'designation'
        }, {
            name : 'valeur'
        }, ],
        data : FiucParcelleData
    });


    var FiucProprietaireStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'col1'
        }, {
            name : 'compte'
        }, {
            name : 'nom'
        }, {
            name : 'prenom'
        }, {
            name : 'mentioncpl'
        }, {
            name : 'nomcpl'
        }, {
            name : 'prenomcpl'
        }, {
            name : 'adresse'
        }, {
            name : 'datenaissance'
        }, {
            name : 'lieunaissance'
        }, {
            name : 'cco_lib'
        } ],
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
            name : 'lettreindic'
        }, {
            name : 'contenance'
        }, {
            name : 'terrain'
        }, {
            name : 'revenu'
        }],
        data : FiucSubdivfiscData
    });
      
    var FiucHistomutStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'dateacte'
        }, {
            name : 'reference.parcelle'
        },{
            name : 'type.mutation'
        }],
        data : FiucHistomutData
    });

    //var sm = Ext.create('Ext.selection.CheckboxModel');
          
    FiucParcelleGrid = new Ext.grid.GridPanel({
        store : FiucParcelleStore,
        stateful : true,  
        height : 500,
        title: 'Bordereau parcellaire',
        name : 'Fiuc_Parcelle',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                border : true,
                sortable : false,
            },
            columns : [ {
                header: OpenLayers.i18n('cadastrapp.duc.designation'),
                dataIndex : 'designation'
                }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.valeur'),
                dataIndex : 'valeur'
            }]
        }),

    });
    
    FiucProprietairesGrid = new Ext.grid.GridPanel({
        store : FiucProprietaireStore,
        stateful : true,
        height : 500,
        title: 'Relevé de propriété',
        name : 'Fiuc_Proprietaire',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                border : true,
                sortable : false,
            },
            
            columns : [ 
                {

                header: '',
                //selModel: sm,                
                 width: 50,
                dataIndex : 'col1'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.compte'),
                dataIndex : 'compte'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.nom'),
                dataIndex : 'nom'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.prenom'),
                dataIndex : 'prenom'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.mentioncpl'),
                dataIndex : 'mentioncpl'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.nomcpl'),
                dataIndex : 'nomcpl'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.prenomcpl'),
                dataIndex : 'prenomcpl'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.adresse'),
                dataIndex : 'adresse'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.datenaissance'),
                dataIndex : 'datenaissance'
            }, {
                header: OpenLayers.i18n('cadastrapp.duc.lieunaissance'),
                dataIndex : 'lieunaissance'
            },
                {
                header: OpenLayers.i18n('cadastrapp.duc.cco_lib'),
                dataIndex : 'cco_lib'
            }]
        }),

    });
    
    FiucBatimentsGrid = new Ext.grid.GridPanel({
        store : FiucBatimentsStore,
        stateful : true,
        height : 500,
        title: 'batiment(s)',
        name : 'Fiuc_Batiments',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : false,
            },
            columns : [ {
                header: OpenLayers.i18n('cadastrapp.CoProprietaire'),
                dataIndex : 'batiments'
            }]
        }),

    });
    
    FiucSubdivfiscGrid = new Ext.grid.GridPanel({
        store : FiucSubdivfiscStore,
        stateful : true,
        height : 500,
        name : 'Fiuc_Subdivisions_fiscales',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : false,
            },
            columns : [ {
                header: OpenLayers.i18n('cadastrapp.duc.lettreindic'),
                dataIndex : 'lettreindic'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.contenance'),
                dataIndex : 'contenance'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.terrain'),
                dataIndex : 'terrain'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.revenu'),
                dataIndex : 'revenu'
            }]
        }),

    });

    
    FiucHistomutGrid = new Ext.grid.GridPanel({
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
                header: OpenLayers.i18n('cadastrapp.duc.dateacte'),
                dataIndex : 'dateacte'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.reference_parcelle'),
                dataIndex : 'reference.parcelle'
            }, 
                {
                header: OpenLayers.i18n('cadastrapp.duc.type_mutation'),
                dataIndex : 'type.mutation'
            }]
        }),

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
            labelWidth: 400,
            width: 850,        
            defaults: {autoHeight: true, bodyStyle:'padding:10px', flex: 1},

            listeners: {
                close: function(window) {
                    windowFIUC = null;
                }
            },
            
            items: [{
                autoHeight: true,    
                xtype: 'tabpanel', width:800, height: 800,    
                activeTab: 0,                
                    items: [{
                                //ONGLET 1
                                title: OpenLayers.i18n('cadastrapp.duc.parcelle'),    
                                xtype:'form',
                                items: [
                                    FiucParcelleGrid
                                        ]
                                    },
                                    {
                                //ONGLET 2
                                title: OpenLayers.i18n('cadastrapp.duc.propietaire'),
                                xtype:'form',
                                items: [
                                    FiucProprietairesGrid
                                        ]
                                    },
                                    {
                                //ONGLET 3
                                title: OpenLayers.i18n('cadastrapp.duc.batiment'),
                                xtype:'form',
                                items: [
                                    FiucBatimentsGrid
                                        ]
                                    },
                                    {
                                //ONGLET 4
                                title: OpenLayers.i18n('cadastrapp.duc.subdiv'),
                                xtype:'form',
                                items: [
                                    FiucSubdivfiscGrid
                                        ]

                                    },
                                    {
                                    //ONGLET 5
                                    title:OpenLayers.i18n('cadastrapp.duc.histomut'),
                                    xtype:'form',                    
                                    items: [
                                            FiucHistomutGrid,    //grille "historique de mutation"
                                            ]
                                    }]
                                }]
            
            });
        windowFIUC.show();
    console.log("displayFIUC onClick")
    };
	
	
