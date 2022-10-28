module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: true,
        allowUndefined: false,
      },
    ],
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    [
      'babel-plugin-module-resolver',
      {
        root: ['./src'],
        imageScale: ['@2x', '@3x'],
        imageTypes: ['.png', '.gif', '.jpg'],
        alias: {
          '@images': './src/assets/images',
          '@accounts': './src/accounts',
          '@components': './src/ui/screens/components',
          '@utility': './src/Utility',
          '@constants': './src/constants',
          '@bookings': './src/bookings',
          '@contexts': './src/contexts',
          '@notifications': './src/notifications',
          '@incidents': './src/incidents',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
}
