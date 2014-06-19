/**
 *  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @requires plugins/QueryForm.js
 * @requires plugins/spatialselector/SpatialSelector.js
 * @include widgets/FilterBuilder.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = SpatialSelectorQueryForm
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: SpatialSelectorQueryForm(config)
 *
 *    Plugin for performing queries on feature layers with a pluggable spatial selector
 */
gxp.plugins.SpatialSelectorQueryForm = Ext.extend(gxp.plugins.QueryForm, {
    
    /** api: ptype = gxp_querybboxform */
    ptype: "gxp_spatialqueryform",
    
    filterMapText: 'Filter Map',
    
    noFilterSelectedMsgTitle: "No filter selected",
    
    noFilterSelectedMsgText: "You must select at least one filter",
    
    invalidRegexFieldMsgTitle: "Invalid Fields",
    
    invalidRegexFieldMsgText: "One or more fields are incorrect!",    
    
    /** api: config[spatialSelectorsConfig]
     * ``Object``
     * Spatial selector pluggins configurations. 
     * @see gxp.plugins.spatialselector.SpatialSelectorMethod.js
     */
    spatialSelectorsConfig:{
        bbox:{
            ptype : 'gxp_spatial_bbox_selector'
        },
        buffer:{
            ptype : 'gxp_spatial_buffer_selector'
        },
        circle:{
            ptype : 'gxp_spatial_circle_selector',
            zoomToCurrentExtent : true
        },
        polygon:{
            ptype : 'gxp_spatial_polygon_selector'
        }
    },
    
    /** api: config[filterLayer]
     * ``Object``
     * Add controls to filter WMS layer using the filter
     */
    filterLayer: false,
    
    /** api: config[validators]
     * ``Object``
     * Add regex validator
     */    
    validators: {},
    
    /** api: config[autoComplete]
     * ``Object``
     * Adds autocomplete support for text fields, allows specifying the sources that support autocomplete.
     */    
    autoComplete: null,
    
    init: function(target) {
        
        var me = this;
      
        if(!this.style){
            this.style = new OpenLayers.Style();
            if(this.outputConfig){
                Ext.apply(this.style.defaultStyle, this.outputConfig.selectStyle);
            }
        }

        var formId = this.getFormId();

        var spatialSelectorsConfig = this.spatialSelectorsConfig;

        for (var key in spatialSelectorsConfig){
            spatialSelectorsConfig[key].loadingMaskId = formId;
        }

        this.spatialSelector = new gxp.plugins.spatialselector.SpatialSelector({
            target: target,
            layoutConfig: {
                xtype: 'container',
                defaults:{
                    layout: "form"
                }
            },
            spatialSelectorsConfig: spatialSelectorsConfig
        });
       
        return gxp.plugins.SpatialSelectorQueryForm.superclass.init.apply(this, arguments);
    },

    getFormId: function(){
        return this.id + "_spatialQueryForm";
    },
    
    /** api: method[addOutput]
     */
    addOutput: function(config) {
        this.featureManagerTool = this.target.tools[this.featureManager];
		
		var me = this;

        var spatialSelector = this.spatialSelector;

        var spatialSelectorOutput = this.spatialSelector.addOutput();
		
        config = Ext.apply({
            border: false,
            bodyStyle: "padding: 10px",
            layout: "form",
            autoScroll: true,
            id: this.getFormId(),
            items: [
            {
                xtype: "fieldset",
                ref: "spatialSelectorFieldset",
                title: spatialSelectorOutput.title,
                checkboxToggle: true,
                collapsed : false,
                items: [spatialSelectorOutput],
                listeners: {
                    scope: this,
                    expand: function(panel){
                        panel.doLayout();
                    }
                }
            },
            {
                xtype: "fieldset",
                ref: "attributeFieldset",
                title: this.queryByAttributesText,
                checkboxToggle: true,
                collapsed : true,
				listeners: {
					scope: this,
					expand: function(panel){
						panel.doLayout();
					}
				}
            }],
            bbar: ["->", {   
                scope: this,    
                text: this.cancelButtonText,
                iconCls: "cancel",
                handler: function() {                
                    this.resetFeatureManager();
                    this.spatialSelector.reset();
					
                    var methodSelection = this.output[0].outputType;
					
                    if (me.draw) {me.draw.deactivate();};
                    if (me.drawings) {me.drawings.destroyFeatures();};
                    if (me.filterCircle) {me.filterCircle = new OpenLayers.Filter.Spatial({});};
                    if (me.filterPolygon) {me.filterPolygon = new OpenLayers.Filter.Spatial({});};    
					
                    var ownerCt = this.outputTarget ? queryForm.ownerCt :
                        queryForm.ownerCt.ownerCt;
                    if (ownerCt && ownerCt instanceof Ext.Window) {
                        ownerCt.hide();
                    } else {
                        this.addFilterBuilder(
                            this.featureManagerTool, this.featureManagerTool.layerRecord,
                            this.featureManagerTool.schema
                        ); 
                    }                    
                }
            }, {
                text: this.queryActionText,
                iconCls: "gxp-icon-find",
                handler: function() {
					var container = this.featureGridContainer ? Ext.getCmp(this.featureGridContainer) : null;
					if(container){
						container.expand();
					}
                    // Collect all selected filters
                    var filters = new Array();
                    
                    //START
                    //Check if there are some invalid field according to validators regex config
                    var filterFieldItems = queryForm.filterBuilder.childFilterContainer;
                    var filterFieldItem = filterFieldItems.findByType("gxp_filterfield");
                    
                    var f = 0;
                    var invalidItems = 0;
                    while(filterFieldItem[f]){
                    
                        var formItems = filterFieldItem[f].innerCt.findBy(function(c) {
                            return c.isFormField;
                        });
                    
                        for(var x = 0;x<formItems.length;x++){
                            var validateItem = formItems[x];
                            //if(!validateItem.isValid(true) && ( validateItem.vtype == "customValidationTextValue" || validateItem.vtype == "customValidationTextLowerBoundary" || validateItem.vtype == "customValidationTextUpperBundary")){
                            if(!validateItem.isValid(true)){
                                invalidItems++;
                            }
                        }                        
                        f++;
                    }
                    //END
                        
                    if(queryForm.spatialSelectorFieldset && !queryForm.spatialSelectorFieldset.collapsed){
                        var currentFilter = this.spatialSelector.getQueryFilter();   
                        if (currentFilter) {
                            filters.push(currentFilter);
                        }
                    }

                    if(queryForm.filterBuilder && !queryForm.filterBuilder.collapsed){
                        var attributeFilter = queryForm.filterBuilder.getFilter();
                        attributeFilter && filters.push(attributeFilter);
                    }

                    if(invalidItems == 0){
                        if(filters.length > 0){
                            this.featureManagerTool.loadFeatures(filters.length > 1 ?
                                new OpenLayers.Filter.Logical({
                                    type: OpenLayers.Filter.Logical.AND,
                                    filters: filters
                                }) :
                                filters[0]
                            );    
                        }else{
                            Ext.Msg.show({
                                title: this.noFilterSelectedMsgTitle,
                                msg: this.noFilterSelectedMsgText,
                                buttons: Ext.Msg.OK,
                                icon: Ext.MessageBox.ERROR
                            }); 
                        }
                    }else{
                        Ext.Msg.show({
                            title: this.invalidRegexFieldMsgTitle,
                            msg: this.invalidRegexFieldMsgText,
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    }
                      
                },
                scope: this
            }]
        }, config || {});
		
        var queryForm = gxp.plugins.QueryForm.superclass.addOutput.call(this, config);
        
        var methodSelection = this.output[0].outputType;
        
        this.addFilterBuilder = function(mgr, rec, schema) {			
            // is current source enabled for autoComplete ?
            var autoComplete = rec && me.autoComplete && me.autoComplete.sources && me.autoComplete.sources.indexOf(rec.get('source')) !== -1;
            queryForm.attributeFieldset.removeAll();
            queryForm.setDisabled(!schema);
			
            if (schema) {
                queryForm.attributeFieldset.add({
                    xtype: "gxp_filterbuilder",
                    ref: "../filterBuilder",
                    attributes: schema,
                    validators: me.validators,
                    autoComplete: autoComplete,
                    autoCompleteCfg: me.autoComplete || {},
                    allowBlank: true,
                    allowGroups: false
                });
				
			   /**
				* Overriding the removeCondition method in order to manage the 
				* single filterfield reset.
				*/
				 queryForm.filterBuilder.removeCondition = function(item, filter) {
					var parent = this.filter.filters[0].filters;
					if(parent.length > 1) {
						parent.remove(filter);
						this.childFilterContainer.remove(item, true);
					}else{
						var items = item.findByType("gxp_filterfield");
						
						var i = 0;
						while(items[i]){
							items[i].reset();
							
                            for(var c = 1;c<items[i].items.items.length;c++){
                                items[i].items.get(c).disable();                            
                            }

							filter.value = null;
                            filter.lowerBoundary = null;
                            filter.upperBoundary = null;
							i++;
						}
					}
					
					this.fireEvent("change", this);
				};
				
				if (me.draw) {me.draw.deactivate();};
				if (me.drawings) {me.drawings.destroyFeatures();};
				if (me.filterCircle) {me.filterCircle = new OpenLayers.Filter.Spatial({});};
				if (me.filterPolygon) {me.filterPolygon = new OpenLayers.Filter.Spatial({});};   
            } else {
                me.spatialSelector.reset();
				
				if (me.draw) {me.draw.deactivate();};
				if (me.drawings) {me.drawings.destroyFeatures();};
				if (me.filterCircle) {me.filterCircle = new OpenLayers.Filter.Spatial({});};
				if (me.filterPolygon) {me.filterPolygon = new OpenLayers.Filter.Spatial({});};  
            }
			
            queryForm.attributeFieldset.doLayout();
        
            spatialSelector.filterGeometryName = this.featureStore
                && this.featureStore.geometryName
                ? this.featureStore.geometryName : null;
        };
		
        this.featureManagerTool.on("layerchange", this.addFilterBuilder);
		
        this.addFilterBuilder(this.featureManagerTool,
            this.featureManagerTool.layerRecord, this.featureManagerTool.schema
        );
		
        this.featureManagerTool.on({
            "beforequery": function() {
                new Ext.LoadMask(queryForm.getEl(), {
                    store: this.featureManagerTool.featureStore,
                    msg: this.queryMsg
                }).show();
            },
            "query": function(tool, store) {
                if (store) {
                    store.getCount() || Ext.Msg.show({
                        title: this.noFeaturesTitle,
                        msg: this.noFeaturesMessage,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    });
                    if (this.autoHide) {
                        var ownerCt = this.outputTarget ? queryForm.ownerCt :
                            queryForm.ownerCt.ownerCt;
                        ownerCt instanceof Ext.Window && ownerCt.hide();
                    }
                }
            },
            scope: this
        });
        
        return queryForm;
    }
});

Ext.preg(gxp.plugins.SpatialSelectorQueryForm.prototype.ptype, gxp.plugins.SpatialSelectorQueryForm);