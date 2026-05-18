import { Contract, ContractFactory, JsonRpcProvider, Wallet, type InterfaceAbi } from 'ethers';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface DeployParams {
  quorumBps: number;
}

export interface GovernanceContract {
  getAddress(): Promise<string>;
  setProposal(description: string): Promise<unknown>;
  assignStake(wallet: string, amount: bigint): Promise<unknown>;
  startVoting(): Promise<unknown>;
  endVoting(): Promise<unknown>;
  result(): Promise<string>;
  quorumReached(): Promise<boolean>;
  getVoteCounts(): Promise<[bigint, bigint]>;
}

let abiCache: InterfaceAbi | undefined;

function loadAbi(): InterfaceAbi {
  if (abiCache) return abiCache;
  const paths = [
    join(process.cwd(), 'contracts', 'abi', 'StakeVotingGovernance.json'),
    join(__dirname, '..', '..', '..', 'contracts', 'abi', 'StakeVotingGovernance.json'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      const raw = JSON.parse(readFileSync(p, 'utf-8'));
      abiCache = (Array.isArray(raw) ? raw : (raw.abi ?? raw)) as InterfaceAbi;
      return abiCache;
    }
  }
  throw new Error('StakeVotingGovernance ABI not found. Set CONTRACT_ABI_PATH or place ABI in contracts/abi/.');
}

function loadArtifact(): { abi: InterfaceAbi; bytecode: string } {
  const paths = [
    process.env.CONTRACT_ARTIFACT_PATH,
    join(process.cwd(), 'out', 'StakeVotingGovernance.sol', 'StakeVotingGovernance.json'),
    join(__dirname, '..', '..', '..', 'out', 'StakeVotingGovernance.sol', 'StakeVotingGovernance.json'),
  ].filter(Boolean) as string[];
  for (const p of paths) {
    if (existsSync(p)) {
      const art = JSON.parse(readFileSync(p, 'utf-8'));
      const bytecode = art.bytecode?.object ?? art.bytecode ?? art.deployedBytecode?.object;
      if (bytecode) {
        return { abi: (art.abi ?? loadAbi()) as InterfaceAbi, bytecode };
      }
    }
  }
  throw new Error(
    'Contract bytecode not found. Run `forge build` in the contract repo, then set CONTRACT_ARTIFACT_PATH to out/StakeVotingGovernance.sol/StakeVotingGovernance.json'
  );
}

function getAdminWallet(): Wallet {
  if (!config.chain.adminPrivateKey) {
    throw new Error('ADMIN_PRIVATE_KEY is not set. Required for deploy and admin calls.');
  }
  const provider = new JsonRpcProvider(config.chain.rpcUrl);
  return new Wallet(config.chain.adminPrivateKey, provider);
}

export async function deployContract(params: DeployParams): Promise<GovernanceContract> {
  const { quorumBps } = params;
  if (quorumBps < 1 || quorumBps > 10000) {
    throw new Error('quorumBps must be 1–10000');
  }
  const wallet = getAdminWallet();
  const { abi, bytecode } = loadArtifact();
  const factory = new ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(quorumBps);
  await contract.waitForDeployment();
  return contract as unknown as GovernanceContract;
}

export function getContract(address: string): GovernanceContract {
  const wallet = getAdminWallet();
  return new Contract(address, loadAbi(), wallet) as unknown as GovernanceContract;
}

export async function initializeVoting(
  contractAddress: string,
  description: string,
  snapshots: { wallet_address: string; stake_amount: string }[]
): Promise<void> {
  const wallet = getAdminWallet();
  const contract = new Contract(contractAddress, loadAbi(), wallet);

  let currentNonce = await wallet.getNonce();

  const tx1: any = await contract.setProposal(description, { nonce: currentNonce++ });
  if (tx1 && tx1.wait) await tx1.wait();

  for (const s of snapshots) {
    const amount = BigInt(s.stake_amount);
    if (amount <= 0n) continue;
    const tx: any = await contract.assignStake(s.wallet_address, amount, { nonce: currentNonce++ });
    if (tx && tx.wait) await tx.wait();
  }

  const tx2: any = await contract.startVoting({ nonce: currentNonce++ });
  if (tx2 && tx2.wait) await tx2.wait();
}

export async function endVoting(contractAddress: string): Promise<void> {
  const contract = getContract(contractAddress);
  const tx: any = await contract.endVoting();
  if (tx && tx.wait) await tx.wait();
}

export async function getResult(contractAddress: string): Promise<string> {
  const contract = getContract(contractAddress);
  return contract.result();
}

export async function getQuorumReached(contractAddress: string): Promise<boolean> {
  const contract = getContract(contractAddress);
  return contract.quorumReached();
}

export async function getVoteCounts(contractAddress: string): Promise<[bigint, bigint]> {
  const contract = getContract(contractAddress);
  return contract.getVoteCounts();
}
