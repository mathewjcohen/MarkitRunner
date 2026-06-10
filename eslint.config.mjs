import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      // Server components are async functions; Date.now() and similar are fine
      'react-hooks/purity': 'off',
    },
  },
]
