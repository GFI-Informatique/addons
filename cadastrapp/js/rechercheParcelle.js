
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
		var bisStore, sectionStore, parcelleStore, cityStore, referenceStore, colModel, referenceGrid;
		
		//liste des compléments de numéro de rue : BIS, TER (à compléter ?)
		bisStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : '--',   value: '--'},
				{name : 'bis',  value: 'bis'},
				{name : 'ter', value: 'ter'}
			]
		});	
		
		//liste des sections : TODO : charger dynamiquement selon la ville choisie
		sectionStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'sect1',   value: 'sect1'},
				{name : 'sect2',  value: 'sect2'},
				{name : 'sect3', value: 'sect3'}
			]
		});
		
		//liste des parcelles : TODO : charger dynamiquement selon la ville choisie et la section choisie
		parcelleStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'parc1',   value: 'parc1'},
				{name : 'parc2',  value: 'parc2'},
				{name : 'parc3', value: 'parc3'}
			]
		});
		
		//liste des villes : TODO : récupérer la liste entière
		cityStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'Caen',   value: 'caen'},
				{name : 'Rennes',  value: 'rennes'},
				{name : 'Lannion', value: 'lannion'}
			]
		});
	
		//listes des section / parcelles saisies : "références"
		//initialement vide
		//ajoute automatique une ligne vide quand la dernière ligne est complètement remplie
		//actuellement, on ne peut pas supprimer une ligne
		referenceStore = new Ext.data.JsonStore({
			fields : ['section', 'parcelle'],
			data   : [{section : '',   parcelle: ''}],
			listeners: {
				update(store, record, operation) {
					var lastIndex = this.getCount()-1;
					var lastData = this.getAt(this.getCount()-1).data;
					
					if (lastData.section!='' && lastData.parcelle!='') {
						var p = new this.recordType({section:'', parcelle:''}); // create new record
						referenceGrid.stopEditing();
						this.add(p); // insert a new record into the store (also see add)
						referenceGrid.startEditing(lastIndex+1, 0);	//
					}
				}
			}
		});

		//modele la la grille des "références"
		colModel = new Ext.grid.ColumnModel([
			{
				id:'section',
				dataIndex: 'section',
				header: "Section",
				width: 100,
				sortable: false,
				editor: new Ext.form.ComboBox({
					mode: 'local',
					value: '',
					forceSelection: true,
					editable:       true,
					displayField:   'name',
					valueField:     'value',
					store: sectionStore
				})
			},
			{
				id: "parcelle",
				dataIndex: 'parcelle',
				header: "Parcelle",
				width: 100,
				sortable: false,
				editor: new Ext.form.ComboBox({
					mode: 'local',
					value: '',
					forceSelection: true,
					editable:       true,
					displayField:   'name',
					valueField:     'value',
					store: parcelleStore
				})
			}
		]);			
		
		//grille "références"
		referenceGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'R&eacute;f&eacute;rence(s)',
			name: 'references',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: referenceStore,
			cm: colModel,
			autoExpandColumn: 'parcelle',
			height: 100,
			width: 300,
			border: true
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
			defaults: {autoHeight:true, bodyStyle:'padding:10px', flex: 1},
			
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
						width: 300
					}]
											
				},{
				
					//ONGLET 2
					title:'Adresse cadastrale',
					layout:'form',
					defaultType: 'displayfield',
					id: 'secondForm',

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
				text: 'Rechercher'
			},{
				text: 'Fermer'
			}]
		});
	};