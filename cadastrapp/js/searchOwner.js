
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

	var proprietaireWindow;

  	/** public: method[onClickRechercheProprietaire]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickRechercheProprietaire1 = function() {
		if (proprietaireWindow == null) {
			initRechercheProprietaire();
		}
		proprietaireWindow.show();
		proprietaireWindow.items.items[0].setActiveTab(0);
	}
	
    onClickRechercheProprietaire2 = function() {
		if (proprietaireWindow == null) {
			initRechercheProprietaire();
		}
		proprietaireWindow.show();
		proprietaireWindow.items.items[0].setActiveTab(1);
	}
	
    initRechercheProprietaire = function(){
		var propCityStore, propCityCombo1, propCityCombo2, proprietaireGrid;
				
		propCityStore = getCityStore();

		//comboboxes "villes"
		propCityCombo1 = new Ext.form.ComboBox({
			fieldLabel: OpenLayers.i18n('cadastrapp.proprietaire.city'),
			name: 'city',
            allowBlank:false,
			width: 300,
			mode: 'local',
			value: '',
			forceSelection: true,
			editable: true,
			displayField: 'displayname',
			valueField: 'ccoinsee',
			store: getPartialCityStore(),
			listeners: {
				beforequery: function(q){  
			    	if (q.query) {
		                var length = q.query.length;
		                if (length==3) {
		                	if (isNaN(q.query)) {
		                		//recherche par nom de ville
		                		q.combo.getStore().load({params: {libcom_partiel: q.query}});
		                	} else {
		                		//recherche par code insee
		                		q.combo.getStore().load({params: {ccoinsee_partiel: q.query}});
		                	}		                	
		                } else if (length < 3) {
		                	q.combo.getStore().loadData([],false);
		                }
		                q.query = new RegExp(Ext.escapeRe(q.query), 'i');
		                q.query.length = length;
		            }
			    }
			}
		});	
		
		propCityCombo2 = new Ext.form.ComboBox({
			fieldLabel: OpenLayers.i18n('cadastrapp.proprietaire.city'),
			name: 'city',
            allowBlank:false,
			width: 300,
			mode: 'local',
			value: '',
			forceSelection: true,
			editable: true,
			displayField: 'displayname',
			valueField: 'ccoinsee',
			store: propCityStore,
			listeners: {
			    beforequery: function(q){  
			    	if (q.query) {
		                var length = q.query.length;
		                q.query = new RegExp(Ext.escapeRe(q.query), 'i');
		                q.query.length = length;
		            }
			    },
				change: function(combo, newValue, oldValue) {
					//refaire le section store pour cette ville						
					proprietaireGrid.reconfigure(getVoidProprietaireStore(), getProprietaireColModel(newValue));
					proprietaireWindow.buttons[0].enable();
				}
			}
		});			
		
		//grille "proprietaires"
		proprietaireGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: OpenLayers.i18n('cadastrapp.proprietaire.proprietaires'),
			name: 'proprietaires',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: getVoidProprietaireStore(),
			cm: getProprietaireColModel(''),
			autoExpandColumn: 'proprietaire',
			height: 100,
			width: 300,
			border: true,
			listeners: {
				beforeedit: function(e) {
					if (e.column == 0) {
						//pas d'edition de section si aucune ville selectionnée
						if (propCityCombo2.value == '') return false;
					}
				},
				afteredit: function(e) {
					var lastIndex = e.grid.store.getCount()-1;
					var lastData = e.grid.store.getAt(e.grid.store.getCount()-1).data;
					
					if (lastData.proprietaire!='') {
						var p = new e.grid.store.recordType({proprietaire:''}); // create new record
						e.grid.stopEditing();
						e.grid.store.add(p); // insert a new record into the store (also see add)
						this.startEditing(e.row + 1, 0);
					}
				}
			}
		});
		
				
		//fenêtre principale
		proprietaireWindow = new Ext.Window({
			title: OpenLayers.i18n('cadastrapp.proprietaire.title'),
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
				close: function(window) {
					proprietaireWindow = null;
				}
			},
			
			items: [
			{
				xtype:'tabpanel',
				activeTab: 0,
				
				items:[{
				
					//ONGLET 1
					id: 'propFirstForm',
					xtype: 'form',
					title: OpenLayers.i18n('cadastrapp.proprietaire.title.tab1'),
					defaultType: 'displayfield',
					height: 200,
								
					items: [
					propCityCombo1,
					{
						value: OpenLayers.i18n('cadastrapp.proprietaire.city.exemple'),
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'textfield',
						fieldLabel: OpenLayers.i18n('cadastrapp.proprietaire.lastname'),
						name: 'lastname',
			            allowBlank:false,
						width: 300
					},
					{
						value: OpenLayers.i18n('cadastrapp.proprietaire.lastname.exemple'),
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'textfield',
						fieldLabel: OpenLayers.i18n('cadastrapp.proprietaire.firstname'),
						name: 'firstname',
						width: 300
					},
					{
						value: OpenLayers.i18n('cadastrapp.proprietaire.firstname.exemple'),
						fieldClass: 'displayfieldGray'
					}]
				},{
				
					//ONGLET 2
					id: 'propSecondForm',
					xtype: 'form',
					title: OpenLayers.i18n('cadastrapp.proprietaire.title.tab2'),
					defaultType: 'displayfield',
					fileUpload: true,
					height: 200,

					items: [
					propCityCombo2,
					{
						value: OpenLayers.i18n('cadastrapp.proprietaire.city.exemple'),
						fieldClass: 'displayfieldGray'
					},
					proprietaireGrid,	//grille "proprietaires"
					{
						value: OpenLayers.i18n('cadastrapp.proprietaire.or'),
						fieldClass: 'displayfieldCenter'
					},
					{
						fieldLabel: OpenLayers.i18n('cadastrapp.proprietaire.file.path'),
						name: 'filePath',
						xtype: 'fileuploadfield',
						emptyText: OpenLayers.i18n('cadastrapp.proprietaire.file.exemple'),
						buttonText: OpenLayers.i18n('cadastrapp.proprietaire.file.open'),
						height: 25,
						width: 300
					}]
				}]
			}],
			
			buttons: [{
				text: OpenLayers.i18n('cadastrapp.search'),
				//disabled: true,
				listeners: {
					click: function(b,e) {
						var currentForm = proprietaireWindow.items.items[0].getActiveTab();
						if (currentForm.id == 'propFirstForm') {
							//TODO : remettre la validation
							//if (currentForm.getForm().isValid()) {
								var cityName = currentForm.getForm().findField('city').lastSelectionText;
								//envoi des données d'une form
								//Ext.Ajax.request({
								currentForm.getForm().submit({
									method: 'GET',
									url:'http://localhost:8080/cadastrapp/getCommune/all',
									success: function(form, action) {
										//creation d'un store en retour
										var store = new Ext.data.JsonStore({
											fields: ['ccoinsee', 'libcom', 'libcom_min'],
											data: Ext.util.JSON.decode(form.responseText)
										});
										
										addNewResultProprietaire(cityName, store);
									},
									failure: function(form, action) {
										addNewResultProprietaire(cityName, null);
									}
								});
							//}
							
						} else {
							//TODO : remettre la validation
							//if (currentForm.getForm().isValid()) {
							
								var cityName = currentForm.getForm().findField('city').lastSelectionText;
								
								//soumet la form (pour envoyer le fichier)
								currentForm.getForm().submit({								
									method: 'POST',
									url:'http://localhost:8080/cadastrapp/getProprietaire/fromFile',
									params: {
										//envoi du contenu du store des proprietaires
										jsonData: Ext.util.JSON.encode(Ext.pluck(proprietaireGrid.getStore().getRange(), 'data'))
									},
									success: function(form, action) {
										//creation d'un store en retour
										var store = (action.response==undefined) ? null : new Ext.data.JsonStore({
												fields: ['ccoinsee', 'libcom', 'libcom_min'],
												data: Ext.util.JSON.decode(action.response.responseText)
											});										
										addNewResultProprietaire(cityName, store);
									},
									failure: function(form, action) {
										//creation d'un store en retour
										var store = (action.response==undefined) ? null : new Ext.data.JsonStore({
												fields: ['ccoinsee', 'libcom', 'libcom_min'],
												data: Ext.util.JSON.decode(action.response.responseText)
											});										
										addNewResultProprietaire(cityName, store);
									}
								});
							//}
						}
					}
				}
			},{
				text: OpenLayers.i18n('cadastrapp.close'),
				listeners: {
					click: function(b,e) {
						proprietaireWindow.close();
					}
				}
			}]
		});
	};
