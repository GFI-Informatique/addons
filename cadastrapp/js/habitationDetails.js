Ext.namespace("GEOR.Addons.Cadastre");

/**
 * Affiche la fenêtre de détails d'habitation pour les éléments données
 * 
 * @param batiment
 * @param niveau
 * @param porte
 * @param annee
 * @param invar
 * 
 */
GEOR.Addons.Cadastre.showHabitationDetails = function(batiment, niveau, porte, annee, invar) {
    
    var habitationDetailsWindows = new Ext.Window({
        id:"cadHabDetailsWindows",
        title:" Batiments " + batiment + "- niveau "+ niveau+ " - porte " + porte,
        frame : true,
        autoScroll : true,
        
    });
    
    var habitationDetailsStore =  new Ext.data.JsonStore({
        proxy: new Ext.data.HttpProxy({
            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getHabitationDetails', 
            autoLoad: false,
            method: 'GET'
        }),
    });
    
    
    habitationDetailsStore.load({params:{invar:invar,annee: annee}});
    
    habitationDetailsWindows.show();
}
    
