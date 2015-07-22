Ext.namespace("GEOR.Addons.Cadastre");

// Parcelle windows with three tabs
// Ref ; Adresse cadastrale, Ref cadastrale
GEOR.Addons.Cadastre.rechercheParcelleWindow;

/**
 * Init windows if it does not exist, and select firt tab
 * 
 * @param: tab 0, 1 or 2 
 *      0 -> tab search by ref
 *      1 -> tab search by adresse
 *      2 -> tab search by ref cadastrale
 */
GEOR.Addons.Cadastre.onClickRechercheParcelle = function(tab) {
    
    // Check if windows already exists.
    if (GEOR.Addons.Cadastre.rechercheParcelleWindow == null) {
        GEOR.Addons.Cadastre.initRechercheParcelle();
    }
    GEOR.Addons.Cadastre.rechercheParcelleWindow.show();
    GEOR.Addons.Cadastre.rechercheParcelleWindow.items.items[0].setActiveTab(tab);
}

/**
 *  Create search windows
 */
GEOR.Addons.Cadastre.initRechercheParcelle = function() {
    
    var parcBisStore, parcCityCombo1, parcCityCombo2, parcelleGrid;

    parcBisStore = GEOR.Addons.Cadastre.getBisStore();

    // combobox "villes"
    parcCityCombo1 = new Ext.form.ComboBox({
        fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.city'),
        hiddenName : 'ccoinsee',
        allowBlank : false,
        width : 300,
        mode : 'local',
        value : '',
        forceSelection : true,
        editable : true,
        displayField : 'displayname',
        valueField : 'ccoinsee',
        store : GEOR.Addons.Cadastre.getPartialCityStore(),
        listeners : {
            beforequery : function(q) {
                if (q.query) {
                    var length = q.query.length;
                    if (length >= GEOR.Addons.Cadastre.minCharToSearch && q.combo.getStore().getCount() == 0) {
                        if (isNaN(q.query)) {
                            // recherche par nom de ville
                            q.combo.getStore().load({
                                params : {
                                    libcom_partiel : q.query
                                }
                            });
                        } else {
                            // recherche par code insee
                            q.combo.getStore().load({
                                params : {
                                    ccoinsee_partiel : q.query
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
            change : function(combo, newValue, oldValue) {
                // refaire le section store pour cette ville
                parcelleGrid.reconfigure(GEOR.Addons.Cadastre.getVoidRefStore(), GEOR.Addons.Cadastre.getRefColModel(newValue));
                GEOR.Addons.Cadastre.rechercheParcelleWindow.buttons[0].enable();
            }
        }
    });

    parcCityCombo2 = new Ext.form.ComboBox({
        fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.city'),
        hiddenName : 'ccoinsee',
        allowBlank : false,
        width : 300,
        mode : 'local',
        value : '',
        forceSelection : true,
        editable : true,
        displayField : 'displayname',
        valueField : 'ccoinsee',
        store : GEOR.Addons.Cadastre.getPartialCityStore(),
        listeners : {
            beforequery : function(q) {
                if (q.query) {
                    var length = q.query.length;
                    if (length >= GEOR.Addons.Cadastre.minCharToSearch && q.combo.getStore().getCount() == 0) {
                        if (isNaN(q.query)) {
                            // recherche par nom de ville
                            q.combo.getStore().load({
                                params : {
                                    libcom_partiel : q.query
                                }
                            });
                        } else {
                            // recherche par code insee
                            q.combo.getStore().load({
                                params : {
                                    ccoinsee_partiel : q.query
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
            change : function(combo, newValue, oldValue) {
                GEOR.Addons.Cadastre.rechercheParcelleWindow.buttons[0].enable();
            }
        }
    });

    // grille "références"
    parcelleGrid = new Ext.grid.EditorGridPanel({
        fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.references'),
        xtype : 'editorgrid',
        clicksToEdit : 1,
        ds : GEOR.Addons.Cadastre.getVoidRefStore(),
        cm : GEOR.Addons.Cadastre.getRefColModel(null),
        autoExpandColumn : 'parcelle',
        height : 100,
        width : 300,
        border : true,
        listeners : {
            beforeedit : function(e) {
                console.log("Beforeedit What event is it");
                if (e.column == 0) {
                    // pas d'edition de section si aucune ville selectionnée
                    if (parcCityCombo1.value == ''){
                        console.log("La ville doit être choisie d'abord")
                        return false;
                    }
                }
                if (e.column == 1) {
                    // pas d'edition de parcelle si aucune section selectionnée
                    if (e.record.data.section == ''){
                        console.log("La section et pre-section doit être choisie d'abord")
                        return false;
                    }
                   
                    // on remplace le contenu du store des parcelles selon la section selectionnée
                    GEOR.Addons.Cadastre.loadParcelleStore(e.grid.getColumnModel().getColumnById(e.field).editor.getStore(), parcCityCombo1.value, e.record.data.section);
                }
            },
            afteredit : function(e) {
                console.log("Afteredit What event is it");
                // on ajoute un champ vide, si le dernier champ est complet
                var lastIndex = e.grid.store.getCount() - 1;
                var lastData = e.grid.store.getAt(e.grid.store.getCount() - 1).data;

                if (lastData.section != '' && lastData.parcelle != '') {
                    var p = new e.grid.store.recordType({
                        section : '',
                        parcelle : ''
                    }); // create new record
                    e.grid.stopEditing();
                    e.grid.store.add(p); // insert a new record into the store (also see add)
                    this.startEditing(e.row, 1);
                }
            }
        }
    });

    // fenêtre principale
    GEOR.Addons.Cadastre.rechercheParcelleWindow = new Ext.Window({
        title : OpenLayers.i18n('cadastrapp.parcelle.title'),
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
                GEOR.Addons.Cadastre.rechercheParcelleWindow = null;
            }
        },

        items : [ {
            xtype : 'tabpanel',
            activeTab : 0,
            items : [ {
                // ONGLET 1
                title : OpenLayers.i18n('cadastrapp.parcelle.title.tab1'),
                xtype : 'form',
                defaultType : 'displayfield',
                id : 'parcFirstForm',
                fileUpload : true,
                height : 200,
                items : [ parcCityCombo1, // combobox "villes"
                {
                    value : OpenLayers.i18n('cadastrapp.parcelle.city.exemple'),
                    fieldClass : 'displayfieldGray'
                }, parcelleGrid, // grille "références"
                {
                    value : OpenLayers.i18n('cadastrapp.parcelle.or'),
                    fieldClass : 'displayfieldCenter'
                }, {
                    fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.file.path'),
                    name : 'filePath',
                    xtype : 'fileuploadfield',
                    emptyText : OpenLayers.i18n('cadastrapp.parcelle.file.exemple'),
                    buttonText : OpenLayers.i18n('cadastrapp.parcelle.file.open'),
                    height : 25,
                    width : 300
                } ]

            }, {

                // ONGLET 2
                title : OpenLayers.i18n('cadastrapp.parcelle.title.tab2'),
                xtype : 'form',
                defaultType : 'displayfield',
                id : 'parcSecondForm',
                height : 200,

                items : [ parcCityCombo2, // combobox "villes"
                {
                    value : OpenLayers.i18n('cadastrapp.parcelle.city.exemple'),
                    fieldClass : 'displayfieldGray'
                }, {
                    xtype : 'compositefield',
                    fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.street'),
                    defaults : {
                        flex : 1
                    },
                    items : [ {
                        name : 'dnvoiri',
                        xtype : 'textfield',
                        width : 50,
                    }, {
                        hiddenName : 'dindic',
                        xtype : 'combo',
                        width : 50,
                        mode : 'local',
                        value : '',
                        triggerAction : 'all',
                        forceSelection : true,
                        editable : false,
                        displayField : 'name',
                        valueField : 'value',
                        store : parcBisStore
                    }, {
                        name : 'dvoilib',
                        xtype : 'textfield',
                        width : 190
                    } ]
                }, {
                    value : OpenLayers.i18n('cadastrapp.parcelle.street.exemple'),
                    fieldClass : 'displayfieldGray'
                }, {
                    xtype : 'textfield',
                    fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.town'),
                    name : 'town',
                    width : 300
                }, {
                    value : OpenLayers.i18n('cadastrapp.parcelle.town.exemple'),
                    fieldClass : 'displayfieldGray'
                } ]
            }, {

                // ONGLET 3
                title : OpenLayers.i18n('cadastrapp.parcelle.title.tab3'),
                xtype : 'form',
                defaultType : 'displayfield',
                id : 'parcThirdForm',
                height : 200,

                items : [ {
                    xtype : 'textfield',
                    fieldLabel : OpenLayers.i18n('cadastrapp.parcelle.ident'),
                    name : 'ident',
                    width : 300
                }, {
                    value : OpenLayers.i18n('cadastrapp.parcelle.ident.exemple'),
                    fieldClass : 'displayfieldGray'
                } ]
            } ]
        } ],

        buttons : [ {
            text : OpenLayers.i18n('cadastrapp.search'),
            disabled : false,
            listeners : {
                click : function(b, e) {
                    var currentForm = GEOR.Addons.Cadastre.rechercheParcelleWindow.items.items[0].getActiveTab();

                    if (currentForm.id == 'parcFirstForm') {
                        if (currentForm.getForm().isValid()) {
                            // TITRE de l'onglet resultat
                            var resultTitle = currentForm.getForm().findField('ccoinsee').lastSelectionText;

                            if (currentForm.getForm().findField('filePath').value != undefined) {
                                // PAR FICHIER

                                // soumet la form (pour envoyer le fichier)
                                currentForm.getForm().submit({
                                    url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle/fromParcellesFile',
                                    params : {},
                                    success : function(form, action) {
                                        GEOR.Addons.Cadastre.addNewResultParcelle(resultTitle, GEOR.Addons.Cadastre.getResultParcelleStore(action.response.responseText, true));
                                    },
                                    failure : function(form, action) {
                                        alert('ERROR');
                                    }
                                });

                            } else {
                                // PARAMS
                                var params = {};
                                params.ccoinsee = currentForm.getForm().findField('ccoinsee').value;
                                
                                // init result windows without showing it
                                GEOR.Addons.Cadastre.addNewResult(resultTitle, null, OpenLayers.i18n('cadastrapp.parcelle.result.nodata'));
                                
                                parcelleGrid.getStore().each(function(record) {
                                    console.log("parcelleGrid each row");
                                   
                                    params.dnupla = record.data.parcelle;
                                    params.ccopre = record.data.section.substring(0, record.data.section.length-2);
                                    params.ccosec = record.data.section.substring(record.data.section.length-2, record.data.section.length);
                                     
                                    if(params.dnupla != undefined && params.ccosec != ' '){
                                        
                                        console.log("parcelleGrid each row - after test");
                                        //envoi la liste de resultat
                                        Ext.Ajax.request({
                                            method : 'GET',
                                            url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
                                            params : params,
                                            success : function(result) {
                                                var data = eval(result.responseText);
                                                GEOR.Addons.Cadastre.addNewDataResultParcelle(data);
                                            },
                                            failure : function(result) {
                                                alert('ERROR');
                                            }
                                        });
                                    }       
                                });
                             }
                        }

                    }
                    if (currentForm.id == 'parcSecondForm') {
                        if (currentForm.getForm().isValid()) {
                            //TITRE de l'onglet resultat
                            var resultTitle = currentForm.getForm().findField('ccoinsee').lastSelectionText;

                            //PARAMS
                            var params = currentForm.getForm().getValues();
                            params.ccoinsee = currentForm.getForm().findField('ccoinsee').value;
 
                            //envoi des données d'une form
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
                                params : params,
                                success : function(result) {
                                    GEOR.Addons.Cadastre.addNewResultParcelle(resultTitle, GEOR.Addons.Cadastre.getResultParcelleStore(result.responseText, false));
                                },
                                failure : function(result) {
                                    alert('ERROR');
                                }
                            });
                        }

                    }
                    if (currentForm.id == 'parcThirdForm') {

                        if (currentForm.getForm().isValid()) {
                            //PARAMS
                            var params = currentForm.getForm().getValues();

                            //TITRE de l'onglet resultat
                            var resultTitle = "Recherche par id(s)";
                            params.parcelle = currentForm.getForm().getValues().ident;

                            //envoi des données d'une form
                            Ext.Ajax.request({
                                method : 'GET',
                                url : GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle',
                                params: params,
                                success : function(result) {
                                    GEOR.Addons.Cadastre.addNewResultParcelle(resultTitle, GEOR.Addons.Cadastre.getResultParcelleStore(result.responseText, false));
                                },
                                failure : function(result) {
                                    alert('ERROR');
                                }
                            });
                        }
                    }

                }
            }
        }, {
            text : OpenLayers.i18n('cadastrapp.close'),
            listeners : {
                click : function(b, e) {
                    GEOR.Addons.Cadastre.rechercheParcelleWindow.close();
                }
            }
        } ]
    });
};