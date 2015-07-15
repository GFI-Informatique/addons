Ext.namespace("GEOR.Addons");

GEOR.Addons.Cadastrapp = Ext.extend(GEOR.Addons.Base, {

    control : null,

    window : null,

    /**
     * Method: init
     * 
     * Parameters: record - {Ext.data.record} a record with the addon parameters
     */
    init : function(record) {
        
        // get information for addons options
        WFSLayerSetting = this.options.WFSLayerSetting;
        
        cadastrappWebappUrl = this.options.webapp.url;
        cnil1RoleName = this.options.CNIL.cnil1RoleName;
        cnil2RoleName = this.options.CNIL.cnil2RoleName
        
        // TODO remove this and place it into good namespace
        isCNIL1 = function() {
            return (GEOR.config.ROLES.indexOf(cnil1RoleName) != -1);
        };
        
        isCNIL2 = function() {
            return (GEOR.config.ROLES.indexOf(cnil2RoleName) != -1);
        };
       
        var cadastrapp = new GEOR.Cadastrapp({
            map : this.map,
            popupOptions : {
                unpinnable : false,
                draggable : true
            }
        });

        this.map.allOverlays = false;

        addWMSLayer(this.options.WMSLayer);
        createSelectionControl(this.options.defautStyleParcelle , this.options.selectedStyle);
        addPopupOnhover(this.options.popup);

        this.window = new Ext.Window({
            title : OpenLayers.i18n('cadastrapp.cadastre_tools'),
            width : 540,
            closable : true,
            closeAction : "hide",
            resizable : false,
            border : false,
            constrainHeader : true,

            cls : 'cadastrapp',
            items : [ {
                xtype : 'toolbar',
                border : false,
                items : cadastrapp.actions
            } ],
            listeners : {
                "hide" : function() {
                    this.item && this.item.setChecked(false);
                    this.components && this.components.toggle(false);
                },
                scope : this
            }
        });


        if (this.target) {
            // create a button to be inserted in toolbar:
            this.components = this.target.insertButton(this.position, {
                xtype : 'button',
                tooltip : this.getTooltip(record),
                iconCls : "addon-cadastrapp",
                handler : this._onCheckchange,
                scope : this
            });
            this.target.doLayout();
        } else {
            // create a menu item for the "tools" menu:
            this.item = new Ext.menu.CheckItem({
                text : this.getText(record),
                qtip : this.getQtip(record),
                iconCls : "addon-cadastrapp",
                checked : false,
                listeners : {
                    "checkchange" : this._onCheckchange,
                    scope : this
                }
            });
        }

    },

    /**
     * Method: _onCheckchange Callback on checkbox state changed
     */
    _onCheckchange : function(item, checked) {
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
    destroy : function() {
        this.window.hide();
        this.control = null;

        GEOR.Addons.Base.prototype.destroy.call(this);
    }

});
