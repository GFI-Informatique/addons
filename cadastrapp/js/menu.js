Ext.namespace("GEOR.Addons.Cadastre");


// TODO move this ***************
var _isCadastre = true;
var _isFoncier = false;


GEOR.Addons.Cadastre.isCadastre = function() {
    return _isCadastre;
}
GEOR.Addons.Cadastre.isFoncier = function() {
    return _isFoncier;
}
// **********************************

/**
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
     * api: config[actions] ``Array(GeoExt.Action or Ext.Action)`` An array of
     * actions created from various controls or tasks that are to be added to a
     * toolbar.
     */
    actions : null,

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
     * api: config[layerOptions] ``Object`` Options to be passed to the
     * OpenLayers.Layer.Vector constructor.
     */
    layerOptions : {},


    /**
     * api: property[toggleGroup] ``String`` The name of the group used for the
     * buttons created. If none is provided, it's set to this.map.id.
     */
    toggleGroup : null,

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
                GEOR.Addons.Cadastre.zoomOnFeatures(GEOR.Addons.Cadastre.result.tabs.activeTab.featuresList);
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
            
            var isButtonPressed = false;

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
                // Point pressed by default
                isButtonPressed = true;
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
                pressed : isButtonPressed,
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
        buttonTraitementSelectionParcellesExport.on('click', function(){GEOR.Addons.Cadastre.exportSelectionAsCSV()});
        
        // sous-sous-sous-menu : traitement sélection - parcelles - bordereau
        var buttonTraitementSelectionParcellesBordereau = scrollMenuTraitementSelectionParcelles.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection.parcelles.bordereau"),
            text : OpenLayers.i18n("cadastrapp.selection.parcelles.bordereau")
        });
        buttonTraitementSelectionParcellesBordereau.on('click', function(){GEOR.Addons.Cadastre.printSelectedBordereauParcellaire()});

        // sous-sous-sous-menu : traitement sélection - parcelles - plan
        var buttonTraitementSelectionParcellesPlan = scrollMenuTraitementSelectionParcelles.add({
            tooltip : OpenLayers.i18n("cadastrapp.selection.parcelles.plan"),
            text : OpenLayers.i18n("cadastrapp.selection.parcelles.plan")
        });
        // TODO create plan de situation
        buttonTraitementSelectionParcellesPlan.on('click', function(){GEOR.Addons.Cadastre.printSelectedBordereauParcellaire()});

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
     * private: method[onFeatureAdded] 
     * 
     * @param event: ``event`` Called when a new
     * feature is added to the layer. Change the state of the feature to INSERT
     * and select it.
     * 
     */
    onFeatureAdded : function(event) {
        var feature;

        feature = event.feature;
        feature.state = OpenLayers.State.INSERT;

        GEOR.Addons.Cadastre.selectFeatureIntersection(feature);
        
        // erase point, line or polygones
        feature.layer.removeAllFeatures();
    },

    CLASS_NAME : "Cadastrapp"
});
