/* eslint-disable no-undef */
//
// Focused coverage for the full-sync / CLI entrypoint fixes in index.js.
// The legacy test/unit/index.test.js is skipped upstream cruft (its Settings
// mock shape and event set no longer match this fork), so these standalone
// tests pin the two index.js bugs the full-sync fix addressed:
//
//   Bug 1 (getRouter): full-sync.js calls the app as `appFn(probot, {})` with
//     no HTTP router. Route setup must be skipped instead of throwing.
//   Bug 2 (baseRef/changedFiles): syncAllSettings referenced these as
//     undeclared variables. A NOP full sync must reach Settings.syncAll rather
//     than throwing a ReferenceError that gets swallowed into the error path.
//
jest.mock('../../lib/installationCache', () => ({ initCache: jest.fn().mockResolvedValue(true) }))

const plugin = require('../../index')

const flush = () => new Promise(resolve => setImmediate(resolve))

function makeGithub () {
  const installation = { id: 1, account: { login: 'test-org' } }
  return {
    apps: {
      listInstallations: { endpoint: { merge: jest.fn().mockReturnValue({}) } },
      getAuthenticated: jest.fn().mockResolvedValue({ data: { slug: 'safe-settings' } })
    },
    paginate: jest.fn().mockResolvedValue([installation]),
    repos: {
      // 404 => ConfigManager.loadYaml returns null (no global settings file).
      getContent: jest.fn().mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))
    }
  }
}

function makeRobot (github) {
  return {
    log: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn(), trace: jest.fn() },
    on: jest.fn(),
    onAny: jest.fn(),
    auth: jest.fn().mockResolvedValue(github)
  }
}

describe('index full-sync / CLI entrypoint', () => {
  describe('bug 1: getRouter guard', () => {
    it('does not throw when invoked without an HTTP router (CLI/full-sync context)', async () => {
      const robot = makeRobot(makeGithub())
      // full-sync.js invokes the app as `appFn(probot, {})` — no getRouter.
      expect(() => plugin(robot, {})).not.toThrow()
      // Route setup must be skipped rather than attempted with an undefined router.
      expect(robot.log.info).toHaveBeenCalledWith(
        expect.stringContaining('skipping route setup')
      )
      await flush() // let registration-time async (info/prefetch) settle
    })
  })

  describe('bug 2: syncAllSettings baseRef/changedFiles', () => {
    it('NOP full sync reaches Settings.syncAll without a ReferenceError', async () => {
      const github = makeGithub()
      const robot = makeRobot(github)
      const SettingsMock = {
        syncAll: jest.fn().mockResolvedValue({ errors: [] }),
        handleError: jest.fn()
      }

      const app = plugin(robot, {}, SettingsMock)
      await app.syncInstallation(true)

      // Reached the sync (would be a swallowed ReferenceError -> handleError before the fix).
      expect(SettingsMock.syncAll).toHaveBeenCalledTimes(1)
      expect(SettingsMock.syncAll.mock.calls[0][0]).toBe(true) // nop flag threaded through
      expect(SettingsMock.handleError).not.toHaveBeenCalled()
      await flush()
    })
  })
})
