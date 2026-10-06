module.exports = {
  extends: ['google'],
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'new-cap': 'off',
    'require-jsdoc':'off'
  },
};