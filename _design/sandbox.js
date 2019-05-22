// Sandbox
///////////////////////////////////////////////

/**

Thinking:
sandbox could be caviar-independent?

*/

const subProcess = await sandbox({
  configLoaderModulePath,
  forkerModulePath,
  cwd,
  dev
})
.applyPlugins()
.ready()

monitor(subProcess).catch(fail)
