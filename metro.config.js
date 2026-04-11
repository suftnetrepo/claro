const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Required for drizzle-orm with expo-sqlite
config.resolver.unstable_enablePackageExports = false

module.exports = config
