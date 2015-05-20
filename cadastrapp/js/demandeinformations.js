
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

		var demandWindow;
			demandWindow = new Ext.Window({
            title: 'Demande Informations Foncieres',
			frame: true,
			bodyPadding: 10,
			autoScroll:true,
			width: 355,
			minimizable: true,
            closable: true,
            resizable: true,
			draggable : true,
			fieldDefaults: {
				labelAlign: 'right',
				labelWidth: 115,
				msgTarget: 'side'
		},
	    items: [{
			xtype: 'fieldset',
			title: 'Informations sur le demandeur',
			defaultType: 'textfield',
			items: [
				{ fieldLabel: 'Nom', name: 'nom'},
				{ fieldLabel: 'Prénom', name: 'prenom'},
				{ fieldLabel: 'Ville, Commune', name: 'commune'},
				{ fieldLabel: 'N° de voirie et rue', name: 'numero'},
				{ fieldLabel: 'Rue', name: 'rue'},
				{ fieldLabel: 'Lieu-Dit', name: 'lieudit'},
				{ fieldLabel: 'CNI', name: 'cni'}
				]
			},
			{
			xtype: 'fieldset',
			title: 'Biens à consulter',
			defaultType: 'textfield',
			items: [				
				{ fieldLabel: 'Ville, Commune', name: 'commune'},
				{ fieldLabel: 'Parcelle(s)', name: 'parcelle'},
				{ fieldLabel: 'Adresse(s) cadastrale(s)'}
				]
			}],
        buttons: [{
            text: 'Annuler la demande'
			},{
            text: 'Imprimer la demande'
			}]
        });
		
		demandWindow.show();
		console.log("onClick")
	};