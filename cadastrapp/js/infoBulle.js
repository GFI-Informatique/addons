/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

//onClickDisplayInfoBulle = function(ccocom, ccodep, ccodir, ccopre, 
//        ccosec, dindic, dnupla, dnvoiri, dvoilib, parcelleId ){
    
    onClickDisplayInfoBulle = function(){
    var parcelleId = "20146303810000E0958";
    var ccocom = "381";
    var ccodep = "63";
    var ccodir = "0";
    var ccopre = "";
    var ccosec = "E";
    var dindic = "";
    var dnupla = "0958";
    var dnvoiri = "";
    var dvoilib = "PUY DES GOUTTES";

    var InfoBulleData = [ [ "20146303810000E0958", "381", "63", "0", "", "E",
            "", "0958", "", "PUY DES GOUTTES" ] ];

    var InfoBulleStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'ccocom'
        }, {
            name : 'ccosec'
        }, {
            name : 'ccodep'
        }, {
            name : 'ccodir'
        }, {
            name : 'parcelleId'
        }, {
            name : 'ccopre'
        }, {
            name : 'dindic'
        }, {
            name : 'dnupla'
        }, {
            name : 'dnvoiri'
        }, {
            name : 'dvoilib'
        } ],
        data : InfoBulleData
    });
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
        labelWidth : 400,
        width : 850,
        defaults : {
            autoHeight : true,
            bodyStyle : 'padding:10px',
            flex : 1
        },

        /*
         * listeners: { close: function(window) { windowDisplayInfoBulle = null;
         *  },
         */
        items : [ {
            xtype : 'fieldset',
            title : 'XXX',
            labelWidth : 120,
            autoHeight : true,
            defaultType : 'field',
            items : [     
                        {fieldLabel : 'ccocom',     xtype: 'label', text : ccocom,     width : 280},
                        {fieldLabel : 'ccosec',     xtype: 'label', text : ccosec,     width : 280},
                        {fieldLabel : 'ccodep',     xtype: 'label', text : ccodep,     width : 280},
                        {fieldLabel : 'ccodir',     xtype: 'label', text : ccodir,     width : 280},
                        {fieldLabel : 'ccopre',     xtype: 'label', text : ccopre,     width : 280},
                        {fieldLabel : 'dindic',     xtype: 'label', text : dindic,     width : 280},
                        {fieldLabel : 'dnupla',     xtype: 'label', text : dnupla,     width : 280},
                        {fieldLabel : 'dnvoiri',    xtype: 'label', text : dnvoiri,    width : 280},
                        {fieldLabel : 'dvoilib',    xtype: 'label', text : dvoilib,    width : 280},
                        {fieldLabel : 'parcelleId', xtype: 'label', text : parcelleId, width : 280}
            ]
        } ],

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