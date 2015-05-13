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
            width: 540,
            closable: true,
            resizable: true,
        });
		demandWindow.show();
		console.log("onClick")
	};
