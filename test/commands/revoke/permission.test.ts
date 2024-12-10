import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('revoke:permission', () => {
  it('runs revoke:permission cmd', async () => {
    const {stdout} = await runCommand('revoke:permission')
    expect(stdout).to.contain('hello world')
  })

  it('runs revoke:permission --name oclif', async () => {
    const {stdout} = await runCommand('revoke:permission --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
