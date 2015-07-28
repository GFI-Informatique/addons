Ext.namespace("GEOR.Addons.Cadastre");

/**
 * Test if user as ROLE_"cnil1Role" in his role list
 * 
 * @return {Boolean}
 */
GEOR.Addons.Cadastre.isCNIL1 = function() {
    return (GEOR.config.ROLES.indexOf("ROLE_"+GEOR.Addons.Cadastre.cnil1RoleName) != -1);
};
  
/**
 * 
 * Test if user as ROLE_"cnil2Role" in his role list
 * 
 * @return {Boolean} 
 */
GEOR.Addons.Cadastre.isCNIL2 = function() {
    return (GEOR.config.ROLES.indexOf("ROLE_"+GEOR.Addons.Cadastre.cnil2RoleName) != -1);
};

