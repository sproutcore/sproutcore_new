// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../core/core.js';
import './render_delegates/split.js';
import './render_delegates/split_divider.js';
import './render_delegates/button.js';
import './render_delegates/checkbox.js';
import './render_delegates/collection.js';
import './render_delegates/disclosure.js';
import './render_delegates/toolbar.js';
import './render_delegates/image_button.js';
import './render_delegates/master_detail.js';
import './render_delegates/menu.js';
import './render_delegates/panel.js';
import './render_delegates/picker.js';
import './render_delegates/popup_button.js';
import './render_delegates/progress.js';
import './render_delegates/radio_group.js';
import './render_delegates/radio.js';
import './render_delegates/segment.js';
import './render_delegates/segmented.js';
import './render_delegates/select_button.js';
import './render_delegates/slider.js';
import './render_delegates/source_list.js';
import './render_delegates/well.js';
import './render_delegates/workspace.js';

/**
  If set to `NO`, then pressing backspace will NOT navigate to the previous
  page in the browser history, which is the default behavior in most browsers.
  
  Usually it is best to leave this property set to `NO` in order to prevent the
  user from inadvertently losing data by pressing the backspace key.

  @static
  @type Boolean
  @default NO
*/

// SC.allowsBackspaceToPreviousPage = NO;
SC.setSetting('allowsBackspaceToPreviousPage', false);

export { ScrollerView, OverlayScrollerView } from './views/scroller.js';
export { ListItemView } from './views/list_item.js';
export { ButtonView } from './views/button.js';
export { CheckboxView } from './views/checkbox.js';
export * from './system/constants.js';
export { SplitChild, NeedsSplitParent } from './mixins/split_child.js';
export { SplitThumb } from './mixins/split_thumb.js';
export { Drag } from './system/drag.js';
export { SplitDividerView } from './views/split_divider.js';
export { SplitView } from './views/split.js';
export { ScrollView } from './views/scroll_view.js';
export { SourceListView } from './views/source_list.js';
export { ListView } from './views/list.js';
export { ToolbarView } from './views/toolbar.js';
export { WebView } from './views/web.js';
export { GridView } from './views/grid.js';
export { SliderView } from './views/slider.js';
export { SelectView } from './views/select.js';
export { WorkspaceView } from './views/workspace.js';
export { MasterDetailView } from './views/master_detail.js';
export { ImageButtonView } from './views/image_button.js';
export { CollectionViewDelegate } from './mixins/collection_view_delegate.js';
export { PanelPane } from './panes/panel.js';
export { SheetPane } from './panes/sheet.js';
