'use strict'

module.exports = function (api) {
  const targets = 'node >=10'
  api.cache(true)
  api.cacheDirectory = true

  return {
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-env',
        {
          corejs: 3,
          useBuiltIns: 'entry',
          modules: 'commonjs',
          bugfixes: true,
          targets
        }
      ]
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: false,
          regenerator: true
        }
      ]
    ]
  }
}
