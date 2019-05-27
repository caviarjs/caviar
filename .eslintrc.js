module.exports = {
  extends: require.resolve('eslint-config-ostai'),
  rules: {
    // Allow
    // const a =
    // this.a = value
    'operator-linebreak': 0,

    // For test cases
    'import/no-extraneous-dependencies': 0,

    // Allow for of
    'no-restricted-syntax': 0
  }
}
