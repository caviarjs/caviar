if (!process.env.CAVIAR_DEV) {
  console.error('process.env.CAVIAR_DEV not found')
  process.exit(1)
}

if (process.env.CAVIAR_PHASE !== 'default') {
  console.error('process.env.CAVIAR_PHASE not match')
}
