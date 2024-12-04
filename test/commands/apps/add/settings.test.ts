import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:add:settings', () => {
  it('runs apps:add:settings cmd', async () => {
    const {stdout} = await runCommand('apps:add:settings')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:add:settings --name oclif', async () => {
    const {stdout} = await runCommand('apps:add:settings --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
