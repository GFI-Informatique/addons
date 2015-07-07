/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

/**
 *  Display an infobulle when waiting on a parcelle
 *  
 * @param map OpenLayers map where popup should be displayed
 * @param idParcelle parameter will be use to call webapp and get additional information
 * @param lonlatt position where popup should be displayed
 */    
displayInfoBulle = function(map, idParcelle, lonlat) {

    // webapp request using parcelleid
    Ext.Ajax.request({
        url : getWebappURL() + 'getInfoBulle?parcelle=' + idParcelle,
        failure : function() {
        	//TODO change i18n
            alert("Erreur lors de la requete 'getInfoBulle' ");
        },
        method : "GET",
        success : function(response, opts) {
          
        	// result from requestion JSON
        	var result = Ext.decode(response.responseText);

			//TODO add when available in webapp dcntpa_sum = result[0].dcntpa_sum;
            //TODO add when available in webapp dcntpa_sum = result[0].dcntpa_sum;
            //TODO add when available in webapp sigcal_sum = result[0].sigcal_sum;
            //TODO add when available in webapp batical = result[0].batical;
            
        	// TODO add 5 first dnupro and dnomlp
            popup = new GeoExt.Popup({
				map:map,
				location: lonlat,
				width: 200,
				html: "<div>"+result[0].libcom+"</div>" +
						"<div>"+result[0].dnvoiri+"</div>" +
						"<div>"+result[0].dindic+"</div>" +
						"<div>"+result[0].dvoilib+"</div>" +
						"<div>DGDFIP : "+result[0].dcntpa+" m²</div>" +
						"<div>SGI : m²</div>" +
						"<div>"+result[0].comptecommunal+"</div>" +
						"<div>"+result[0].dnupro+"</div>" +
						"<div>"+result[0].dnomlp+"</div>" +
						"<div>"+idParcelle+"</div>",
				listeners: {
                    close: function() {
                        // closing a popup destroys it, but our reference is truthy
                        popup = null;
                    }
                }
			});
			popup.show();
			
			// check to avoid erase too quickly
			document.body.onmousemove = function(e) {
				//destroy popup on move
				popup.destroy()
			}
           
        }
    });	
    
				
}

