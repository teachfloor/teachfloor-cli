import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:revoke:permission', () => {
  it('runs apps:revoke:permission cmd', async () => {
    const {stdout} = await runCommand('apps:revoke:permission')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:revoke:permission --name oclif', async () => {
    const {stdout} = await runCommand('apps:revoke:permission --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
