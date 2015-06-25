
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

	//type de grille spécifique :
	//detailParcelles : liste des fenetres filles ouvertes
	GEOR.ResultParcelleGrid = Ext.extend(Ext.grid.GridPanel, {
		detailParcelles: new Array()
	});


	var resultParcelleWindow;
	var tabCounter = 1;

  	/** public: method[onClickRechercheProprietaire]
     *  :param layer: 
     *  Create ...TODO
     */
	addNewResultParcelle = function(title, result) {
		addNewResult(title, result, OpenLayers.i18n('cadastrapp.parcelle.result.nodata'));
	}
	
	addVoidResultParcelle = function() {
		addNewResult(OpenLayers.i18n('cadastrapp.parcelle.result.selection.title'), null, OpenLayers.i18n('cadastrapp.parcelle.result.selection.content'));
	}
	
    addNewResult = function(title, result, message) {
		if (resultParcelleWindow == null) {
			initResultParcelle();
		}
		resultParcelleWindow.show();
		
		tabs = resultParcelleWindow.items.items[0];
		tabCounter = tabCounter+1;
		
		newGrid = new GEOR.ResultParcelleGrid({
			title: title,
			id: 'resultParcelleWindowTab'+tabCounter,
			height: 300,
			border: true,
            closable: true,
			
			store: (result!=null) ? result : new Ext.data.Store(),
	        
			colModel: getResultParcelleColModel(),
				
			viewConfig: {
				deferEmptyText: false,
				emptyText: message
			},
			
			listeners: {
				close: function(grid) {
					//on ferme toutes les fenetres filles : detail parcelle
					for	(var index = 0; index < grid.detailParcelles.length; index++) {
						if (grid.detailParcelles[index] != undefined) {
							grid.detailParcelles[index].close();
						}
					}
					//on ferme la fenetre si c'est le dernier onglet
					if (tabs.items.length==2) {
						//si il ne reste que cet onglet et l'onglet '+', fermer la fenetre
						resultParcelleWindow.close();
					} else {
						//on selectionne manuellement le nouvel onglet à activer, pour eviter de tomber sur le '+' (qui va tenter de refaire un onglet et ça va faire nimporte quoi)
						var index = tabs.items.findIndex('id', grid.id);
						tabs.setActiveTab((index==0) ? 1 : (index-1));
					}
					
					

				}
			}
		
		});
		newGrid.addListener("rowclick",function(grid, rowIndex, e) {
					if (windowFIUC)
						windowFIUC.close();
					//on ouvre une fenetre : detail parcelle
				    var record = grid.getStore().getAt(rowIndex);
					grid.detailParcelles.push(
							//TODO : cf. alert
							onClickDisplayFIUC(record.data.parcelle)
							//displayDetailParcelle(record.data.parcelle)
					);
					//*****************************************
					// on modifie le style de la parcelle selectionnée
					var feature = getFeatureById(record.data.parcelle);
					if (feature){
					feature.state = 2;
					selectLayer.drawFeature(feature);
					}else 
						console.log("pas d'entité trouvée dans la base avec ce numero")
					//*****************************************

					//alert('TODO : appeler la methode qui ouvre la fenetre de détail de la parcelle (qui doit retourner l objet Window)');
		});
		var parcelle;
		for(var i=0; i<newGrid.getStore().totalLength; i++) {
			parcelle = newGrid.getStore().getAt(i);
			getFeaturesWFSAttribute(parcelle.data.parcelle);
		}
		
		tabs.insert(0, newGrid);
		tabs.setActiveTab(0);
	}
    
    
    initResultParcelle = function() {						
		//fenêtre principale
    	resultParcelleWindow = new Ext.Window({
			title: OpenLayers.i18n('cadastrapp.parcelle.result.title'),
			frame: true,
			autoScroll:true,
			minimizable: false,
			closable: true,
			resizable: true,
			draggable : true,
			constrainHeader: true,
			
			border:false,
			width: 600,
			defaults: {autoHeight:true},
			
			listeners: {
				close: function(window) {
					
					//*********************
					// remettre le style de la couche à zero
					clearLayerSelection();
					newGrid.getSelectionModel().clearSelections();
					//*********************
					resultParcelleWindow = null;
				}
			},
			
			items: [
			{
				xtype:'tabpanel',
				
				items: [{
					xtype: 'panel',
					title: '+',
					border: true,
					closable: false,
					
					listeners: {
						activate: function(grid) {
							addVoidResultParcelle();
						}
					}
				}]
			}],
			
			buttons: [
			{
				text: OpenLayers.i18n('cadastrapp.close'),
				listeners: {
					click: function(b,e) {
						resultParcelleWindow.close();
					}
				}
			}]
		});
	};