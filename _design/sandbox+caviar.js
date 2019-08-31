// Sandbox
///////////////////////////////////////////////

/**

Thinking:
sandbox could be caviar-independent?

*/

const sb = sandbox({
  cwd,
  dev
})
.applyPlugins(condition)

// Build phase
await sb.build()

// Start server
const subProcess = await sb.ready()

monitor(subProcess).catch(fail)



const c = caviar({
  configLoaderClassPath,
  cwd,
  dev
})
.applyPlugins(condition)

// Build phase
await c.build()

// Start server
await c.ready()
