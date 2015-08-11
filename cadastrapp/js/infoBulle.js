/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR.Addons.Cadastre");

/**
 *  Display an infobulle when waiting on a parcelle
 *  
 * @param map OpenLayers map where popup should be displayed
 * @param idParcelle parameter will be use to call webapp and get additional information
 * @param lonlatt position where popup should be displayed
 */    
GEOR.Addons.Cadastre.displayInfoBulle = function(map, idParcelle, lonlat) {

    // Build url depending on check button Cadastre or Foncier
    urlInfoBulleService =  GEOR.Addons.Cadastre.cadastrappWebappUrl+ 'getInfoBulle?parcelle=' + idParcelle
    
    if (!GEOR.Addons.Cadastre.isCadastre()){
        urlInfoBulleService += "&infocadastrale=0";
    }
    if (!GEOR.Addons.Cadastre.isFoncier()){
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
            
                if (GEOR.Addons.Cadastre.isCadastre()){
                    html = "<div class=\"cadastrapp-infobulle-parcelle\"><div>"+result.libcom+"</div>" +
                    "<div>"+idParcelle+"</div>" +
                    "<div>"+result.dnvoiri+" "+result.dindic+" "+result.cconvo+" "+result.dvoilib+"</div>" +
                    "<div>"+OpenLayers.i18n('cadastrapp.contenancedgfip') +" : "+result.dcntpa.toLocaleString()+" m²</div>" +
                    "<div>"+OpenLayers.i18n('cadastrapp.sig') +" : "+result.surfc.toLocaleString()+" m²</div>";
                    
                    if(GEOR.Addons.Cadastre.isCNIL1() || GEOR.Addons.Cadastre.isCNIL2()){
                        if (typeof(result.proprietaires) != "undefined"){
                            Ext.each(result.proprietaires, function(proprietaire, currentIndex){
                                if(currentIndex==8){
                                    html = html + "<div>...  </div>";
                                }else{
                                    html = html + "<div>"+ proprietaire.ddenom +"</div>";
                                }                   
                            });
                        }
                    }
                    html += "</div>"
                }
                if (GEOR.Addons.Cadastre.isFoncier()){
                    //TODO wait for data from view
                    html += "<div class=\"cadastrapp-infobulle-unite-fonciere\">" +
                            "<div>"+result.comptecommunal +"</div>" +
                            "<div>"+ OpenLayers.i18n('cadastrapp.contenancedgfip') +" UF : "+result.dcntpa_sum.toLocaleString()+" m²</div>" +
                            "<div>"+ OpenLayers.i18n('cadastrapp.sig') +" UF :"+result.sigcal_sum.toLocaleString()+" m²</div>";
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

