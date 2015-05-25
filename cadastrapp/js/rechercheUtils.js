
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

	//liste des compléments de numéro de rue : BIS, TER (à compléter ?)
	//statique
	getBisStore = function() {
		return new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : '--',   value: '--'},
				{name : 'bis',  value: 'bis'},
				{name : 'ter', value: 'ter'}
			]
		});		
	}
		
	//liste des villes
	//chargé une fois, au lancement
	//TODO : récupérer la liste entière	
	getCityStore = function() {
		return new Ext.data.JsonStore({
			fields : ['name', 'code'],
			//url: 'cities.json'
			data   : [
				{name : 'Caen', code: '14000'},
				{name : 'Rennes',  code: '35000'},
				{name : 'Lannion', code: '22300'}
			]
		});	
	}	
		
	//liste des sections
	//TODO : charger dynamiquement selon la ville choisie
	getSectionStore = function(cityId) {
		return new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'sect1-'+cityId},
				{name : 'sect2-'+cityId},
				{name : 'sect3-'+cityId}
			]
		});	
	}
	
	//liste des parcelles
	//TODO : charger dynamiquement selon la ville choisie et la section choisie
	getParcelleStore = function(cityId, sectionId) {
		return new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : 'parc1-'+cityId+'-'+sectionId},
				{name : 'parc2-'+cityId+'-'+sectionId},
				{name : 'parc3-'+cityId+'-'+sectionId}
			]
		});	
	}
		
	//listes des section / parcelles saisies : "références"
	//initialement vide
	//ajoute automatique une ligne vide quand la dernière ligne est complètement remplie
	//actuellement, on ne peut pas supprimer une ligne
	getVoidReferenceStore = function() {
		return new Ext.data.JsonStore({
			fields : ['section', 'parcelle'],
			data   : [{section : '',   parcelle: ''}],
			//listeners: {
			//	update(store, record, operation) {
			//		var lastIndex = this.getCount()-1;
			//		var lastData = this.getAt(this.getCount()-1).data;
			//		
			//		if (lastData.section!='' && lastData.parcelle!='') {
			//			var p = new this.recordType({section:'', parcelle:''}); // create new record
			//			referenceGrid.stopEditing();
			//			this.add(p); // insert a new record into the store (also see add)
			//			referenceGrid.startEditing(lastIndex+1, 0);	//
			//		}
			//	}
			//}
		});		
	}
	
	getReferenceColModel = function(cityId) {
		return new Ext.grid.ColumnModel([
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
					valueField:     'name',
					store: getSectionStore(cityId)
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
					valueField:     'name',
					store: getParcelleStore(cityId, '')
				})
			}
		]);		
	}
	
	
	
	