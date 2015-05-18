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
		var informationDemandeurForm, biensConsulterForm;
			demandWindow = new Ext.Window({
            title: 'Demande Informations Foncieres',
            width: 540,
			height: 800,
			minimizable: true,
            closable: true,
            resizable: true,
			draggable : true,
			items: [{
			    layout: 'form', 
				title: 'Informations sur le demandeur',
				items: [{
							fieldLabel: 'Nom',
							name: 'nom',
							allowBlank: true
							},{
							fieldLabel: 'Prénom',
							name: 'prenom'
							},{
							fieldLabel: 'Ville, Commune',
							name: 'commune',
							allowBlank: false
							}],
				layout: 'form', 
				title: 'Biens à consulter',
				items: [{
							fieldLabel: 'Ville, Commune',
							name: 'commune',
							allowBlank: false
							},{
							fieldLabel: 'Prénom',
							name: 'prenom'
							},{
							fieldLabel: 'Adresses cadastrale',
							name: 'commune',
							allowBlank: false
							},{
							fieldLabel: 'N° de voirie et rue',
							name: 'numero'
							}]
			}],
			buttonAlign : 'center',
			xtype: 'button',
			text: 'Annuler la Demande',
			handler: function(){
			Ext.Msg.alert('Annuler la demande');
			},
			xtype: 'button',
			text: 'Imprimer la Demande',
			handler: function(){
			Ext.Msg.alert('Imprimer la Demande');
			}
        });
		demandWindow.show();
		console.log("onClick")
	};
