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
        	if (typeof(result) != "undefined"){
        	
            	if (isCadastre()){
            		html = "<div class=\"cadastrapp-infobulle-parcelle\"><div>"+result.libcom+"</div>" +
            		"<div>"+idParcelle+"</div>" +
            		"<div>"+result.dnvoiri+" "+result.dindic+" "+result.cconvo+" "+result.dvoilib+"</div>" +
            		"<div>DGFiP : "+result.dcntpa.toLocaleString()+" m²</div>" +
        			"<div>SIG : "+result.surfc.toLocaleString()+" m²</div>";
            		
            		if(isCNIL1() || isCNIL2()){
            			if (typeof(result.proprietaires) != "undefined"){
                    		for(i=0;i<result.proprietaires.length; i++){
                    		    if(i=4){
                    		        html = html + "<div>...  </div>";
                    		    }else{
                    		        html = html + "<div>"+ result.proprietaires[i].ddenom +"</div>";
                    		    }    			    
                    		}
                    	}
            		}
            		html += "</div>"
            	}
            	if (isFoncier()){
            		//TODO wait for data from view
            		html += "<div class=\"cadastrapp-infobulle-unite-fonciere\">" +
            				"<div>"+result.comptecommunal +"</div>" +
            		        "<div>"+result.dcntpa_sum.toLocaleString()+" m²</div>" +
            		        "<div>"+result.sigcal_sum.toLocaleString()+" m²</div>";
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
			
    			// TODO check to avoid erase too quickly
    			document.body.onmousemove = function(e) {
    			    //destroy popup on move
    			    popup.destroy()
    			}
        	}
       	}
    });	
    
				
}

