import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:upload', () => {
  it('runs apps:upload cmd', async () => {
    const {stdout} = await runCommand('apps:upload')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:upload --name oclif', async () => {
    const {stdout} = await runCommand('apps:upload --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
