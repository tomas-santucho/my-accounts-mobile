const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exclude realm on web platform
  if (platform === 'web' && moduleName === 'realm') {
    return {
      type: 'empty',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;