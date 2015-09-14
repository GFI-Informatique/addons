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
    GEOR.Addons.Cadastre.initPrintBordereauParcellaireWindow(parcelleId);
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

                    //envoi des données d'une form
                    Ext.Ajax.request({
                        method: 'GET',
                        url: GEOR.Addons.Cadastre.cadastrappWebappUrl + 'createBordereauParcellaire',
                        params:printBordereauParcellaireWindow.items.items[0].getForm().getValues(),
                        success: function(result) {
                            printBordereauParcellaireWindow.close();
                        },
                        failure: function(result) {
                            printBordereauParcellaireWindow.close();
                            alert('Erreur lors de la récupération du bordereau parcellaire');
                        }
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