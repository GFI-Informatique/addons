
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
    var formParcelles = Ext.form;

    // the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store (created below)
    var colformParcelles = new Ext.grid.ColumnModel({
        // specify any defaults for each column
       defaults: {
            sortable: true, // columns are not sortable by default ,
			fieldLabel: 'Parcelle(s)'		
        },
        columns: [{
            id: 'Section',
            header: 'Section',
            dataIndex: 'section',
//			xtype: 'combo',
            width: 220
            // use shorthand alias defined above
 /*           editor: new fm.TextField({
                allowBlank: false
            })*/
        }, {
            header: 'Parcelle',
            dataIndex: 'parcelle',
            width: 130,

  /*           editor: new fm.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                // transform the data already specified in html
                transform: 'light',
//                lazyRender: true,
                listClass: 'x-combo-list-small' 
            })*/
		
       
      }] 
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
//				{ labelWidth: 60, fieldLabel: '', name: ''},
				                    {
                        xtype: 'compositefield',
                        fieldLabel: 'N° de voirie et rue',
                        items: [
                           {
                               name : 'numero',
                               xtype: 'numberfield',
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
				{ fieldLabel: 'Parcelle(s)', name: 'parcelle'
//					{xtype: 'grid', name:'colformParcelles'}
				},
				{ fieldLabel: 'Adresse(s) cadastrale(s)', name: 'adresse'}
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