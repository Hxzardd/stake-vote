/**
 * Compiles contracts/StakeVotingGovernance.sol and writes the deploy
 * artifact (abi + creation bytecode) to lib/contract/StakeVotingGovernance.json.
 *
 * Settings mirror foundry.toml: solc 0.8.28, optimizer enabled, 200 runs.
 * The artifact is committed because the admin deploy path needs the
 * bytecode at runtime (e.g. on Vercel), where Foundry is unavailable.
 *
 * Usage: pnpm build:artifact
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import solc from 'solc'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'contracts', 'StakeVotingGovernance.sol')
const outPath = join(root, 'lib', 'contract', 'StakeVotingGovernance.json')

const source = readFileSync(sourcePath, 'utf-8')

const input = {
  language: 'Solidity',
  sources: {
    'StakeVotingGovernance.sol': { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': { '*': ['abi', 'evm.bytecode.object'] },
    },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))

const errors = (output.errors ?? []).filter((e) => e.severity === 'error')
if (errors.length > 0) {
  for (const e of errors) console.error(e.formattedMessage)
  process.exit(1)
}

const contract = output.contracts['StakeVotingGovernance.sol'].StakeVotingGovernance
const artifact = {
  contractName: 'StakeVotingGovernance',
  solcVersion: solc.version(),
  optimizer: { enabled: true, runs: 200 },
  abi: contract.abi,
  bytecode: `0x${contract.evm.bytecode.object}`,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`)
console.log(`Wrote ${outPath} (${artifact.bytecode.length / 2 - 1} bytes of bytecode)`)
