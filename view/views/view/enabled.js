sc_require("views/view");

const ENABLED = 0x08; // 8
const IS_DISABLED = 0x10; // 16
const DISABLED = 0x11; // 17
const DISABLED_BY_PARENT = 0x12; // 18
const DISABLED_AND_BY_PARENT = 0x13; // 19

export const CoreViewEnabledSupport = /** @scope SC.CoreView */ {

  /**
    The view is enabled.

    @static
    @constant
  */
  ENABLED: 0x08, // 8

  /**
    The view has been disabled.

    @static
    @constant
  */
  IS_DISABLED: 0x10, // 16

  /**
    The view is disabled.

    @static
    @constant
  */
  DISABLED: 0x11, // 17

  /**
    The view is enabled itself, but is effectively disabled in the pane due to
    a disabled ancestor.

    @static
    @constant
  */
  DISABLED_BY_PARENT: 0x12, // 18

  /**
    The view is disabled itself and is also disabled in the pane due to
    a disabled ancestor.

    @static
    @constant
  */
  DISABLED_AND_BY_PARENT: 0x13 // 19

};


SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The current enabled state of the view.

    Views have a few possible enabled states:

    * SC.CoreView.ENABLED
    * SC.CoreView.DISABLED
    * SC.CoreView.DISABLED_BY_PARENT

    @type String
    @default SC.CoreView.ENABLED
    @readonly
  */
  enabledState: SC.CoreView.ENABLED,

  /**
    Set to true when the item is enabled.   Note that changing this value
    will alter the `isEnabledInPane` property for this view and any
    child views as well as to automatically add or remove a 'disabled' CSS
    class name.

    This property is observable and bindable.

    @type Boolean
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),

  /**
    Computed property returns YES if the view and all of its parent views
    are enabled in the pane.  You should use this property when deciding
    whether to respond to an incoming event or not.

    @type Boolean
  */
  // The previous version used a lazy upward search method.  This has better
  // performance, but made isEnabledInPane non-bindable.
  // isEnabledInPane: function() {
  //   var ret = this.get('isEnabled'), pv ;
  //   if (ret && (pv = this.get('parentView'))) { ret = pv.get('isEnabledInPane'); }
  //   return ret ;
  // }.property('parentView', 'isEnabled'),
  isEnabledInPane: function () {
    return this.get('enabledState') === SC.CoreView.ENABLED;
  }.property('enabledState').cacheable(),

  /**
    By default, setting isEnabled to false on a view will place all of its
    child views in a disabled state.  To block this from happening to a
    specific child view and its children, you can set `shouldInheritEnabled`
    to false.

    In this way you can set `isEnabled` to false on a main pane to disable all
    buttons, collections and other controls within it, but can still keep a
    section of it editable using `shouldInheritEnabled: false`.

    @type Boolean
  */
  shouldInheritEnabled: true,

  // ------------------------------------------------------------------------
  // Actions & Events
  //

  /** @private */
  _doEnable: function () {
    var handled = true,
      enabledState = this.get('enabledState');

    // If the view itself is disabled, then we can enable it.
    if (enabledState === SC.CoreView.DISABLED) {
      // Update the enabled state of all children. Top-down, because if a child is disabled on its own it
      // won't affect its childrens' state and we can bail out early.
      this._callOnChildViews('_parentDidEnableInPane');
      this._gotoEnabledState();

    // If the view is disabled and has a disabled parent, we can enable it, but it will be disabled by the parent.
    } else if (enabledState === SC.CoreView.DISABLED_AND_BY_PARENT) {
      // The view is no longer disabled itself, but still disabled by an ancestor.
      this._gotoDisabledByParentState();

    // If the view is not disabled, we can't enable it.
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private */
  _doDisable: function () {
    var handled = true,
      enabledState = this.get('enabledState');

    // If the view is not itself disabled, then we can disable it.
    if (enabledState === SC.CoreView.ENABLED) {
      // Update the disabled state of all children. Top-down, because if a child is disabled on its own it
      // won't affect its childrens' state and we can bail out early.
      this._callOnChildViews('_parentDidDisableInPane');
      this._gotoDisabledState();

      // Ensure that first responder status is given up.
      if (this.get('isFirstResponder')) {
        this.resignFirstResponder();
      }

    // If the view is disabled because of a disabled parent, we can disable the view itself too.
    } else if (enabledState === SC.CoreView.DISABLED_BY_PARENT) {
      // The view is now disabled itself and disabled by an ancestor.
      this._gotoDisabledAndByParentState();

    // If the view is not enabled, we can't disable it.
    } else {
      handled = false;
    }

    return handled;
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private
    Observes the isEnabled property and resigns first responder if set to NO.
    This will avoid cases where, for example, a disabled text field retains
    its focus rings.

    @observes isEnabled
  */
  _sc_view_isEnabledDidChange: function () {
    // Filter the input channel.
    this.invokeOnce(this._doUpdateEnabled);
  }.observes('isEnabled'),

  /** @private */
  _doUpdateEnabled: function () {
    var state = this.get('viewState');

    // Call the proper action.
    if (this.get('isEnabled')) {
      this._doEnable();
    } else {
      this._doDisable();
    }

    // Update the display if in a visible state.
    switch (state) {
    case SC.CoreView.ATTACHED_SHOWN:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_BUILDING_IN:
      // Update the display.
      this._doUpdateEnabledStyle();
      break;
    default:
      // Indicate that a display update is required the next time we are visible.
      this._enabledStyleNeedsUpdate = true;
    }
  },

  /** @private */
  _doUpdateEnabledStyle: function () {
    var isEnabled = this.get('isEnabled');

    this.$().toggleClass('disabled', !isEnabled);
    this.$().attr('aria-disabled', !isEnabled ? true : null);

    // Reset that an update is required.
    this._enabledStyleNeedsUpdate = false;
  },

  /** @private */
  _parentDidEnableInPane: function () {
    var enabledState = this.get('enabledState');

    if (this.get('shouldInheritEnabled')) {

      if (enabledState === SC.CoreView.DISABLED_BY_PARENT) { // Was enabled before.
        this._gotoEnabledState();
      } else if (enabledState === SC.CoreView.DISABLED_AND_BY_PARENT) { // Was disabled before.
        this._gotoDisabledState();

        // There's no need to continue to further child views.
        return false;
      }
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private */
  _parentDidDisableInPane: function () {
    var enabledState = this.get('enabledState');

    if (this.get('shouldInheritEnabled')) {

      if (enabledState === SC.CoreView.ENABLED) { // Was enabled.
        this._gotoDisabledByParentState();
      } else if (enabledState === SC.CoreView.DISABLED) { // Was disabled.
        this._gotoDisabledAndByParentState();
      } else { // Was already disabled by ancestor.

        // There's no need to continue to further child views.
        return false;
      }
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private */
  _gotoEnabledState: function () {
    this.set('enabledState', SC.CoreView.ENABLED);
  },

  /** @private */
  _gotoDisabledState: function () {
    this.set('enabledState', SC.CoreView.DISABLED);
  },

  /** @private */
  _gotoDisabledAndByParentState: function () {
    this.set('enabledState', SC.CoreView.DISABLED_AND_BY_PARENT);
  },

  /** @private */
  _gotoDisabledByParentState: function () {
    this.set('enabledState', SC.CoreView.DISABLED_BY_PARENT);
  }

});
