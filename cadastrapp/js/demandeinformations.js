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
			bodyBorder : true,
			items: [{
			    layout: 'form', 
				title: 'Informations sur le demandeur',
				bodyStyle:'padding:5px 5px 0',
				border : true,
				width: 600,
				items: [{
					        xtype:'textfield',
							fieldLabel: 'Nom',
							name: 'nom',
							allowBlank: true
							},{
						    xtype:'textfield',
							fieldLabel: 'Prénom',
							name: 'prenom'
							},{
						    xtype:'textfield',
							fieldLabel: 'N° de voirie et rue',
							name: 'numéro',
							allowBlank: false
							}],
				layout: 'form',
				title: 'Biens à consulter',
				bodyStyle:'padding:5px 5px 0',
				border : true,
				width: 600,
				items: [{
	                        xtype:'textfield',
							fieldLabel: 'Ville, Commune',
							name: 'commune',
							allowBlank: false
							},{
						    xtype:'textfield',
							fieldLabel: 'Section',
							name: 'section'
							},{
						    xtype:'textfield',
							fieldLabel: 'Parcelle',
							name: 'parcelle'
							},{
						    xtype:'textfield',
							autoScroll: true,
							fieldLabel: 'Adresses cadastrale',
							name: 'commune',
							allowBlank: false
							}]
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
