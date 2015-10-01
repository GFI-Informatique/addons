Ext.namespace("GEOR.Addons.Cadastre");

/**
 * @include OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Control/SelectFeature.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/Handler/RegularPolygon.js
 * @include OpenLayers/Lang.js
 * @include GeoExt/widgets/Action.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/Popup.js
 */

// ***************
var _isCadastre = true;
var _isFoncier = false;


GEOR.Addons.Cadastre.isCadastre = function() {
    return _isCadastre;
}
GEOR.Addons.Cadastre.isFoncier = function() {
    return _isFoncier;
}

/**
 * api: constructor .. class:: Cadastrapp(config)
 * 
 * Create a menu main controler for cadastrapp
 */
GEOR.Addons.Cadastre.Menu = Ext.extend(Ext.util.Observable, {

    /**
     * api: property[map] ``OpenLayers.Map`` A configured map object.
     */
    map : null,

    /**
     * api: config[cadastrappControls] ``Array(OpenLayers.Control.DrawFeature)``
     * An array of DrawFeature controls automatically created from the layer.
     */
    cadastrappControls : null,

    /**
     * api: config[lastDrawControl] ``OpenLayers.Control.DrawFeature`` The last
     * active cadastrapp control.
     */
    lastDrawControl : null,

    /**
     * api: config[actions] ``Array(GeoExt.Action or Ext.Action)`` An array of
     * actions created from various controls or tasks that are to be added to a
     * toolbar.
     */
    actions : null,

    /**
     * api: config[featureControl] ``OpenLayers.Control.ModifyFeature or
     * OpenLayers.Control.SelectFeature`` The OpenLayers control responsible of
     * selecting the feature by clicks on the screen and, optionnaly, edit
     * feature geometry.
     */
    featureControl : null,

    /**
     * api: config[featurePanel] ``GEOR.FeaturePanel`` A reference to the
     * FeaturePanel object created
     */
    featurePanel : null,

    /**
     * api: config[popup] ``GeoExt.Popup`` A reference to the Popup object
     * created
     */
    popup : null,

    /**
     * api: config[downloadService] ``String`` URL used in order to use a server
     * download service. The attributes "format" and "content" are sent (POST)
     * to this service.
     */
    /**
     * private: property[downloadService] ``String`` URL used in order to use a
     * server download service. The attributes "format" and "content" are sent
     * (POST) to this service.
     */
    downloadService : null,

    /**
     * private: property[useDefaultAttributes] ``Boolean`` If set to true,
     * defaultAttributes are set to new features added with no attributes.
     */
    useDefaultAttributes : true,

    /**
     * api: config[defaultAttributes] ``Array(String)`` An array of attribute
     * names to used when a blank feature is added to the map if
     * useDefaultAttributes is set to true.
     */
    defaultAttributes : [ 'label', 'description' ],

    /**
     * api: config[defaultAttributesValues] ``Array(String|Number)`` An array of
     * attribute values to used when a blank feature is added to the map if
     * useDefaultAttributes is set to true. This should match the
     * defaultAttributes order.
     */
    defaultAttributesValues : [ OpenLayers.i18n('cadastrapp.no_title'), '' ],

    /**
     * private: property[style] ``Object`` Feature style hash to use when
     * creating a layer. If none is defined,
     * OpenLayers.Feature.Vector.style['default'] is used instead.
     */
    style : null,

    /**
     * private: property[defaultStyle] ``Object`` Feature style hash to apply to
     * the default OpenLayers.Feature.Vector.style['default'] if no style was
     * specified.
     */
    defaultStyle : {
        fillColor : "#FF0000",
        strokeColor : "#FF0000",
        fontColor : "#000000"
    },

    /**
     * api: config[layerOptions] ``Object`` Options to be passed to the
     * OpenLayers.Layer.Vector constructor.
     */
    layerOptions : {},

    /**
     * api: config[fadeRatio] ``Numeric`` The fade ratio to apply when features
     * are not selected.
     */
    fadeRatio : 0.4,

    /**
     * api: config[opacityProperties] ``Array(String)`` The style properties
     * refering to opacity.
     */
    opacityProperties : [ "fillOpacity", "hoverFillOpacity", "strokeOpacity", "hoverStrokeOpacity" ],

    /**
     * api: config[defaultOpacity] ``Numeric`` Default opacity maximum value
     */
    defaultOpacity : 1,

    /**
     * api: property[toggleGroup] ``String`` The name of the group used for the
     * buttons created. If none is provided, it's set to this.map.id.
     */
    toggleGroup : null,

    /**
     * api: property[popupOptions] ``Object`` The options hash used when
     * creating GeoExt.Popup objects.
     */
    popupOptions : {},

    /**
     * api: property[styler] ``Styler`` The styler type to use in the
     * FeaturePanel widget.
     */
    styler : null,

    /**
     * private: method[constructor] Private constructor override.
     */
    constructor : function(config) {
        Ext.apply(this, config);

        this.cadastrappControls = [];
        this.actions = [];

        this.initMap();
        var info;
        // if set, automatically creates a "cadastrapp" layer
        var style = this.style || OpenLayers.Util.applyDefaults(this.defaultStyle, OpenLayers.Feature.Vector.style["default"]);
        var styleMap = new OpenLayers.StyleMap({
            'default' : style,
            'vertices' : new OpenLayers.Style({
                pointRadius : 5,
                graphicName : "square",
                fillColor : "white",
                fillOpacity : 0.6,
                strokeWidth : 1,
                strokeOpacity : 1,
                strokeColor : "#333333"
            })
        });
        var layerOptions = OpenLayers.Util.applyDefaults(this.layerOptions, {
            styleMap : styleMap,
            displayInLayerSwitcher : false
        });
        layer = new OpenLayers.Layer.Vector("__georchestra_cadastrapps", layerOptions);
        this.layer = layer;
        this.map.addLayer(layer);

        // *********************************************************************
        // *********************************************************************

        layer.events.on({
            "beforefeatureselected" : this.onBeforeFeatureSelect,
            "featureunselected" : this.onFeatureUnselect,
            "featureselected" : this.onFeatureSelect,
            "beforefeaturemodified" : this.onModificationStart,
            "featuremodified" : this.onModification,
            "afterfeaturemodified" : this.onModificationEnd,
            "beforefeatureadded" : this.onBeforeFeatureAdded,
            scope : this
        });

        // 2nd, create new ones from the current active layer
        this.initZoomControls(layer);
        this.actions.push('-');
        this.initSelectionControls(layer);
        this.actions.push('-');
        this.initCadastrappControls(layer);
        this.actions.push('-');
        this.initRechercheControls(layer);
        this.actions.push('-');
        this.initDemandeControl(layer);

        GEOR.Addons.Cadastre.Menu.superclass.constructor.apply(this, arguments);
    },

    /**
     * private: method[initMap] Convenience method to make sure that the map
     * object is correctly set.
     */
    initMap : function() {
        if (this.map instanceof GeoExt.MapPanel) {
            this.map = this.map.map;
        }

        if (!this.map) {
            this.map = GeoExt.MapPanel.guess().map;
        }

        // if no toggleGroup was defined, set to this.map.id
        if (!this.toggleGroup) {
            this.toggleGroup = this.map.id;
        }

    },

    /**
     * private: method[initZoomControls]
     * 
     * @param layer:
     *            ``OpenLayers.Layer.Vector``
     * 
     * init action on zoom button
     */
    initZoomControls : function(layer) {
        var control, action, iconCls, actionOptions, tooltip;

        handler = OpenLayers.Handler.Path;
        iconCls = "gx-featureediting-zoom";
        tooltip = OpenLayers.i18n("Zoom to results extent");
        actionOptions = {
            allowDepress : true,
            pressed : false,
            tooltip : tooltip,
            iconCls : iconCls,
            text : OpenLayers.i18n("cadastrapp.zoom"),
            iconAlign : 'top',
            // check item options
            group : this.toggleGroup,
            checked : false,
            handler : function(){
                GEOR.Addons.Cadastre.zoomOnFeatures(GEOR.Addons.Cadastre.result.tabs.activeTab.selectedFeatures);
            }
        };

        action = new Ext.Button(actionOptions);
        this.actions.push(action);

    },
    /**
     * private: method[initSelectionControls]
     * 
     * @param layer:
     *            ``OpenLayers.Layer.Vector`` init action on selection button
     */
    initSelectionControls : function(layer) {
        var control, handler, geometryTypes, geometryType, options, action, iconCls, actionOptions, tooltip;

        geometryTypes = [ "Point", "LineString", "Polygon" ];

        for (var i = 0; i < geometryTypes.length; i++) {
            options = {
                handlerOptions : {
                    stopDown : true,
                    stopUp : true
                }
            };
            geometryType = geometryTypes[i];

            switch (geometryType) {
            case "LineString":
                handler = OpenLayers.Handler.Path;
                iconCls = "gx-featureediting-cadastrapp-line";
                tooltip = OpenLayers.i18n("cadastrapp.create_line");
                break;
            case "Point":
                handler = OpenLayers.Handler.Point;
                iconCls = "gx-featureediting-cadastrapp-point";
                tooltip = OpenLayers.i18n("cadastrapp.create_point");

                break;
            case "Polygon":
                handler = OpenLayers.Handler.Polygon;
                iconCls = "gx-featureediting-cadastrapp-polygon";
                tooltip = OpenLayers.i18n("cadastrapp.create_polygon");
                break;
            }

            control = new OpenLayers.Control.DrawFeature(layer, handler, options);

            this.cadastrappControls.push(control);

            control.events.on({
                "featureadded" : this.onFeatureAdded,
                scope : this
            });

            actionOptions = {
                control : control,
                map : this.map,
                // button options
                toggleGroup : this.toggleGroup,
                allowDepress : true,
                pressed : false,
                tooltip : tooltip,
                iconCls : iconCls,
                text : OpenLayers.i18n("cadastrapp." + geometryType.toLowerCase()),
                iconAlign : 'top',
                // check item options
                group : this.toggleGroup,
                checked : false
            };

            action = new GeoExt.Action(actionOptions);

            this.actions.push(action);
        }

    },

    /**
     * private: method[initCadastrappControls] :param layer:
     * ``OpenLayers.Layer.Vector``
     * 
     * Init action on checkBox Foncier or Cadastre
     */
    initCadastrappControls : function(layer) {
        // menu : checkbox cadastre
        var cadastrePanel = new Ext.Panel({
            frame: false,
            border: false,
            bodyStyle: 'background:transparent;',
            style: 'margin-left:5px;margin-right:5px',
            items: [ {
                id: 'UCCheckbox',
                xtype: 'checkbox',
                checked: _isCadastre,
                style: 'margin-top:2px;margin-left:15px',
                listeners: {
                    check: function(cb, checked) {
                        _isCadastre = checked;
                    },
                    render: function(c) {
                        Ext.QuickTips.register({
                            target: c,
                            text: OpenLayers.i18n("cadastrapp.menu.tooltips.cadastre")
                        });
                    }
                }
            }, {
                xtype: 'displayfield',
                value: OpenLayers.i18n("cadastrapp.cadastre"),
            } ]
        });
        this.actions.push(cadastrePanel);
        
        // menu : checkbox foncier
        var foncierPanel = new Ext.Panel({
            frame: false,
            border: false,
            bodyStyle: 'background:transparent;',
            style: 'margin-left:5px;margin-right:5px',
            items: [ {
                xtype: 'checkbox',
                checked: _isFoncier, 
                style: 'margin-top:2px;margin-left:10px',
                listeners: {
                    check: function(cb, checked) {
                        _isFoncier = checked;
                    },
                    render: function(c) {
                        Ext.QuickTips.register({
                            target: c,
                            text: OpenLayers.i18n("cadastrapp.menu.tooltips.foncier"),
                        });
                    }
                }
            }, {
                xtype: 'displayfield',
                value: OpenLayers.i18n("cadastrapp.foncier"),
            } ]
        });
        this.actions.push(foncierPanel);
    },

    /**
     * private: method[initRechercheControls] :param layer:
     * ``OpenLayers.Layer.Vector`` Init action on search parcelle menu and
     * button
     */
    initRechercheControls : function(layer) {
        // menu : recherche parcelle
        var configRechercheParcelle = {
            tooltip : OpenLayers.i18n("cadastrapp.parcelle"),
            iconCls : "gx-featureediting-cadastrapp-parcelle",
            iconAlign : 'top',
            text : OpenLayers.i18n("cadastrapp.parcelle"),
            handler : function(){GEOR.Addons.Cadastre.onClickRechercheParcelle(0)}
        };
        this.actions.push(new Ext.Button(configRechercheParcelle));

        // menu : recherche avancée
        var scrollMenu = new Ext.menu.Menu();
        var configRechercheAvancee = {
            tooltip : OpenLayers.i18n("cadastrapp.recherches"),
            iconCls : "gx-featureediting-cadastrapp-line",
            iconAlign : 'top',
            text : OpenLayers.i18n("cadastrapp.recherches"),
            menu : scrollMenu
        };
        this.actions.push(new Ext.Button(configRechercheAvancee));

        // sous-menu : recherche parcelle
        var scrollMenuRechercheParcelle = new Ext.menu.Menu();
        var buttonRechercheParcelle = scrollMenu.add({
            tooltip : OpenLayers.i18n("cadastrapp.parcelle"),
            text : OpenLayers.i18n("cadastrapp.parcelle"),
            menu : scrollMenuRechercheParcelle
        });
        // sous-sous-menu : recherche parcelle - par référence
        var buttonRechercheParcelleIdentifiant = scrollMenuRechercheParcelle.add({
            tooltip : OpenLayers.i18n("cadastrapp.menu.parcelle.refer"),
            text : OpenLayers.i18n("cadastrapp.menu.parcelle.refer")
        });
        buttonRechercheParcelleIdentifiant.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheParcelle(0)});

        // sous-sous-menu : recherche parcelle - par adresse
        var buttonRechercheParcelleAdresse = scrollMenuRechercheParcelle.add({
            tooltip : OpenLayers.i18n("cadastrapp.menu.parcelle.adresse"),
            text : OpenLayers.i18n("cadastrapp.menu.parcelle.adresse")
        });
        buttonRechercheParcelleAdresse.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheParcelle(1)});

        // sous-sous-menu : recherche parcelle - par identifiant cadastral
        var buttonRechercheParcelleAdresse = scrollMenuRechercheParcelle.add({
            tooltip : OpenLayers.i18n("cadastrapp.menu.parcelle.identifiant"),
            text : OpenLayers.i18n("cadastrapp.menu.parcelle.identifiant")
        });
        buttonRechercheParcelleAdresse.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheParcelle(2)});
        
        // sous-sous-menu : recherche parcelle - par identifiant cadastral
        var buttonRechercheParcelleLot = scrollMenuRechercheParcelle.add({
            tooltip : OpenLayers.i18n("cadastrapp.menu.parcelle.lot"),
            text : OpenLayers.i18n("cadastrapp.menu.parcelle.lot")
        });
        buttonRechercheParcelleLot.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheParcelle(3)});

        if(GEOR.Addons.Cadastre.isCNIL1() || GEOR.Addons.Cadastre.isCNIL2()){
            // sous-menu : recherche proprietaire
            var scrollMenuRechercheProprietaire = new Ext.menu.Menu();
            var buttonRechercheProprietaire = scrollMenu.add({
                tooltip : OpenLayers.i18n("cadastrapp.proprietaire"),
                text : OpenLayers.i18n("cadastrapp.proprietaire"),
                menu : scrollMenuRechercheProprietaire
            });
            // sous-sous-menu : recherche proprietaire - par nom
            var buttonRechercheProprietaireNom = scrollMenuRechercheProprietaire.add({
                tooltip : OpenLayers.i18n("cadastrapp.proprietaire.nom"),
                text : OpenLayers.i18n("cadastrapp.proprietaire.nom")
            });
            buttonRechercheProprietaireNom.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheProprietaire(0)});
            
            // sous-sous-menu : recherche proprietaire - par compte
            var buttonRechercheProprietaireCompte = scrollMenuRechercheProprietaire.add({
                tooltip : OpenLayers.i18n("cadastrapp.proprietaire.compte"),
                text : OpenLayers.i18n("cadastrapp.proprietaire.compte")
            });
            buttonRechercheProprietaireCompte.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheProprietaire(1)});
    
         // sous-sous-menu : recherche proprietaire - par compte
            var buttonRechercheProprietaireCompte = scrollMenuRechercheProprietaire.add({
                tooltip : OpenLayers.i18n("cadastrapp.proprietaire.lot"),
                text : OpenLayers.i18n("cadastrapp.proprietaire.lot")
            });
            buttonRechercheProprietaireCompte.on('click', function(){GEOR.Addons.Cadastre.onClickRechercheProprietaire(2)});
            
            // sous-menu : recherche copropriété
            var buttonRechercheCopropriete = scrollMenu.add({
                tooltip : OpenLayers.i18n("cadastrapp.copropriete"),
                text : OpenLayers.i18n("cadastrapp.copropriete")
            });
        }

        // sous-menu : traitement sélection
        var scrollMenuTraitementSelection = new Ext.menu.Menu();
        var buttonTraitementSelection = scrollMenu.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection"),
            text : OpenLayers.i18n("cadastrapp.selection"),
            menu : scrollMenuTraitementSelection
        });
        // sous-sous-menu : traitement sélection - parcelles
        var scrollMenuTraitementSelectionParcelles = new Ext.menu.Menu();
        var buttonTraitementSelectionParcelles = scrollMenuTraitementSelection.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection.parcelles"),
            text : OpenLayers.i18n("cadastrapp.selection.parcelles"),
            menu : scrollMenuTraitementSelectionParcelles
        });
        // sous-sous-sous-menu : traitement sélection - parcelles - export
        var buttonTraitementSelectionParcellesExport = scrollMenuTraitementSelectionParcelles.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection.parcelles.export"),
            text : OpenLayers.i18n("cadastrapp.selection.parcelles.export")
        });

        // sous-sous-sous-menu : traitement sélection - parcelles - bordereau
        var buttonTraitementSelectionParcellesBordereau = scrollMenuTraitementSelectionParcelles.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection.parcelles.bordereau"),
            text : OpenLayers.i18n("cadastrapp.selection.parcelles.bordereau")
        });

        // sous-sous-sous-menu : traitement sélection - parcelles - plan
        var buttonTraitementSelectionParcellesPlan = scrollMenuTraitementSelectionParcelles.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection.parcelles.plan"),
            text : OpenLayers.i18n("cadastrapp.selection.parcelles.plan")
        });

        if(GEOR.Addons.Cadastre.isCNIL1() || GEOR.Addons.Cadastre.isCNIL2()){
            // sous-sous-menu : traitement sélection - proprietaires
            var scrollMenuTraitementSelectionProprietaires = new Ext.menu.Menu();
            var buttonTraitementSelectionProprietaires = scrollMenuTraitementSelection.add({
                tooltip : OpenLayers.i18n("cadastrapp.selection.proprietaires"),
                text : OpenLayers.i18n("cadastrapp.selection.proprietaires"),
                menu : scrollMenuTraitementSelectionProprietaires
            });
            // sous-sous-sous-menu : traitement sélection - parcelles - export
            var scrollMenuTraitementSelectionProprietairesExport = scrollMenuTraitementSelectionProprietaires.add({
                tooltip : OpenLayers.i18n("cadastrapp.selection.proprietaires.export"),
                text : OpenLayers.i18n("cadastrapp.selection.proprietaires.export")
            });
    
            // sous-sous-sous-menu : traitement sélection - parcelles - edition
            var scrollMenuTraitementSelectionProprietairesEdition = scrollMenuTraitementSelectionProprietaires.add({
                tooltip : OpenLayers.i18n("cadastrapp.selection.proprietaires.edition"),
                text : OpenLayers.i18n("cadastrapp.selection.proprietaires.edition")
            });
        }
    },

    /**
     * private: method[initDemandeControl] :param layer:
     * ``OpenLayers.Layer.Vector`` Create ...TODO
     */
    initDemandeControl : function(layer) {
        var button, config;

        config = {
            // button options
            toggleGroup : this.toggleGroup,
            allowDepress : false,
            pressed : false,
            tooltip : OpenLayers.i18n("cadastrapp.demande"),
            // check item options
            group : this.toggleGroup,
            iconCls : "gx-featureediting-cadastrapp-demande",
            iconAlign : 'top',
            text : OpenLayers.i18n("cadastrapp.demande"),
            handler : GEOR.Addons.Cadastre.onClickAskInformations
        };
        button = new Ext.Button(config);

        this.actions.push(button);
    },

    /**
     * private: method[destroyDrawControls] Destroy all drawControls and all
     * their related objects.
     */
    destroyDrawControls : function() {
        for (var i = 0; i < this.drawControls.length; i++) {
            this.drawControls[i].destroy();
        }
        this.drawControls = [];
    },

    /**
     * private: method[initDeleteAllAction] Create a Ext.Action object that is
     * set as the deleteAllAction property and pushed to te actions array.
     */
    initDeleteAllAction : function() {
        var actionOptions = {
            handler : this.deleteAllFeatures,
            scope : this,
            text : OpenLayers.i18n('cadastrapp.delete_all'),
            iconCls : "gx-featureediting-delete",
            iconAlign : 'top',
            tooltip : OpenLayers.i18n('cadastrapp.delete_all_features')
        };

        var action = new Ext.Action(actionOptions);

        this.actions.push(action);
    },

    /**
     * private: method[deleteAllFeatures] Called when the deleteAllAction is
     * triggered (button pressed). Destroy all features from all layers.
     */
    deleteAllFeatures : function() {
        Ext.MessageBox.confirm(OpenLayers.i18n('cadastrapp.delete_all_features'), OpenLayers.i18n('cadastrapp.delete_features_confirm'), function(btn) {
            if (btn == 'yes') {
                if (this.popup) {
                    this.popup.close();
                    this.popup = null;
                }
                this.layer.destroyFeatures();
            }
        }, this);
    },

    /**
     * private: method[getActiveDrawControl] :return:
     * ``OpenLayers.Control.DrawFeature or false`` Get the current active
     * DrawFeature control. If none is active, false is returned.
     */
    getActiveDrawControl : function() {
        var control = false;

        for (var i = 0; i < this.cadastrappControls.length; i++) {
            if (this.cadastrappControls[i].active) {
                control = this.cadastrappControls[i];
                break;
            }
        }
        return control;
    },

    /**
     * private: method[onLabelAdded]
     * 
     * @param event: ``event`` Called when a new
     * label feature is added to the layer. Set a flag to let the controler know
     * it's a label.
     * 
     */
    onLabelAdded : function(event) {
        var feature = event.feature;
        feature.style.label = feature.attributes.label;
        feature.style.graphic = false;
        feature.style.labelSelect = true;
        feature.isLabel = true;
    },

    /**
     * private: method[onFeatureAdded] 
     * 
     * @param event: ``event`` Called when a new
     * feature is added to the layer. Change the state of the feature to INSERT
     * and select it.
     * 
     */
    onFeatureAdded : function(event) {
        var feature, cadastrappControl;

        feature = event.feature;
        feature.state = OpenLayers.State.INSERT;

        cadastrappControl = this.getActiveDrawControl();
        if (cadastrappControl) {
            cadastrappControl.deactivate();
            this.lastDrawControl = cadastrappControl;
        }
        // **************************
        // this.featureControl.activate();
        selctedFeatures = GEOR.Addons.Cadastre.selectFeatureIntersection(feature);
        feature.layer.removeAllFeatures();
        // **************************
    },

    /**
     * private: method[onModificationStart] 
     * 
     * @param event: ``event`` Called when
     * a feature is selected. Display a popup that contains the FeaturePanel.
     */
    onModificationStart : function(event) {
        var feature = (event.geometry) ? event : event.feature;

        // to keep the state before any modification, useful when hitting the
        // 'cancel' button
        /*
         * if(feature.state != OpenLayers.State.INSERT){ feature.myClone =
         * feature.clone(); feature.myClone.fid = feature.fid; }
         */

        // if the user clicked on an other feature while adding a new one,
        // deactivate the cadastrapp control.
        var cadastrappControl = this.getActiveDrawControl();
        if (cadastrappControl) {
            cadastrappControl.deactivate();
            this.featureControl.activate();
        }

        var options = {
            features : [ feature ],
            styler : this.styler
        };

        this.featurePanel = new GEOR.FeaturePanel(options);

        // display the popup
        popupOptions = {
            location : feature,
            // the following line is here for compatibility with
            // GeoExt < 1 (before changeset 2343)
            feature : feature,
            items : [ this.featurePanel ]
        };
        popupOptions = OpenLayers.Util.applyDefaults(popupOptions, this.popupOptions);
        popupOptions = OpenLayers.Util.applyDefaults(popupOptions, {
            layout : 'fit',
            border : false,
            width : 280
        });

        var popup = new GeoExt.Popup(popupOptions);
        feature.popup = popup;
        this.popup = popup;
        popup.on({
            close : function() {
                if (OpenLayers.Util.indexOf(this.layer.selectedFeatures, feature) > -1) {
                    this.featureControl.unselectFeature(feature);
                    this.featureControl.deactivate();
                }
            },
            scope : this
        });
        popup.show();

    },

    /**
     * private: method[onModification] 
     * @param event: ``event``
     */
    onModification : function(event) {
        var feature = (event.geometry) ? event : event.feature;
    },

    /**
     * private: method[onModificationEnd] 
     * @param event: ``event``
     */
    onModificationEnd : function(event) {
        var feature = (event.geometry) ? event : event.feature;
        // or we could execute commits here also

        if (!feature) {
            return;
        }

        if (feature.popup) {
            feature.popup.close();
            feature.popup = null;
        }

        this.reactivateDrawControl();
    },

    /**
     * private: method[onBeforeFeatureAdded] 
     * @param event: ``event`` Called when
     * a new feature is added to the layer.
     */
    onBeforeFeatureAdded : function(event) {
        var feature = event.feature;
        this.parseFeatureStyle(feature);
        this.parseFeatureDefaultAttributes(feature);
    },

    /**
     * private: method[parseFeatureStyle]
     */
    parseFeatureStyle : function(feature) {
        var symbolizer = this.layer.styleMap.createSymbolizer(feature);
        feature.style = symbolizer;
    },

    /**
     * private: method[parseFeatureDefaultAttributes] 
     * @param event: ``OpenLayers.Feature.Vector`` Check if the feature has any attributes. If
     * not, add those defined in this.defaultAttributes.
     */
    parseFeatureDefaultAttributes : function(feature) {
        var hasAttributes;

        if (this.useDefaultAttributes === true) {
            hasAttributes = false;

            for ( var key in feature.attributes) {
                hasAttributes = true;
                break;
            }

            if (!hasAttributes) {
                for (var i = 0; i < this.defaultAttributes.length; i++) {
                    feature.attributes[this.defaultAttributes[i]] = this.defaultAttributesValues[i];
                }
            }
        }
    },
    /*
     * /** private: method[reactivateDrawControl]
     */
    reactivateDrawControl : Ext.emptyFn,

    /**
     * private: method[onBeforeFeatureSelect] 
     *  @param event: ``event`` Called
     * before a feature is selected
     */
    onBeforeFeatureSelect : function(event) {
        var feature = (event.geometry) ? event : event.feature;

        // if it's the first feature that is selected
        if (feature.layer.selectedFeatures.length === 0) {
            this.applyStyles('faded', {
                'recadastrapp' : true
            });
        }
    },

    /**
     * private: method[onFeatureUnselect] 
     * @param event: ``event`` Called when a
     * feature is unselected.
     */
    onFeatureUnselect : function(event) {
        var feature = (event.geometry) ? event : event.feature;
        this.applyStyle(feature, 'faded', {
            'recadastrapp' : true
        });

        // if it's the last feature that is unselected
        if (feature.layer.selectedFeatures.length === 0) {
            this.applyStyles('normal', {
                'recadastrapp' : true
            });
        }
    },

    /**
     * private: method[onFeatureSelect] 
     * @param event: ``event`` Called when a
     * feature is selected
     */
    onFeatureSelect : function(event) {
        var feature = (event.geometry) ? event : event.feature;
        this.applyStyle(feature, 'normal', {
            'recadastrapp' : true
        });

    },

    /**
     * private: method[applyStyles] 
     * @param style: ``String`` Mandatory. Can be
     * "normal" or "faded". :param options: ``Object`` Object of options. Apply
     * a specific style to all layers of this controler. If 'recadastrapp': true
     * was specified in the options, the layer is recadastrappn after.
     */
    applyStyles : function(style, options) {
        style = style || "normal";
        options = options || {};
        var layer = this.layer;
        for (var j = 0; j < layer.features.length; j++) {
            feature = layer.features[j];
            // don't apply any style to features coming from the
            // ModifyFeature control
            if (!feature._sketch) {
                this.applyStyle(feature, style);
            }
        }

        if (options['recadastrapp'] === true) {
            layer.recadastrapp();
        }
    },

    /**
     * private: method[applyStyle] 
     * @param feature: ``OpenLayers.Feature.Vector``
     * @param style: ``String`` Mandatory. Can be "normal" or "faded". 
     * @param options: ``Object`` Object of options. Apply a specific style to a
     * specific feature. If 'recadastrapp': true was specified in the options,
     * the layer is recadastrappn after.
     */
    applyStyle : function(feature, style, options) {
        var fRatio;
        options = options || {};

        switch (style) {
            case "faded":
                fRatio = this.fadeRatio;
                break;
            default:
                fRatio = 1 / this.fadeRatio;
        }

        for (var i = 0; i < this.opacityProperties.length; i++) {
            property = this.opacityProperties[i];
            if (feature.style[property]) {
                feature.style[property] *= fRatio;
            }
        }

        if (options['recadastrapp'] === true) {
            feature.layer.cadastrappFeature(feature);
        }
    },

    CLASS_NAME : "Cadastrapp"
});
