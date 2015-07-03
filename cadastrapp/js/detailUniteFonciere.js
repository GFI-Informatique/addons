/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

/**
 * public: method[onClickdisplayFIUF] :param layer: Create ...TODO
 */
onClickDisplayFIUF = function(parcelleId) {
    var windowFIUF, parcelleGrid;

 //   var FiufGlobalInfosData = [ [ 'Surface DGFIP', "1420" ],
 //           [ 'Surface SIG', "1423" ], [ 'Surface batie', "200" ] ];
 
    var FiufGlobalInfosData = 	[];

    var FiufProprietaireData = [ [ 'Proprietaire 1' ], [ 'Proprietaire 2' ] ];
    var FiufParcelleListData = [ [ '38852 2225 22', '255','201',"1 Rue louis 1"], 
                                 [ '38852 2225 22', '255','201',"1 Rue louis 1"],
                                 [ '38852 2225 22', '255','201',"1 Rue louis 1"] ];
								 
	var surfaceDGFiP ='';
	var surfaceSIG ='';
	var surfaceBatie ='';

	
	var FiufGlobalInfosStore =new Ext.data.ArrayStore({
			fields : [ {
				name : 'uniteFonciere'
			}, {
				name : 'surface',
				type : 'float'
			}, ],
			data : FiufGlobalInfosData
         });
					
		 Ext.Ajax.request({
        url: getWebappURL() + 'getFIUF?parcelle='+parcelleId+"&detail=1",
        method: 'GET',   
        //params: params,
        success: function(response) {
            //console.log(response.responseText);
            var result = eval(response.responseText);
            surfaceDGFiP = result[0].dcntpa_sum;
			
            surfaceSIG = result[0].sigcal_sum;
			
            surfaceBatie = result[0].batical_sum;
			
 
            //console.log(commune);
           
            FiufGlobalInfosData = [[ 'Unite Fonciere', surfaceDGFiP ],
                                 [ ' Surface SIG', surfaceSIG ],
                                 [ 'Surface Batie', surfaceBatie ],
								];
            FiufGlobalInfosStore.loadData(FiufGlobalInfosData,false);
			
            data : FiufGlobalInfosData;
			 
			//titre de la fenetre
			//titleFIUC =result[0].ccodep + result[0].ccodir + result[0].ccocom + '-'+result[0].ccopre + result[0].ccosec+'-'+result[0].dnupla;
            console.log(titleFIUC);         
        }
    }); 

    var FiufProprietaireStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'proprietaire'
        } ],
        data : FiufProprietaireData
    });
    
    var FiufParcelleListStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'parcelle',
            type : 'string',
        }, 
        {
            name : 'surfacedgfip',
            type : 'string'
        },
        {
            name : 'surfacesig',
            type : 'string'
        },
        {
            name : 'adresse',
            type : 'string'
        },],
        
        data : FiufParcelleListData
    });

    FiufGlobalInfosGrid = new Ext.grid.GridPanel({
        store : FiufGlobalInfosStore,
        stateful : true,
        name : 'FIUF_globalInformations',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : false,
            },
            columns : [ {
                header : OpenLayers.i18n('cadastrapp.uniteFonciere'),
                width : 100,
                dataIndex : 'uniteFonciere'
            }, {
                header : OpenLayers.i18n('cadastrapp.surface'),
                width : 100,
                renderer : Ext.util.Format.numberRenderer('0,000.00 m'),
                dataIndex : 'surface'
            }, ],
        }),
        height : 100,
        width : 200,
        border : true,
    });

    FiufProprietaireGrid = new Ext.grid.GridPanel({
        store : FiufProprietaireStore,
        stateful : true,
        name : 'Fiuf_Proprietaire',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
                header : OpenLayers.i18n('cadastrapp.CoProprietaire'),
                width : 150,
                dataIndex : 'proprietaire'
            }, ],
        }),
        height : 100,
        width : 150,
        border : true,
    });

    FiufParcelleListGrid = new Ext.grid.GridPanel({
        store : FiufParcelleListStore,
        stateful : true,
        name : 'Fiuf_ParcelleList',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [
                    {
                        header : OpenLayers.i18n('cadastrapp.parcelle'),
                        width : 100,
                        dataIndex : 'parcelle'
                    },
                    {
                        header : OpenLayers.i18n('cadastrapp.surface') + " "
                                + OpenLayers.i18n('cadastrapp.parcelle.DGFIP'),
                        width : 50,
                        dataIndex : 'surfacedgfip'
                    },
                    {
                        header : OpenLayers.i18n('cadastrapp.surface') + " "
                                + OpenLayers.i18n('cadastrapp.parcelle.SIG'),
                        width : 50,
                        dataIndex : 'surfacesig'
                    }, {
                        header : OpenLayers.i18n('cadastrapp.adresse_postale'),
                        width : 200,
                        dataIndex : 'adresse'
                    } ],
        }),
        height : 100,
        width : 450,
        border : true,
    });

    FiufDownloadPdfButton = new Ext.Button({
        name : 'FiufDownloadPdfButton',
        cls : "pdf_button"
        
    });
    windowFIUF = new Ext.Window({
        title : parcelleId,
        frame : true,
        bodyPadding : 10,
        autoScroll : true,
        width : 600,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,

        items : [ {
            xtype : 'compositefield',
            margins : {
                right : 10,
                left : 10
            },

            items : [ 
                      FiufGlobalInfosGrid, 
                      FiufProprietaireGrid,
                      FiufDownloadPdfButton
                    ]
        }, 
            FiufParcelleListGrid 
        ],
		// AJOUT HAMZA
		listeners : {
            close : function(window) {
				// deselection de la ligne
				var rowIndex = indexRowParcelle(parcelleId);
				newGrid.getSelectionModel().deselectRow(rowIndex);
				// mise à jour des tableau de fenêtres ouvertes
				var index =newGrid.idParcellesFOuvertes.indexOf(parcelleId);
				newGrid.idParcellesFOuvertes.splice(index,1);
				newGrid.fichesFOuvertes.splice(index,1);
				var feature = getFeatureById(parcelleId);
				if (feature)
					changeStateFeature(feature, -1, "yellow");
				closeWindowFIUC(parcelleId,newGrid);	// on ferme la fenêtre cadastrale si ouverte 
					
                windowFIUF = null;
            }
        },
		// FIN AJOUT
        buttons: [
                  {
                      text: "Seletionner toutes les parcelles",
                      listeners: {
                          click: function(b,e) {
                        	  windowFIUF.close();
                          }
                      }
                  }]

    });
	newGrid.fichesFOuvertes.push(windowFIUF);
	newGrid.idParcellesFOuvertes.push(parcelleId);
    windowFIUF.show();
    //console.log("displayFIUF onClick")
};
;
