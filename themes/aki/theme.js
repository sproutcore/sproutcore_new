



import { SC } from '../../core/core.js';
import { BaseTheme, Theme } from '../../view/view.js';
// import './css.js';
import './resources/scroller/scroller.js';
/**
 * @class
 * SproutCore's Aki theme.
 */
export const AkiTheme = BaseTheme.create({
  name: "aki",
  description: "A SproutCore built-in theme by Nicolas Badia and contributors. Only supports browsers that implement CSS3."
});

// register the theme with SproutCore
Theme.addTheme(AkiTheme);

// ButtonView variants
AkiTheme.PointLeft = AkiTheme.subtheme("point-left", "point-left");
AkiTheme.PointRight = AkiTheme.subtheme("point-right", "point-right");
AkiTheme.Capsule = AkiTheme.subtheme("capsule", "capsule");

// Color variants
AkiTheme.Dark = AkiTheme.subtheme("dark");
AkiTheme.Info = AkiTheme.subtheme("info");
AkiTheme.Success = AkiTheme.subtheme("success");
AkiTheme.Warning = AkiTheme.subtheme("warning");
AkiTheme.Danger = AkiTheme.subtheme("danger");

// for apps that don't set their own theme
SC.setSetting('defaultTheme', 'aki');