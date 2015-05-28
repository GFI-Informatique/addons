
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
		var bisStore, cityStore, cityCombo1, cityCombo2, proprietaireGrid;
		
		bisStore = getBisStore();
		
		cityStore = getCityStore();

		//comboboxes "villes"
		cityCombo1 = new Ext.form.ComboBox({
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
			store: cityStore
		});	
		
		cityCombo2 = new Ext.form.ComboBox({
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
				change: function(combo, newValue, oldValue) {
					//refaire le section store pour cette ville						
					proprietaireGrid.reconfigure(getVoidProprietaireStore(), getProprietaireColModel(newValue));
				}
			}
		});			
		
		//grille "proprietaires"
		proprietaireGrid = new Ext.grid.EditorGridPanel({
			fieldLabel: 'Propri&eacute;taire(s)',
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
						if (cityCombo2.value == '') return false;
					}
				},
				afteredit: function(e) {
					var lastIndex = e.grid.store.getCount()-1;
					var lastData = e.grid.store.getAt(e.grid.store.getCount()-1).data;
					
					if (lastData.proprietaire!='') {
						var p = new e.grid.store.recordType({proprietaire:''}); // create new record
						e.grid.stopEditing();
						e.grid.store.add(p); // insert a new record into the store (also see add)
						this.startEditing(e.row, 1);
					}
				}
			}
		});
		
				
		//fenêtre principale
		proprietaireWindow = new Ext.Window({
			title: 'Recherche de propriétaires',
			frame: true,
			autoScroll:true,
			minimizable: true,
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
					id: 'firstForm',
					xtype: 'form',
					title: 'Nom Usage ou Naissance',
					defaultType: 'displayfield',
					height: 200,
								
					items: [
					cityCombo1,
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
					id: 'secondForm',
					title: 'Adresse cadastrale',
					layout: 'form',
					defaultType: 'displayfield',
					fileUpload: true,
					height: 200,

					items: [
					cityCombo2,
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
						height: 25,
						width: 300
					}]
				}]
			}],
			
			buttons: [{
				text: 'Rechercher',
				listeners: {
					click: function(b,e) {
						var currentForm = proprietaireWindow.items.items[0].getActiveTab();
						if (currentForm.id == 'firstForm') {
							
							//appel de méthode webapp
							Ext.Ajax.request({
								method: 'GET',
								url:'./getCommune/all',
								success: function(form, action) {
									alert('Success : ' + action.result.msg);
								},
								failure: function(form, action) {
									alert('Failed : ' + action.result.msg);
								}
							});

							//soumission des données d'une form
							currentForm.getForm().submit({
								method: 'GET',
								url:'./getCommune/all',
								success: function(form, action) {
									alert('Success : ' + action.result.msg);
								},
								failure: function(form, action) {
									alert('Failed : ' + action.result.msg);
								}
							});				
							
							/*
							var result = new Ext.data.JsonStore({
								fields : ['prenom', 'nom'],
								data   : [
									{prenom : 'nicolas', nom: 'tasia'},
									{prenom : 'pierre', nom: 'jego'},
									{prenom : 'laurent', nom: 'cornic'}
								]
							});
							addNewResultProprietaire(result);
							*/
						} else {
							alert('TODO');
						}
					}
				}
			},{
				text: 'Fermer',
				listeners: {
					click: function(b,e) {
						proprietaireWindow.close();
					}
				}
			}]
		});
	};