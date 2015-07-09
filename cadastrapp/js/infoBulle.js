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

	// Build url depending on check button Cadastre or Foncier
	urlInfoBulleService =  cadastrappWebappUrl+ 'getInfoBulle?parcelle=' + idParcelle
	
	if (!isCadastre()){
		urlInfoBulleService += "&infocadastrale=0";
	}
	if (!isFoncier()){
		urlInfoBulleService += "&infouf=0";
	}
    // webapp request using parcelleid
    Ext.Ajax.request({
        url : urlInfoBulleService,
        failure : function() {
        	//TODO change i18n
            alert("Erreur lors de la requete 'getInfoBulle' ");
        },
        method : "GET",
        success : function(response, opts) {
          
        	// result from requestion JSON
        	var result = Ext.decode(response.responseText);
       	
        	
        	html = "";
        	if (isCadastre()){
        		html = "<div class=\"cadastrapp-infobulle-parcelle\"><div>"+result[0].libcom+"</div>" +
        		"<div>"+idParcelle+"</div>" +
        		"<div>"+result[0].dnvoiri+" "+result[0].dindic+" "+result[0].cconvo+" "+result[0].dvoilib+"</div>" +
        		"<div>DGDFIP : "+result[0].dcntpa+" m²</div>" +
    			"<div>SGI : m²</div>";
        		
        		if(isCNIL1() || isCNIL2()){
        			for(i=0;i<result[0].proprietaires.length; i++){
        				html = html + "<div>"+ result[0].proprietaires[i].ddenom +"</div>";
        			}
        		}
        		html += "</div>"
        	}
        	if (isFoncier()){
        		//TODO wait for data from view
        		html += "<div class=\"cadastrapp-infobulle-unite-fonciere\"><div>"+result[0].comptecommunal+"</div>";
        		//TODO add when available in webapp dcntpa_sum = result[0].dcntpa_sum;
                //TODO add when available in webapp dcntpa_sum = result[0].dcntpa_sum;
                //TODO add when available in webapp sigcal_sum = result[0].sigcal_sum;
                //TODO add when available in webapp batical = result[0].batical;
        		html += "</div>";
        	}
  	
            popup = new GeoExt.Popup({
				map:map,
				location: lonlat,
				width: 200,
				html: html,
				listeners: {
                    close: function() {
                        // closing a popup destroys it, but our reference is truthy
                        popup = null;
                    }
                }
			});
			popup.show();
			
			// check to avoid erase too quickly
			//document.body.onmousemove = function(e) {
				//destroy popup on move
			//	popup.destroy()
			//}
           
        }
    });	
    
				
}

