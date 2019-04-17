module.exports = {
  extends: require.resolve('eslint-config-ostai'),
  rules: {
    'operator-linebreak': 0,

    // For test cases
    'import/no-extraneous-dependencies': 0
  }
}
