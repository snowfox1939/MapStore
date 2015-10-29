/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = SearchServizioApertura
 */
 
 
/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: SearchServizioApertura(config)
 *
 *    Plugin for adding a new group on layer tree.
 */
gxp.plugins.SearchServizioApertura = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_addgroup */
    ptype: "gxp_searchservizioapertura",
	
	serviceUrl: null,
	vieLang: "it",
	viaText: "Via",
	viaEmpty: 'Inserisci via',
	selectionProperties: null,
	
	viaToolTip: 'Per esempio per Via Roma digitare "Roma"',
		
		
	constructor: function(config) {
        gxp.plugins.SearchServizioApertura.superclass.constructor.apply(this, arguments);
    },
	
	/** private: method[init]
	* :arg target: ``Object`` The object initializing this plugin.
	*/
	init: function(target) {
		gxp.plugins.SearchServizioApertura.superclass.init.apply(this, arguments);
		
	},

    /** 
     * api: method[addActions]
     */
    addOutput: function() {
        var apptarget = this.target;     		

		//CQL Filter: DATE_COL AFTER 2012-01-01T00:00:00Z AND DATE_COL BEFORE 2012-12-31T23:59:59Z
		/*
		      APER_DATA_INIZIO BEFORE 2013-02-31T00:00:00Z AND APER_DATA_FINE AFTER 2013-02-01T00:00:00Z
		*/
		
		var me = this;
		
		var comProjection = new OpenLayers.Projection("EPSG:25832"); 
		var googleProjection = new OpenLayers.Projection("EPSG:900913");
		
		var dsVie = new Ext.data.Store({
			url: this.serviceUrl + 'VieServlet',			
			reader: new Ext.data.JsonReader({
				root: 'vie',
				totalProperty: 'totalCount',
				successProperty: 'success',
				fields: [
					{name: 'codice', type: 'string'},
					{name: 'descrizione',  type: 'string'}
				]
			})
		});
		dsVie.setBaseParam('lang', this.vieLang);
		
		var dsServizi = new Ext.data.Store({
			url: this.serviceUrl + 'DescServiziServlet',			
			reader: new Ext.data.JsonReader({
				root: 'servizi',
				totalProperty: 'totalCount',
				successProperty: 'success',
				fields: [
					{name: 'codice', type: 'string'},
					{name: 'descrizione',  type: 'string'}
				]
			})
		});
		dsServizi.setBaseParam('lang', this.vieLang);
		
		
		var dsQuart = new Ext.data.ArrayStore({
			// store configs
			autoDestroy: true,
			storeId: 'quartStore',
			// reader configs
			idIndex: 1,  
			fields: [
			   'quart',
			   {name: 'codice', type: 'string'},
			   {name: 'descrizione', type: 'string'}
			],
			data: [
			    ['TT', '0', '-TUTTI-'],
				['DB', '4', 'DON BOSCO'],
				['EU', '3', 'EUROPA NOVACELLA'],
				['CP', '1', 'CENTRO P. RENCIO'],
				['GR', '5', 'GRIES S.QUIRINO'],
				['OL', '2', 'OLTRISARCO ASLAGO']
			]
		});
		
		/*var quartieriBounds = new Array(new OpenLayers.Bounds(676378.506299966,5146295.22456535,678948.527007408,5151668.14303656),
										new OpenLayers.Bounds(678466.28086363,5150788.14999069,679766.270519622,5151733.93921576),
										new OpenLayers.Bounds(679592.610573759,5146771.96139754,686694.123215321,5153840.62514496),
										new OpenLayers.Bounds(674670.741214438,5150321.92017395,681330.48838804,5155672.9491575),
										new OpenLayers.Bounds(676774.543313356,5146071.45289345,680640.700936764,5151231.94294201)
										);*/
		
		var quartieriBounds = new Array(new OpenLayers.Bounds(1257678.91320766,5852261.07912094,1261441.1885092,5860011.5664276),
										new OpenLayers.Bounds(1260744.90851826,5858721.29277957,1262629.25908689,5860082.35535871),
										new OpenLayers.Bounds(1262261.33008108,5852716.30969585,1272699.68342259,5863090.83195279),
										new OpenLayers.Bounds(1255276.74739195,5858156.79274919,1265077.53955173,5865757.69329878),
										new OpenLayers.Bounds(1258145.07649538,5851905.9397528,1263878.7098088,5859314.92879478)
										);	
		
		
		var lineconfig = {
			xtype: 'box',
			autoEl:{
				tag: 'div',
				style:'line-height:1px; font-size: 1px;margin-bottom:4px',
				children: [{
					tag: 'img',
					src: '1pxLine.gif',
					height: '2px',
					width: '100%'
				}]
			}
		};
		
		var verLine = {
			xtype: 'box',
			autoEl:{
				tag: 'div',
				style:'line-height:1px; font-size: 1px;margin-bottom:4px',
				children: [{
					tag: 'img',
					src: '1pxLine.gif',
					height: '2px',
					width: '100%'
				}]
			}
		};
	
		/*var formPanel =  {
			xtype       : 'panel',
			height:      35,
			border:0,
			autoScroll  : false,
			layout:'column',
			bodyStyle:'padding:0px 0px 0; background-color:transparent;',
			id          : 'formpanel',
			defaultType : 'field',
			frame       : true,
			items:[				   
						{
							xtype: 'button',
							id: 'ckBtn',
							text: 'Seleziona tutto',
							iconCls: 'icon-addlayers',
							width: 50,
							handler: function(){
								Ext.getCmp('serviziCheck').items.each(function(oEl) {
									oEl.setValue(true);
								});
							}
						},
						verLine,
						{
							xtype: 'button',
							id: 'unckBtn',
							text: 'Deseleziona tutto',
							iconCls: 'icon-removelayers',
							width: 50,
							handler: function(){
								Ext.getCmp('serviziCheck').items.each(function(oEl) {
									oEl.setValue(false);
								});
							}
						}
				   ]
			};*/
	
		
		var serviziForm = new Ext.form.FormPanel({
			header: true,
			border: true,
			title: 'Ricerca Apertura Servizi',
			labelWidth: 80,
			bodyStyle:'padding:5px 5px 0', 
			tbar:[				   
						{
							xtype: 'button',
							id: 'ckBtn',
							text: 'Seleziona tutto',
							iconCls: 'icon-addlayers',
							width: 50,
							handler: function(){
								Ext.getCmp('serviziCheck').items.each(function(oEl) {
									oEl.setValue(true);
								});
							}
						},
						//verLine,
						'-',
						{
							xtype: 'button',
							id: 'unckBtn',
							text: 'Deseleziona tutto',
							iconCls: 'icon-removelayers',
							width: 50,
							handler: function(){
								Ext.getCmp('serviziCheck').items.each(function(oEl) {
									oEl.setValue(false);
								});
							}
						}
		    ],			
			items: [
				//formPanel,
				{
					xtype: "fieldset",
					items:[{
						xtype: 'checkboxgroup',
						fieldLabel: 'Tipo Servizi',
						// Arrange checkboxes into two columns, distributed vertically
						columns: 1,
						vertical: true,
						id: 'serviziCheck',
						labelStyle:'font-weight:bold;',					
						items: [{
							boxLabel: 'Amministrativo',
							name: 'rbAmm',
							inputValue: '01',
							checked: true
						}, {
							boxLabel: 'Chiese',
							name: 'rbAmm',
							inputValue: '04',
							checked: true
						}, {
							boxLabel: 'Commercio',
							name: 'rbAmm',
							inputValue: '10',
							checked: true
						}, {
							boxLabel: 'Cultura',
							name: 'rbAmm',
							inputValue: '05',
							checked: true
						}, {
							boxLabel: 'Finanziari',
							name: 'rbAmm',
							inputValue: '11',
							checked: true
						}, {
							boxLabel: 'Giustizia',
							name: 'rbAmm',
							inputValue: '02',
							checked: true
						}, {
							boxLabel: 'Informazione',
							name: 'rbAmm',
							inputValue: '13',
							checked: true
						}, {
							boxLabel: 'Istruzione',
							name: 'rbAmm',
							inputValue: '06',
							checked: true
						}, {
							boxLabel: 'Libera Prof.',
							name: 'rbAmm',
							inputValue: '12',
							checked: true
						}, {
							boxLabel: 'Sanita',
							name: 'rbAmm',
							inputValue: '07',
							checked: true
						}, {
							boxLabel: 'Sicurezza',
							name: 'rbAmm',
							inputValue: '03',
							checked: true
						}, {
							boxLabel: 'Sociali',
							name: 'rbAmm',
							inputValue: '14',
							checked: true
						}, {
							boxLabel: 'Sport',
							name: 'rbAmm',
							inputValue: '09',
							checked: true
						}]
					}]
				},				
				{
					xtype: "fieldset",  //RICERCA TESTUALE DESCRIZIONE SERVIZIO
					items:[{
						xtype: 'combo',
						fieldLabel: 'Chiave',
						labelStyle:'font-weight:bold;',
						store: dsServizi,
						mode: 'remote',
						displayField: 'descrizione',
						emptyText: 'Inserisci parola chiave',
						valueField: 'codice', 
						width: 250,
						minChars: 3,
						id: 'servDescBox',
						hideTrigger:true,
						forceSelection: false,
						scope: this,	
						listeners:{					    
							select: function(combo, record, index) {
								var recordSelected = Ext.getCmp("quartBox").getStore().getAt(0);                     
								Ext.getCmp("quartBox").setValue(recordSelected.get('codice'));
								dsVie.removeAll(false);								
								Ext.getCmp("vieBox").clearValue();	
							},
							render: function(c) {
							  /*Ext.QuickTips.register({
								target: c.getEl(),
								text: me.viaToolTip
							  });*/
							}
						}
					}]
				},
				//lineconfig,
				{
					xtype: "fieldset",
					items:[{
						xtype: 'timefield',
						fieldLabel: 'Da',
						labelStyle:'font-weight:bold;',					
						emptyText: 'Orario Da',
						minValue: '7:00',
						maxValue: '22:00',
						format: 'H:i',
						increment: 30,
						width: 150,
						id: 'daBox',
						scope: this					
					},
					{
						xtype: 'timefield',
						fieldLabel: 'A',
						labelStyle:'font-weight:bold;',					
						emptyText: 'Orario A',
						minValue: '7:00',
						maxValue: '22:00',
						format: 'H:i',
						increment: 30,
						width: 150,
						id: 'aBox',
						scope: this	
					}, 			
					{
						xtype: 'datefield',
						//anchor: '100%',
						width: 150,
						fieldLabel: 'Data',
						labelStyle:'font-weight:bold;',					
						name: 'date',
						id: 'searchDate',
						format: 'd/m/Y'
					},
					{
						xtype: 'combo',
						fieldLabel: 'Quartiere',
						labelStyle:'font-weight:bold;',
						store: dsQuart,
						mode: 'local',	
						displayField: 'descrizione',
						valueField: 'codice', 
						value: '0',
						typeAhead: true,
						triggerAction: 'all',
						emptyText: '',
						width: 150,					
						id: 'quartBox',
						listeners:{
							select: function(combo, record, index) {
								dsVie.removeAll(false);								
								Ext.getCmp("vieBox").clearValue();								
								dsServizi.removeAll(false);								
								Ext.getCmp("servDescBox").clearValue();
							}
						}
					},
					{
						xtype: 'combo',
						fieldLabel: this.viaText,
						labelStyle:'font-weight:bold;',
						store: dsVie,
						mode: 'remote',
						displayField: 'descrizione',
						emptyText: this.viaEmpty,
						valueField: 'codice', 
						width: 250,
						minChars: 3,
						id: 'vieBox',
						hideTrigger:true,
						forceSelection: false,
						scope: this,	
						listeners:{					    
							select: function(combo, record, index) {
								var recordSelected = Ext.getCmp("quartBox").getStore().getAt(0);                     
								Ext.getCmp("quartBox").setValue(recordSelected.get('codice'));
								dsServizi.removeAll(false);								
								Ext.getCmp("servDescBox").clearValue();
							},
							render: function(c) {
							  /*Ext.QuickTips.register({
								target: c.getEl(),
								text: me.viaToolTip
							  });*/
							}
						}
				    }]
				},						
				{
					xtype: 'button',
					text: 'Aggiorna',
					scope: this,
					handler: function(){					   
					   aggiornaServizi();
						if ((! Ext.getCmp('vieBox').getValue()) && (Ext.getCmp('quartBox').getValue() == 0) &&
						     (! Ext.getCmp('servDescBox').getValue())) {
							var layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
							if(layer){
								apptarget.mapPanel.map.removeLayer(layer);																																			
							}
						}
						
					   /*serviziLayer.mergeNewParams({
					       "viewparams": "begin_datetime:2014-11-03 20:00:00;end_datetime:2014-11-03 22:30:00"
					   });*/
					   //viewparams = 'begin_datetime:' + aDate.format('Y-m-d') + ' ' + startTime + ':00;end_datetime:' + aDate.format('Y-m-d') + ' ' + endTime + ':00';
					}
				}
            ]
		});		
		
		var actualDate = new Date();
		Ext.getCmp("searchDate").setValue(actualDate);
		
		if (actualDate.getHours() <= 12)
		{
			Ext.getCmp("daBox").setValue('8:30');
			Ext.getCmp("aBox").setValue('12:30');
		}
		else 
		{
			Ext.getCmp("daBox").setValue('14:30');
			Ext.getCmp("aBox").setValue('18:00');
		}
		
		function aggiornaServizi(layer) {
		   var startTime = Ext.getCmp("daBox").getValue();
		   var endTime = Ext.getCmp("aBox").getValue();
		   var aDate = Ext.getCmp("searchDate").getValue();
		   var via = Ext.getCmp('vieBox').getValue();
		   var quartiere = Ext.getCmp('quartBox').getValue();
		   var servizio = Ext.getCmp('servDescBox').getValue();
		   var serviziLayer;
		   var url;
		   var qBounds;
		   
		   if (via) {
				url = me.serviceUrl + 'BoundsServlet?tipo=via&codice=' + via;
				if(me.selectionProperties){
					selectionLayerName = me.selectionProperties.selectionLayerViaName;
					filterAttribute = me.selectionProperties.filterViaAttribute;
					selectionStyle = me.selectionProperties.selectionViaStyle;
				}
				
				zoomVia(url, selectionLayerName, filterAttribute, selectionStyle, comProjection, googleProjection);
			} else if (quartiere > 0) {
				//var record = Ext.getCmp('quartBox').findRecord(Ext.getCmp('quartBox').valueField || Ext.getCmp('quartBox').displayField, quartiere);
				//var index = Ext.getCmp('quartBox').store.indexOf(record) - 1;
				qBounds = quartieriBounds[Ext.getCmp('quartBox').selectedIndex - 1];
				
				selectionLayerName = 'Ambiente:quartieri';
				filterAttribute = 'BOLZANO_CI';
				selectionStyle = 'highlight_polygon';
				
				zoomQuartiere(url, selectionLayerName, filterAttribute, selectionStyle, quartiere, qBounds, comProjection, googleProjection);
			} else if (servizio) {
				url = me.serviceUrl + 'BoundsServlet?tipo=servizio&codice=' + servizio;
				if(me.selectionProperties){
					selectionLayerName = 'Cartografia:SERVIZI_RICERCA';
					filterAttribute = 'SERV_ID';
					selectionStyle = 'highlight_point';
				}
				
				zoomServizio(url, selectionLayerName, filterAttribute, selectionStyle, servizio, comProjection, googleProjection);
			}
			
			
			
		   
		   if (!layer) {
		   	   serviziLayer = apptarget.mapPanel.map.getLayersByName('servizi_apertura')[0];
		   } else {
			   serviziLayer = layer;
		   }
		   
		  
		   var selectedServices = Ext.getCmp("serviziCheck").getValue();
		   var inServices = "";
           /*for(var i=0;i<selectedServices.length;i++){
				inServices = inServices + "'" + selectedServices[i].inputValue + "'";
				if (i < (selectedServices.length - 1))
				{
					inServices = inServices + ',';
				}
			}*/
			
            // /////////////////////////////////////////////////////////////////
            // Create a CQL OpenLayers WFS compliant
            // ('IN' clause is not supported by OpenLayers.Format.CQL)
            // /////////////////////////////////////////////////////////////////
            for(var i=0; i<selectedServices.length; i++){
                var inService = "CATE_ROOT_CODE='" + selectedServices[i].inputValue + "'";
                inServices += inService;
                
                if(i+1 < selectedServices.length){
                    inServices += " OR ";
                }         
            }
            
			if (!via) {
				via = 0;
			}
			
			var params = {
			   "viewparams": "begin_datetime:" + aDate.format("Y-m-d") + " " + startTime + ":00;end_datetime:" + aDate.format("Y-m-d") + " " + endTime + ":00;via_p:" + via + ";quart_p:" + quartiere,
			   //"cql_filter": "CATE_ROOT_CODE IN (" + inServices + ")"
                //"cql_filter": inServices == "" ? "INCLUDE" : inServices
				"cql_filter": inServices == "" ? "CATE_ROOT_CODE=-1" : inServices
		    };
		   
		   
		   serviziLayer.mergeNewParams(params);
		   
		   var index = apptarget.mapPanel.layers.findExact('name', 'Cartografia:servizi_apertura');
		   apptarget.mapPanel.layers.getAt(index).getLayer().vendorParams = params;
		   apptarget.mapPanel.layers.getAt(index).getLayer().mergeNewParams(params);		  
		   
		   // /////////////////////////////////////////////////////////////////////////////
		   // We need to deactivate and then reactivate the info-hover control if active 
		   // in order to refresh the vendorParams
		   // /////////////////////////////////////////////////////////////////////////////
		    for(var tool in apptarget.tools){
				if(apptarget.tools[tool].ptype == "gxp_wmsgetfeatureinfo_menu"){
					apptarget.tools[tool].button.menu.items.each(function(i) {
						if(i.id == "info-hover" && i.checked){
							//apptarget.tools[tool].toggleActiveControl();
							i.setChecked(false);
							i.setChecked(true);
						}
					}, this);
					
					break;
				}
			}   
		}
		
		
		function zoomVia(url, selectionLayerName, filterAttribute, selectionStyle, comProjection, googleProjection) {
			if (url != '') {
								
					var mask = new Ext.LoadMask(Ext.getBody(), {msg: me.waitMsg});
					mask.show();
				
					Ext.Ajax.request({
						url: url,
						scope: me,
						success: function(response, opts) {
							mask.hide();
							var obj = Ext.decode(response.responseText);
							var bounds = obj.bounds;
							
							
							var comBounds = new OpenLayers.Bounds(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
							var newBounds = comBounds.transform(comProjection, googleProjection);
						
							
							//
							// Add the WMS layer
							//
							var addLayer = apptarget.tools["addlayer"];
							if(selectionLayerName && me.selectionProperties && 
								filterAttribute && selectionStyle && addLayer){
							
								var layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
								if(!layer){
									var customParams = {
										cql_filter: filterAttribute + "=" + bounds.codice,
										styles: selectionStyle,
										displayInLayerSwitcher: false,
										enableLang: false
									};
									
									var opts = {
										msLayerTitle: me.selectionProperties.selectionLayerTitle,
										msLayerName: selectionLayerName,
										wmsURL: me.selectionProperties.wmsURL,
										customParams: customParams
									};
									
									addLayer.addLayer(opts);																					
									
									layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
								}//else{   Nota: a seguito di alcune modifiche, bisogna riassegnare il cql_filter
								layer.mergeNewParams({
									"cql_filter": filterAttribute + "=" + bounds.codice,
									"layers": selectionLayerName,
									"styles": selectionStyle
								});
								//}
							}
							
							apptarget.mapPanel.map.zoomToExtent(newBounds);							
						},
						failure: function(response, opts) {
							mask.hide();
							
							Ext.Msg.show({
								  title: me.titleError,
								  msg: response.responseText + " - " + response.status,
								  width: 300,
								  icon: Ext.MessageBox.WARNING
							});
							
							console.log('server-side failure with status code ' + response.status);
						}
					});
				}
		}
		
		function zoomQuartiere(url, selectionLayerName, filterAttribute, selectionStyle, quartiere, qBounds) {
			if (url != '') {
								
					var mask = new Ext.LoadMask(Ext.getBody(), {msg: me.waitMsg});
					mask.show();
				
					
					var addLayer = apptarget.tools["addlayer"];
							if(selectionLayerName && me.selectionProperties && 
								filterAttribute && selectionStyle && addLayer){
							
																
								var newBounds = qBounds;
								
								var layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
								if(!layer){
									var customParams = {
										cql_filter: filterAttribute + "=" + quartiere,
										styles: selectionStyle,
										displayInLayerSwitcher: false,
										enableLang: false
									};
									
									var opts = {
										msLayerTitle: me.selectionProperties.selectionLayerTitle,
										msLayerName: selectionLayerName,
										wmsURL: me.selectionProperties.wmsURL,
										customParams: customParams
									};
									
									addLayer.addLayer(opts);																					
									
									layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
								}//else{   Nota: a seguito di alcune modifiche, bisogna riassegnare il cql_filter
								layer.mergeNewParams({
									"cql_filter": filterAttribute + "=" + quartiere,
									"layers": selectionLayerName,
									"styles": selectionStyle
								});
								//}
								
							}
					mask.hide();
					
					if (newBounds) {
						apptarget.mapPanel.map.zoomToExtent(newBounds);
					}
				}
		}
		
		function zoomServizio(url, selectionLayerName, filterAttribute, selectionStyle, servizio, comProjection, googleProjection) {
			if (url != '') {
								
					var mask = new Ext.LoadMask(Ext.getBody(), {msg: me.waitMsg});
					mask.show();
				
					Ext.Ajax.request({
						url: url,
						scope: me,
						success: function(response, opts) {
							mask.hide();
							var obj = Ext.decode(response.responseText);
							var bounds = obj.bounds;
							
							
							var comBounds = new OpenLayers.Bounds(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
							var newBounds = comBounds.transform(comProjection, googleProjection);
						
							
							//
							// Add the WMS layer
							//
							var addLayer = apptarget.tools["addlayer"];
							if(selectionLayerName && me.selectionProperties && 
								filterAttribute && selectionStyle && addLayer){
							
								var layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
								if(!layer){
									var customParams = {
										cql_filter: filterAttribute + "=" + bounds.codice,
										styles: selectionStyle,
										displayInLayerSwitcher: false,
										enableLang: false
									};
									
									var opts = {
										msLayerTitle: me.selectionProperties.selectionLayerTitle,
										msLayerName: selectionLayerName,
										wmsURL: me.selectionProperties.wmsURL,
										customParams: customParams
									};
									
									addLayer.addLayer(opts);																					
									
									layer = apptarget.mapPanel.map.getLayersByName(me.selectionProperties.selectionLayerTitle)[0];
								}//else{   Nota: a seguito di alcune modifiche, bisogna riassegnare il cql_filter
								layer.mergeNewParams({
									"cql_filter": filterAttribute + "=" + bounds.codice,
									"layers": selectionLayerName,
									"styles": selectionStyle
								});
								//}
							}
							
							apptarget.mapPanel.map.zoomToExtent(newBounds);							
						},
						failure: function(response, opts) {
							mask.hide();
							
							Ext.Msg.show({
								  title: me.titleError,
								  msg: response.responseText + " - " + response.status,
								  width: 300,
								  icon: Ext.MessageBox.WARNING
							});
							
							console.log('server-side failure with status code ' + response.status);
						}
					});
				}
		}
		
		apptarget.mapPanel.map.events.register('preaddlayer', apptarget.mapPanel.map, function (e) {
		
			if (e.layer.params && e.layer.params.LAYERS ==  'Cartografia:servizi_apertura'){
				aggiornaServizi(e.layer);
			}
		});				
		
		var panel = gxp.plugins.SearchServizioApertura.superclass.addOutput.call(this, serviziForm);
		
		// Imposto il tab di ricerca come tab attivo
		var container = Ext.getCmp(this.initialConfig.outputTarget);
		
		if(container instanceof Ext.TabPanel){
			container.setActiveTab(panel);
		}	
        
		return panel;
    }
        
});

Ext.preg(gxp.plugins.SearchServizioApertura.prototype.ptype, gxp.plugins.SearchServizioApertura);