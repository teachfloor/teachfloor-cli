import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:remove:view', () => {
  it('runs apps:remove:view cmd', async () => {
    const {stdout} = await runCommand('apps:remove:view')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:remove:view --name oclif', async () => {
    const {stdout} = await runCommand('apps:remove:view --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
