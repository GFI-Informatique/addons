Ext.namespace("GEOR.Addons.Cadastre");

GEOR.Addons.Cadastrapp = Ext.extend(GEOR.Addons.Base, {

    control: null,

    window: null,

    /**
     * Method: init
     * 
     * @param: record - {Ext.data.record} a record with the addon parameters
     */
    init: function(record) {
        
        // Get information for addons options
        GEOR.Addons.Cadastre.WFSLayerSetting = this.options.WFSLayerSetting;
        
        GEOR.Addons.Cadastre.cadastrappWebappUrl = this.options.webapp.url+"services/";
        GEOR.Addons.Cadastre.minCharToSearch = this.options.webapp.minCharToSearch;
        
        GEOR.Addons.Cadastre.cnil1RoleName = this.options.CNIL.cnil1RoleName;
        GEOR.Addons.Cadastre.cnil2RoleName = this.options.CNIL.cnil2RoleName;
        
        GEOR.Addons.Cadastre.relevePropriete=[];
        GEOR.Addons.Cadastre.relevePropriete.maxProprietaire = 25;
        
        // Init gobal variables   
        GEOR.Addons.Cadastre.selectedFeatures = [];
        GEOR.Addons.Cadastre.selectLayer;
        GEOR.Addons.Cadastre.newGrid,tabs;
       
        // TODO check why click on global
        GEOR.Addons.Cadastre.click;
        
        var cadastrapp = new GEOR.Addons.Cadastre.Menu({
            map: this.map,
            popupOptions: {
                unpinnable: false,
                draggable: true
            }
        });

        this.map.allOverlays = false;

        GEOR.Addons.Cadastre.addWMSLayer(this.options.WMSLayer);
        GEOR.Addons.Cadastre.createSelectionControl(this.options.defautStyleParcelle , this.options.selectedStyle);
        GEOR.Addons.Cadastre.addPopupOnhover(this.options.popup);

        this.window = new Ext.Window({
            title: OpenLayers.i18n('cadastrapp.cadastre_tools'),
            width: 540,
            closable: true,
            closeAction: "hide",
            resizable: false,
            border: false,
            constrainHeader: true,
            cls: 'cadastrapp',
            items: [ {
                xtype: 'toolbar',
                border: false,
                items: cadastrapp.actions
            } ],
            listeners: {
                "hide": function() {
                    this.item && this.item.setChecked(false);
                    this.components && this.components.toggle(false);
                },
                scope: this
            }
        });

        if (this.target) {
            // create a button to be inserted in toolbar:
            this.components = this.target.insertButton(this.position, {
                xtype: 'button',
                tooltip: this.getTooltip(record),
                iconCls: "addon-cadastrapp",
                handler: this._onCheckchange,
                scope: this
            });
            this.target.doLayout();
        } else {
            // create a menu item for the "tools" menu:
            this.item = new Ext.menu.CheckItem({
                text: this.getText(record),
                qtip: this.getQtip(record),
                iconCls: "addon-cadastrapp",
                checked: false,
                listeners: {
                    "checkchange": this._onCheckchange,
                    scope: this
                }
            });
        }
    },

    /**
     * Method: _onCheckchange Callback on checkbox state changed
     */
    _onCheckchange: function(item, checked) {
        if (checked) {
            this.window.show();
            this.window.alignTo(Ext.get(this.map.div), "t-t", [ 0, 5 ], true);
        } else {
            this.window.hide();
        }
    },

    /**
     * Method: destroy Called by GEOR_tools when deselecting this addon
     */
    destroy: function() {
        
        // Remove menu
        this.window.hide();
        this.control = null;
        
        // Delete selectedFeature 
        GEOR.Addons.Cadastre.selectedFeatures=null;
        
        // Remove WMS Layer
        layer.map.removeLayer(GEOR.Addons.Cadastre.WMSLayer);
        GEOR.Addons.Cadastre.WMSLayer.destroy();
        
        // Remove WFSLayer
        layer.map.removeLayer(GEOR.Addons.Cadastre.selectLayer);
        GEOR.Addons.Cadastre.selectLayer.destroy();

        GEOR.Addons.Base.prototype.destroy.call(this);
    }
    
});
