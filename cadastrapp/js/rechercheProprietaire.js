
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
    onClickRechercheProprietaire = function() {
		if (proprietaireWindow == null) {
			initRechercheProprietaire();
		}
		proprietaireWindow.show();
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
				change(combo, newValue, oldValue) {
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
				beforeedit(e) {
					if (e.column == 0) {
						//pas d'edition de section si aucune ville selectionnée
						if (cityCombo2.value == '') return false;
					}
				},
				afteredit(e) {
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
			
			border:false,
			labelWidth: 100,
			width: 450,
			defaults: {autoHeight: true, bodyStyle:'padding:10px', flex: 1},
			
			listeners: {
				close(window) {
					proprietaireWindow = null;
				}
			},
			
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
					title:'Adresse cadastrale',
					layout:'form',
					defaultType: 'displayfield',
					id: 'secondForm',
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
						proprietaireWindow.close();
					}
				}
			}]
		});
	};