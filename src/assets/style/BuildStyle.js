import { Platform } from 'react-native';

const _ = require('lodash');

export function CombineClasses(classes, style) {
  if (typeof classes == 'string') {
    classes = classes.split(' ');
  }

  return _.map(classes, className => style[className]);
}

export function BuildStyle (overwrite, ...styles) {
  let out = {};

  _.forEach(styles, (style) => {
    // Check platform-specific styles
    const check = Platform.OS == 'android' ? '@Android:' : Platform.OS == 'ios' ? '@iOS:' : '@Other:';

    // Transform platform-specific rules
    let newStyle = {};
    for (let rule in style) {
      let key = rule;
      if (rule.includes(check)) {
        key = rule.split(':').pop();
      }

      if (!newStyle[key]) {
        newStyle[key] = Object.assign({}, style[rule]);
      } else {
        newStyle[key] = Object.assign(newStyle, style[rule])
      }

      if (Platform.OS == 'android') {
          delete newStyle[key]['fontWeight'];
      }
    }

    style = newStyle;

    // See if styles get overwritten
    if (overwrite) {
      Object.assign(out, style);
    } else {
      out = Object.assign({}, style, out);
    }
  })

  return out;
}

export function BuildStyleOverwrite (...styles) {
  return BuildStyle.bind(null, true).apply(null, styles);
}

export function BuildStyleDontOverwrite (...styles) {
  return BuildStyle.bind(null, false).apply(null, styles);
}
