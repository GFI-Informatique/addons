Ext.namespace("GEOR.Addons.Cadastre");

/**
 * 
 * @returns {Boolean}
 */
GEOR.Addons.Cadastre.isCNIL1 = function() {
    return (GEOR.config.ROLES.indexOf(GEOR.Addons.Cadastre.cnil1RoleName) != -1);
};
  
/**
 * 
 * @returns {Boolean}
 */
GEOR.Addons.Cadastre.isCNIL2 = function() {
    return (GEOR.config.ROLES.indexOf(GEOR.Addons.Cadastre.cnil2RoleName) != -1);
};

