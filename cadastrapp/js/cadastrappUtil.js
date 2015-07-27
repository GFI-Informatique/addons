Ext.namespace("GEOR.Addons.Cadastre");

/**
 * 
 * @returns {Boolean}
 */
GEOR.Addons.Cadastre.isCNIL1 = function() {
    console.log("Test cnil level1");
    return (GEOR.config.ROLES.indexOf(GEOR.Addons.Cadastre.cnil1RoleName) != -1);
};
  
/**
 * 
 * @returns {Boolean}
 */
GEOR.Addons.Cadastre.isCNIL2 = function() {
    console.log("Test cnil level2");
    return (GEOR.config.ROLES.indexOf(GEOR.Addons.Cadastre.cnil2RoleName) != -1);
};

