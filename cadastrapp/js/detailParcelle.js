
	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")

  	/** public: method[onClickRechercheProprietaire]
     *  :param layer: 
     *  Create ...TODO
     */
    displayDetailParcelle = function(parcelleId) {						
		//fenêtre principale
    	var detailParcelleWindow = new Ext.Window({
			title: 'Parcelle '+parcelleId,
			frame: true,
			autoScroll:true,
			minimizable: true,
			closable: true,
			resizable: false,
			draggable : true,
			constrainHeader: true,
			
			border:false,
			width: 400,
			defaults: {autoHeight:true},
						
			items: [
			{
				xtype:'displayfield',
				fieldLabel: 'Parcelle',
				value: parcelleId
			}]
		});
    	detailParcelleWindow.show();
    	return detailParcelleWindow;
	};