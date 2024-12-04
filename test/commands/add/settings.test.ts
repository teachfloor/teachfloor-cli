import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('add:settings', () => {
  it('runs add:settings cmd', async () => {
    const {stdout} = await runCommand('add:settings')
    expect(stdout).to.contain('hello world')
  })

  it('runs add:settings --name oclif', async () => {
    const {stdout} = await runCommand('add:settings --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
