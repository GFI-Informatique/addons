
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
            
			colModel: new Ext.grid.ColumnModel([
				{
					id:'ccoinsee',
					dataIndex: 'ccoinsee',
					header: 'Code INSEE',
					sortable: true
				},{
					id:'libcom_min',
					dataIndex: 'libcom_min',
					header: 'Nom Commune',
					sortable: true
				}]),
				
			//store: (result!=null) ? result : new Ext.data.Store(),
			store: (result!=null) ? result : new Ext.data.JsonStore({
				fields : ['ccoinsee', 'libcom_min'],
				data   : [
					{ccoinsee: '63001',  libcom_min: 'Ville Test 1'},
					{ccoinsee: '63002', libcom_min: 'Ville Test 2'}
				]
			}),
		
			viewConfig: {
				deferEmptyText: false,
				emptyText: 'Aucune données',
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
			title: 'Séléction de propriétaires',
			frame: true,
			autoScroll:true,
			minimizable: true,
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
				text: 'Fermer',
				listeners: {
					click: function(b,e) {
						resultProprietaireWindow.close();
					}
				}
			}]
		});
	};