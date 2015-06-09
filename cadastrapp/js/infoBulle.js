/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

//onClickDisplayInfoBulle = function(ccocom, ccodep, ccodir, ccopre, 
//        ccosec, dindic, dnupla, dnvoiri, dvoilib, parcelleId ){
    
    onClickDisplayInfoBulle = function(){
    var parcelleId = "025";
    var libcom = "CLERMONT";
    var ccocom = "63005";
    var ccodep = "63";
    var ccodir = "0";
    var ccopre = "";
    var ccosec = "AZ";
    var natvoi = "rue";
    var dindic = "";
    var dnupla = "0958";
    var dnvoiri = "16";
    var dcntpa_sum = "789.56";
	var sigcal_sum = "712.22";
	var surfbati = "156.5";
    var dvoilib = "PUY DES GOUTTES";
	var comptecommunal = "63005L112"

    // Construction de la fenêtre principale
    var windowDisplayInfoBulle;
    windowDisplayInfoBulle = new Ext.Window({

        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : false,
        draggable : true,
        constrainHeader : true,

        border : false,
//        labelWidth : 100,
 //       width : 300,
        defaults : {
            autoHeight : true,
			autoWidth : true,
            bodyStyle : 'padding:1px',
            flex : 1
        },

        /*
         * listeners: { close: function(window) { windowDisplayInfoBulle = null;
         *  },
         */
        items : [ {
            xtype : 'fieldset',
			font: '6px Arial',
            labelWidth : 0,
			padding: 5,
            autoHeight : true,
            defaultType : 'label',
			items : [   
			
                        {fieldLabel: ' ',	xtype: 'label', text : libcom+'('+ccocom+')'},
                        {fieldLabel: ' ',	xtype: 'label', text : parcelleId+ccosec},
                        {fieldLabel: ' ',	xtype: 'label', text : dnvoiri +' '+ dindic +' '+natvoi+' '+dvoilib},
                        {fieldLabel: ' ',	xtype: 'label', text : dcntpa_sum+'m2'},
                        {fieldLabel: ' ',	xtype: 'label', text : sigcal_sum+'m2'},
 						{fieldLabel: ' ',	xtype: 'label', text : comptecommunal},
                        {fieldLabel: ' ',	xtype: 'label', text : dcntpa_sum},
                        {fieldLabel: ' ',	xtype: 'label', text : sigcal_sum},
                        {fieldLabel: ' ',	xtype: 'label', text : surfbati}                       
				]

        } ],
/**		
		if (_isCadastre)
		{}
		if (_isFoncier)
		{}
*/
    /*
     * //windowDisplayInfoBulle.show(ccocom,ccodep,ccodir,
     * ccopre,ccosec,dindic,dnupla,dnvoiri,dvoilib,parcelleId);
     * console.log("ccocom : " + ccocom + " ccodep : " +ccodep+ " ccodir : " +
     * ccodir + " ccopre : " +ccopre + " ccosec : "+ccosec + " dindic :
     * "+dindic+ " dnupla : "+ dnupla + " dnvoiri : "+dnvoiri+ " dvoilib : "+
     * dvoilib + " parcelleId : "+parcelleId);
     */
    });
    windowDisplayInfoBulle.show();
}