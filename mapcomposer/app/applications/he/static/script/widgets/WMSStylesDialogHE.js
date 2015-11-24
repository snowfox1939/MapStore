/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/**
 * require util.js
 * require widgets/RulePanel.js
 * require widgets/StylePropertiesDialog.js
 *  OpenLayers/Renderer/SVG.js
 *  OpenLayers/Renderer/VML.js
 *  OpenLayers/Renderer/Canvas.js
 *  OpenLayers/Style2.js
 *  OpenLayers/Format/SLD/v1_0_0_GeoServer.js
 *  GeoExt/data/AttributeStore.js
 *  GeoExt/widgets/WMSLegend.js
 *  GeoExt/widgets/VectorLegend.js
 */

/** api: (define)
 *  module = gxp
 *  class = WMSStylesDialog
 *  base_link = `Ext.Container <http://extjs.com/deploy/dev/docs/?class=Ext.Container>`_
 */
Ext.namespace("gxp.he");

/** api: constructor
 *  .. class:: WMSStylesDialog(config)
 *   
 *      Create a dialog for selecting and layer styles. If the WMS supports
 *      GetStyles, styles can also be edited. The dialog does not provide any
 *      means of writing modified styles back to the server. To save styles,
 *      configure the dialog with a :class:`gxp.plugins.StyleWriter` plugin
 *      and call the ``saveStyles`` method.
 *
 *      Note: when this component is included in a build,
 *      ``OpenLayers.Renderer.defaultSymbolizer`` will be set to the SLD
 *      defaults.  In addition, the OpenLayers SLD v1 parser will be patched
 *      to support vendor specific extensions added to SLD by GeoTools.
 */
gxp.he.WMSStylesDialogHE = Ext.extend(Ext.Container, {
    
    /** api: config[addStyleText] (i18n) */
     addStyleText: "Add",
    /** api: config[addStyleTip] (i18n) */
     addStyleTip: "Add a new style",
    /** api: config[chooseStyleText] (i18n) */    
    chooseStyleText: "Choose style",
    /** api: config[addStyleText] (i18n) */
     deleteStyleText: "Remove",
    /** api: config[addStyleTip] (i18n) */
     deleteStyleTip: "Delete the selected style",
    /** api: config[addStyleText] (i18n) */
     editStyleText: "Edit",
    /** api: config[addStyleTip] (i18n) */
     editStyleTip: "Edit the selected style",
    /** api: config[addStyleText] (i18n) */
     duplicateStyleText: "Duplicate",
    /** api: config[addStyleTip] (i18n) */
     duplicateStyleTip: "Duplicate the selected style",
    /** api: config[addStyleText] (i18n) */
     addRuleText: "Add",
    /** api: config[addStyleTip] (i18n) */
     addRuleTip: "Add a new rule",
    /** api: config[newRuleText] (i18n) */
     newRuleText: "New Rule",
    /** api: config[addStyleText] (i18n) */
     deleteRuleText: "Remove",
    /** api: config[addStyleTip] (i18n) */
     deleteRuleTip: "Delete the selected rule",
    /** api: config[addStyleText] (i18n) */
     editRuleText: "Edit",
    /** api: config[addStyleTip] (i18n) */
     editRuleTip: "Edit the selected rule",
    /** api: config[addStyleText] (i18n) */
     duplicateRuleText: "Duplicate",
    /** api: config[addStyleTip] (i18n) */
     duplicateRuleTip: "Duplicate the selected rule",
    /** api: config[cancelText] (i18n) */
     cancelText: "Cancel",
    /** api: config[saveText] (i18n) */
     saveText: "Save",
    /** api: config[stylePropertiesWindowTitle] (i18n) */
     styleWindowTitle: "User Style: {0}",
    /** api: config[ruleWindowTitle] (i18n) */
     ruleWindowTitle: "Style Rule: {0}",
    /** api: config[stylesFieldsetTitle] (i18n) */
     stylesFieldsetTitle: "Styles",
    /** api: config[rulesFieldsetTitle] (i18n) */
     rulesFieldsetTitle: "Rules",
    /** api: config[errorTitle] (i18n) */
     errorTitle: "Error saving style",
    /** api: config[errorMsg] (i18n) */
     errorMsg: "There was an error saving the style back to the server.",
    /** api: config[searchStyleResourcesErrorTitle] (i18n) */    
    searchStyleResourcesErrorTitle: "Error",
    /** api: config[searchStyleResourcesErrorMsg] (i18n) */    
    searchStyleResourcesErrorMsg: "Something went wrong to try styles",
    
    //TODO create a StylesStore which can read styles using GetStyles. Create
    // subclasses for that store with writing capabilities, e.g.
    // for GeoServer's RESTconfig API. This should replace the current
    // StyleWriter plugins.
    
    /** api: config[layerRecord]
     *  ``GeoExt.data.LayerRecord`` The layer to edit/select styles for.
     */
    
    /** private: property[layerRecord]
     *  ``GeoExt.data.LayerRecord`` The layer to edit/select styles for.
     */
    layerRecord: null,
    
    /** api: config[styleName]
     *  ``String`` A style's name to select in the styles combo box. Optional.
     *  If not provided, the layer's current style will be selected.
     */
     
    /** api: config[stylesComboOptions]
     *  ``Object`` configuration options to pass to the styles combo of this
     *  dialog. Optional.
     */
    
    /** api: config[layerDescription]
     *  ``Object`` Array entry of a DescribeLayer response as read by
     *      ``OpenLayers.Format.WMSDescribeLayer``. Optional. If not provided,
     *      a DescribeLayer request will be issued to the WMS.
     */
    
    /** private: property[layerDescription]
     *  ``Object`` Array entry of a DescribeLayer response as read by
     *      ``OpenLayers.Format.WMSDescribeLayer``.
     */
    layerDescription: null,
    
    /** private: property[symbolType]
     *  ``Point`` or ``Line`` or ``Polygon`` - the primary symbol type for the
     *  layer. This is the symbolizer type of the first symbolizer of the
     *  first rule of the current layer style. Only available if the WMS
     *  supports GetStyles.
     */
    symbolType: null,
    
    /** api: property[stylesStore]
     *  ``Ext.data.Store`` A store representing the styles returned from
     *  GetCapabilities and GetStyles. It has "name", "title", "abstract",
     *  "legend" and "userStyle" fields. If the WMS supports GetStyles, the
     *  "legend" field will not be available. If it does not, the "userStyle"
     *  field will not be available.
     */
    stylesStore: null,
    
    /** api: property[selectedStyle]
     *  ``Ext.data.Record`` The currently selected style from the
     *  ``stylesStore``.
     */
    selectedStyle: null,
    
    /** private: property[selectedRule]
     *  ``OpenLayers.Rule`` The currently selected rule, or null if none
     *  selected.
     */
    selectedRule: null,
    
    /** api: config[editable]
     *  ``Boolean`` Set to false if styles should not be editable. Default is
     *  true.
     */
    
    /** api: property[editable]
     *  ``Boolean`` Read-only once the dialog is rendered. True if this
     *  component could gather enough information to allow styles being edited,
     *  false otherwise. This is not supposed to be read before the
     *  ``ready`` event is fired.
     */
    editable: true,
    
    /** private: property[styler]
     *  class:: Styler
     */    
    styler: null,
    
    /** api: property[disableEditButtons]
     *  ``Boolean`` Disable edit buttons in WMSLayerProperty dialog.
     *  default to false
     */    
    disableEditButtons: false,
    
    /** private: property[modified]
     *  ``Boolean`` Will be true if styles were modified. Initial state is
     *  false.
     */
    modified: false,
    
    /** private: config[dialogCls]
     *  ``Ext.Component`` The dialogue class to use. Default is ``Ext.Window``.
     *  If using e.g. ``Ext.Container``, override the ``showDlg`` method to
     *  add the dialogue to a container.
     */
    dialogCls: Ext.Window,

    /** private: method[initComponent]
     */
    initComponent: function() {
        this.addEvents(
            /** api: event[ready]
             *  Fires when this component is ready for user interaction.
             */
            "ready",
            
            /** api: event[modified]
             *  Fires on every style modification.
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``String`` the name of the modified style
             */
            "modified",
            
            /** api: event[styleselected]
             *  Fires whenever an existing style is selected from this dialog's
             *  Style combo box.
             *  
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``String`` the name of the selected style
             */
            "styleselected",
            
            /** api: event[beforesaved]
             *  Fires before the styles are saved (using a
             *  :class:`gxp.plugins.StyleWriter` plugin)
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``Object`` options for the ``write`` method of the
             *    :class:`gxp.plugins.StyleWriter`
             */
            "beforesaved",
            
            /** api: event[saved]
             *  Fires when a style was successfully saved. Applications should
             *  listen for this event and redraw layers with the currently
             *  selected style.
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``String`` the name of the currently selected style
             */
            "saved"            
        );

        var defConfig = {
            layout: "form",
            disabled: true,
            items: [{
                xtype: "fieldset",
                title: this.stylesFieldsetTitle,
                labelWidth: 85,
                style: "margin-bottom: 0;"
            }, {
                xtype: "toolbar",
                style: "border-width: 0 1px 1px 1px; margin-bottom: 10px;",
                items: [
                    {
                        xtype: "button",
                        iconCls: "add",
                        text: this.addStyleText,
                        tooltip: this.addStyleTip,
                        handler: this.addStyle,
                        scope: this
                    }, {
                        xtype: "button",
                        iconCls: "delete",
                        text: this.deleteStyleText,
                        tooltip: this.deleteStyleTip,
                        handler: function() {
                            this.stylesStore.remove(this.selectedStyle);
                        },
                        scope: this
                    }, {
                        xtype: "button",
                        iconCls: "edit",
                        text: this.editStyleText,
                        tooltip: this.editStyleTip,
                        handler: function() {
                            this.editStyle();
                        },
                        scope: this
                    }, {
                        xtype: "button",
                        iconCls: "duplicate",
                        text: this.duplicateStyleText,
                        tooltip: this.duplicateStyleTip,
                        handler: function() {
                            var prevStyle = this.selectedStyle;
                            var newStyle = prevStyle.get(
                                "userStyle").clone();
                            newStyle.isDefault = false;
                            newStyle.name = this.newStyleName();
                            newStyle.geostore = true;
                            var store = this.stylesStore;
                            store.add(new store.recordType({
                                "name": newStyle.name,
                                "title": newStyle.title,
                                "abstract": newStyle.description,
                                "userStyle": newStyle
                            }));
                            this.editStyle(prevStyle);
                        },
                        scope: this
                    }
                ]
            }]
        };
        Ext.applyIf(this, defConfig);
        
        this.createStylesStore();
                        
        this.on({
            "beforesaved": function() {
                if (this._saving === undefined)
                    this._saving = true;
            },
            "saved": function() { delete this._saving; },
            "savedgeostore": function() { delete this._saving; },
            "savefailed": function() { 
                Ext.Msg.show({
                    title: this.errorTitle,
                    msg: this.errorMsg,
                    icon: Ext.MessageBox.ERROR,
                    buttons: {ok: true}
                });
                delete this._saving; 
            },
            "savegeostorefailed": function() {
                this._saving = false; 
            },            
            "render": function() {
                gxp.util.dispatch([this.getStyles], function() {
                    this.enable();
                }, this);
            },
            scope: this
        });

        gxp.he.WMSStylesDialogHE.superclass.initComponent.apply(this, arguments);
    },
    
    /** api: method[addStyle]
     *  Creates a new style and selects it in the styles combo.
     */
    addStyle: function() {
    
        if(!this._ready) {
            this.on("ready", this.addStyle, this);
            return;
        }
        var prevStyle = this.selectedStyle;
        var store = this.stylesStore;
        var newStyle = new OpenLayers.Style(null, {
            name: this.newStyleName(),
            rules: [this.createRule()]
        });
        store.add(new store.recordType({
            "name": newStyle.name,
            "userStyle": newStyle
        }));
        this.editStyle(prevStyle);
    },
    
    /** api: method[editStyle]
     *  :arg prevStyle: ``Ext.data.Record``
     *
     *  Edit the currently selected style.
     */
    editStyle: function(prevStyle) {
        var userStyle = this.selectedStyle.get("userStyle");
        var buttonCfg = {
            bbar: ["->", {
                text: this.cancelText,
                iconCls: "cancel",
                handler: function() {
                    styleProperties.propertiesDialog.userStyle = userStyle;
                    styleProperties.destroy();
                    if (prevStyle) {
                        this._cancelling = true;
                        this.stylesStore.remove(this.selectedStyle);
                        this.changeStyle(prevStyle, {
                            updateCombo: true,
                            markModified: true
                        });
                        delete this._cancelling;
                    }
                },
                scope: this
            }, {
                text: this.saveText,
                iconCls: "save",
                handler: function() {
                    styleProperties.destroy();
                }
            }]
        };
        var styleProperties = new this.dialogCls(Ext.apply(buttonCfg, {
            title: String.format(this.styleWindowTitle,
                userStyle.title || userStyle.name),
            shortTitle: userStyle.title || userStyle.name,
            bodyBorder: false,
            autoHeight: true,
            width: 300,
            modal: true,
            items: {
                border: false,
                items: {
                    xtype: "gxp_stylepropertiesdialog",
                    ref: "../propertiesDialog",
                    userStyle: userStyle.clone(),
                    nameEditable: false,
                    style: "padding: 10px;"
                }
            },
            listeners: {
                "beforedestroy": function() {
                    this.selectedStyle.set(
                        "userStyle",
                        styleProperties.propertiesDialog.userStyle);
                },
                scope: this
            }
        }));
        this.showDlg(styleProperties);
    },
    
    /** api: method[createSLD]
     *  :arg options: ``Object``
     *  :return: ``String`` The current SLD for the NamedLayer.
     *  
     *  Supported ``options``:
     *
     *  * userStyles - ``Array(String)`` list of userStyles (by name) that are
     *    to be included in the SLD. By default, all will be included.
     */
    createSLD: function(options) {
        options = options || {};
        var sld = {
            version: "1.0.0",
            namedLayers: {}
        };
        var layerName = this.layerRecord.get("name");
        sld.namedLayers[layerName] = {
            name: layerName,
            userStyles: []
        };
        
        this.stylesStore.each(function(r) {
            if(!options.userStyles ||
                    options.userStyles.indexOf(r.get("name")) !== -1) {
                sld.namedLayers[layerName].userStyles.push(r.get("userStyle"));
            }
        });
        var writeSLD = new OpenLayers.Format.SLD({
            multipleSymbolizers: true,
            profile: "GeoServer"
        }).write(sld);
        
        return writeSLD;
    },
    
    /** api: method[saveStyles]
     *  :arg options: ``Object`` Options to pass to the
     *      :class:`gxp.plugins.StyleWriter` plugin
     *
     *  Saves the styles. Without a :class:`gxp.plugins.StyleWriter` plugin
     *  configured for this instance, nothing will happen.
     */
    saveStyles: function(options) {
        this.modified === true && this.fireEvent("beforesaved", this, options);
    },
    
    /** private: method[updateStyleRemoveButton]
     *  Enable/disable the "Remove" button to make sure that we don't delete
     *  the last style.
     */
    updateStyleRemoveButton: function() {
    
        var userStyle = this.selectedStyle &&
            this.selectedStyle.get("userStyle");
        
        if(this.styler.roleAdmin){
            this.items.get(1).items.get(1).setDisabled(!userStyle ||
                this.stylesStore.getCount() <= 1 ||  userStyle.isDefault === true);
            this.items.get(1).items.get(2).setDisabled(!userStyle ||
                this.stylesStore.getCount() <= 1 ||  userStyle.isDefault === true);                                
        }else{
            this.items.get(1).items.get(1).setDisabled(!userStyle ||
                this.stylesStore.getCount() <= 1 ||  userStyle.isDefault === true || !userStyle.geostore);
                
            this.items.get(1).items.get(2).setDisabled(!userStyle ||
                this.stylesStore.getCount() <= 1 ||  userStyle.isDefault === true || !userStyle.geostore);                
        }
        
        if(this.styler.advancedUser){
            /*this.items.get(2).setDisabled(
                !userStyle.geostore
            );*/                        
            this.items.get(3).items.get(0).setDisabled(
                !userStyle.geostore
            );
            
            this.items.get(3).items.get(1).setDisabled(
                !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2 || !userStyle.geostore
            );
            
            this.items.get(3).items.get(2).setDisabled(
                !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2 || !userStyle.geostore
            );
            
            this.items.get(3).items.get(3).setDisabled(
                !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2 || !userStyle.geostore
            );
            
            this.items.get(1).setVisible(!this.disableEditButtons);
        }else{
            this.items.get(3).items.get(1).setDisabled(
                !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2
            );
            
            this.items.get(3).items.get(2).setDisabled(
                !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2
            );
            
            this.items.get(3).items.get(3).setDisabled(
                !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2
            );
            
            this.items.get(1).setVisible(!this.disableEditButtons);        
        }
    },
    
    /** private: method[updateRuleRemoveButton]
     *  Enable/disable the "Remove" button to make sure that we don't delete
     *  the last rule.
     */
    updateRuleRemoveButton: function() {
        this.items.get(3).items.get(1).setDisabled(
            !this.selectedRule || this.items.get(2).items.get(0).rules.length < 2
        );
    },
    
    /** private: method[createRule]
     */
    createRule: function() {
        return new OpenLayers.Rule({
            symbolizers: [new OpenLayers.Symbolizer[this.symbolType]]
        });
    },
    
    /** private: method[addRulesFieldSet]
     *  :return: ``Ext.form.FieldSet``
     *
     *  Creates the rules fieldSet and adds it to this container.
     */
    addRulesFieldSet: function() {
        var rulesFieldSet = new Ext.form.FieldSet({
            itemId: "rulesfieldset",
            title: this.rulesFieldsetTitle,
            autoScroll: true,
            style: "margin-bottom: 0;",
            hideMode: "offsets",
            hidden: true
        });
        var rulesToolbar = new Ext.Toolbar({
            style: "border-width: 0 1px 1px 1px;",
            hidden: true,
            items: [
                {
                    xtype: "button",
                    iconCls: "add",
                    text: this.addRuleText,
                    tooltip: this.addRuleTip,
                    handler: this.addRule,
                    scope: this
                }, {
                    xtype: "button",
                    iconCls: "delete",
                    text: this.deleteRuleText,
                    tooltip: this.deleteRuleTip,
                    handler: this.removeRule,
                    scope: this,
                    disabled: true
                }, {
                    xtype: "button",
                    iconCls: "edit",
                    text: this.editRuleText,
                    toolitp: this.editRuleTip,
                    handler: function() {
                        this.layerDescription ?
                            this.editRule() :
                            this.describeLayer(this.editRule);
                    },
                    scope: this,
                    disabled: true
                }, {
                    xtype: "button",
                    iconCls: "duplicate",
                    text: this.duplicateRuleText,
                    tip: this.duplicateRuleTip,
                    handler: this.duplicateRule,
                    scope: this,
                    disabled: true
                }
            ]
        });
        this.add(rulesFieldSet, rulesToolbar);
        this.doLayout();
        return rulesFieldSet;
    },
    
    /** private: method[addRule]
     */
    addRule: function() {
        var legend = this.items.get(2).items.get(0);
        this.selectedStyle.get("userStyle").rules.push(
            this.createRule()
        );
        legend.update();
        // mark the style as modified
        this.selectedStyle.store.afterEdit(this.selectedStyle);
        this.updateRuleRemoveButton();
    },
    
    /** private: method[removeRule]
     */
    removeRule: function() {
        var selectedRule = this.selectedRule;
        this.items.get(2).items.get(0).unselect();
        this.selectedStyle.get("userStyle").rules.remove(selectedRule);
        // mark the style as modified
        this.afterRuleChange();
    },
    
    /** private: method[duplicateRule]
     */
    duplicateRule: function() {
        var legend = this.items.get(2).items.get(0);
        var newRule = this.selectedRule.clone();
        this.selectedStyle.get("userStyle").rules.push(
            newRule
        );
        legend.update();
        // mark the style as modified
        this.selectedStyle.store.afterEdit(this.selectedStyle);
        this.updateRuleRemoveButton();
    },
    
    /** private: method[editRule]
     */
    editRule: function() {
        var rule = this.selectedRule;
        var origRule = rule.clone();

        var ruleDlg = new this.dialogCls({
            title: String.format(this.ruleWindowTitle,
                rule.title || rule.name || this.newRuleText),
            shortTitle: rule.title || rule.name || this.newRuleText,
            layout: "fit",
            width: 320,
            height: 450,
            modal: true,
            id: 'ruleDlg',
            items: [{
                xtype: "gxp_rulepanel",
                ref: "rulePanel",
                symbolType: this.symbolType,
                rule: rule,
                attributes: new GeoExt.data.AttributeStore({
                    url: this.layerDescription.owsURL,
                    baseParams: {
                        "SERVICE": this.layerDescription.owsType,
                        "REQUEST": "DescribeFeatureType",
                        "TYPENAME": this.layerDescription.typeName
                    },
                    method: "GET",
                    disableCaching: false
                }),
                autoScroll: true,
                border: false,
                defaults: {
                    autoHeight: true,
                    hideMode: "offsets"
                },
                listeners: {
                    "change": this.saveRule,
                    "tabchange": function() {
                        if (ruleDlg instanceof Ext.Window) {
                            ruleDlg.syncShadow();
                        }
                    },
                    scope: this
                }
            }],
            bbar: ["->", {
                text: this.cancelText,
                iconCls: "cancel",
                handler: function() {
                    this.saveRule(ruleDlg.rulePanel, origRule);
                    ruleDlg.destroy();
                },
                scope: this
            }, {
                text: this.saveText,
                iconCls: "save",
                handler: function() { ruleDlg.destroy(); }
            }]
        });
        this.showDlg(ruleDlg);
    },
    
    /** private: method[saveRule]
     *  :arg cmp:
     *  :arg rule: the rule to save back to the userStyle
     */
    saveRule: function(cmp, rule) {
        var style = this.selectedStyle;
        var legend = this.items.get(2).items.get(0);
        var userStyle = style.get("userStyle");
        var i = userStyle.rules.indexOf(this.selectedRule);
        userStyle.rules[i] = rule;
        this.afterRuleChange(rule);
    },
    
    /** private: method[afterRuleChange]
     *  :arg rule: the rule to set as selectedRule, can be null
     *  
     *  Performs actions that are required to update the selectedRule and
     *  selectedStyle after a rule was changed.
     */
    afterRuleChange: function(rule) {
        var legend = this.items.get(2).items.get(0);
        this.selectedRule = rule;
        // mark the style as modified
        this.selectedStyle.store.afterEdit(this.selectedStyle);
    },
    
    /** private: method[setRulesFieldSetVisible]
     *  :arg visible: ``Boolean``
     *
     *  Sets the visibility of the rules fieldset
     */
    setRulesFieldSetVisible: function(visible) {
        // the toolbar
        this.items.get(3).setVisible(visible && this.editable && !this.disableEditButtons);
        // and the fieldset itself
        this.items.get(2).setVisible(visible);
        this.doLayout();
    },
    
    parseSLDGeostore: function(response,userStyles,initialStyle){
    
        var layerParams = this.layerRecord.getLayer().params;
        
        if(response){
            var geostoreStyles = response["namedLayers"][layerParams.LAYERS].userStyles;
            
            Ext.each(geostoreStyles, function(item) {
                item.geostore = true;
            },this);
            
            Array.prototype.push.apply(userStyles, geostoreStyles);        
        }

        // our stylesStore comes from the layerRecord's styles - clear it
        // and repopulate from GetStyles
        this.stylesStore.removeAll();
        this.selectedStyle = null;

        var userStyle, record, index, defaultStyle;
        for (var i=0, len=userStyles.length; i<len; ++i) {
            userStyle = userStyles[i];
            // remove existing record - this way we replace styles from
            // userStyles with inline styles.
            index = this.stylesStore.findExact("name", userStyle.name);
            index !== -1 && this.stylesStore.removeAt(index);
            record = new this.stylesStore.recordType({
                "name": userStyle.name,
                "title": userStyle.title,
                "abstract": userStyle.description,
                "userStyle": userStyle,
                "geostore": userStyle.geostore ? "Geostore Styles" : "Admin Styles"
            });
            record.phantom = false;
            this.stylesStore.add(record);
            // set the default style if no STYLES param is set on the layer
            if (!this.selectedStyle && (initialStyle === userStyle.name ||
                        (!initialStyle && userStyle.isDefault === true))) {
                this.selectedStyle = record;
            }
            if (userStyle.isDefault === true) {
                defaultStyle = record;
            }
        }
        // fallback to the default style, this can happen when the layer referenced
        // a non-existing style as initialStyle
        if (!this.selectedStyle) {
            this.selectedStyle = defaultStyle;
        }

        this.addRulesFieldSet();
        this.createLegend(this.selectedStyle.get("userStyle").rules);

        this.stylesStoreReady();
        layerParams.SLD_BODY && this.markModified();        
    },
    /** private: method[parseSLD]
     *  :arg response: ``Object``
     *  :arg options: ``Object``
     *  
     *  Success handler for the GetStyles response. Includes a fallback
     *  to GetLegendGraphic if no valid SLD is returned.
     */
    parseSLD: function(response, options) {
        var data = response.responseXML;
        if (!data || !data.documentElement) {
            data = new OpenLayers.Format.XML().read(response.responseText);
        }
        var layerParams = this.layerRecord.getLayer().params;

        var initialStyle = this.initialConfig.styleName || layerParams.STYLES;
        if (initialStyle) {
            this.selectedStyle = this.stylesStore.getAt(
                this.stylesStore.findExact("name", initialStyle));
        }
        
        var format = new OpenLayers.Format.SLD({profile: "GeoServer", multipleSymbolizers: true});
        
        try {
            var sld = format.read(data);

            // add userStyle objects to the stylesStore
            //TODO this only works if the LAYERS param contains one layer
            var userStyles = sld.namedLayers[layerParams.LAYERS].userStyles;

            // add styles from the layer's SLD_BODY *after* the userStyles
            var inlineStyles;
            if (layerParams.SLD_BODY) {
                var sldBody = format.read(layerParams.SLD_BODY);
                inlineStyles = sldBody.namedLayers[layerParams.LAYERS].userStyles;
                Array.prototype.push.apply(userStyles, inlineStyles);
            }            
            
            if(this.styler.roleAdmin){
                // our stylesStore comes from the layerRecord's styles - clear it
                // and repopulate from GetStyles
                this.stylesStore.removeAll();
                this.selectedStyle = null;

                var userStyle, record, index, defaultStyle;
                var check = [];
                for (var i=0, len=userStyles.length; i<len; ++i) {
                    userStyle = userStyles[i];
                    // remove existing record - this way we replace styles from
                    // userStyles with inline styles.
                    index = this.stylesStore.findExact("name", userStyle.name);
                    index !== -1 && this.stylesStore.removeAt(index);
                    record = new this.stylesStore.recordType({
                        "name": userStyle.name,
                        "title": userStyle.title,
                        "abstract": userStyle.description,
                        "userStyle": userStyle
                    });
                    record.phantom = false;
                    this.stylesStore.add(record);
                    // set the default style if no STYLES param is set on the layer
                    if (!this.selectedStyle && (initialStyle === userStyle.name ||
                                (!initialStyle && userStyle.isDefault === true))) {
                        this.selectedStyle = record;
                    }
                    if (userStyle.isDefault === true) {
                        defaultStyle = record;
                    }
                }
                // fallback to the default style, this can happen when the layer referenced
                // a non-existing style as initialStyle
                if (!this.selectedStyle) {
                    this.selectedStyle = defaultStyle;
                }

                this.addRulesFieldSet();
                this.createLegend(this.selectedStyle.get("userStyle").rules);

                this.stylesStoreReady();
                layerParams.SLD_BODY && this.markModified();        
            }else{
                var geostoreStyles = this.getGeostoreStyles(userStyles,initialStyle,layerParams);            
            }
            
        }
        catch(e) {
            if (window.console) {
                console.warn(e.message);
            }
            this.setupNonEditable();
        }
    },
    
    /** private: method[createLegend]
     *  :arg rules: ``Array``
     */
    createLegend: function(rules) {
        var R = OpenLayers.Symbolizer.Raster;
        if (R && rules[0] && rules[0].symbolizers[0] instanceof R) {            
            throw new Error("Raster symbolizers are not supported.");
        } else {
            this.addVectorLegend(rules);
        }
    },
    
    /** private: methos[setNonEditable]
     */
    setupNonEditable: function() {
        this.editable = false;
        // disable styles toolbar
        this.items.get(1).hide();
        var rulesFieldSet = this.getComponent("rulesfieldset") ||
            this.addRulesFieldSet();
        rulesFieldSet.add(this.createLegendImage());
        this.doLayout();
        // disable rules toolbar
        this.items.get(3).hide();
        this.stylesStoreReady();
    },
    
    /** private: method[stylesStoreReady]
     *  Adds listeners and triggers the ``load`` event of the ``styleStore``.
     */
    stylesStoreReady: function() {
        // start with a clean store
        this.stylesStore.commitChanges();
        this.stylesStore.on({
            "load": function() {
                this.addStylesCombo();
                this.updateStyleRemoveButton();
            },
            "add": function(store, records, index) {
                this.updateStyleRemoveButton();
                // update the "Choose style" combo's value
                var combo = this.items.get(0).items.get(0);
                this.markModified();
                combo.fireEvent("select", combo, store.getAt(index), index);
                combo.setValue(this.selectedStyle.get("name"));
            },
            "remove": function(store, record, index) {
                if (!this._cancelling) {
                    this._removing = true;
                    var newIndex =  Math.min(index, store.getCount() - 1);
                    this.updateStyleRemoveButton();
                    // update the "Choose style" combo's value
                    var combo = this.items.get(0).items.get(0);
                    this.markModified();
                    combo.fireEvent("select", combo, store.getAt(newIndex), newIndex);
                    combo.setValue(this.selectedStyle.get("name"));
                    delete this._removing;
                }
            },
            "update": function(store, record) {
                var userStyle = record.get("userStyle");
                var data = {
                    "name": userStyle.name,
                    "title": userStyle.title || userStyle.name,
                    "abstract": userStyle.description
                };
                Ext.apply(record.data, data);
                // make sure that the legend gets updated
                this.changeStyle(record, {
                    updateCombo: true,
                    markModified: true
                });
            },
            scope: this
        });

        this.stylesStore.fireEvent("load", this.stylesStore,
            this.stylesStore.getRange()
        );

        this._ready = true;
        this.fireEvent("ready");
    },
    
    /** private: method[markModified]
     */
    markModified: function() {
        if(this.modified === false) {
            this.modified = true;
        }
        if (!this._saving) {
            this.fireEvent("modified", this, this.selectedStyle.get("name"));
        }
    },
    
    /** private: method[createStylesStore]
     */
    createStylesStore: function(callback) {
        var styles = this.layerRecord.get("styles") || [];
        
        this.stylesStore = new Ext.data.JsonStore({
            data: {
                styles: styles
            },
            idProperty: "name",
            root: "styles",
            // add a userStyle field (not included in styles from
            // GetCapabilities), which will be populated with the userStyle
            // object if GetStyles is supported by the WMS
            fields: ["name", "title", "abstract", "legend", "userStyle"],
            listeners: {
                "add": function(store, records) {
                    for(var rec, i=records.length-1; i>=0; --i) {
                        rec = records[i];
                        store.suspendEvents();
                        rec.get("title") || rec.set("title", rec.get("name"));
                        store.resumeEvents();
                    }
                }
            }
        });
    },


    /** private: method[getGeostoreStyles]
     *  :arg callback: ``Function`` function that will be called when the
     *      request result was returned.
     */
    getGeostoreStyles: function(userStyles,initialStyle,layerParams) {
        if(this.editable === true) {
            var geostoreEntityResource = new OpenLayers.GeoStore.Resource({
                name: "resources"
            });
            
            this.geoStore.getEntities(geostoreEntityResource,
                function(store){
                    var layer = layerParams.LAYERS;
                    if(store.length>0){
                        this.stylesGeostoreStore = store;
                        firstResponse = store[0].data.data.replace(/\\/g,"");
                        var firstData = new OpenLayers.Format.XML().read(firstResponse);
                        var format = new OpenLayers.Format.SLD({profile: "GeoServer", multipleSymbolizers: true});
                        var firstSld = format.read(firstData);
                        var namedLayers = firstSld;
                        
                        for(var i = 1;i<store.length; i++){
                            response = store[i].data.data.replace(/\\/g,"");
                            var data = new OpenLayers.Format.XML().read(response);
                            var sld = format.read(data);
                            Array.prototype.push.apply(namedLayers.namedLayers[layerParams.LAYERS].userStyles, sld.namedLayers[layerParams.LAYERS].userStyles);
                        }
                        
                        Ext.each(namedLayers.namedLayers[layerParams.LAYERS].userStyles, function(item,index) {
                            item.gs_name = this.stylesGeostoreStore[index].name;
                            item.gs_id = this.stylesGeostoreStore[index].id;
                        },this);
                        
                        this.parseSLDGeostore(namedLayers,userStyles,initialStyle);
                    }else{
                        this.parseSLDGeostore(undefined,userStyles,initialStyle);
                    }
                },function(response){
                    Ext.Msg.show({
                        title: this.searchStyleResourcesErrorTitle,
                        buttons: Ext.Msg.OK,
                        msg: this.searchStyleResourcesErrorMsg + this.styler.getErrorMsg(response),
                        icon: Ext.MessageBox.ERROR,
                        fn: this.parseSLDGeostore(undefined,userStyles,initialStyle),
                        scope: this
                    });
                },
                this,true,
                "POST",
                "<AND><FIELD><field>METADATA</field><operator>LIKE</operator><value>"+layerParams.LAYERS+"</value></FIELD><CATEGORY><operator>EQUAL_TO</operator><name>LAYERS_STYLES</name></CATEGORY></AND>",
                "text/xml"
            );
        } else {
            this.setupNonEditable();
        }
    },    
    /** private: method[getStyles]
     *  :arg callback: ``Function`` function that will be called when the
     *      request result was returned.
     */
    getStyles: function(callback) {
        var layer = this.layerRecord.getLayer();
        if(this.editable === true) {
            var version = layer.params["VERSION"];
            if (parseFloat(version) > 1.1) {
                //TODO don't force 1.1.1, fall back instead
                version = "1.1.1";
            }
            var ppp = [layer.params["LAYERS"]].join(",");
            Ext.Ajax.request({
                url: layer.url,
                params: {
                    "SERVICE": "WMS",
                    "VERSION": version,
                    "REQUEST": "GetStyles",
                    "LAYERS": [layer.params["LAYERS"]].join(",")
                },
                method: "GET",
                disableCaching: true,
                success: this.parseSLD,
                failure: this.setupNonEditable,
                callback: callback,
                scope: this
            });            
        } else {
            this.setupNonEditable();
        }
    },
    
    /** private: method[describeLayer]
     *  :arg callback: ``Function`` function that will be called when the
     *      request result was returned.
     */
    describeLayer: function(callback) {
        if (this.layerDescription) {
            // always return before calling callback
            window.setTimeout(function() {
                callback.call(this);
            }, 0);
        } else {
            var layer = this.layerRecord.getLayer();
            var version = layer.params["VERSION"];
            if (parseFloat(version) > 1.1) {
                //TODO don't force 1.1.1, fall back instead
                version = "1.1.1";
            }
            Ext.Ajax.request({
                url: layer.url,
                params: {
                    "SERVICE": "WMS",
                    "VERSION": version,
                    "REQUEST": "DescribeLayer",
                    "LAYERS": [layer.params["LAYERS"]].join(",")
                },
                method: "GET",
                disableCaching: false,
                success: function(response) {
                    var result = new OpenLayers.Format.WMSDescribeLayer().read(
                        response.responseXML && response.responseXML.documentElement ?
                            response.responseXML : response.responseText);
                    this.layerDescription = result[0];
                },
                callback: callback,
                scope: this
            });
        }
    },
    
    /** private: method[addStylesCombo]
     * 
     *  Adds a combo box with the available style names found for the layer
     *  in the capabilities document to this component's stylesFieldset.
     */
    addStylesCombo: function() {
        var store = this.stylesStore;
        var style = this.selectedStyle ?
                this.selectedStyle.get("title") :
                this.layerRecord.getLayer().params.STYLES || "default";
                
        var combo = new Ext.form.ComboBox(Ext.apply({
            fieldLabel: this.chooseStyleText,
            store: store,
            editable: false,
            displayField: "title",
            valueField: "name",
            value: style,
            disabled: !store.getCount(),
            mode: "local",
            typeAhead: true,
            triggerAction: "all",
            forceSelection: true,
            anchor: "100%",
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<tpl if="this.geostore != values.geostore">',
                '<tpl exec="this.geostore = values.geostore"></tpl>',
                '<h1><span style="color:gray">{geostore}</span></h1>',
                '</tpl>',
                '<div class="x-combo-list-item">{title}</div>',
                '</tpl>'
            ),            
            listeners: {
                "afterrender": function(combo){
                    var comboStore = combo.getStore();
                    var index = comboStore.findBy(function(record,id){
                        if (record.data.name === (this.selectedStyle ? this.selectedStyle.get("name") : this.layerRecord.getLayer().params.STYLES || "default")){
                            return record;
                        };
                    },this,0);
                    
                    var record = combo.getStore().getAt(index);
                    
                    this.changeStyle(record);
                    if (!record.phantom && !this._removing) {
                        this.fireEvent("styleselected", this, record.get("name"));
                    }
                },
                "select": function(combo, record) {
                
                    if (record.get("userStyle")["geostore"]){
                        this.changeStyle(record);                  
                        var style = this.geoStore.url + "misc/category/name/LAYERS_STYLES/resource/name/" + record.data.userStyle.gs_name + "/data/";
                        if (!record.phantom && !this._removing) {  
                            this.fireEvent("styleselectedgeostore", this, style);
                        }
                    }else{
                        this.changeStyle(record);
                        if (!record.phantom && !this._removing) {
                            this.fireEvent("styleselected", this, record.get("name"));
                        }
                    }
                },
                scope: this
            }
        }, this.initialConfig.stylesComboOptions));
        // add combo to the styles fieldset
        this.items.get(0).add(combo);
        this.doLayout();
    },
    
    /** private: method[createLegendImage]
     *  :return: ``GeoExt.LegendImage`` or undefined if none available.
     * 
     *  Creates a legend image for the first style of the current layer. This
     *  is used when GetStyles is not available from the layer's WMS.
     */
    createLegendImage: function() {
        var legend = new GeoExt.WMSLegend({
            showTitle: false,
            layerRecord: this.layerRecord,
            autoScroll: true,
            defaults: {
                listeners: {
                    "render": function(cmp) {
                        cmp.getEl().on({
                            load: function(evt, img) {
                                if (img.getAttribute("src") != cmp.defaultImgSrc) {
                                    this.setRulesFieldSetVisible(true);
                                    if (cmp.getEl().getHeight() > 250) {
                                        legend.setHeight(250);
                                    }
                                }
                            },
                            "error": function() {
                                this.setRulesFieldSetVisible(false);
                            },
                            scope: this
                        });
                    },
                    scope: this
                }
            }
        });
        return legend;
    },
    
    /** api: method[changeStyle]
     *  :arg value: ``Ext.data.Record``
     *  :arg options: ``Object`` Additional options for this method.
     *
     *  Available options:
     *  * updateCombo - ``Boolean`` set to true to update the combo box
     *  * markModified - ``Boolean`` set to true to mark the dialog modified
     *
     *  Handler for the stylesCombo's ``select`` and the store's ``update``
     *  event. Updates the layer and the rules fieldset.
     */
    changeStyle: function(record, options) {
        options = options || {};
        var legend = this.items.get(2).items.get(0);
        this.selectedStyle = record;
        this.updateStyleRemoveButton();            
        var styleName = record.get("name");
        
        if (this.editable === true) {
            var userStyle = record.get("userStyle");
            if (userStyle.isDefault === true) {
                styleName = "";
            }
            var ruleIdx = legend.rules.indexOf(this.selectedRule);
            // replace the legend
            legend.ownerCt.remove(legend);
            this.createLegend(userStyle.rules, {selectedRuleIndex: ruleIdx});
        }
        if (options.updateCombo === true) {
            // update the combo's value with the new name
            this.items.get(0).items.get(0).setValue(userStyle.name);
            options.markModified === true && this.markModified();
        }
    },
    
    /** private: method[addVectorLegend]
     *  :arg rules: ``Array``
     *  :arg options: ``Object``
     *  :return: ``GeoExt.VectorLegend`` the legend that was created
     *
     *  Creates the vector legend for the provided rules and adds it to the
     *  rules fieldset.
     */
    addVectorLegend: function(rules, options) {
        options = Ext.applyIf(options || {}, {enableDD: true});
        
        var isGeostoreStyle = this.selectedStyle.get("userStyle")["geostore"];
        
        this.symbolType = options.symbolType;
        if (!this.symbolType) {
            var typeHierarchy = ["Point", "Line", "Polygon"];
            // use the highest symbolizer type of the 1st rule
            highest = 0;
            var symbolizers = rules[0].symbolizers, symbolType;
            for (var i=symbolizers.length-1; i>=0; i--) {
                symbolType = symbolizers[i].CLASS_NAME.split(".").pop();
                highest = Math.max(highest, typeHierarchy.indexOf(symbolType));
            }
            this.symbolType = typeHierarchy[highest];
        }
        var legend = this.items.get(2).add({
            xtype: "gx_vectorlegend",
            showTitle: false,
            height: rules.length > 10 ? 250 : undefined,
            autoScroll: rules.length > 10,
            rules: rules,
            symbolType: this.symbolType,
            selectOnClick: this.styler.roleAdmin ? (!this.disableEditButtons || isGeostoreStyle) : (!this.disableEditButtons && isGeostoreStyle),
            enableDD: options.enableDD,
            listeners: {
                "ruleselected": function(cmp, rule) {
                    this.selectedRule = rule;
                    // enable the Remove, Edit and Duplicate buttons
                    var tbItems = this.items.get(3).items;
                    this.updateRuleRemoveButton();
                    tbItems.get(2).enable();
                    tbItems.get(3).enable();
                },
                "ruleunselected": function(cmp, rule) {
                    this.selectedRule = null;
                    // disable the Remove, Edit and Duplicate buttons
                    var tbItems = this.items.get(3).items;
                    tbItems.get(1).disable();
                    tbItems.get(2).disable();
                    tbItems.get(3).disable();
                },
                "rulemoved": function() {
                    this.markModified();
                },
                "afterlayout": function() {
                    // restore selection
                    //TODO QA: avoid accessing private properties/methods
                    if (this.selectedRule !== null &&
                            legend.selectedRule === null &&
                            legend.rules.indexOf(this.selectedRule) !== -1) {
                        legend.selectRuleEntry(this.selectedRule);
                    }
                },
                scope: this
            }
        });
        this.setRulesFieldSetVisible(true);
        return legend;
    },
    
    newStyleName: function() {
        var layerName = this.layerRecord.get("name");
        return layerName.split(":").pop() + "_" +
            gxp.util.md5(layerName + new Date() + Math.random()).substr(0, 8);
    },
    
    /** private: method[showDlg]
     *  :arg dlg:
     *
     *  Shows a subdialog
     */
    showDlg: function(dlg) {
        dlg.show();
    }   
    
});

/** api: function[createGeoServerStylerConfig]
 *  :arg layerRecord: ``GeoExt.data.LayerRecord`` Layer record to configure the
 *      dialog for.
 *  :arg url: ``String`` Optional. Custaom URL for the GeoServer REST endpoint
 *      for writing styles.
 *
 *  Creates a configuration object for a :class:`gxp.WMSStylesDialog` with a
 *  :class:`gxp.plugins.GeoServerStyleWriter` plugin and listeners for the
 *  "styleselected", "modified" and "saved" events that take care of saving
 *  styles and keeping the layer view updated.
 */
gxp.he.WMSStylesDialogHE.createGeoServerStylerConfig = function(layerRecord, url) {
    var layer = layerRecord.getLayer();
    
    var styler = app.tools["styler"];
    var geoStore = styler.geoStore;
    var roleAdmin = styler.roleAdmin;
    var advancedUser = styler.advancedUser;
    var styleWriterPTYPE = "gxp_geoserverstylewriter";
    var setEditable = false;
    
    if(roleAdmin){
        styleWriterPTYPE = "gxp_geoserverstylewriter";
        setEditable = true;
    }else if(advancedUser){
        styleWriterPTYPE = "gxp_geostorestylewriter";
        setEditable = true;
    }
    
    if (!url) {
        url = layerRecord.get("restUrl");
    }
    if (!url) {
        url = layer.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest");
    }
    return {
        xtype: "gxp_wmsstylesdialoghe",
        layerRecord: layerRecord,
        geoStore: geoStore,
        styler: styler,
        editable: setEditable,
        plugins: [{
            ptype: styleWriterPTYPE,
            baseUrl: url,
            url: geoStore.url,
            user: geoStore.user,
            password: geoStore.password,
            geoStore: geoStore
        }],
        listeners: {
            "styleselectedgeostore": function(cmp, style) {
                layer.mergeNewParams({
                    _olSalt: Math.random(),
                    styles: "",
                    sld: style
                });
            },
            "styleselected": function(cmp, style) {
                layer.mergeNewParams({
                    sld: null,
                    styles: style
                });
            },
            "modifiedgeostore": function(cmp, style) {
                cmp.saveStyles();
            },            
            "modified": function(cmp, style) {
                cmp.saveStyles();
            },
            "savedgeostore": function(cmp, style) {
                layer.mergeNewParams({
                    _olSalt: Math.random(),
                    styles: "",                    
                    sld: style
                });
            },            
            "saved": function(cmp, style) {
                layer.mergeNewParams({
                    _olSalt: Math.random(),
                    styles: style,                    
                    sld: null
                });
            },
            scope: this
        }
    };
};

// set SLD defaults for symbolizer
OpenLayers.Renderer.defaultSymbolizer = {
    fillColor: "#808080",
    fillOpacity: 1,
    strokeColor: "#000000",
    strokeOpacity: 1,
    strokeWidth: 1,
    strokeDashstyle: "solid",
    pointRadius: 3,
    graphicName: "square",
    fontColor: "#000000",
    fontSize: 10,
    haloColor: "#FFFFFF",
    haloOpacity: 1,
    haloRadius: 1,
    labelAlign: 'cm'
};

//http://blogs.cozi.com/tech/2010/04/generating-uuids-in-javascript.html
(function() {
    UUID = {
    // Return a randomly generated v4 UUID, per RFC 4122
        uuid4: function () {
            return this._uuid(
                this.randomInt(), this.randomInt(),
                this.randomInt(), this.randomInt(), 4);
        },

        // Create a versioned UUID from w1..w4, 32-bit non-negative ints
        _uuid: function (w1, w2, w3, w4, version) {
            var uuid = new Array(36);
            var data = [
                (w1 & 0xFFFFFFFF), (w2 & 0xFFFF0FFF) | ((version || 4) << 12), // version (1-5)
                (w3 & 0x3FFFFFFF) | 0x80000000, // rfc 4122 variant
                (w4 & 0xFFFFFFFF)
            ];
            for (var i = 0, k = 0; i < 4; i++) {
                var rnd = data[i];
                for (var j = 0; j < 8; j++) {
                    if (k == 8 || k == 13 || k == 18 || k == 23) {
                        uuid[k++] = '-';
                    }
                    var r = (rnd >>> 28) & 0xf; // Take the high-order nybble
                    rnd = (rnd & 0x0FFFFFFF) << 4;
                    uuid[k++] = this.hex.charAt(r);
                }
            }
            return uuid.join('');
        },

        hex: '0123456789abcdef',

        // Return a random integer in [0, 2^32).
        randomInt: function () {
            return Math.floor(0x100000000 * Math.random());
        }
    }
})();  
    
/** api: xtype = gxp_wmsstylesdialoghe */
Ext.reg('gxp_wmsstylesdialoghe', gxp.he.WMSStylesDialogHE);
