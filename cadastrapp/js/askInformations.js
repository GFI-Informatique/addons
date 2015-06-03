
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")


  	 /** public: method[onClickAskInformations]
     *  :param layer: 
     *  Create ...TODO
     */
    onClickAskInformations = function(){
		
		var parcBisStore, parcCityStore, parcCityCombo1, parcCityCombo2, parcelleGrid;
		
		parcBisStore = getBisStore();
		
		parcCityStore = getCityStore();

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
			store: parcCityStore,
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
			store: parcCityStore,
			listeners: {
			    beforequery: function(q){  
			    	if (q.query) {
		                var length = q.query.length;
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
			
		
    // formulaire Parcelles
		//liste des compléments de numéro de rue : BIS, TER (à compléter ?)
		var bisStore = getBisStore(); 
		/*new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : '--',   value: '--'},
				{name : 'bis',  value: 'bis'},
				{name : 'ter', value: 'ter'}
			]
		});*/	
		
		//liste des sections : TODO : charger dynamiquement selon la ville choisie
		var sectionStore = getSectionStore();
		/*new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'sect1',   value: 'sect1'},
				{name : 'sect2',  value: 'sect2'},
				{name : 'sect3', value: 'sect3'}
			]
		});*/
		
		//liste des parcelles : TODO : charger dynamiquement selon la ville choisie et la section choisie
		var parcelleStore = getParcelleStore();
		/*new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'parc1',   value: 'parc1'},
				{name : 'parc2',  value: 'parc2'},
				{name : 'parc3', value: 'parc3'}
			]
		});*/
		
		//liste des villes : TODO : récupérer la liste entière
		var cityStore = getCityStore();
		/*new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'Caen',   value: 'caen'},
				{name : 'Rennes',  value: 'rennes'},
				{name : 'Lannion', value: 'lannion'}
			]
		});*/
	
		//listes des section / parcelles saisies : "références"
		//initialement vide
		//ajoute automatique une ligne vide quand la dernière ligne est complètement remplie
		//actuellement, on ne peut pas supprimer une ligne
		var ds = new Ext.data.JsonStore({
			fields : ['section', 'parcelle'],
			data   : [{section : '',   parcelle: ''}],
			listeners: {
				update: function(store, record, operation) {
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

		//modele la la grille des "parcelles"
		var colModel = new Ext.grid.ColumnModel([
			{
				id:'section',
				dataIndex: 'section',
				header: "Section",
				width: 250,
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
				width: 350,
				sortable: false,
				editor: new Ext.form.ComboBox({
					mode: 'local',
					value: '',
					forceSelection: true,
					editable:       true,
					displayField:   'name',
					valueField:     'value',
					store: parcCityStore
				})
			}
		]);			
		
		//grille "parcellle"
		var parcelleGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'Parcelle(s)',
			name: 'parcelles',							
			xtype: 'editorgrid',
			clicksToEdit: 1,
			ds: ds,
			cm: colModel,
			autoExpandColumn: 'parcelle',
			height: 100,
			width: 400,
			border: true
		});
		
				//modele la la grille des "adresses"
		var coladresseModel = new Ext.grid.ColumnModel([
			{
				id:'adresse',
				dataIndex: 'adresse',
				header: "Adresse cadastrale",
				width: 400,
				sortable: false,
				editor: new Ext.form.ComboBox({
					mode: 'local',
					value: '',
//					editable:       true,
					displayField:   'name',
					valueField:     'value',
					store: sectionStore
				})
			}
			]);	

		//grille "adresse"
		var adresseGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'adresse(s)',
			name: 'adresse cadastrales',							
			xtype: 'editorgrid',
			clicksToEdit: 3,
			ds: ds,
			cm: coladresseModel,
			autoExpandColumn: 'adresse',
			height: 140,
			width: 400,
			border: true
		});
		
		var askInformationsWindow;
			askInformationsWindow = new Ext.Window({
            title: 'Demande Informations Foncieres',
			frame: true,
			bodyPadding: 10,
			autoScroll:true,
			resizable: false,
			width: 450,
            closable: true,
            resizable: true,
			draggable : true,
			constrainHeader: true,
			
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
				{ fieldLabel: OpenLayers.i18n('cadastrapp.demandeinformation.nom'), name: 'nom', width: 280},
				{ fieldLabel: OpenLayers.i18n('cadastrapp.demandeinformation.prenom'), name: 'prenom', width: 280},
				{ fieldLabel: OpenLayers.i18n('cadastrapp.demandeinformation.commune'), name: 'commune', width: 280},

				            {
                        xtype: 'compositefield',
                        fieldLabel: OpenLayers.i18n('cadastrapp.demandeinformation.num_rue'),
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
				{ fieldLabel: OpenLayers.i18n('cadastrapp.demandeinformation.lieudit'), name: 'lieudit', width: 280},
				{ fieldLabel: OpenLayers.i18n('cadastrapp.demandeinformation.cni'), name: 'cni', width: 280}
				]
			},
			{
			xtype: 'fieldset',
			title: OpenLayers.i18n('cadastrapp.demandeinformation.titre2'),
			defaultType: 'textfield',
			labelWidth: 120,
			items: [				
				{ fieldLabel:OpenLayers.i18n('cadastrapp.demandeinformation.commune'), name: 'commune', width: 280},
				{ xtype:'tabpanel',	height: 160,

				activeTab: 0,
				items:[{
				
					//ONGLET 1
					title:OpenLayers.i18n('cadastrapp.demandeinformation.parcelles'),
//					layout:'form',
					defaultType: 'displayfield',
					height: 200,
					id: 'firstForm',
					fileUpload: true,
					
					items: [
					parcelleGrid,	//grille "parcelle"
					{
						value: 'ou',
						fieldClass: 'displayfieldCenter'
					}]
											
				}]
				},
				{ xtype:'tabpanel',
				activeTab: 0,
				items:[{	
				
					//ONGLET 1
					title:OpenLayers.i18n('cadastrapp.demandeinformation.adressescadastrales'),
					defaultType: 'displayfield',
					id: 'firstForm',
					fileUpload: true,
					
					items: [
							adresseGrid,	//grille "adresse"
							{
							value: 'ou',
							fieldClass: 'displayfieldCenter'
							}]
											
					}]
				}				
				]
			}],
			buttons: [{
						labelAlign: 'left',				
						text: OpenLayers.i18n('cadastrapp.demandeinformation.annuler'),
						listeners:{
							click: function(b,e) {
											askInformationsWindow.close();
											}
									 }
						},{
						labelAlign: 'right',
						text: OpenLayers.i18n('cadastrapp.demandeinformation.imprimer'),
						listeners:{
							click: function(b,e) {
											askInformationsWindow.close();
											}
									 }							
						}]
        });
		askInformationsWindow.show();
		console.log("onClick")
	};