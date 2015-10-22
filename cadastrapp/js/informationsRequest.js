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

    GEOR.Addons.Cadastre.request.informationsWindow = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.demandeinformation.titre'),
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
                            params.cni=newValue;
                            // envoi des données d'une form
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'checkRequestLimitation',
                                params : params,
                                success : function(response) {
                                    
                                    var result = Ext.decode(response.responseText);
                                    var nbRequestAvailable = result.requestAvailable; 
                                    if(nbRequestAvailable <= 0){
                                        Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.exceded.number'));
                                    }
                                    else{
                                        // enabled field 
                                        Ext.getCmp('requestLastName').enable();
                                        Ext.getCmp('requestFirstName').enable();
                                        Ext.getCmp('requestAdress').enable();
                                        Ext.getCmp('requestCommune').enable();
                                        Ext.getCmp('requestCodePostal').enable();
                                        Ext.getCmp('requestCompteCommunal').enable();
                                        Ext.getCmp('requestParcelleId').enable();
                                        
                                        // full fill user information if present 
                                        if(result.user){
                                            Ext.getCmp('requestLastName').setValue(result.user.lastName);
                                            Ext.getCmp('requestFirstName').setValue(result.user.firstName);
                                            Ext.getCmp('requestAdress').setValue(result.user.adress);
                                            Ext.getCmp('requestCommune').setValue(result.user.commune);
                                            Ext.getCmp('requestCodePostal').setValue(result.user.codepostal);
                                        }
                                       
                                    }
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
                    allowBlank: false,
                    disabled: true
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.prenom'),
                    id : 'requestFirstName',
                    width : 280,
                    allowBlank: false,
                    disabled: true
                },{
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.num_rue'),
                    id : 'requestAdress',
                    width : 280,
                    allowBlank: false,
                    disabled: true
                },// Le code postal et la commune ne sont pas en combox ici, car l'utilisateur qui fait la demande ne fait peut être pas parti des communes chargées en base
                {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.code_postal'),
                    id : 'requestCodePostal',
                    width : 280,
                    allowBlank: false,
                    disabled: true
                },{
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.commune'),
                    id : 'requestCommune',
                    width : 280,
                    allowBlank: false,
                    disabled: true
                }]
            }, {
                xtype : 'fieldset',
                title : OpenLayers.i18n('cadastrapp.demandeinformation.titre2'),
                defaultType : 'textfield',
                labelWidth : 120,
                items : [ {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.comptecommunal'),
                    id : 'requestCompteCommunal',
                    width : 280,
                    disabled: true,
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
                                    
                                    Ext.getCmp('requestPrintButton').enable();
                                },
                                failure : function(result) {
                                    Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.demande'));
                                }
                            });
                        }
                    }
                }, {
                    xtype: 'textarea',
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.parcelles'),
                    id : 'requestParcelleId',
                    width : 280,
                    disabled: true,
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
                                    Ext.getCmp('requestPrintButton').enable();
                                },
                                failure : function(result) {
                                    Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.demande'));
                                }
                            });
                        }
                    }
                },{
                    xtype : 'displayfield',
                    width : 280,
                    value: OpenLayers.i18n('cadastrapp.demandeinformation.parcelles.exemple'),
                    fieldClass: 'displayfieldGray'
                }, ]
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
                    params.firstname = Ext.getCmp('requestFirstName').getValue();
                    params.adress = Ext.getCmp('requestAdress').getValue();
                    params.cni = Ext.getCmp('requestCNI').getValue();
                    params.commune = Ext.getCmp('requestCommune').getValue();
                    params.codepostal = Ext.getCmp('requestCodePostal').getValue();
                    params.comptecommunal = Ext.getCmp('requestCompteCommunal').getValue();
                    params.parcelle = Ext.getCmp('requestParcelleId').getValue();
                    
                    // Save request and get id
                    Ext.Ajax.request({
                        method : 'GET',
                        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'saveInformationRequest',
                        params : params,
                        success : function(response) {
                            
                            var result = Ext.decode(response.responseText);  
                            
                            var paramsPrint={};
                            paramsPrint.requestid = result.id
                            
                            var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'printPDFRequest?' + Ext.urlEncode(paramsPrint);

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


                        },
                        failure : function(result) {
                            Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.demande'));
                        }
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
