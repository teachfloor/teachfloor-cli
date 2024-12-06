import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:set:distribution', () => {
  it('runs apps:set:distribution cmd', async () => {
    const {stdout} = await runCommand('apps:set:distribution')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:set:distribution --name oclif', async () => {
    const {stdout} = await runCommand('apps:set:distribution --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
