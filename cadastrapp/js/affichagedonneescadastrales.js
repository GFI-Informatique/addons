
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
    onClickaffichagedonneescadastrales = function(){
		//déclaration des variables relatives aux données cadastrales
		var ccodep, ccodir, ccocom, gcopre, ccosec, dnupla, dnupro, dnomlp, dprnlp, expnee, dnomcp, dprncp, adressehabitation , jdatnss , dldnss, ccodro_lib, dnvoiri, dindic, natvoiriv_lib, dvoilib, dcntpa, supf, gparbat, gurbpa;
		var dniv, dpor, cconlc_lib, dvlrt, jdatat, dnupro, dnomlp, dprnlp, expnee, dnomcp, dprncp
		
		//variable userauthent: niveau de droits de l'utilisateur
		var userauthent;
		
		// Set up a model to use in our Store
		Ext.regModel('Parcelle', {
		fields: [
			{name: 'commune', type: 'string'},
			{name: 'section',  type: 'string'},
			{name: 'voie',  type: 'string'},
			{name: 'adresse',  type: 'string'},
			{name: 'contenance',  type: 'string'},
			{name: 'surface',  type: 'string'},
			{name: 'parcellebatie',  type: 'string'},
			{name: 'appartientsecteururbain',  type: 'string'}
			]
		});

		
		// Modele du  Store parcelle
		Ext.regModel('Fic', {
		fields: [
				//Parcelle
				{name: 'département', type: 'String'},
				{name: 'direction', type: 'String'},
				{name: 'commune', type: 'String'},
				{name: 'libellecommune', type: 'String'},
				{name: 'prefixesection', type: 'String'},
				{name: 'Section', type: 'String'},
				{name: 'numplanparcelle', type: 'String'},
				{name: 'numerovoirie', type: 'String'},
				{name: 'indicerepetition', type: 'String'},
				{name: 'naturevoie', type: 'String'},
				{name: 'libellevoie', type: 'String'},
				{name: 'contenancedgfip', type: 'int'},
				{name: 'surface', type: 'float'},
				{name: 'parcellebatie', type: 'String'},
				{name: 'secteururbain', type: 'String'},
				]

		
				//	Proprietaires
				{name: 'comptepropriétaire', type: 'String'},
				{name: 'nomdusage', type: 'String'},
				{name: 'prenomsdusage', type: 'String'},
				{name: 'mentionducomplement', type: 'String'},
				{name: 'nomcomplement', type: 'String'},
				{name: 'prenomscomplement', type: 'String'},

				

		
				// Adressehabitation			
		dlign3	Ligne d’adresse	String[30]
		dlign4	Ligne d’adresse	String[36]
		dlign5	Ligne d’adresse	String[30]
		dlign6	Ligne d’adresse	String[32]
		dldnss	Lieu de naissance	String[58]
		jdatnss	Date de naissance	date
		ccodro	Code du droit réel	String[1]
		ccodro_lib	Libellé – Code du droit réel	String[150]
	
				// Batiments		
		dnubat	Lettre de bâtiment	
		locaux			
		annee	année	String[4]
		invar	numéro invariant	String[10]
		descr	Numéro d’entrée	String[2]
		dniv	Niveau d’étage	String[2]
		dpor	Numéro de local (porte)	String[5]
		cconlc_lib	Libellé - Nature du local 	String[150]
		dvltrt	Valeur locative totale retenue – Revenu fiscal ?	Int4
		jdatat	Date d’acte de mutation du local	date
		jannat	Année de construction	String[4]
		proprietaires		
		dnupro	Compte propriétaire	String[6]
		dnomlp	Nom d’usage	String[30]
		dprnlp	Prénoms d’usage	String[15]
		expnee	Mention du complément	String[3]
		dnomcp	Nom complément	String[30]
		dprncp	Prénoms complément	String[15]
			
			// Subdivisions		
		ccosub	Lettre indicative de subdivisions fiscales	String[2]
		dcntsf	Contenance de la subdivision en m2	Int4
		cgrnum_lib	Libellé - Groupe de nature de culture	String[150]
		drcsub	Revenu cadastral revalorisé du 01-01 de l’année en euros	numeric
		
			// Filiation		
		jdatat	Date de l’acte	date
		ccocomm	Code INSEE de la commune de la parcelle mère	String[3]
		ccoprem	Code du préfixe de section de la parcelle mère	String[3]
		ccosecm	Code section de la parcelle mère	String[2]
		dnuplam	Numéro de plan de la parcelle	String[4]
		type_filiation	Type de filiation (D, R, T ou blanc)	String[1]

		
		
		//Information parcelle : TODO : charger dynamiquement selon la parcelle
		var parcelleStore = new Ext.data.JsonStore({
 {
							//envoi des données d'une form
							//Ext.Ajax.request({
							currentForm.getForm().submit({
								method: 'GET',
								url:'../cadastrapp/getCommune/all',
								success: function(form, action) {
									//creation d'un store en retour
									var store = new Ext.data.JsonStore({
										fields: ['ccoinsee', 'libcom', 'libcom_min'],
										data: Ext.util.JSON.decode(form.responseText)
									});	
									addNewResultParcelle(store);
								},
								failure: function(form, action) {
									alert('Failed');
								}
							});
						}

		}); 
		//Information parcelle : TODO : charger dynamiquement selon la parcelle		

		//The Store contains the AjaxProxy as an inline configuration
		var donneescadastralesStore = new Ext.data.Store({
		model: 'Parcelle',
		proxy: {
					type: 'ajax',
					//TODO
					//url : 'parcelle.json'
					}
		});

		store.load();
		
		
		// méthode relative aux données de parcelles
		getParcelle = function(){
	
			
		};
		
		// méthode relative aux données de propriétaires
		getProprietaire = function(){
			
		};
				
		// méthode relative aux données de l'habitation
		getHabitationDetails = function(){
			
		};
		// méthode relative a la fiche d'information cadastrale
		getFic = function(){
			
		};
					

  		//fenêtre principale
		var affichagedonneescadastrales;
			affichagedonneescadastrales = new Ext.Window({
            title: 'TODO',
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
				close(window) {
					affichagedonneescadastrales = null;
				}
			},
			
			if 
			//construction de la vue fiche d'information cadastrale
			//Onglet parcelle
			items: [{
						buttons: [{
						/* TODO
						labelAlign: 'left',				
						text: 'Annuler la demande',
						listeners:{
							click: function(b,e) {
											demandWindow.close();
											}
									 }	*/				
						}],
				xtype: 'fieldset',
				items: [				
					{ xtype:'tabpanel',	height: 160,

					activeTab: 0,
					items:[{
					
						//ONGLET 1
						title:'Parcelle',
						id: 'Form1',
						xtype: 'form',
						height: 200,
						id: 'Form1',
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
					
						//ONGLET 2
						title:'Propriétaires',
						id: 'Form2',
						xtype: 'form',
						defaultType: 'displayfield',
						fileUpload: true,
						
						items: [
								adresseGrid,	//grille "adresse"
								{
								value: 'ou',
								fieldClass: 'displayfieldCenter'
								}]
												
						}]
					},
					{ xtype:'tabpanel',
					activeTab: 0,
					items:[{	
					
						//ONGLET 3
						title:'Bâtiments',
						id: 'Form3',
						xtype: 'form',
						defaultType: 'displayfield',
						fileUpload: true,
						
						items: [
								adresseGrid,	//grille "adresse"
								{
								value: 'ou',
								fieldClass: 'displayfieldCenter'
								}]
												
						}]
					},
					{ xtype:'tabpanel',
					activeTab: 0,
					items:[{	
					
						//ONGLET 4
						title:'Subdivisions fiscales',
						defaultType: 'displayfield',
						id: 'Form4',
						xtype: 'form',
						fileUpload: true,
						
						items: [
								adresseGrid,	//grille "adresse"
								{
								value: 'ou',
								fieldClass: 'displayfieldCenter'
								}]
												
						}]
					},
					{ xtype:'tabpanel',
					activeTab: 0,
					items:[{	
					
						//ONGLET 5
						title:'Historique de mutation',
						defaultType: 'displayfield',
						id: 'Form5',
						xtype: 'form',
						fileUpload: true,
						
						items: [
								adresseGrid,	//grille "adresse"
								{
								value: 'ou',
								fieldClass: 'displayfieldCenter'
								}]
												
						}]
					},
					{ xtype:'tabpanel',
					activeTab: 0,
					items:[{	
					
						//ONGLET 5
						title:'Adresse(s) cadastrale(s)',
						defaultType: 'displayfield',
						id: 'Form5',
						xtype: 'form',
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
				}]
        });
		
		affichagedonneescadastrales.show();
		console.log("onClick")
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	
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
							
							
							var result = new Ext.data.JsonStore({
								fields : ['prenom', 'nom'],
								data   : [
									{prenom : 'nicolas', nom: 'tasia'},
									{prenom : 'pierre', nom: 'jego'},
									{prenom : 'laurent', nom: 'cornic'}
								]
							});
							addNewResultProprietaire(result);
							
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
*/