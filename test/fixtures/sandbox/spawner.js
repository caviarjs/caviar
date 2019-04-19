if (!process.env.CAVIAR_DEV) {
  throw new Error('process.env.CAVIAR_DEV not found')
}
