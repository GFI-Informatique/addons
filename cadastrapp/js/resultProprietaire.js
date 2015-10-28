Ext.namespace("GEOR.Addons.Cadastre");


/**
 * Init Global windows containing all tabs
 */
GEOR.Addons.Cadastre.initResultProprietaireWindow = function() {
    
    var ownerGrid = new Ext.grid.GridPanel({
        store: new Ext.data.JsonStore({
            autoDestroy: true,
            storeId:"resultOwnerStore",
            fields: ['comptecommunal', 'ddenom'],
            autoload:false
        }),
        colModel: new Ext.grid.ColumnModel({
            defaults: {
                sortable: true
            },
            columns: [
                {id: 'comptecommunal', header: OpenLayers.i18n('cadastrapp.result.owner.comptecommunal'), width: 35, dataIndex: 'comptecommunal'},
                {header: OpenLayers.i18n('cadastrapp.result.owner.ddenom'), dataIndex: 'ddenom'}
            ]
        }),
        viewConfig: {
            forceFit: true,
        },
        sm : new Ext.grid.RowSelectionModel({multiSelect : true,}),
        autoHeight: true
    });
        

    // fenêtre principale
    GEOR.Addons.Cadastre.result.owner.window = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.result.owner.title'),
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        border : false,
        width : 580,
        height : 200,
        listeners : {
            close : function(window) {
                GEOR.Addons.Cadastre.result.owner.window = null;
            }
        },
        items : [ ownerGrid ],
        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.result.parcelle.export'),
            listeners : {
                click : function(b, e) {

                    // Export selected plots as csv
                    GEOR.Addons.Cadastre.exportOwnerSelectionAsCSV();
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.close'),
            listeners : {
                click : function(b, e) {
                    // Close all tab and open windows
                    GEOR.Addons.Cadastre.result.owner.window.close();
                }
            }
        } ]
    });
};



/**
 * public: method[addNewResult]
 * 
 * Call the initWindows method if windows do not exist then fill one tab with
 * given information or message
 * 
 * @param: title tab title
 * @param: result to be store in a grid
 * @param: message to replace data if not exist
 */
GEOR.Addons.Cadastre.addNewResultProprietaire = function(title, result, message) {

    // If windows do not exist
    if (GEOR.Addons.Cadastre.result.owner.window == null) {
        GEOR.Addons.Cadastre.initResultProprietaireWindow();
    }

    GEOR.Addons.Cadastre.result.owner.window.items.items[0].getStore().loadData(result);
    
    GEOR.Addons.Cadastre.result.owner.window.show();
}



/**
 * Export current selection of owenr as CSV
 */
GEOR.Addons.Cadastre.exportOwnerSelectionAsCSV = function() {

    if (GEOR.Addons.Cadastre.result.owner.window) {
      
         var selection = GEOR.Addons.Cadastre.result.owner.window.items.items[0].getSelectionModel().getSelections();
        
        if (selection && selection.length > 0) {
            var ownerIds = [];
            Ext.each(selection, function(item) {
                ownerIds.push(item.data.comptecommunal);
            });

            // PARAMS
            var params = {
                data : ownerIds
            }
            var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'exportAsCsv?' + Ext.urlEncode(params);

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
        } else {
            Ext.Msg.alert('Status', OpenLayers.i18n('cadastrapp.result.owner.no.selection'));
        }
    } else {
        Ext.Msg.alert('Status', OpenLayers.i18n('cadastrapp.result.owner.no.search'));
    }
}

