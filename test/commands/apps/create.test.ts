import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:create', () => {
  it('runs apps:create cmd', async () => {
    const {stdout} = await runCommand('apps:create')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:create --name oclif', async () => {
    const {stdout} = await runCommand('apps:create --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
