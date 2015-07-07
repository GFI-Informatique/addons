/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR")

/**
 *  Information to be display in infobulle
 *  
 * @param parcelleId parameter will be use to call webapp and get additional information
 */    
onClickDisplayInfoBulle = function(parcelleId) {

    // webapp request using parcelleid
    Ext.Ajax.request({
        url : getWebappURL() + 'getInfoBulle?parcelle=' + parcelle,
        failure : function() {
        	//TODO change i18n
            alert("Erreur lors de la requete 'getInfoBulle' ");
        },
        method : "GET",
        success : function(response, opts) {
            var obj = Ext.decode(response.responseText);
            
            //TODO set console only to debug
            console.log(obj);
            
            libcom = obj[0].libcom;
            dcntpa = obj[0].dcntpa;
			//TODO add when available in webapp dcntpa_sum = obj[0].dcntpa_sum;
            dnvoiri = obj[0].dnvoiri;
            dindic = obj[0].dindic;
            dvoilib = obj[0].dvoilib;
            dnupro = obj[0].dnupro;
            dnomlp = obj[0].dnomlp;
            comptecommunal = obj[0].comptecommunal;
            //TODO add when available in webapp dcntpa_sum = obj[0].dcntpa_sum;
            //TODO add when available in webapp sigcal_sum = obj[0].sigcal_sum;
            //TODO add when available in webapp batical = obj[0].batical;
           
            //TODO check how to display information in GeoExt probably return html
        }

    });	
				
}

