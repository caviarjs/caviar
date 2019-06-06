module.exports = {
  // UNDEFINED: undefined,

  RETURNS_TRUE: () => true,
  IS_SANDBOX_PLUGIN: ({sandbox}) => sandbox === true,
  IS_NOT_SANDBOX_PLUGIN: ({sandbox}) => sandbox !== true
}
