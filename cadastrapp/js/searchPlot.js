
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
    onClickRechercheParcelle3 = function() {
		if (parcelleWindow == null) {
			initRechercheParcelle();
		}
		parcelleWindow.show();
		parcelleWindow.items.items[0].setActiveTab(2);
	}		
		
	initRechercheParcelle = function(){
		var parcBisStore, parcCityCombo1, parcCityCombo2, parcelleGrid;
		
		parcBisStore = getBisStore();

		//combobox "villes"
		parcCityCombo1 = new Ext.form.ComboBox({
			fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.city'),
			hiddenName: 'ccoinsee',
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
		                if (length >= getSearchStart() && q.combo.getStore().getCount() == 0) {
		                	if (isNaN(q.query)) {
		                		//recherche par nom de ville
		                		q.combo.getStore().load({params: {libcom_partiel: q.query}});
		                	} else {
		                		//recherche par code insee
		                		q.combo.getStore().load({params: {ccoinsee_partiel: q.query}});
		                	}		                	
		                } else if (length < getSearchStart()) {
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
			hiddenName: 'ccoinsee',
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
		                if (length >= getSearchStart() && q.combo.getStore().getCount() == 0) {
		                	if (isNaN(q.query)) {
		                		//recherche par nom de ville
		                		q.combo.getStore().load({params: {libcom_partiel: q.query}});
		                	} else {
		                		//recherche par code insee
		                		q.combo.getStore().load({params: {ccoinsee_partiel: q.query}});
		                	}		                	
		                } else if (length < getSearchStart()) {
		                	q.combo.getStore().loadData([],false);
		                }
		                q.query = new RegExp(Ext.escapeRe(q.query), 'i');
		                q.query.length = length;
		            }
			    },
				change: function(combo, newValue, oldValue) {
					parcelleWindow.buttons[0].enable();
				}
			}
		});		
		
		//grille "références"
		parcelleGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.references'),
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: getVoidParcelleStore(),
			cm: getParcelleColModel(null),
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
						reloadParcelleStore(e.grid.getColumnModel().getColumnById(e.field).editor.getStore(), parcCityCombo1.value, e.record.data.section);
					}
				},
				afteredit: function(e) {				
					//on ajoute un champ vide, si le dernier champ est complet
					var lastIndex = e.grid.store.getCount()-1;
					var lastData = e.grid.store.getAt(e.grid.store.getCount()-1).data;
					
					if (lastData.section!='' && lastData.parcelle!='') {
						var p = new e.grid.store.recordType({section:'', parcelle:''}); // create new record
						e.grid.stopEditing();
						e.grid.store.add(p); 	//insert a new record into the store (also see add)
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
			resizable: true,
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
								name : 'dnvoiri',
								xtype: 'textfield',
								width: 50,
							},
							{
								hiddenName : 'dindic',
								xtype: 'combo',
								width: 50,
								mode: 'local',
								value: '',
								triggerAction:  'all',
								forceSelection: true,
								editable:       false,
								displayField:   'name',
								valueField:     'value',
								store: parcBisStore
							},
							{
								name : 'dvoilib',
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
				},{
				
					//ONGLET 3
					title: OpenLayers.i18n('cadastrapp.parcelle.title.tab3'),
					xtype:'form',
					defaultType: 'displayfield',
					id: 'parcThirdForm',
					height: 200,

					items: [
					{
						xtype: 'textfield',
						fieldLabel: OpenLayers.i18n('cadastrapp.parcelle.ident'),
						name: 'ident',
						width: 300
					},
					{
						value: OpenLayers.i18n('cadastrapp.parcelle.ident.exemple'),
						fieldClass: 'displayfieldGray'
					}
					]
				}]
			}],
			
			buttons: [{
				text: OpenLayers.i18n('cadastrapp.search'),
				disabled: false,
				listeners: {
					click: function(b,e) {
						var currentForm = parcelleWindow.items.items[0].getActiveTab();
						
						
						if (currentForm.id == 'parcFirstForm') {
							if (currentForm.getForm().isValid()) {
								//TITRE de l'onglet resultat
								var resultTitle = currentForm.getForm().findField('ccoinsee').lastSelectionText;
								
								if (currentForm.getForm().findField('filePath').value != undefined) {
									//PAR FICHIER
									
									//soumet la form (pour envoyer le fichier)
									currentForm.getForm().submit({
										url: getWebappURL() + 'getParcelle/fromParcellesFile',
										params: {details: 1},
										success: function(form, action) {
											addNewResultParcelle(resultTitle, getResultParcelleStore(action.response.responseText, true));
										},
										failure: function(form, action) {
											alert('ERROR');
										}
									});
									
								} else {
									//PAR LISTE
									
									//PARAMS
									var params = currentForm.getForm().getValues();
									params.details = 1;
									var cityCode = currentForm.getForm().findField('ccoinsee').value;
									params.ccodep = cityCode.substring(0,2);
									params.ccodir = cityCode.substring(2,3);
									params.ccocom = cityCode.substring(3,6);
									
									//liste des parcelles
									//parcelle: Ext.util.JSON.encode(Ext.pluck(parcelleGrid.getStore().getRange(), 'data'))
									params.parcelle = new Array();
									parcelleGrid.getStore().each(function(record) {  
										params.parcelle.push(record.data.parcelle); 
									});								
									
									//envoi la liste de resultat
									Ext.Ajax.request({
										method: 'GET',
										url: getWebappURL() + 'getParcelle',
										params: params,
										success: function(result) {
											addNewResultParcelle(resultTitle, getResultParcelleStore(result.responseText, false));
										},
										failure: function(result) {
											alert('ERROR');
										}
									});
								}
							}	
							
							
							
						}
						if (currentForm.id == 'parcSecondForm') {
							if (currentForm.getForm().isValid()) {
								//TITRE de l'onglet resultat
								var resultTitle = currentForm.getForm().findField('ccoinsee').lastSelectionText;
								
								//PARAMS
								var params = currentForm.getForm().getValues();
								params.details = 1;
								var cityCode = currentForm.getForm().findField('ccoinsee').value;
								params.ccodep = cityCode.substring(0,2);
								params.ccodir = cityCode.substring(2,3);
								params.ccocom = cityCode.substring(3,6);								
								
								//envoi des données d'une form
								Ext.Ajax.request({
									method: 'GET',
									url: getWebappURL() + 'getParcelle',
									params: params,
									success: function(result) {
										addNewResultParcelle(resultTitle, getResultParcelleStore(result.responseText, false));
									},
									failure: function(result) {
										alert('ERROR');
									}
								});
							}	
							
						}
						if (currentForm.id == 'parcThirdForm') {
					
							if (currentForm.getForm().isValid()) {
								//PARAMS
								var params = currentForm.getForm().getValues();
								
								//TITRE de l'onglet resultat
								var resultTitle = currentForm.getForm().getValues().ident;
								
								var parcelleId = currentForm.getForm().getValues().ident;							
								
								console.log(params);
								
								//liste des parcelles
								//parcelle: Ext.util.JSON.encode(Ext.pluck(parcelleGrid.getStore().getRange(), 'data'))
								params.parcelle = new Array();
								parcelleGrid.getStore().each(function(record) {  
									params.parcelle.push(record.data.parcelle); 
								});	

								
								//envoi des données d'une form
								Ext.Ajax.request({
									method: 'GET',
									url: getWebappURL() + 'getParcelle?parcelle='+parcelleId+"&details=1",
									//params: params,
									success: function(result) {
										addNewResultParcelle(resultTitle, getResultParcelleStore(result.responseText, false));
									},
									failure: function(result) {
										alert('ERROR');
									}
								});
							}		
						} else {
							alert('Parcelle non trouvée');
							
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