const appFn = require('./')
const { FULL_SYNC_NOP } = require('./lib/env')
const { createProbot } = require('probot')

async function performFullSync (appFn, nop) {
  const probot = createProbot()
  probot.log.info(`Starting full sync with NOP=${nop} (org='${process.env.GH_ORG || '(from installations)'}', adminRepo='${process.env.ADMIN_REPO || 'admin'}')`)

  const startedAt = Date.now()
  try {
    const app = appFn(probot, {})
    const settings = await app.syncInstallation(nop)

    if (!settings) {
      probot.log.warn('Full sync produced no result (no installations found or nothing to sync).')
      return
    }

    const errorCount = (settings.errors && settings.errors.length) || 0
    if (errorCount > 0) {
      probot.log.error(`Errors occurred during full sync: ${errorCount} error(s).`)
      process.exit(1)
    }

    probot.log.info(`Full sync completed successfully in ${Date.now() - startedAt}ms.`)
  } catch (error) {
    process.stdout.write(`Unexpected error during full sync: ${error}\n`)
    process.exit(1)
  }
}

performFullSync(appFn, FULL_SYNC_NOP).catch((error) => {
  console.error('Fatal error during full sync:', error)
  process.exit(1)
})
