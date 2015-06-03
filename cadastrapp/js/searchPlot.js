
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

	var parcelleWindow;

  	/** public: method[onClickRechercheParcelle]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickRechercheParcelle1 = function() {
		if (parcelleWindow == null) {
			initRechercheParcelle();
		}
		parcelleWindow.show();
		parcelleWindow.items.items[0].setActiveTab(0);
	}
    onClickRechercheParcelle2 = function() {
		if (parcelleWindow == null) {
			initRechercheParcelle();
		}
		parcelleWindow.show();
		parcelleWindow.items.items[0].setActiveTab(1);
	}		
		
	initRechercheParcelle = function(){
		var parcBisStore, parcCityCombo1, parcCityCombo2, parcelleGrid;
		
		parcBisStore = getBisStore();

		//combobox "villes"
		parcCityCombo1 = new Ext.form.ComboBox({
			fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.city'),
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
			    },
				change: function(combo, newValue, oldValue) {
					//refaire le section store pour cette ville						
					parcelleGrid.reconfigure(getVoidParcelleStore(), getParcelleColModel(newValue));
					parcelleWindow.buttons[0].enable();
				}
			}
		});
		
		parcCityCombo2 = new Ext.form.ComboBox({
			fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.city'),
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
		
		//grille "références"
		parcelleGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.references'),
			name: 'parcelles',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: getVoidParcelleStore(),
			cm: getParcelleColModel(''),
			autoExpandColumn: 'parcelle',
			height: 100,
			width: 300,
			border: true,
			listeners: {
				beforeedit: function(e) {
					if (e.column == 0) {
						//pas d'edition de section si aucune ville selectionnée
						if (parcCityCombo1.value == '') return false;
					}
					if (e.column == 1) {
						//pas d'edition de parcelle si aucune section selectionnée
						if (e.record.data.section == '') return false;
						//on remplace le contenu du store des parcelles selon la section selectionnée
						e.grid.getColumnModel().getColumnById(e.field).editor.getStore().loadData(getParcelleStore(parcCityCombo1.value, e.record.data.section).reader.jsonData);
					}
				},
				afteredit: function(e) {
					var lastIndex = e.grid.store.getCount()-1;
					var lastData = e.grid.store.getAt(e.grid.store.getCount()-1).data;
					
					if (lastData.section!='') {
						var p = new e.grid.store.recordType({section:'', parcelle:''}); // create new record
						e.grid.stopEditing();
						e.grid.store.add(p); // insert a new record into the store (also see add)
						this.startEditing(e.row, 1);
					}
				}
			}
		});
		
				
		//fenêtre principale
		parcelleWindow = new Ext.Window({
			title: OpenLayers.i18n('cadastrapp.parcelle.title'),
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
					parcelleWindow = null;
				}
			},
			
			items: [
			{
				xtype:'tabpanel',
				activeTab: 0,
			
				items:[{
				
					//ONGLET 1
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab1'),
					xtype:'form',
					defaultType: 'displayfield',
					id: 'parcFirstForm',
					fileUpload: true,
					height: 200,
					
					items: [
					parcCityCombo1,		//combobox "villes"				
					{
						value: OpenLayers.i18n('cadastrapp.parcelle.city.exemple'),
						fieldClass: 'displayfieldGray'
					},
					parcelleGrid,	//grille "références"
					{
						value: OpenLayers.i18n('cadastrapp.parcelle.or'),
						fieldClass: 'displayfieldCenter'
					},
					{
						fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.file.path'),
						name: 'filePath',
						xtype: 'fileuploadfield',
						emptyText: OpenLayers.i18n('cadastrapp.parcelle.file.exemple'),
						buttonText: OpenLayers.i18n('cadastrapp.parcelle.file.open'),
						height: 25,
						width: 300
					}]
											
				},{
				
					//ONGLET 2
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab2'),
					xtype:'form',
					defaultType: 'displayfield',
					id: 'parcSecondForm',
					height: 200,

					items: [
					parcCityCombo2,		//combobox "villes"
					{
						value: OpenLayers.i18n('cadastrapp.parcelle.city.exemple'),
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'compositefield',
						fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.street'),
						defaults: {flex: 1},
						items: [
							{
								name : 'streetNumber',
								xtype: 'textfield',
								width: 50,
							},
							{
								name : 'streetBis',
								xtype: 'combo',
								width: 50,
								mode: 'local',
								value: '--',
								triggerAction:  'all',
								forceSelection: true,
								editable:       false,
								displayField:   'name',
								valueField:     'value',
								store: parcBisStore
							},
							{
								name : 'streetName',
								xtype: 'textfield',
								width: 190
							}
						]
					},
					{
						value: OpenLayers.i18n('cadastrapp.parcelle.street.exemple'),
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'textfield',
						fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.town'),
						name: 'town',
						width: 300
					},
					{
						value: OpenLayers.i18n('cadastrapp.parcelle.town.exemple'),
						fieldClass: 'displayfieldGray'
					}
					]
				}]
			}],
			
			buttons: [{
				text: OpenLayers.i18n('cadastrapp.search'),
				disabled: true,
				listeners: {
					click: function(b,e) {
						var currentForm = parcelleWindow.items.items[0].getActiveTab();
						if (currentForm.id == 'parcFirstForm') {
							if (currentForm.getForm().isValid()) {
								var cityName = currentForm.getForm().findField('city').lastSelectionText;
								//soumet la form (pour envoyer le fichier)
								currentForm.getForm().submit({
									//method: 'GET',
									url:'../cadastrapp/getCommune/all',
									params: {
										//envoi du contenu du store des proprietaires
										jsonData: Ext.util.JSON.encode(Ext.pluck(parcelleGrid.getStore().getRange(), 'data'))
									},
									success: function(form, action) {
										//creation d'un store en retour
										var store = new Ext.data.JsonStore({
											fields: ['ccoinsee', 'libcom', 'libcom_min'],
											data: Ext.util.JSON.decode(form.responseText)
										});
										
										addNewResultParcelle(cityName, store);
									},
									failure: function(form, action) {
										addNewResultParcelle(cityName, null);
									}
								});
							}
							
						} else {
							if (currentForm.getForm().isValid()) {
								var cityName = currentForm.getForm().findField('city').lastSelectionText;
								//envoi des données d'une form
								//Ext.Ajax.request({
								currentForm.getForm().submit({
									method: 'GET',
									url:'../cadastrapp/getCommune/all',
									success: function(form, action) {
										//creation d'un store en retour
										var store = new Ext.data.JsonStore({
											fields: ['ccoinsee', 'libcom', 'libcom_min'],
											data: Ext.util.JSON.decode(form.responseText)
										});
										
										addNewResultParcelle(cityName, store);
									},
									failure: function(form, action) {
										addNewResultParcelle(cityName, null);
									}
								});
							}
						}
					}
				}
			},{
				text: OpenLayers.i18n('cadastrapp.close'),
				listeners: {
					click: function(b,e) {
						parcelleWindow.close();
					}
				}
			}]
		});
	};