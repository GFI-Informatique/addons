/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

/**
 * public: method[onClickdisplayFIUF] :param layer: Create ...TODO
 */
onClickDisplayFIUF = function() {
    var windowFIUF, parcelleGrid;

    var FiufGlobalInfosData = [ 
                                [ 'Surface DGFIP', "1420" ], 
                                [ 'Surface SIG', "1423" ],
                                [ 'Surface batie', "200" ]
                              ];
    
    var FiufProprietaireData = [ 
                                 [ 'Proprietaire 1' ], 
                                 [ 'Proprietaire 2' ]
                               ];
    
    var FiufGlobalInfosStore = new Ext.data.ArrayStore({
        fields : [ 
                   {
                      name : 'uniteFonciere'
                   }, 
                   {
                	   name : 'surface',
                	   type : 'float'
                   	},
                 ],
        data : FiufGlobalInfosData
    });

    var FiufProprietaireStore = new Ext.data.ArrayStore({
        fields : [ {
            name : 'proprietaire'
        }],
        data : FiufProprietaireData
    });
    
    FiufGlobalInfosGrid = new Ext.grid.GridPanel({
        store : FiufGlobalInfosStore,
        stateful : true,
        name : 'FIUF_globalInformations',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                sortable : false,
            },
            columns : [ {
                header : OpenLayers.i18n('cadastrapp.uniteFonciere'),
                width : 100,
                dataIndex : 'uniteFonciere'
            }, {
            	header : OpenLayers.i18n('cadastrapp.surface'),
                width : 100,
                renderer: Ext.util.Format.numberRenderer('0,000.00 m'),
                dataIndex : 'surface'
            }, ],
        }),
        height : 100,
        width : 200,
        border : true,
    });
    
    FiufProprietaireGrid = new Ext.grid.GridPanel({
        store : FiufProprietaireStore,
        stateful : true,
        name : 'Fiuf_Proprietaire',
        xtype : 'editorgrid',
        colModel : new Ext.grid.ColumnModel({
            defaults : {
                width : 100,
                sortable : false,
            },
            columns : [ {
            	header: OpenLayers.i18n('cadastrapp.CoProprietaire'),
                width : 150,
                dataIndex : 'proprietaire'
            }, ],
        }),
        height : 100,
        width : 150,
        border : true,
    });

    
    windowFIUF = new Ext.Window({
        title : 'DXXX',
        frame : true,
        bodyPadding : 10,
        autoScroll : true,
        width : 450,
        minimizable : true,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,

        items : [ {
            xtype : 'compositefield',
            margins :{
            	 right: 10,
            	 left: 10
            }, 
            
            items : [ 
                    FiufGlobalInfosGrid,
                    FiufProprietaireGrid, 
                    ]
        } ]

    });
    windowFIUF.show();
    console.log("displayFIUF onClick")
};
