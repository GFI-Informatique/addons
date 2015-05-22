
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")


  	 /** public: method[onClickDemand]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickDemand = function(){
    // formulaire Parcelles
		//liste des compléments de numéro de rue : BIS, TER (à compléter ?)
		var bisStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : '--',   value: '--'},
				{name : 'bis',  value: 'bis'},
				{name : 'ter', value: 'ter'}
			]
		});	
		
		//liste des sections : TODO : charger dynamiquement selon la ville choisie
		var sectionStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'sect1',   value: 'sect1'},
				{name : 'sect2',  value: 'sect2'},
				{name : 'sect3', value: 'sect3'}
			]
		});
		
		//liste des parcelles : TODO : charger dynamiquement selon la ville choisie et la section choisie
		var parcelleStore = new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'parc1',   value: 'parc1'},
				{name : 'parc2',  value: 'parc2'},
				{name : 'parc3', value: 'parc3'}
			]
		});
		
		//liste des villes : TODO : récupérer la liste entière
		var cityStore = new Ext.data.JsonStore({
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
		var ds = new Ext.data.JsonStore({
			fields : ['section', 'parcelle'],
			data   : [{section : '',   parcelle: ''}],
			listeners: {
				update(store, record, operation) {
					var lastIndex = this.getCount()-1;
					var lastData = this.getAt(this.getCount()-1).data;
					
					if (lastData.section!='' && lastData.parcelle!='') {
						var p = new this.recordType({section:'', parcelle:''}); // create new record
						parcelleGrid.stopEditing();
						this.add(p); // insert a new record into the store (also see add)
						parcelleGrid.startEditing(lastIndex+1, 0);	//
					}
				}
			}
		});

		//modele la la grille des "références"
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
		var parcelleGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'Parcelle(s)',
			name: 'parcelles',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: ds,
			cm: colModel,
			autoExpandColumn: 'parcelle',
			height: 100,
			width: 300,
			border: true
		});

		var demandWindow;
			demandWindow = new Ext.Window({
            title: 'Demande Informations Foncieres',
			frame: true,
			bodyPadding: 10,
			autoScroll:true,
			width: 450,
			minimizable: true,
            closable: true,
            resizable: true,
			draggable : true,
			fieldDefaults: {
				labelAlign: 'right',

				msgTarget: 'side'
		},
	    items: [{
			xtype: 'fieldset',
			title: 'Informations sur le demandeur',
			labelWidth: 120,
			defaultType: 'textfield',
			items: [
				{ fieldLabel: 'Nom', name: 'nom', width: 280},
				{ fieldLabel: 'Prénom', name: 'prenom', width: 280},
				{ fieldLabel: 'Ville, Commune', name: 'commune', width: 280},

				            {
                        xtype: 'compositefield',
                        fieldLabel: 'N° de voirie et rue',
                        items: [
                           {
                               xtype: 'numberfield',
							   name : 'numero',
                               width: 40
                           },
                           {
                               xtype: 'combo',
                               name: 'complement',
							   width: 40
                           },
                           {
                               xtype: 'textfield',
							   name: 'rue',
                               width: 190
                           }
                        ]
                    },
				{ fieldLabel: 'Lieu-Dit', name: 'lieudit', width: 280},
				{ fieldLabel: 'CNI', name: 'cni', width: 280}
				]
			},
			{
			xtype: 'fieldset',
			title: 'Biens à consulter',
			defaultType: 'textfield',
			labelWidth: 120,
			items: [				
				{ fieldLabel: 'Ville, Commune', name: 'commune', width: 280},
				{ xtype:'tabpanel',
				activeTab: 0,
				items:[{
				
					//ONGLET 1
					title:'R&eacute;f&eacute;rence',
					layout:'form',
					defaultType: 'displayfield',
					id: 'firstForm',
					fileUpload: true,
					
					items: [
					parcelleGrid,	//grille "références"
					{
						value: 'ou',
						fieldClass: 'displayfieldCenter'
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

				{ fieldLabel: 'Adresse(s) cadastrale(s)', name: 'adresse', width: 280}
				]
			}],
			buttons: [{
				labelAlign: 'left',				
				text: 'Annuler la demande'
				},{
				labelAlign: 'right',
				text: 'Imprimer la demande'
				}]
        });
		
		demandWindow.show();
		console.log("onClick")
	};