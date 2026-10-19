/**
 * Babel configuration for the SHOBDOX Android app.
 *
 * `babel-preset-expo` already registers the React Native / Expo plugins the app
 * needs, including the `react-native-worklets` plugin that Reanimated 4 depends
 * on. Adding that plugin here as well would apply it twice and break the
 * worklet transforms, so the preset is the only entry.
 */
module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
  };
};
