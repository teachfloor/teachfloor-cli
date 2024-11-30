import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:start', () => {
  it('runs apps:start cmd', async () => {
    const {stdout} = await runCommand('apps:start')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:start --name oclif', async () => {
    const {stdout} = await runCommand('apps:start --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
