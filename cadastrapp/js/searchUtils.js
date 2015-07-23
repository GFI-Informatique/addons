Ext.namespace("GEOR.Addons.Cadastre");


/**
 * liste des compléments de numéro de rue : BIS, TER (à compléter ?)
 */
GEOR.Addons.Cadastre.getBisStore = function() {
		return new Ext.data.JsonStore({
			fields : ['name', 'value'],
			data   : [
				{name : '--', value: ''},
				{name : 'bis', value: 'B'},
				{name : 'ter', value: 'T'},
				{name : 'quater', value: 'Q'},
				{name : 'A', value: 'A'},
				{name : 'B', value: 'B'},
				{name : 'C', value: 'C'},
				{name : 'D', value: 'D'},
				{name : 'E', value: 'E'},
				{name : 'F', value: 'F'},
				{name : 'G', value: 'G'},
				{name : 'H', value: 'H'}
			]
		});		
	}
	

/**
 * Liste de villes afficher sous la forme NomVille - (CodeCommune6Char)
 */
GEOR.Addons.Cadastre.getPartialCityStore = function() {
		return new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
                url: GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getCommune',
                method: 'GET'
             }),
			fields: ['ccoinsee', 'libcom', 'libcom_min', { 
		       name: 'displayname', 
		       convert: function(v, rec) { return rec.libcom_min.trim() + ' (' + rec.ccoinsee.trim() + ')'}
		    }]
		});
	}
	
		
/**
 *  Appel pour récuperer la liste des sections
 *  
 *  @param : cityId -> 6 chars corresponding to ccodep + ccodir + ccocom
 */		
GEOR.Addons.Cadastre.getSectionStore = function(cityId) {
		if (cityId!=null) {
			return new Ext.data.JsonStore({
			    url: GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getSection?ccoinsee='+cityId,
			    method: 'GET',
				autoLoad: true,
				fields: ['ccoinsee', 'ccopre', 'ccosec', 
					{ 
				       name: 'fullccosec', 
				       convert: function(v, rec) { return rec.ccopre + rec.ccosec; }
				    }]
			});
		} else {
			return new Ext.data.JsonStore({
				data: [],
				fields: ['ccoinsee', 'ccopre', 'ccosec', 'fullccosec']
			});
		}
	}
	
/**
 * Init webapp call, without calling
 *  Params will be set later after section has been choosen
 */
GEOR.Addons.Cadastre.initParcelleStore = function() {
    return new Ext.data.JsonStore({
        proxy: new Ext.data.HttpProxy({
            url: GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getParcelle/dnupla',
            method: 'GET'}),
        params:{},
        fields: ['dnupla']
    });
}


/**
 * loadParcelleStore update parcelleStore with input params that will be used in webapp call
 * 
 * @param : parcelleStore
 * @param : cityId
 * @param : sectionId (contains ccopre 3 first characters, and ccosec after)
 */
GEOR.Addons.Cadastre.loadParcelleStore = function(parcelleStore, cityId, sectionId) {
        
    console.log("loadParcelleStore : " + parcelleStore + ""+ cityId + ""+ sectionId);
    
    if (parcelleStore!=null && cityId!=null && sectionId!=null) {
        // parse sectionID to set params for request
        var prefix = sectionId.substring(0, sectionId.length-2);
        var section = sectionId.substring(sectionId.length-2, sectionId.length);
			        
        parcelleStore.load({params: {
            ccoinsee: cityId,
            ccopre: prefix,
            ccosec: section,
        }});
    }
}
	
		
/**
 *  Appel à la webApp pour récupérer les propriétaires habitant dans une commune
 * @param : cityId
 */
GEOR.Addons.Cadastre.getProprietaireStore = function(cityId) {		
    if (cityId!=null) {
        return new Ext.data.JsonStore({
            url: GEOR.Addons.Cadastre.cadastrappWebappUrl + 'getProprietaire?ccoinsee=' + cityId,
            autoLoad: true,
            fields: ['ccoinsee', 'ccopre', 'ccosec', 
                     { 
                name: 'fullccosec', 
                convert: function(v, rec) { return (rec.ccopre.trim().length>0) ? (rec.ccopre.trim() + '-' + rec.ccosec.trim()) : rec.ccosec.trim(); }
                     }]
        });
    } else {
        return new Ext.data.JsonStore({
            data: [],
            fields: ['ccoinsee', 'ccopre', 'ccosec', 'fullccosec']
        });
    }
}
		
/**
 * 
 */
GEOR.Addons.Cadastre.getVoidRefStore = function() {
    return new Ext.data.JsonStore({
        fields : ['section', 'parcelle'],
        data   : [{section : '',   parcelle: ''}]
    });		
}


/**
 * 
 */
GEOR.Addons.Cadastre.getVoidProprietaireStore = function() {
    return new Ext.data.JsonStore({
        fields : ['proprietaire'],
        data   : [{proprietaire : ''}]
    });		
}
	
/**
 * Creation des headers de colonnes de la grille "référence"
 * 
 * @param cityId -> ccodep + ccodir + ccocom
 * 
 */
GEOR.Addons.Cadastre.getRefColModel = function(cityId) {
    return new Ext.grid.ColumnModel([
    {
        id:'section',
		dataIndex: 'section',
		header: OpenLayers.i18n('cadastrapp.parcelle.references.col1'),
		width: 100,
		sortable: false,
		editor: new Ext.form.ComboBox({
		    mode: 'local',
		    value: '',
		    forceSelection: false,
		    editable:       true,
		    displayField:   'fullccosec',
		    valueField:     'fullccosec',
		    store: GEOR.Addons.Cadastre.getSectionStore(cityId)				
		})
    },
    {
        id: "parcelle",
        dataIndex: 'parcelle',
        header: OpenLayers.i18n('cadastrapp.parcelle.references.col2'),
        width: 100,
        sortable: false,	
        editor: new Ext.form.ComboBox({
            mode: 'local',
            value: '',
            forceSelection: false,
            editable: true,
            displayField: 'dnupla',
            valueField: 'dnupla',
            store: GEOR.Addons.Cadastre.initParcelleStore(),
            listeners: {
                beforequery: function(q){  
                    console.log("Parcelle - beforequery :" + q.query);
                    if (q.query) {
                        var length = q.query.length;
                        q.query = new RegExp(Ext.escapeRe(q.query), 'i');
                        q.query.length = length;
                    }
                }
            }
        })
    }
    ]);		
}

/**
 * Création des colonnes et nom pour la GridPanel Parcelle
 * 
 * @return  ColumnModel - completed with all header names
 */
GEOR.Addons.Cadastre.getResultParcelleColModel = function() {
    return new Ext.grid.ColumnModel([
        {
            id:'ccoinsee',
			dataIndex: 'ccoinsee',
			header: OpenLayers.i18n('cadastrapp.parcelle.result.commune'),
			sortable: true,
			width: 60
		},
		{
			id:'ccosec',
			dataIndex: 'ccosec',
			header: OpenLayers.i18n('cadastrapp.parcelle.result.ccosec'),
			sortable: true,
            width: 50
		},
		{
			id:'dnupla',
			dataIndex: 'dnupla',
			header: OpenLayers.i18n('cadastrapp.parcelle.result.dnupla'),
			sortable: true,
            width: 60
		},
		{
			id:'adresse',
			dataIndex: 'adresse',
			header: OpenLayers.i18n('cadastrapp.parcelle.result.adresse'),
			sortable: true,
            width: 190
		},
		{
			id:'dcntpa',
			dataIndex: 'dcntpa',
			header: OpenLayers.i18n('cadastrapp.parcelle.result.surface'),
			sortable: true,
            width: 150
	}]);
}
	
	
/**
 * 
 * @param cityId
 * 
 * @returb ColumnModel
 */
GEOR.Addons.Cadastre.getProprietaireColModel = function(cityId) {
		return new Ext.grid.ColumnModel([
			{
				id:'proprietaire',
				dataIndex: 'proprietaire',
				header: OpenLayers.i18n('cadastrapp.proprietaire.proprietaires.col1'),
				width: 100,
				sortable: false,
				editor: new Ext.form.TextField({ allowBlank: false })
			}
		]);		
	}
	
/**
 * Parse JSon response from webApp from getParcelle with details=0
 */	
GEOR.Addons.Cadastre.getResultParcelleStore = function (result, fromForm) {
		return new Ext.data.JsonStore({
			fields: ['parcelle', 'ccoinsee', 'ccopre', 'ccosec', 'dnupla', 'dnvoiri', 'dindic', 'cconvo', 'dvoilib', 'dcntpa',
			         { 
			       		name: 'adresse', 
			       		convert: function(v, rec) {
			       			return rec.dnvoiri + rec.dindic +' '+rec.cconvo  +' ' + rec.dvoilib;
			       		}
			         }],
			data: (fromForm) ? Ext.util.JSON.decode(result).data : Ext.util.JSON.decode(result)
		});		
	}

	
	
	