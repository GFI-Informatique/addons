/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

/**
 * onClickdisplayFIUF
 * 
 * @param layer: parcelleId
 * Cette methode construit la fiche d'information foncière pour une parcelle donnée
 * dont d'identifiant est parcelleId
 * Elle permet également l'export au format pdf de la fiche d'information foncière
 * @return Test
 */
onClickDisplayFIUF = function(parcelleId) {
    var windowFIUF, parcelleGrid;

 //   var FiufGlobalInfosData = [ [ 'Surface DGFIP', "1420" ],
 //           [ 'Surface SIG', "1423" ], [ 'Surface batie', "200" ] ];
    
    // Declaration des donnees globales
    var FiufGlobalInfosData = 	[];

    // Declaration des donnees propprietaires
    var FiufProprietaireData = [ [ 'Proprietaire 1' ], [ 'Proprietaire 2' ] ];
    
    // Declaration des donnees de liste de parcelles
    var FiufParcelleListData = [ [ '38852 2225 22', '255','201',"1 Rue louis 1"], 
                                 [ '38852 2225 22', '255','201',"1 Rue louis 1"],
                                 [ '38852 2225 22', '255','201',"1 Rue louis 1"] ];
	
    // Declaration des variables 							 
	var surfaceDGFiP ='';
	var surfaceSIG ='';
	var surfaceBatie ='';

	// Déclaration du bouton d'export PDF de la fiche d'unité foncière
	var exportPdfFiufButton = new ext.ButtonGroup({
		bodyBorder: false,
		border: false,
		hideBorders: false,
		frame: false,
		items:[{
			xtype: 'button',
			scale: 'small',
			name: 'Export pdf',
			iconCls: "pdf-button",
			handler: function() {
				// TODO: call createPdfUF
			}						
		}]	
		
	});
	
	// Modele de donnees informations globales de la parcelle
	var FiufGlobalInfosStore =new Ext.data.ArrayStore({
	fields : [ {
		name : 'uniteFonciere'
		}, {
		name : 'surface',
		type : 'float'
		}, ],
	data : FiufGlobalInfosData
	});
		
	//Requete Ajax pour chercher dans la webapp les donnees relative à la parcelle
	// TODO requete getFIUF a completer
	Ext.Ajax.request({
        url: getWebappURL() + 'getFIUF?parcelle='+parcelleId+"&detail=1",
        method: 'GET',   
        //Evaluation de la reponse et memorisation des champs
        //params: response,
        success: function(response) {
        	//console.log(response.responseText);
            var result = eval(response.responseText);
            
            // Les champs retournés par la webapp sont mis dans 
            // les variables correspondantes
            surfaceDGFiP = result[0].dcntpa_sum;			
            surfaceSIG = result[0].sigcal_sum;			
            surfaceBatie = result[0].batical_sum;
           
            //Preparation du tableau de donnees
            FiufGlobalInfosData = [[ 'Unite Fonciere', surfaceDGFiP ],
                                 [ ' Surface SIG', surfaceSIG ],
                                 [ 'Surface Batie', surfaceBatie ],
								];
            //Chargement dans le store correspondant
            FiufGlobalInfosStore.loadData(FiufGlobalInfosData,false);
			data : FiufGlobalInfosData;
			        
        }
    }); 
	
	// Modele de donnes relatif à la liste des coproprietaires
	// TODO a modifier
    var FiufProprietaireStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'proprietaire'
        } ],
        data : FiufProprietaireData
    });
    
/*  // 
 * 	// TODO	
 * Modele de donnes relatif aux listes de parcelles
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
    });*/
    // Modele de donnes relatif aux listes de parcelles
    var FiufParcelleListStore = new Ext.data.JsonStore({
    	
    	// Appel a la webapp
    	url: getWebappURL()+'getFIUF?parcelle='+parcelleId+"&detail=1",
    	autoLoad : true,
    	fields : [
            'comptecommunal',
            'dcntpa_sum',
            'sigcal_sum',
            'adressepostale'
            ],
        
        data : FiufParcelleListData
    });
    // Declaration et construction du tableau informations globales de la parcelle
    // Tableau composé des colonnes 'unité foncière' et 'surface'
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

    // Declaration et construction du tableau des coproprietaires
    // Composé d'une seule colonne: co-proprietaires
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

    // Declaration et construction du tableau de liste de parcelles
    // Comprend les colonnes 'parcelle', 'surface DGFiP','Surface SIG' et 'Adresse postale'
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
                    	// colonne parcelle
                        header : OpenLayers.i18n('cadastrapp.parcelle'),
                        width : 100,
                        dataIndex : 'comptecommunal'
                    },
                    {
                    	// colonne surface DGFiP
                        header : OpenLayers.i18n('cadastrapp.surface') + " "
                                + OpenLayers.i18n('cadastrapp.parcelle.DGFiP'),
                        width : 50,
                        dataIndex : 'dcntpa_sum'
                    },
                    {
                    	// colonne surface SIG
                        header : OpenLayers.i18n('cadastrapp.surface') + " "
                                + OpenLayers.i18n('cadastrapp.parcelle.SIG'),
                        width : 50,
                        dataIndex : 'sigcal_sum'
                    }, {
                    	//colonne adresse postale
                        header : OpenLayers.i18n('cadastrapp.adresse_postale'),
                        width : 200,
                        dataIndex : 'adressepostale'
                    } ],
        }),
        height : 100,
        width : 450,
        border : true,
    });

    // Declaration et creation de la fenetre principale
    // Comprend les tableaux 'unite fonciere', 'coproprietaires' et 'liste des parcelles
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

            items : [[ 
                      FiufGlobalInfosGrid, 
                      FiufProprietaireGrid,
                      
                    ],[exportPdfFiufButton]]
        }, 
            FiufParcelleListGrid 
        ],
		// AJOUT HAMZA
		listeners : {
            close : function(window) {
				// deselection de la ligne
				var rowIndex = indexRowParcelle(parcelleId);
				newGrid.getSelectionModel().deselectRow(rowIndex);
				// mise Ã  jour des tableau de fenÃªtres ouvertes
				var index =newGrid.idParcellesFOuvertes.indexOf(parcelleId);
				newGrid.idParcellesFOuvertes.splice(index,1);
				newGrid.fichesFOuvertes.splice(index,1);
				var feature = getFeatureById(parcelleId);
				if (feature)
					changeStateFeature(feature, -1, "yellow");
				closeWindowFIUC(parcelleId,newGrid);	// on ferme la fenÃªtre cadastrale si ouverte 
					
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
