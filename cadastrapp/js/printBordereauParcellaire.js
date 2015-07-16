Ext.namespace("GEOR.Addons.Cadastre");

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
    initPrintBordereauParcellaireWindow(parcelleId);
    printBordereauParcellaireWindow.show();
    return printBordereauParcellaireWindow;
}

/**
 * init new windows
 * 
 * @param parcelleId
 */
GEOR.Addons.Cadastre.initPrintBordereauParcellaireWindow = function(parcelleId) {
    // fenêtre principale
   var printBordereauParcellaireWindow = new Ext.Window({
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
                    name : 'data',
                    inputValue : 'false'

                }, {
                    xtype : 'radio',
                    boxLabel : OpenLayers.i18n('cadastrapp.bordereauparcellaire.data.with'),
                    name : 'data',
                    inputValue : 'true'
                } ]
            } ]
        } ],

        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.generate'),
            listeners : {
                click : function(b, e) {

                    // PARAMS
                    var params = printBordereauParcellaireWindow.items.items[0].getForm().getValues();
                    var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle/toFile?' + Ext.urlEncode(params);

                    // téléchargement du fichier
                    Ext.DomHelper.append(document.body, {
                        tag : 'iframe',
                        id : 'downloadIframe',
                        frameBorder : 0,
                        width : 0,
                        height : 0,
                        css : 'display:none;visibility:hidden;height:0px;',
                        src : url
                    });
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