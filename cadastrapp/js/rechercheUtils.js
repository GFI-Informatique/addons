
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
			url: '../cadastrapp/getCommune/all',
			autoLoad: true,
			fields: ['ccoinsee', 'libcom', 'libcom_min', { 
		       name: 'displayname', 
		       convert: function(v, rec) { return rec.libcom_min.trim() + ' (' + rec.ccoinsee.trim() + ')'}
		    }]
		});
	}	
		
	//liste des sections
	//TODO : charger dynamiquement selon la ville choisie
	getSectionStore = function(cityId) {
		return new Ext.data.JsonStore({
			fields : ['name'],
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
			fields : ['name'],
			data   : [
				{name : 'parc1-'+cityId+'-'+sectionId},
				{name : 'parc2-'+cityId+'-'+sectionId},
				{name : 'parc3-'+cityId+'-'+sectionId}
			]
		});	
	}	
		
	//liste des propriétaires d'une ville
	//TODO : charger dynamiquement selon la ville choisie
	getProprietaireStore = function(cityId) {
		return new Ext.data.JsonStore({
			fields : ['name'],
			data   : [
				{name : 'prop1-'+cityId},
				{name : 'prop2-'+cityId},
				{name : 'prop3-'+cityId}
			]
		});	
	}
		
	//listes des section / parcelles saisies : "références"
	//initialement vide
	//ajoute automatique une ligne vide quand la dernière ligne est complètement remplie
	//actuellement, on ne peut pas supprimer une ligne
	getVoidParcelleStore = function() {
		return new Ext.data.JsonStore({
			fields : ['section', 'parcelle'],
			data   : [{section : '',   parcelle: ''}]
		});		
	}
	
	//listes des "propriétaires" saisis
	//initialement vide
	getVoidProprietaireStore = function() {
		return new Ext.data.JsonStore({
			fields : ['proprietaire'],
			data   : [{proprietaire : ''}]
		});		
	}
	
	//design et editor des colonnes de la grille "référence"
	getParcelleColModel = function(cityId) {
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
	
	
	//design et editor des colonnes de la grille "propriétaires"
	getProprietaireColModel = function(cityId) {
		return new Ext.grid.ColumnModel([
			{
				id:'proprietaire',
				dataIndex: 'proprietaire',
				header: "Propri&eacute;taire",
				width: 100,
				sortable: false,
				editor: new Ext.form.ComboBox({
					mode: 'local',
					value: '',
					forceSelection: true,
					editable:       true,
					displayField:   'name',
					valueField:     'name',
					store: getProprietaireStore(cityId)
				})
			}
		]);		
	}
	
	
	
	