// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This line is sometimes needed for monorepos or specific setups
// but should be handled by getDefaultConfig now.
// config.resolver.sourceExts.push('cjs');

module.exports = config;