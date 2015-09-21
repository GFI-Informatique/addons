Ext.namespace("GEOR.Addons.Cadastre");

// Change this to avoir global variables
var printBordereauParcellaireWindow;

/**
 * 
 * @param parcelleId
 * 
 * @returns Ext.Window 
 */
GEOR.Addons.Cadastre.onClickPrintBordereauParcellaireWindow = function(parcelleId) {
    if (printBordereauParcellaireWindow != null) {
        printBordereauParcellaireWindow.close();
    }
    
    // Test if user have CNIL level 1 or 2
    // ask if user want with or without personnal data
    if (GEOR.Addons.Cadastre.isCNIL1 || GEOR.Addons.Cadastre.isCNIL2){
        GEOR.Addons.Cadastre.initPrintBordereauParcellaireWindow(parcelleId);
        printBordereauParcellaireWindow.show();
    }else{
        // PARAMS
        var params = {
            parcelle : parcelleId, personaldata:0
        } 
        var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createBordereauParcellaire?' + Ext.urlEncode(params);

        Ext.DomHelper.useDom = true;
        
        // Directly download file, without and call service without ogcproxy
        Ext.DomHelper.append(document.body, {
            tag : 'iframe',
            id : 'downloadIframe',
            frameBorder : 0,
            width : 0,
            height : 0,
            css : 'display:none;visibility:hidden;height:0px;',
            src : url
        });
        
        //TODO add waiting panel
        printBordereauParcellaireWindow.close();
    }
}

/**
 * init new windows
 * 
 * @param parcelleId
 */
GEOR.Addons.Cadastre.initPrintBordereauParcellaireWindow = function(parcelleId) {

    // fenêtre principale
    printBordereauParcellaireWindow = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.bordereauparcellaire.title') + ' - ' + parcelleId,
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : false,
        draggable : true,
        constrainHeader : true,

        border : false,
        width : 300,
        defaults : {
            autoHeight : true,
            bodyStyle : 'padding:10px',
            flex : 1
        },

        listeners : {
            close : function(window) {
                printBordereauParcellaireWindow = null;
            }
        },

        items : [ {
            xtype : 'form',
            id : 'bordereauForm',
            height : 200,
            labelWidth : 1,
            autoHeight : true,

            items : [ {
                xtype : 'fieldset',
                title : OpenLayers.i18n('cadastrapp.bordereauparcellaire.data'),
                autoHeight : true,

                items : [ {
                    xtype : 'hidden',
                    name : 'parcelle',
                    value : parcelleId
                }, {
                    xtype : 'radio',
                    boxLabel : OpenLayers.i18n('cadastrapp.bordereauparcellaire.data.without'),
                    checked : true,
                    name : 'personaldata',
                    inputValue : 0

                }, {
                    xtype : 'radio',
                    boxLabel : OpenLayers.i18n('cadastrapp.bordereauparcellaire.data.with'),
                    name : 'personaldata',
                    inputValue : 1
                } ]
            } ]
        } ],

        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.generate'),
            listeners : {
                click : function(b, e) {

                    // PARAMS
                    var params = printBordereauParcellaireWindow.items.items[0].getForm().getValues();
                    var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createBordereauParcellaire?' + Ext.urlEncode(params);

                    // Needed for IE
                    //Ext.DomHelper.useDom = true;

                    // Directly download file, without and call service without ogcproxy
                    Ext.DomHelper.append(document.body, {
                        tag : 'iframe',
                        id : 'downloadIframe',
                        frameBorder : 0,
                        width : 0,
                        height : 0,
                        css : 'display:none;visibility:hidden;height:0px;',
                        src : url
                    });
                    
                    //TODO add waiting panel
                    printBordereauParcellaireWindow.close();
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.close'),
            listeners : {
                click : function(b, e) {
                    printBordereauParcellaireWindow.close();
                }
            }
        } ]
    });
}