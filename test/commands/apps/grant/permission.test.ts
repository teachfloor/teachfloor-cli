import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:grant:permission', () => {
  it('runs apps:grant:permission cmd', async () => {
    const {stdout} = await runCommand('apps:grant:permission')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:grant:permission --name oclif', async () => {
    const {stdout} = await runCommand('apps:grant:permission --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
