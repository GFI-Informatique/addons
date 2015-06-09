/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

selectionTest = function(map) {
    // var cadastre1=map.getLayersByName("geo_parcelle");
    var cadastre = new OpenLayers.Layer.Vector("parcelle", {
        strategies : [ new OpenLayers.Strategy.Fixed() ],
        projection : new OpenLayers.Projection("EPSG:4326"),
        protocol : new OpenLayers.Protocol.WFS({
            version : "1.1.0",
            url : "http://gd-cms-crai-001.fasgfi.fr/geoserver/qgis/wfs",
            featurePrefix : 'qgis', // geoserver worspace name
            featureType : "geo_parcelle", // geoserver Layer Name
            featureNS : "qgis", // Edit Workspace Namespace URI
            geometryName : "geom" // field in Feature Type details with type
                                    // "Geometry"
        })
    });
    map.addLayers([ cadastre ]);
    var select = new OpenLayers.Control.SelectFeature(cadastre);
    map.addControl(select);
    select.activate();
    cadastre.events.on({
        'featureselected' : function(e) {
            console.log(e.feature);
            console.log("geo_parcelle : " + e.feature.data.geo_parcelle);

            var params = {};
            params.parcelle = new Array();

            params.parcelle.push(e.feature.data.geo_parcelle);
            params.parcelle.push(e.feature.data.idu);
            params.details=1;
            Ext.Ajax.request({
                url : getWebappURL() + 'getParcelle',
                method : 'GET',
                success : function(result) {
                    console.log('test 1');
                    console.log(result);
                    var parcelleData = eval(result.responseText);
                    console.log(parcelleData);
                    //onClickDisplayInfoBulle(parcelleData[0].ccocom, parcelleData[0].ccodep, parcelleData[0].ccodir, parcelleData[0].ccopre, 
                    //		parcelleData[0].ccosec, parcelleData[0].dindic, parcelleData[0].dnupla, parcelleData[0].dnvoiri, parcelleData[0].dvoilib, parcelleData[0].parcelle ); 
                },
                params : params,
            });
        },
        'featureunselected' : function(e) {
            console.log("unselected");
        }
    });

    // ******************************************************************

}