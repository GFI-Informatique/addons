/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR.Addons.Cadastre.request");

/**
 * public: method[onClickAskInformations] :
 * 
 * 
 * Cette méthode est appellée sur appui du bouton 'Demande' de la barre d'outil
 * de cadastrapp Elle ouvre une fenetre composee d'informations sur le
 * demandeur,ainsi que sur le ou les biens à consulter La demande d'information
 * peut etre imprimée
 */
GEOR.Addons.Cadastre.onClickAskInformations = function() {

    if (GEOR.Addons.Cadastre.request.informationsWindow == null || GEOR.Addons.Cadastre.request.informationsWindow.isDestroyed == true) {
        GEOR.Addons.Cadastre.initInformationRequestWindow();
    } else {
        GEOR.Addons.Cadastre.request.informationsWindow.show();
    }
}

/**
 * Create information window
 */
GEOR.Addons.Cadastre.initInformationRequestWindow = function() {

    // comboboxe "villes" de l'onglet "Nom usage ou Naissance"
    var cityCombox = new Ext.form.ComboBox({
        fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.city'),
        hiddenName : 'cgocommune',
        allowBlank : false,
        width : 280,
        mode : 'local',
        value : '',
        forceSelection : true,
        editable : true,
        displayField : 'displayname',
        valueField : 'cgocommune',
        store : GEOR.Addons.Cadastre.getPartialCityStore(),
        listeners : {
            beforequery : function(q) {
                // Check not null querry and if enough chars
                if (q.query) {
                    var length = q.query.length;
                    // If enough chars in query
                    if (length >= GEOR.Addons.Cadastre.minCharToSearch && q.combo.getStore().getCount() == 0) {

                        // if not a number request by town name
                        if (isNaN(q.query)) {
                            q.combo.getStore().load({
                                params : {
                                    libcom : q.query
                                }
                            });
                        } else {
                            // if not a number request by town code
                            q.combo.getStore().load({
                                params : {
                                    cgocommune : q.query
                                }
                            });
                        }
                    } else if (length < GEOR.Addons.Cadastre.minCharToSearch) {
                        q.combo.getStore().loadData([], false);
                    }
                    q.query = new RegExp(Ext.escapeRe(q.query), 'i');
                    q.query.length = length;
                }
            }
        }
    });

    GEOR.Addons.Cadastre.request.informationsWindow = new Ext.Window({
        title : 'Demande Informations Foncières',
        frame : true,
        bodyPadding : 10,
        autoScroll : true,
        width : 450,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        fieldDefaults : {
            labelAlign : 'right'
        },
        items : [ {
            id : 'requestInformationForm',
            xtype : 'form',
            items : [ {
                xtype : 'fieldset',
                title : OpenLayers.i18n('cadastrapp.demandeinformation.titre1'),
                defaultType : 'textfield',
                labelWidth : 120,
                items : [ {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.cni'),
                    id : 'requestCNI',
                    width : 280,
                    allowBlank: false,
                    listeners : {
                        change : function(textfield, newValue, oldValue){
                            
                            var params = {};
                            params.id=newValue;
                            // envoi des données d'une form
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'checkRequestLimitation',
                                params : params,
                                success : function(response) {
                                    
                                    var result = Ext.decode(response.responseText);
                                   // result.lastname;
                                   // result.firstname;
                                   // result.adress;
                                  // result.cgocommune;
                                    
                                   // if(result.additionalinformation.length>0){
                                   //  Ext.Msg.alert(result.additionalinformation);
                                //}
                                  
                                },
                                failure : function(result) {
                                    Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.user'));
                                }
                            });
                        }
                    }
                } ,{
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.nom'),
                    id : 'requestLastName',
                    width : 280,
                    allowBlank: false
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.prenom'),
                    id : 'requestFirstName',
                    width : 280,
                    allowBlank: false
                },{
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.num_rue'),
                    id : 'requestAdress',
                    width : 280,
                    allowBlank: false
                }, cityCombox ]
            }, {
                xtype : 'fieldset',
                title : OpenLayers.i18n('cadastrapp.demandeinformation.titre2'),
                defaultType : 'textfield',
                labelWidth : 120,
                items : [ {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.comptecommunal'),
                    id : 'requestCompteCommunal',
                    width : 280,
                    listeners : {
                        change : function(textfield, newValue, oldValue){
                            
                            var params = {};
                            params.comptecommunal=newValue;
                            // Check if user can have information about this owner (could be outside commune or not enough CNIL right)
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'checkRequestValidity',
                                params : params,
                                success : function(response) {
                                    
                                    var result = Ext.decode(response.responseText);     
                                    Ext.getCmp('requestLastName').enable;
                                },
                                failure : function(result) {
                                    Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.demande'));
                                }
                            });
                        }
                    }
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.parcelles'),
                    id : 'requestParcelleId',
                    width : 280,
                    listeners : {
                        change : function(textfield, newValue, oldValue){
                            
                            var params = {};
                            params.parcelle=newValue;
                            // Check if user can have information about this parcelle (could be outside commune)
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'checkRequestValidity',
                                params : params,
                                success : function(response) {
                                    
                                    var result = Ext.decode(response.responseText);     
                                    Ext.getCmp('requestLastName').enable;
                                },
                                failure : function(result) {
                                    Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.demande'));
                                }
                            });
                        }
                    }
                } ]
            } ]
        } ],
        buttons : [ {
            labelAlign : 'left',
            text : OpenLayers.i18n('cadastrapp.demandeinformation.annuler'),
            listeners : {
                click : function(b, e) {
                    GEOR.Addons.Cadastre.request.informationsWindow.hide();
                }
            }
        }, {
            labelAlign : 'right',
            text : OpenLayers.i18n('cadastrapp.demandeinformation.imprimer'),
            id: 'requestPrintButton',
            disabled : true,
            listeners : {
                click : function(b, e) {
                    // PARAMS
                    var params = {};
                    params.lastname = Ext.getCmp('requestLastName').getValue();
                    params.fisrtname = Ext.getCmp('requestFirstName').getValue();
                    params.adress = Ext.getCmp('requestAdress').getValue();
                    params.cni = Ext.getCmp('requestCNI').getValue();
                    params.comptecommunal = Ext.getCmp('requestCompteCommunal').getValue();
                    params.parcelle = Ext.getCmp('requestParcelleId').getValue();

                    // TODO
                    params.requestid = 1;
                    var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'printPDFRequest?' + Ext.urlEncode(params);

                    // Directly download file, without and call service without
                    // ogcproxy
                    Ext.DomHelper.append(document.body, {
                        tag : 'iframe',
                        id : 'downloadIframe',
                        frameBorder : 0,
                        width : 0,
                        height : 0,
                        css : 'display:none;visibility:hidden;height:0px;',
                        src : url
                    });

                }
            }
        } ],
        listeners: {
            beforehide : function(windows){
                GEOR.Addons.Cadastre.request.informationsWindow.items.items[0].getForm().reset();
            }
        }
    });
    GEOR.Addons.Cadastre.request.informationsWindow.show();
    console.log("onClick")
};
