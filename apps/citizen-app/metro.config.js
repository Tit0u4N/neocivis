const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// biome-ignore lint/style/noCommonJs: This is a Metro config file
module.exports = withNativewind(config);