
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

  	/** public: method[onClickRechercheProprietaire]
     *  :param layer: 
     *  Create ...TODO
     */
    addNewResultParcelle = function(title, result) {
		if (resultParcelleWindow == null) {
			initResultParcelle();
		}
		resultParcelleWindow.show();
		
		var tabs = resultParcelleWindow.items.items[0];
		var newGrid = new GEOR.ResultParcelleGrid({
			title: title,
			height: 400,
			border: true,
            closable: true,
			
			//store: (result!=null) ? result : new Ext.data.Store(),
			store: (result!=null) ? result : new Ext.data.JsonStore({
				fields : ['ccoinsee', 'libcom_min'],
				data   : [
					{ccoinsee: '01234',  libcom_min: 'Ville Test 1'},
					{ccoinsee: '56789', libcom_min: 'Ville Test 2'}
				]
			}),
	        
			colModel: new Ext.grid.ColumnModel([
				{
					id:'ccoinsee',
					dataIndex: 'ccoinsee',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.col1'),
					sortable: true
				},{
					id:'libcom_min',
					dataIndex: 'libcom_min',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.col1'),
					sortable: true
				}]),
				
			viewConfig: {
				deferEmptyText: false,
				emptyText: OpenLayers.i18n('cadastrapp.parcelle.result.nodata')
			},
			
			listeners: {
				rowclick: function(grid, rowIndex, e) {
					//on ouvre une fenetre : detail parcelle
				    var record = grid.getStore().getAt(rowIndex);
					grid.detailParcelles.push(displayDetailParcelle(record.data.ccoinsee));
				},
				close: function(grid) {
					//on ferme toutes les fenetres filles : detail parcelle
					for	(var index = 0; index < grid.detailParcelles.length; index++) {
						if (grid.detailParcelles[index] != undefined) {
							grid.detailParcelles[index].close();
						}
					}
					//on ferme la fenetre si c'est le derneir onglet
					if (tabs.items.length==1) {
						resultParcelleWindow.close();
					}
				}
			}
		
		});
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
			resizable: false,
			draggable : true,
			constrainHeader: true,
			
			border:false,
			width: 600,
			defaults: {autoHeight:true},
			
			listeners: {
				close: function(window) {
					resultParcelleWindow = null;
				}
			},
			
			items: [
			{
				xtype:'tabpanel'
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