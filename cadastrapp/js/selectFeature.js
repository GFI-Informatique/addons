	/** api: (define)
	*  module = GEOR
	*  class = Cadastrapp
	*  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
	*/
Ext.namespace("GEOR")	
	
	selectionTest = function (map){
		// var cadastre=map.getLayersByName("geo_parcelle");
		cadastre = new OpenLayers.Layer.WMS(
				"qgis:geo_parcelle", "http://gd-cms-crai-001.fasgfi.fr/geoserver/qgis/wms", {
				LAYERS: 'qgis:geo_parcelle',
				transparent: 'true',
				format: 'image/png'            
				}, {
					isBaseLayer: false,
					singleTile: true
		});
		select = new OpenLayers.Layer.Vector("Selection", {
					styleMap: new OpenLayers.Style(OpenLayers.Feature.Vector.style["select"])
		});

			 
		map.addLayers([select,cadastre]);

		control = new OpenLayers.Control.GetFeature({
					protocol: OpenLayers.Protocol.WFS.fromWMSLayer(cadastre),
					box: true,
					hover: true,
					multipleKey: "shiftKey",
					toggleKey: "ctrlKey"
				});
		control.events.register("featureselected", this, function (e) {
					select.addFeatures([e.feature]);
		});
		control.events.register("featureunselected", this, function (e) {
					select.removeFeatures([e.feature]);
		});

		map.addControl(control);
		control.activate();
		// this.featureControl=control;
		// this.map.addControl(this.featureControl);
		var vector_style = new OpenLayers.Style({
						'fillColor': '#ff0000',
						'strokeColor': '#ff0000',
						'strokeWidth': 5
						});

		var vector_style_map = new OpenLayers.StyleMap({
						'default': vector_style
						});

		select.styleMap = vector_style_map;
	}