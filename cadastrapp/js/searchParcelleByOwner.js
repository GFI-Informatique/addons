Ext.namespace("GEOR.Addons.Cadastre");

/**
 * Init windows if not existing
 */
GEOR.Addons.Cadastre.onClickRechercheProprietaire = function(tab) {

    if (GEOR.Addons.Cadastre.proprietaireWindow == null) {
        GEOR.Addons.Cadastre.initRechercheProprietaire();
    }
    GEOR.Addons.Cadastre.proprietaireWindow.show();
    GEOR.Addons.Cadastre.proprietaireWindow.items.items[0].setActiveTab(tab);
}

/**
 * Create search windows to find list of plots using owners information Town,
 * name or id
 */
GEOR.Addons.Cadastre.initRechercheProprietaire = function() {

    // comboboxe "villes" de l'onglet "Nom usage ou Naissance"
    var propCityCombo1 = new Ext.form.ComboBox({
        fieldLabel : OpenLayers.i18n('cadastrapp.proprietaire.city'),
        hiddenName : 'cgocommune',
        allowBlank : false,
        width : 300,
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
            },
            valid : function(element) {
                Ext.getCmp('comboDnomlpSearchByOwners').enable();
            }
        }
    });

    // Combobox "Villes" de l'onglet "Compte propriétaire"
    var propCityCombo2 = new Ext.form.ComboBox({
        fieldLabel : OpenLayers.i18n('cadastrapp.proprietaire.city'),
        hiddenName : 'cgocommune',
        allowBlank : false,
        width : 300,
        mode : 'local',
        value : '',
        forceSelection : true,
        editable : true,
        displayField : 'displayname',
        valueField : 'cgocommune',
        store : GEOR.Addons.Cadastre.getPartialCityStore(),
        // Recherche de la ville demandée avec gestion de l'autocomplétion
        listeners : {
            beforequery : function(q) {
                if (q.query) {
                    var length = q.query.length;
                    if (length >= GEOR.Addons.Cadastre.minCharToSearch && q.combo.getStore().getCount() == 0) {
                        if (isNaN(q.query)) {
                            // recherche par nom de ville
                            q.combo.getStore().load({
                                params : {
                                    libcom : q.query
                                }
                            });
                        } else {
                            // recherche par code insee
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
            },
            valid : function(element) {
                Ext.getCmp('gripOwnerSearchByOwners').enable();
            }
        }
    });

    // grille "proprietaires"
    var proprietaireGrid = new Ext.grid.EditorGridPanel({
        id : 'gripOwnerSearchByOwners',
        fieldLabel : OpenLayers.i18n('cadastrapp.proprietaire.proprietaires'),
        name : 'proprietaires',
        xtype : 'editorgrid',
        clicksToEdit : 1,
        ds : GEOR.Addons.Cadastre.getVoidProprietaireStore(),
        cm : GEOR.Addons.Cadastre.getProprietaireColModel(),
        autoExpandColumn : 'proprietaire',
        height : 100,
        width : 300,
        border : true,
        disabled : true,
        listeners : {
            beforeedit : function(e) {
                if (e.column == 0 && propCityCombo2.value == '') {
                    return false;
                }
            },
            afteredit : function(e) {
                // on ajoute un champ vide, si le dernier champ est complet
                var lastIndex = e.grid.store.getCount() - 1;
                var lastData = e.grid.store.getAt(e.grid.store.getCount() - 1).data;

                if (lastData.proprietaire != '') {
                    var p = new e.grid.store.recordType({
                        proprietaire : ''
                    }); // create new record
                    e.grid.stopEditing();
                    e.grid.store.add(p); // insert a new record into the
                    // store (also see add)
                    this.startEditing(e.row + 1, 0);
                }
                GEOR.Addons.Cadastre.proprietaireWindow.buttons[0].enable();
            }
        }
    });

    // Construction de la fenêtre principale
    // constituée de deux onglets et des boutons d'ouverture de fichier .csv, de
    // recherche
    // et de fermeture de la fenetre
    GEOR.Addons.Cadastre.proprietaireWindow = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.proprietaire.title'),
        frame : true,
        autoScroll : true,
        minimizable : false,
        closable : true,
        resizable : true,
        draggable : true,
        constrainHeader : true,
        border : false,
        labelWidth : 100,
        width : 450,
        defaults : {
            autoHeight : true,
            bodyStyle : 'padding:10px',
            flex : 1
        },
        listeners : {
            close : function(window) {
                GEOR.Addons.Cadastre.proprietaireWindow = null;
            }
        },
        items : [ {
            xtype : 'tabpanel',
            activeTab : 0,
            items : [ {
                // ONGLET "Nom Usage ou Naissance"
                id : 'propFirstForm',
                xtype : 'form',
                title : OpenLayers.i18n('cadastrapp.proprietaire.title.tab1'),
                defaultType : 'displayfield',
                height : 150,
                items : [ propCityCombo1, {
                    value : OpenLayers.i18n('cadastrapp.proprietaire.city.exemple'),
                    fieldClass : 'displayfieldGray'
                }, {
                    id : 'comboDnomlpSearchByOwners',
                    hiddenName : 'globalname',
                    fieldLabel : OpenLayers.i18n('cadastrapp.proprietaire.name'),
                    xtype : 'combo',
                    allowBlank : false,
                    width : 300,
                    mode : 'local',
                    value : '',
                    forceSelection : false,
                    editable : true,
                    displayField : 'globalname',
                    valueField : 'globalname',
                    disabled : true,
                    store : new Ext.data.JsonStore({
                        proxy : new Ext.data.HttpProxy({
                            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getProprietaire',
                            method : 'GET',
                            autoload : true
                        }),
                        fields : [ { 
                            name: 'globalname', 
                            convert: function(v, rec) {
                                return rec.dnomlp +' '+rec.dnomcp+' '+rec.dprnlp+''+rec.dprncp;
                            } }]
                    }),
                    listeners : {
                        beforequery : function(q) {
                            if (q.query) {
                                var length = q.query.length;
                                if (length >= GEOR.Addons.Cadastre.minCharToSearch && q.combo.getStore().getCount() == 0) {
                                    q.combo.getStore().load({
                                        params : {
                                            cgocommune : GEOR.Addons.Cadastre.proprietaireWindow.items.items[0].getActiveTab().getForm().findField('cgocommune').value,
                                            globalname : q.query
                                        }
                                    });
                                }
                            } else if (length < GEOR.Addons.Cadastre.minCharToSearch) {
                                q.combo.getStore().loadData([], false);
                            }
                            q.query = new RegExp(Ext.escapeRe(q.query), 'i');
                            q.query.length = length;
                        },
                        valid : function(element) {
                            GEOR.Addons.Cadastre.proprietaireWindow.buttons[0].enable();
                        }
                    }
                }, {
                    value : OpenLayers.i18n('cadastrapp.proprietaire.name.exemple'),
                    fieldClass : 'displayfieldGray'
                } ]
            }, {
                // ONGLET "Compte proprietaire"
                id : 'propSecondForm',
                xtype : 'form',
                title : OpenLayers.i18n('cadastrapp.proprietaire.title.tab2'),
                defaultType : 'displayfield',
                height : 150,

                items : [ propCityCombo2, {
                    value : OpenLayers.i18n('cadastrapp.proprietaire.city.exemple'),
                    fieldClass : 'displayfieldGray'
                }, proprietaireGrid, // grille "proprietaires"
                ]
            }, {
                // ONGLET "par lot"
                id : 'propThirdForm',
                xtype : 'form',
                title : OpenLayers.i18n('cadastrapp.proprietaire.title.tab3'),
                defaultType : 'displayfield',
                fileUpload : true,
                height : 150,
                items : [ {
                    fieldLabel : OpenLayers.i18n('cadastrapp.proprietaire.file.path'),
                    name : 'filePath',
                    xtype : 'fileuploadfield',
                    emptyText : OpenLayers.i18n('cadastrapp.proprietaire.file.exemple'),
                    buttonText : OpenLayers.i18n('cadastrapp.proprietaire.file.open'),
                    height : 25,
                    width : 300
                }, {
                    value : OpenLayers.i18n('cadastrapp.proprietaire.file.explanation'),
                    fieldClass : 'displayfieldGray'
                } ], 
                listeners : {
                    afterrender: function(element) {
                        GEOR.Addons.Cadastre.proprietaireWindow.buttons[0].enable();
                    }
                }
            } ],
            listeners : {
                beforetabchange : function(panel, newTab, currentTab) {
                    if(GEOR.Addons.Cadastre.proprietaireWindow){
                        GEOR.Addons.Cadastre.proprietaireWindow.buttons[0].disable();
                    }
                }
            }
        } ],
        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.search'),
            disabled : true,
            listeners : {
                click : function(b, e) {
                    var currentForm = GEOR.Addons.Cadastre.proprietaireWindow.items.items[0].getActiveTab();
                    if (currentForm.id == 'propFirstForm') {
                        if (currentForm.getForm().isValid()) {
                            // TITRE de l'onglet resultat
                            var resultTitle = currentForm.getForm().findField('cgocommune').lastSelectionText;

                            // PARAMS
                            var params = currentForm.getForm().getValues();
                            params.details = 2;

                            // envoi des données d'une form
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getProprietaire',
                                params : params,
                                success : function(response) {
                                    var paramsGetParcelle = {};
                                    var comptecommunalArray = [];
                                    var result = Ext.decode(response.responseText);
                                    for (var i = 0; i < result.length; i++) {
                                        comptecommunalArray.push(result[i].comptecommunal);
                                    }
                                    paramsGetParcelle.comptecommunal = comptecommunalArray;
                                    // envoi des données d'une form
                                    Ext.Ajax.request({
                                        method : 'GET',
                                        url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
                                        params : paramsGetParcelle,
                                        success : function(result) {
                                            GEOR.Addons.Cadastre.addNewResultParcelle(resultTitle, GEOR.Addons.Cadastre.getResultParcelleStore(result.responseText, false));
                                        },
                                        failure : function(result) {
                                            console.log('Error when getting parcelle information, check server side');
                                        }
                                    });
                                },
                                failure : function(result) {
                                    alert('Error when getting proprietaire information, check server side');
                                }
                            });
                        }

                    } else {
                        if (currentForm.getForm().isValid()) {
                           
                            if (currentForm.getForm().findField('filePath').value != undefined) {
                                // PAR FICHIER
                                // TITRE de l'onglet resultat
                                var resultTitle = OpenLayers.i18n('cadastrapp.result.title.fichier');

                                // soumet la form (pour envoyer le fichier)
                                currentForm.getForm().submit({
                                    method : 'POST',
                                    url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'fromProprietairesFile',
                                    params : {
                                        details : 1
                                    },
                                    success : function(form, action) {
                                        GEOR.Addons.Cadastre.addNewResultParcelle(resultTitle, GEOR.Addons.Cadastre.getResultParcelleStore(action.response.responseText, true));
                                    },
                                    failure : function(form, action) {
                                        alert('ERROR');
                                    }
                                });

                            } else {

                                // TITRE de l'onglet resultat
                                var resultTitle = currentForm.getForm().findField('cgocommune').lastSelectionText;

                                // PARAMS
                                var params = currentForm.getForm().getValues();
                                params.details = 2;

                                // liste des proprietaires
                                var dnuproList = new Array();
                                proprietaireGrid.getStore().each(function(record) {
                                    dnuproList.push(record.data.proprietaire);
                                });
                                params.dnupro = dnuproList;
                                // PAR LISTE
                                // envoi des données d'une form
                                Ext.Ajax.request({
                                    method : 'GET',
                                    url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getProprietaire',
                                    params : params,
                                    success : function(response) {
                                        var paramsGetParcelle = {};
                                        var comptecommunalArray = [];
                                        var result = Ext.decode(response.responseText);
                                        for (var i = 0; i < result.length; i++) {
                                            comptecommunalArray.push(result[i].comptecommunal);
                                        }
                                        paramsGetParcelle.comptecommunal = comptecommunalArray;
                                        // envoi des données d'une form
                                        Ext.Ajax.request({
                                            method : 'GET',
                                            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
                                            params : paramsGetParcelle,
                                            success : function(result) {
                                                GEOR.Addons.Cadastre.addNewResultParcelle(resultTitle, GEOR.Addons.Cadastre.getResultParcelleStore(result.responseText, false));
                                            },
                                            failure : function(result) {
                                                console.log('Error when getting parcelle information, check server side');
                                            }
                                        });
                                    },
                                    failure : function(result) {
                                        alert('Error when getting proprietaire information, check server side');
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.close'),
            listeners : {
                click : function(b, e) {
                    GEOR.Addons.Cadastre.proprietaireWindow.close();
                }
            }
        } ]
    });
    
};
