
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

	var referenceWindow;

  	/** public: method[onClickRechercheParcelle]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickRechercheParcelle = function() {
		if (referenceWindow == null) {
			initRechercheParcelle();
		}
		referenceWindow.show();
	}		
		
	initRechercheParcelle = function(){
		var bisStore, cityStore, cityCombo, referenceGrid;
		
		bisStore = getBisStore();
		
		cityStore = getCityStore();

		//combobox "villes"
		cityCombo = new Ext.form.ComboBox({
			fieldLabel: 'Ville, Commune',
			name: 'city',
			width: 300,
			mode: 'local',
			value: '',
			forceSelection: true,
			editable: true,
			tpl: '<tpl for="."><div class="x-combo-list-item" >{name} ({code})</div></tpl>',
			displayField: 'name',
			valueField: 'code',
			store: cityStore,
			listeners: {
				change(combo, newValue, oldValue) {
					//refaire le section store pour cette ville						
					referenceGrid.reconfigure(getVoidReferenceStore(), getReferenceColModel(newValue));
				}
			}
		});		
		
		//grille "références"
		referenceGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'R&eacute;f&eacute;rence(s)',
			name: 'references',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: getVoidReferenceStore(),
			cm: getReferenceColModel(''),
			autoExpandColumn: 'parcelle',
			height: 100,
			width: 300,
			border: true,
			listeners: {
				beforeedit(e) {
					if (e.column == 0) {
						//pas d'edition de section si aucune ville selectionnée
						if (cityCombo.value == '') return false;
					}
					if (e.column == 1) {
						//pas d'edition de parcelle si aucune section selectionnée
						if (e.record.data.section == '') return false;
						//on remplace le contenu du store des parcelles selon la section selectionnée
						e.grid.getColumnModel().getColumnById(e.field).editor.getStore().loadData(getParcelleStore(cityCombo.value, e.record.data.section).reader.jsonData);
					}
				},
				afteredit(e) {
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
		referenceWindow = new Ext.Window({
			title: 'Recherche des parcelles',
			frame: true,
			autoScroll:true,
			minimizable: true,
			closable: true,
			resizable: false,
			draggable : true,
			
			border:false,
			labelWidth: 100,
			width: 450,
			defaults: {autoHeight: true, bodyStyle:'padding:10px', flex: 1},
			
			listeners: {
				close(window) {
					referenceWindow = null;
				}
			},
			
			items: {
				xtype:'tabpanel',
				activeTab: 0,
			
				items:[{
				
					//ONGLET 1
					title:'R&eacute;f&eacute;rence',
					layout:'form',
					defaultType: 'displayfield',
					id: 'firstForm',
					fileUpload: true,
					height: 200,
					
					items: [
					cityCombo,		//combobox "villes"				
					{
						value: 'ex. Rennes, Cesson-S&eacute;vign&eacute;',
						fieldClass: 'displayfieldGray'
					},
					referenceGrid,	//grille "références"
					{
						value: 'ou',
						fieldClass: 'displayfieldCenter'
					},
					{
						fieldLabel: 'Path',
						name: 'filePath',
						xtype: 'fileuploadfield',
						emptyText: 'Charger un fichier au format .csv',
						buttonText: 'Ouvrir fichier',
						height: 25,
						width: 300
					}]
											
				},{
				
					//ONGLET 2
					title:'Adresse cadastrale',
					layout:'form',
					defaultType: 'displayfield',
					id: 'secondForm',
					height: 200,

					items: [{
						xtype: 'combo',
						fieldLabel: 'Ville, Commune',
						name: 'city',
						width: 300,
						mode: 'local',
						value: '',
						forceSelection: true,
						editable:       true,
						displayField:   'name',
						valueField:     'value',
						store: cityStore
					},
					{
						value: 'ex. Rennes, Cesson-S&eacute;vign&eacute;',
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'compositefield',
						fieldLabel: 'N de voirie et rue',
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
								store: bisStore
							},
							{
								name : 'streetName',
								xtype: 'textfield',
								width: 190
							}
						]
					},
					{
						value: 'ex. 4 avenue Henri Fr&eacute;ville',
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'textfield',
						fieldLabel: 'Lieu-dit',
						name: 'town',
						width: 300
					},
					{
						value: 'ex. Mont-Romain, La morinaie',
						fieldClass: 'displayfieldGray'
					}
					]
				}]
			},
			
			buttons: [{
				text: 'Rechercher',
				listeners: {
					click(b,e) {
						alert('TODO');
					}
				}
			},{
				text: 'Fermer',
				listeners: {
					click(b,e) {
						referenceWindow.close();
					}
				}
			}]
		});
	};