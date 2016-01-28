/**
 * api: (define) module = GEOR class = Cadastrapp base_link =
 * `Ext.util.Observable
 * <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GEOR.Addons.Cadastre.request");

//initialisation du nombre maximum pour un tier 
var _numberRequestAvailable = GEOR.Addons.Cadastre.maxRequest + GEOR.Addons.Cadastre.maxRequest;
//nombre maximum par demande
var _numberRequestMax= GEOR.Addons.Cadastre.maxRequest;
//identifiant des objects de demande
var _idContainer = 0;

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
 * cette methode supprime tous les objets de demande avec réinitialisation des composants
 */
GEOR.Addons.Cadastre.request.removeAllObjectRequest = function() {
	//on supprime tous les objets de demande
	 Ext.getCmp('requestObjectDemande').removeAll();
	//on réinitialise la valeur du nombre de requetes max 
	 _numberRequestMax = GEOR.Addons.Cadastre.maxRequest;
	 //on desactive le bouton print
	 Ext.getCmp('requestPrintButton').disable();
	 
	 _idContainer = 0;
}


/**
 * création du conteneur pour les propriétaire
 */
GEOR.Addons.Cadastre.request.createObjectRequestFieldProprio = function(name,id) {
	var comboCom = GEOR.Addons.Cadastre.Component.getComboCommune(id);
	var comboProprio = GEOR.Addons.Cadastre.Component.getComboProprioByCommune(id, 'communeList');
	
	comboCom.on('beforeselect',function(combo, record, index){
		//on supprime tous le store pour eviter de la combo remonte d'ancienne valeur (cache)
		Ext.getCmp('proprioList'+id).reset();
		comboProprio.getStore().removeAll( true );; 
	});
	comboCom.on('valid',function(combo){
		Ext.getCmp('proprioList'+id).enable();
	});
    return new Ext.Container({

        layout : 'column',
        renderTo   : Ext.get(name + id),
        id :  'ObjectRequestDynField' + id,
        width : Ext.getCmp('objectRequestField'+id).getWidth(),
        anchor: '50%',
        items : [ comboCom,
                  comboProprio,
                  {
                      xtype: 'checkboxgroup',
                      columns: 2,
                      allowBlank: false,
                      itemId: 'typePrint',
                      items: [
	                  {
	                      xtype: 'checkbox',
	                      boxLabel: 'Relevé de propriété',
	                      checked: true,
	                      inputValue: 'RP'
	                  },
	                  {
	                   xtype: 'checkbox',
	                      boxLabel: 'Bordereau parcellaire',
	                      inputValue: 'BP'
	                  }] 
                 }]
    });
}

/**
 * création du conteneur pour les parcelles
 */
GEOR.Addons.Cadastre.request.createObjectRequestFieldParcelle = function(name,id) {
	var comboCom = GEOR.Addons.Cadastre.Component.getComboCommune(id);
	var comboSection = GEOR.Addons.Cadastre.Component.getComboSectionByCommune(id, 'communeList');
	var comboParcelle = GEOR.Addons.Cadastre.Component.getComboParcelleBySection(id, 'sectionList');
	
	//on supprime tous le store pour eviter de la combo remonte d'ancienne valeur (cach)
	comboCom.on('beforeselect',function(combo, record, index){
		comboSection.reset();
		comboSection.getStore().removeAll( true ); 
		comboParcelle.reset();
		comboParcelle.getStore().removeAll( true ); 
	});
	
	comboCom.on('select',function(element, rec, idx){
		comboSection.enable();
		var cgocommune = Ext.getCmp('communeList'+id).value;
		var myStore = GEOR.Addons.Cadastre.getSectionStore(cgocommune);
		comboSection.bindStore(myStore);
	});
	
	
	
	//on supprime tous le store pour eviter de la combo remonte d'ancienne valeur (cach)
	comboSection.on('beforeselect',function(combo, record, index){
		comboParcelle.reset();
		comboParcelle.getStore().removeAll( true ); 
	});
	
	comboSection.on('select',function(element, rec, idx){
		var comboSection = Ext.getCmp('sectionList'+id).value;
		var parcelleStrore = Ext.getCmp('parcelleList'+id).getStore();
		var cgocommune = Ext.getCmp('communeList'+id).value
		GEOR.Addons.Cadastre.loadParcelleStore(parcelleStrore,cgocommune,comboSection);
		//comboParcelle.bindStore(myStore);
		comboParcelle.enable();
		
	});
	

    return new Ext.Container({

        layout : 'column',
        renderTo   : Ext.get(name + id),
        id :  'ObjectRequestDynField' + id,
        width : Ext.getCmp('objectRequestField'+id).getWidth(),
        anchor: '50%',
        items : [ comboCom,
                  comboSection,
                  comboParcelle,
                  {
                      xtype: 'checkboxgroup',
                      columns: 2,
                      allowBlank: false,
                      itemId: 'typePrint',
                      items: [
	                  {
	                      xtype: 'checkbox',
	                      boxLabel: 'Relevé de propriété',
	                      checked: true,
	                      inputValue: 'RP'
	                  },
	                  {
	                   xtype: 'checkbox',
	                      boxLabel: 'Bordereau parcellaire',
	                      inputValue: 'BP'
	                  }] 
                 }]
    });
    
    
}

/**
 * création du conteneur pour les id parcelle + compte communal + co(propriété
 */
GEOR.Addons.Cadastre.request.createObjectRequestField = function(name,id) {
	
    return new Ext.Container({
    	autoEl : 'div',
        renderTo   : Ext.get(name + id),
        id :  'ObjectRequestDynField' + id,
        items : [ {
            xtype : 'textfield',
            allowBlank : false,
            emptyText:'id...'
        }],
    });
}


/**
 * création du conteneur principale dans le conteneur objet de demande
 */
GEOR.Addons.Cadastre.request.createObjectRequest = function() {
	
    return new Ext.Container({

        autoEl : 'div', // This is the default
        id : 'container'+ _idContainer,
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
            columnWidth : .3,
            id : 'objectRequestType' + _idContainer,
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
                }, {
                    id : '4',
                    value : OpenLayers.i18n('cadastrapp.demandeinformation.object.type.4')
                }, {
                    id : '5',
                    value : OpenLayers.i18n('cadastrapp.demandeinformation.object.type.5')
                }, {
                    id : '6',
                    value : OpenLayers.i18n('cadastrapp.demandeinformation.object.type.6')
                } ]
            }),
        
	        listeners : {
	        	select : function(element, rec, idx) {
	        		var idCurrentElement = this.getId().split('objectRequestType')[1];
	                var typeObjectRequest = Ext.getCmp('objectRequestType'+idCurrentElement).getValue();
	                
	              //on supprime les champs dynamique crée avant s'il y en a 
	                if(Ext.getCmp('ObjectRequestDynField' + idCurrentElement)){
                		Ext.getCmp('ObjectRequestDynField' + idCurrentElement).removeAll();
                	}
	                
	                if(typeObjectRequest == '4'){
	                	//on crée les nouveaux champs
	                	Ext.getCmp('objectRequestField'+idCurrentElement).add(GEOR.Addons.Cadastre.request.createObjectRequestFieldProprio('objectRequestField', idCurrentElement));
	                	Ext.getCmp('objectRequestField'+idCurrentElement).doLayout();
	                }else if(typeObjectRequest == '2' ){
	                	//on crée les nouveaux champs
	                	Ext.getCmp('objectRequestField'+idCurrentElement).add(GEOR.Addons.Cadastre.request.createObjectRequestFieldParcelle('objectRequestField', idCurrentElement));
	                	Ext.getCmp('objectRequestField'+idCurrentElement).doLayout();
	                }
	                else if(typeObjectRequest == '5' || typeObjectRequest == '3' || typeObjectRequest == '1' ){
	                	//on crée les nouveaux champs
	                	Ext.getCmp('objectRequestField'+idCurrentElement).add(GEOR.Addons.Cadastre.request.createObjectRequestField('objectRequestField', idCurrentElement));
	                	Ext.getCmp('objectRequestField'+idCurrentElement).doLayout();
	                }
	                
	            }
	        }
        
        }, {
            xtype : 'container',
            layout : 'column',
            columnWidth : .7,
            id : 'objectRequestField' + _idContainer,
        }, {
            xtype : 'button',
            width : 20,
            iconCls : 'add-button',
            id : 'objectRequestButtoAdd' + _idContainer,
            handler : function() {
                Ext.getCmp('requestObjectDemande').add(GEOR.Addons.Cadastre.request.createObjectRequest());
                Ext.getCmp('requestObjectDemande').doLayout();
            }
        }, {
            xtype : 'button',
            width : 20,
            //iconCls : 'del-button',
            id : 'objectRequestButtoDel' + _idContainer,
            handler : function(element) {
            	//on récupère l'id du bouton del pour supprimer les éléments du même id
            	activeRemoveButtonId = this.getId().split('objectRequestButtoDel')[1];
            	//on supprime les élements du conteneur
            	Ext.getCmp('container'+activeRemoveButtonId).removeAll();
            	Ext.getCmp('requestObjectDemande').doLayout();
            	//possibilité d'ajouter un autre conteneur
            	_numberRequestMax++;
            	_numberRequestAvailable++;
            	
            	
                
            }
        } ],
    });
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
        width : 600,
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
                    	select : function(element, rec, idx) {
                            
                    		var selectedValue = element.value;
                    		//on vides les champs remplis
                    		GEOR.Addons.Cadastre.request.informationsWindow.items.items[0].getForm().reset();
                    		Ext.getCmp('requestType').setValue(selectedValue);
                            _numberRequestAvailable = GEOR.Addons.Cadastre.maxRequest + GEOR.Addons.Cadastre.maxRequest;
                            //on réinitialise le conteneur objet de demande
                            GEOR.Addons.Cadastre.request.removeAllObjectRequest();
                            
                            if (OpenLayers.i18n('cadastrapp.demandeinformation.type.P3') == selectedValue
                                    || 'P3' == selectedValue) {
                                Ext.getCmp('requestCNI').enable();
                                Ext.getCmp('requestCodePostal').disable();
                                Ext.getCmp('requestLastName').disable();
                                Ext.getCmp('requestFirstName').disable();
                                Ext.getCmp('requestAdress').disable();
                                Ext.getCmp('requestCommune').disable();
                                Ext.getCmp('requestMail').disable();
                                Ext.getCmp('radioGroupDemandeRealisee').disable();
                                Ext.getCmp('radioGroupDemandeTransmission').disable();
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
                                    _numberRequestAvailable = result.requestAvailable;

                                    if (_numberRequestAvailable <= 0) {
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
                                        var typeDemandeur = Ext.getCmp('requestType').getValue();
                                        if (OpenLayers.i18n('cadastrapp.demandeinformation.type.P3') ==  typeDemandeur
                                                || 'P3' ==  typeDemandeur){
                                        	//remove all object already created
                                        	GEOR.Addons.Cadastre.request.removeAllObjectRequest();
                                        	//create object request
                                        	Ext.getCmp('requestObjectDemande').add(GEOR.Addons.Cadastre.request.createObjectRequest());
                                            Ext.getCmp('requestObjectDemande').doLayout();
                                            
                                            Ext.getCmp('requestPrintButton').enable();
                                        }
                                        

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
                    disabled : true,
                    listeners : {
                        change : function(textfield, newValue, oldValue) {
                        	
                        	var typeDemandeur = Ext.getCmp('requestType').getValue();
                        	 // Add object Request
                            if (OpenLayers.i18n('cadastrapp.demandeinformation.type.P3') !=  typeDemandeur
                                    && 'P3' !=  typeDemandeur && _numberRequestMax > 0){
                            	Ext.getCmp('requestObjectDemande').add(GEOR.Addons.Cadastre.request.createObjectRequest());
                                Ext.getCmp('requestObjectDemande').doLayout();
                                Ext.getCmp('requestPrintButton').enable();
                            }
                        }
                    }
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
                        if (_numberRequestAvailable <= 0 ) {
                            Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.exceded.number'));
                            return false;
                        }else if(_numberRequestMax <= 0){
                        	Ext.Msg.alert(OpenLayers.i18n('cadastrapp.demandeinformation.alert.title'), OpenLayers.i18n('cadastrapp.demandeinformation.exceded.maxNumber'));
                            return false;
                        }else {
                    		_numberRequestAvailable = _numberRequestAvailable - 1;
                            _numberRequestMax = _numberRequestMax - 1;
                            _idContainer++;
                        
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
                	
                	//TODO on vérifie si les champs obligatoirs sont saisies

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
                    params.parcelleIds = [];
                    params.comptecommunaux = [];
                    params.coproprietes = [];
                    
                    params.parcelles = [];
                    params.proprietaires = [];
                    params.ProprietaireLots = [];

                    Ext.each(Ext.getCmp('requestObjectDemande').items.items, function(element) {

                		 var requestType = element.items.items[0].getValue();
                         var idObjectRequest = element.items.items[0].getId().split('objectRequestType')[1];
                         
                		 if (requestType == 5) {
                             params.parcelleIds.push(Ext.getCmp('ObjectRequestDynField' + idObjectRequest).items.items[0].getValue());
                         } else if (requestType == 1) {
                             params.comptecommunaux.push(Ext.getCmp('ObjectRequestDynField' + idObjectRequest).items.items[0].getValue());
                         } else if (requestType == 3) {
                             params.coproprietes.push(Ext.getCmp('ObjectRequestDynField' + idObjectRequest).items.items[0].getValue());
                         } else if (requestType == 4) {
                             params.proprietaires.push(Ext.getCmp('communeList' + idObjectRequest).getValue() + '|'+ Ext.getCmp('proprioList' + idObjectRequest).getValue());
                         } else if (requestType == 2) {
                             params.parcelles.push(Ext.getCmp('communeList' + idObjectRequest).getValue() + '|'+ Ext.getCmp('sectionList' + idObjectRequest).getValue()+ '|'+ Ext.getCmp('parcelleList' + idObjectRequest).getValue());
                         } else if (requestType == 6) {
                             params.ProprietaireLots.push(Ext.getCmp('ObjectRequestDynField' + idObjectRequest).getValue());
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
                GEOR.Addons.Cadastre.request.informationsWindow.items.items[0].getForm().reset();
                GEOR.Addons.Cadastre.request.removeAllObjectRequest();
            },
            close : function(windows) {
                GEOR.Addons.Cadastre.request.informationsWindow = null;
            }
        }
    });
    GEOR.Addons.Cadastre.request.informationsWindow.show();
    console.log("onClick")
};
