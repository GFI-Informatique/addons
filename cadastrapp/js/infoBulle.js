/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

//onClickDisplayInfoBulle = function(ccocom, ccodep, ccodir, ccopre, 
//        ccosec, dindic, dnupla, dnvoiri, dvoilib, parcelleId ){
    
onClickDisplayInfoBulle = function() {

    // parcelle utilise pour la requete demo
    var parcelle = '2014630103000YA0054';

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
    var batical = "156.5";
    var dvoilib = "PUY DES GOUTTES";
    var comptecommunal = "XXXX";
    var dnupro;
    var dcntpa;
    // INIT infobulle

    // requete vers la WEBAPP, se referer aux specs
    Ext.Ajax.request({
        url : getWebappURL() + 'getInfoBulle?parcelle=' + parcelle,
        failure : function() {
            alert("erreur lors de la requete 'getInfoBulle' ");
        },
        method : "GET",
        success : function(response, opts) {
            var obj = Ext.decode(response.responseText);
            console.log(obj);
            libcom = obj[0].libcom;
            dcntpa = obj[0].dcntpa;
			//todo: dcntpa_sum = obj[0].dcntpa_sum;
            dnvoiri = obj[0].dnvoiri;
            dindic = obj[0].dindic;
            dvoilib = obj[0].dvoilib;
            dnupro = obj[0].dnupro;
            dnomlp = obj[0].dnomlp;
            comptecommunal = obj[0].comptecommunal;
            dcntpa_sum = obj[0].dcntpa_sum;
            sigcal_sum = obj[0].sigcal_sum;
            batical = obj[0].batical;
            //TODO : tout les infos a afficher sont a passes en param
            displayInfoBulle(comptecommunal);
        }

    });

   
}

function displayInfoBulle(comptecommunal) {

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
        // labelWidth : 100,
        // width : 300,
        defaults : {
            autoHeight : true,
            autoWidth : true,
            bodyStyle : 'padding:1px',
            flex : 1
        },
		if (_isCadastre)
		{
        /*
         * listeners: { close: function(window) { windowDisplayInfoBulle = null; },
         */
        items : [ {
            xtype : 'fieldset',
            font : '6px Arial',
            labelWidth : 0,
            padding : 5,
            autoHeight : true,
            defaultType : 'label',
            items : [

//            {
//                fieldLabel : ' ',
//                xtype : 'label',
//                text : libcom + '(' + ccocom + ')'
//            }, {
//                xtype : 'label',
//                text : parcelleId + ccosec
//            }, {
//                xtype : 'label',
//                html : "<br />"
//            }, {
//                xtype : 'label',
//                text : dnvoiri + ' ' + dindic + ' ' + natvoi + ' ' + dvoilib
//            }, {
//                fieldLabel : ' ',
//                xtype : 'label',
//                text : dcntpa_sum + 'm2'
//            }, {
//                fieldLabel : ' ',
//                xtype : 'label',
//                text : sigcal_sum + 'm2'
//            }, 
            {
                xtype : 'displayfield',
                value : comptecommunal,
                hideLabel : true
            }, 
//            {
//                fieldLabel : ' ',
//                xtype : 'label',
//                text : dcntpa_sum
//            }, {
//                fieldLabel : ' ',
//                xtype : 'label',
//                text : sigcal_sum
//            }, {
//                fieldLabel : ' ',
//                xtype : 'label',
//                text : surfbati
//            } 
            ]

        } ]
		 }
    });
    
    windowDisplayInfoBulle.show();
}