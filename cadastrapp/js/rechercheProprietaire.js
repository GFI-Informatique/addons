
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")


  	 /** public: method[onClickRechercheProprietaire]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickRechercheProprietaire = function(){		
		//liste des villes : TODO : récupérer la liste entière
		var cityStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'Caen',   value: 'caen'},
				{name : 'Rennes',  value: 'rennes'},
				{name : 'Lannion', value: 'lannion'}
			]
		});
	
		//listes des "proprietaires"
		var ds = new Ext.data.JsonStore({
			fields : ['proprietaire'],
			data   : [{proprietaire : ''}],
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

		//modele la la grille des "proprietaires"
		var colModel = new Ext.grid.ColumnModel([
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
					displayField:   'proprietaire',
					valueField:     'proprietaire',
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
					displayField:   'proprietaire',
					valueField:     'proprietaire',
					store: parcelleStore
				})
			}
		]);			
		
		//grille "proprietaires"
		var proprietaireGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'Propri&eacute;taire(s)',
			name: 'proprietaires',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: ds,
			cm: colModel,
			autoExpandColumn: 'proprietaire',
			height: 100,
			width: 300,
			border: true
		});
		
				
		//fenêtre principale
		var referenceWindow = new Ext.Window({
			title: 'Recherche de propriétaires',
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
			
			items: {
				xtype:'tabpanel',
				activeTab: 0,
				items:[{
				
					//ONGLET 1
					title:'Nom Usage ou Naissance',
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
					{
						xtype: 'textfield',
						fieldLabel: 'Nom',
						name: 'lastname',
						width: 300
					},
					{
						value: 'ex. Dupond, Dupont',
						fieldClass: 'displayfieldGray'
					},
					{
						xtype: 'textfield',
						fieldLabel: 'Pr&eacute;nom(s)',
						name: 'firstname',
						width: 300
					},
					{
						value: 'ex. Albert, Jean-Marie',
						fieldClass: 'displayfieldGray'
					}]											
				},{
				
					//ONGLET 2
					title:'Adresse castrale',
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
					proprietaireGrid,	//grille "proprietaires"
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
				}]
			},
			
			buttons: [{
				text: 'Rechercher'
			},{
				text: 'Fermer'
			}]
		});
		
		referenceWindow.show();
		console.log("onClick")
	};