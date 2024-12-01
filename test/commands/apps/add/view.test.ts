import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:add:view', () => {
  it('runs apps:add:view cmd', async () => {
    const {stdout} = await runCommand('apps:add:view')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:add:view --name oclif', async () => {
    const {stdout} = await runCommand('apps:add:view --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
