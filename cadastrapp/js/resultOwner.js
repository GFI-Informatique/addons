
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

	var resultProprietaireWindow;

  	/** public: method[onClickRechercheProprietaire]
     *  :param layer: 
     *  Create ...TODO
     */
    addNewResultProprietaire = function(title, result) {
		if (resultProprietaireWindow == null) {
			initResultProprietaire();
		}
		resultProprietaireWindow.show();
		
		var tabs = resultProprietaireWindow.items.items[0];
		var newGrid = new Ext.grid.GridPanel({
			title: title,
			height: 400,
			border: true,
            closable: true,
				
			store: (result!=null) ? result : new Ext.data.Store(),
            
			colModel: new Ext.grid.ColumnModel([
				{
					id:'ccoinsee',
					dataIndex: 'ccoinsee',
					header: OpenLayers.i18n('cadastrapp.proprietaire.result.col1'),
					sortable: true
				},{
					id:'libcom',
					dataIndex: 'libcom',
					header: OpenLayers.i18n('cadastrapp.proprietaire.result.col2'),
					sortable: true
				},{
					id:'libcom_min',
					dataIndex: 'libcom_min',
					header: OpenLayers.i18n('cadastrapp.proprietaire.result.col2'),
					sortable: true
				}]),
		
			viewConfig: {
				deferEmptyText: false,
				emptyText: OpenLayers.i18n('cadastrapp.proprietaire.result.nodata'),
			},
			
			listeners: {
				rowclick: function(grid, rowIndex, columnIndex, e) {
					//on fait une requete pour obtenir la listes des parcelles du proprietaire
					var record = grid.getStore().getAt(rowIndex);
					var proprietaireName = record.data.libcom_min;		//TODO : changer
					var proprietaireId = record.data.ccoinsee;			//TODO : changer
					
					//envoi des données d'une form
					Ext.Ajax.request({
						method: 'GET',
						url:'../cadastrapp/getCommune/ccoinsee_partiel/' + proprietaireId,		//TODO : changer
						success: function(form, action) {
							//creation d'un store en retour
							var store = new Ext.data.JsonStore({
								fields: ['ccoinsee', 'libcom', 'libcom_min'],
								data: Ext.util.JSON.decode(form.responseText)
							});							
							addNewResultParcelle(proprietaireName, store);
						},
						failure: function(form, action) {
							addNewResultParcelle(proprietaireName, null);
						}
					});
				}				
			}
		});
		tabs.insert(0, newGrid);
		tabs.setActiveTab(0);
	}
		
    initResultProprietaire = function() {						
		//fenêtre principale
		resultProprietaireWindow = new Ext.Window({
			title: OpenLayers.i18n('cadastrapp.proprietaire.result.title'),
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
					resultProprietaireWindow = null;
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
						resultProprietaireWindow.close();
					}
				}
			}]
		});
	};