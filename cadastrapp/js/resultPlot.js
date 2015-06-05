
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
			height: 300,
			border: true,
            closable: true,
			
			store: (result!=null) ? result : new Ext.data.Store(),
	        
			colModel: new Ext.grid.ColumnModel([
				{
					id:'ccoinsee',
					dataIndex: 'ccoinsee',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.commune'),
					sortable: true
				},
				{
					id:'ccosec',
					dataIndex: 'ccosec',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.ccosec'),
					sortable: true
				},
				{
					id:'dnupla',
					dataIndex: 'dnupla',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.dnupla'),
					sortable: true
				},
				{
					id:'adresse',
					dataIndex: 'adresse',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.adresse'),
					sortable: true
				},
				{
					id:'surface',
					dataIndex: 'surface',
					header: OpenLayers.i18n('cadastrapp.parcelle.result.surface'),
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
					grid.detailParcelles.push(
							//TEST
							//displayDetailParcelle(record.data.parcelle)
					);
					alert('TODO : appeler la methode qui ouvre la fenetre de détail de la parcelle (qui doit retourner l objet Window)');
				},
				close: function(grid) {
					//on ferme toutes les fenetres filles : detail parcelle
					for	(var index = 0; index < grid.detailParcelles.length; index++) {
						if (grid.detailParcelles[index] != undefined) {
							grid.detailParcelles[index].close();
						}
					}
					//on ferme la fenetre si c'est le dernier onglet
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