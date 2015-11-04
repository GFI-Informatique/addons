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
 * 
 */
GEOR.Addons.Cadastre.request.createObjectRequest = function() {

    return new Ext.Container({

        autoEl : 'div', // This is the default
        layout : 'column',
        items : [ {
            xtype : 'combo',
            mode : 'local',
            value : '',
            editable : false,
            selectOnFocus : true,
            typeAhead : true,
            forceSelection : true,
            triggerAction : 'all',
            displayField : 'value',
            valueField : 'id',
            columnWidth : .4,
            store : new Ext.data.JsonStore({
                fields : [ 'id', 'value' ],
                data : [ {
                    id : '1',
                    value : OpenLayers.i18n('cadastrapp.demandeinformation.object.type.1')
                }, {
                    id : '2',
                    value : OpenLayers.i18n('cadastrapp.demandeinformation.object.type.2')
                }, {
                    id : '3',
                    value : OpenLayers.i18n('cadastrapp.demandeinformation.object.type.3')
                } ]
            })
        }, {
            xtype : 'textfield',
            columnWidth : .6,
            allowBlank : false,
            listeners : {
                valid : function(element) {
                    Ext.getCmp('requestPrintButton').enable();
                }
            }
        }, {
            xtype : 'button',
            width : 20,
            iconCls : 'add-button',
            handler : function() {
                Ext.getCmp('requestObjectDemande').add(GEOR.Addons.Cadastre.request.createObjectRequest());
                Ext.getCmp('requestObjectDemande').doLayout();
            }
        } ],
    });
}

/**
 * Create information window
 */
GEOR.Addons.Cadastre.initInformationRequestWindow = function() {

    var numberRequestAvailable = 10;

    GEOR.Addons.Cadastre.request.informationsWindow = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.demandeinformation.titre'),
        frame : true,
        bodyPadding : 10,
        autoScroll : true,
        width : 470,
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
                labelWidth : 140,
                items : [ {
                    xtype : 'combo',
                    mode : 'local',
                    displayField : 'value',
                    valueField : 'id',
                    allowBlank : false,
                    selectOnFocus : true,
                    typeAhead : true,
                    forceSelection : true,
                    triggerAction : 'all',
                    editable : false,
                    store : new Ext.data.JsonStore({
                        fields : [ 'id', 'value' ],
                        data : [ {
                            id : 'A',
                            value : OpenLayers.i18n('cadastrapp.demandeinformation.type.A')
                        }, {
                            id : 'P1',
                            value : OpenLayers.i18n('cadastrapp.demandeinformation.type.P1')
                        }, {
                            id : 'P2',
                            value : OpenLayers.i18n('cadastrapp.demandeinformation.type.P2')
                        }, {
                            id : 'P3',
                            value : OpenLayers.i18n('cadastrapp.demandeinformation.type.P3')
                        }, ]
                    }),
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.type.demandeur'),
                    id : 'requestType',
                    width : 280,
                    listeners : {
                        valid : function(element) {
                            if (OpenLayers.i18n('cadastrapp.demandeinformation.type.P3') == element.value
                                    || 'P3' == element.value) {
                                Ext.getCmp('requestCNI').enable();
                            } else {
                                Ext.getCmp('requestCNI').enable();
                                Ext.getCmp('requestLastName').enable();
                                Ext.getCmp('requestFirstName').enable();
                                Ext.getCmp('requestAdress').enable();
                                Ext.getCmp('requestCommune').enable();
                                Ext.getCmp('requestCodePostal').enable();
                                Ext.getCmp('requestMail').enable();

                                Ext.getCmp('radioGroupDemandeRealisee').enable();
                                Ext.getCmp('radioGroupDemandeTransmission').enable();

                                Ext.getCmp('requestObjectDemande').enable();
                            }

                        }
                    }
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.cni'),
                    id : 'requestCNI',
                    width : 280,
                    allowBlank : true,
                    disabled : true,
                    listeners : {
                        change : function(textfield, newValue, oldValue) {

                            var params = {};
                            params.cni = newValue;
                            params.type = Ext.getCmp('requestType').value;

                            // envoi des données d'une form
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'checkRequestLimitation',
                                params : params,
                                success : function(response) {

                                    var result = Ext.decode(response.responseText);
                                    numberRequestAvailable = result.requestAvailable;

                                    if (numberRequestAvailable <= 0) {
                                        Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.exceded.number'));
                                    } else {
                                        // enabled field
                                        Ext.getCmp('requestLastName').enable();
                                        Ext.getCmp('requestFirstName').enable();
                                        Ext.getCmp('requestAdress').enable();
                                        Ext.getCmp('requestCommune').enable();
                                        Ext.getCmp('requestCodePostal').enable();
                                        Ext.getCmp('requestMail').enable();

                                        Ext.getCmp('radioGroupDemandeRealisee').enable();
                                        Ext.getCmp('radioGroupDemandeTransmission').enable();

                                        Ext.getCmp('requestObjectDemande').enable();

                                        // full fill user information if
                                        // present
                                        if (result.user) {
                                            Ext.getCmp('requestLastName').setValue(result.user.lastName);
                                            Ext.getCmp('requestFirstName').setValue(result.user.firstName);
                                            Ext.getCmp('requestAdress').setValue(result.user.adress);
                                            Ext.getCmp('requestCommune').setValue(result.user.commune);
                                            Ext.getCmp('requestCodePostal').setValue(result.user.codePostal);
                                            Ext.getCmp('requestMail').setValue(result.user.mail);
                                        }

                                        // Add object Request
                                        Ext.getCmp('requestObjectDemande').add(GEOR.Addons.Cadastre.request.createObjectRequest());
                                        Ext.getCmp('requestObjectDemande').doLayout();

                                    }
                                },
                                failure : function(result) {
                                    Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.alert.user'));
                                }
                            });

                        }
                    }
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.nom'),
                    id : 'requestLastName',
                    width : 280,
                    allowBlank : false,
                    disabled : true
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.prenom'),
                    id : 'requestFirstName',
                    width : 280,
                    allowBlank : false,
                    disabled : true
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.num_rue'),
                    id : 'requestAdress',
                    width : 280,
                    allowBlank : false,
                    disabled : true
                },// Le code postal et la commune ne sont pas en combox ici,
                // car l'utilisateur qui fait la demande ne fait peut être
                // pas parti des communes chargées en base
                {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.code_postal'),
                    id : 'requestCodePostal',
                    width : 280,
                    allowBlank : false,
                    disabled : true
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.commune'),
                    id : 'requestCommune',
                    width : 280,
                    allowBlank : false,
                    disabled : true
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.mail'),
                    id : 'requestMail',
                    width : 280,
                    allowBlank : true,
                    disabled : true,
                    regex : /^((([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z\s?]{2,5}){1,25})*)*$/
                }, {
                    id : 'radioGroupDemandeRealisee',
                    xtype : 'radiogroup',
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.realise'),
                    columns : 3,
                    items : [ {
                        boxLabel : OpenLayers.i18n('cadastrapp.demandeinformation.realise.guichet'),
                        name : 'realise',
                        checked : true,
                        value : 1
                    }, {
                        boxLabel : OpenLayers.i18n('cadastrapp.demandeinformation.realise.courrier'),
                        name : 'realise',
                        value : 2
                    }, {
                        boxLabel : OpenLayers.i18n('cadastrapp.demandeinformation.realise.mail'),
                        name : 'realise',
                        value : 3
                    } ],
                    disabled : true
                }, {
                    id : 'radioGroupDemandeTransmission',
                    xtype : 'radiogroup',
                    fieldLabel : OpenLayers.i18n('cadastrapp.demandeinformation.transmission'),
                    columns : 3,
                    items : [ {
                        boxLabel : OpenLayers.i18n('cadastrapp.demandeinformation.transmission.guichet'),
                        name : 'transmission',
                        checked : true,
                        value : 1
                    }, {
                        boxLabel : OpenLayers.i18n('cadastrapp.demandeinformation.transmission.courrier'),
                        name : 'transmission',
                        value : 2
                    }, {
                        boxLabel : OpenLayers.i18n('cadastrapp.demandeinformation.transmission.mail'),
                        name : 'transmission',
                        value : 3
                    } ],
                    disabled : true
                } ]
            }, {
                xtype : 'fieldset',
                title : OpenLayers.i18n('cadastrapp.demandeinformation.titre2'),
                id : 'requestObjectDemande',
                labelWidth : 120,
                items : [],
                disabled : true,
                listeners : {
                    // Check number of available request before added
                    beforeadd : function(fielset, component, index) {
                        if (numberRequestAvailable <= 0) {
                            Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.exceded.number'));
                            return false;
                        } else {
                            numberRequestAvailable = numberRequestAvailable - 1;
                        }
                    }
                }
            } ]
        } ],
        buttons : [ {
            labelAlign : 'left',
            text : OpenLayers.i18n('cadastrapp.demandeinformation.annuler'),
            listeners : {
                click : function(b, e) {
                    GEOR.Addons.Cadastre.request.informationsWindow.close();
                }
            }
        }, {
            labelAlign : 'right',
            text : OpenLayers.i18n('cadastrapp.demandeinformation.imprimer'),
            id : 'requestPrintButton',
            disabled : true,
            listeners : {
                click : function(b, e) {

                    // PARAMS
                    var params = {};
                    params.type = Ext.getCmp('requestType').getValue();
                    params.lastname = Ext.getCmp('requestLastName').getValue();
                    params.firstname = Ext.getCmp('requestFirstName').getValue();
                    params.adress = Ext.getCmp('requestAdress').getValue();
                    params.cni = Ext.getCmp('requestCNI').getValue();
                    params.commune = Ext.getCmp('requestCommune').getValue();
                    params.codepostal = Ext.getCmp('requestCodePostal').getValue();
                    params.mail = Ext.getCmp('requestMail').getValue();

                    // For each element of second textfield get value
                    // For each element of second textfield get value
                    params.parcelles = [];
                    params.comptecommunaux = [];
                    params.coproprietes = [];

                    Ext.each(Ext.getCmp('requestObjectDemande').items.items, function(element) {

                        var requestType = element.items.items[0].getValue();

                        if (requestType == 1) {
                            params.parcelles.push(element.items.items[1].getValue());
                        } else if (requestType == 2) {
                            params.comptecommunaux.push(element.items.items[1].getValue());
                        } else if (requestType == 3) {
                            params.coproprietes.push(element.items.items[1].getValue());
                        } else {
                            console.log(" Object Type of request not defined");
                        }

                    });

                    params.responseby = Ext.getCmp('radioGroupDemandeTransmission').getValue().value;
                    params.askby = Ext.getCmp('radioGroupDemandeRealisee').getValue().value;

                    // Save request and get id
                    Ext.Ajax.request({
                        method : 'GET',
                        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'saveInformationRequest',
                        params : params,
                        success : function(response) {

                            var result = Ext.decode(response.responseText);

                            var paramsPrint = {};
                            paramsPrint.requestid = result.id

                            var url = GEOR.Addons.Cadastre.cadastrappWebappUrl + 'printPDFRequest?' + Ext.urlEncode(paramsPrint);

                            // Directly download file, without and call service
                            // without
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
        listeners : {
            beforehide : function(windows) {
                numberRequestAvailable = 10;
                GEOR.Addons.Cadastre.request.informationsWindow.items.items[0].getForm().reset();
            },
            close : function(windows) {
                GEOR.Addons.Cadastre.request.informationsWindow = null;
            }
        }
    });
    GEOR.Addons.Cadastre.request.informationsWindow.show();
    console.log("onClick")
};
