const { Keypair, Networks, TransactionBuilder, Operation, rpc: SorobanRpc, Asset, Contract, Address } = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const rpc = new SorobanRpc.Server(SERVER_URL);

async function fundAccount(publicKey) {
  console.log(`Funding account: ${publicKey}`);
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    await res.json();
    console.log("Funded successfully!");
  } catch (e) {
    console.error("Funding failed:", e);
  }
}

async function submitTx(tx, keypair) {
  let preparedTx = await rpc.prepareTransaction(tx);
  preparedTx.sign(keypair);
  console.log("Submitting transaction...");
  const sendResult = await rpc.sendTransaction(preparedTx);
  if (sendResult.errorResultXdr) {
    throw new Error(`Submit failed: ${sendResult.errorResultXdr}`);
  }
  let statusResult;
  let attempts = 0;
  while (attempts < 100) {
    statusResult = await rpc.getTransaction(sendResult.hash);
    if (statusResult.status !== "NOT_FOUND") {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }
  if (statusResult.status !== "SUCCESS") {
    throw new Error(`Tx failed: ${JSON.stringify(statusResult)}`);
  }
  return statusResult;
}

async function deployContract(wasmName) {
  const deployer = Keypair.random();
  await fundAccount(deployer.publicKey());
  await new Promise(resolve => setTimeout(resolve, 5000));
  const account = await rpc.getAccount(deployer.publicKey());
  const wasmPath = path.join(__dirname, '..', 'target', 'wasm32-unknown-unknown', 'release', wasmName);
  const wasmBuffer = fs.readFileSync(wasmPath);
  console.log(`Uploading ${wasmName}...`);
  const uploadTx = new TransactionBuilder(account, { fee: "50000000", networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
    .setTimeout(300)
    .build();
  const uploadRes = await submitTx(uploadTx, deployer);
  const wasmId = uploadRes.returnValue.value().toString('hex');
  console.log(`Wasm ID for ${wasmName}: ${wasmId}`);
  account.incrementSequenceNumber();
  const createTx = new TransactionBuilder(account, { fee: "50000000", networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(Operation.createCustomContract({
      address: Address.fromString(deployer.publicKey()),
      wasmHash: Buffer.from(wasmId, 'hex')
    }))
    .setTimeout(300)
    .build();
  const createRes = await submitTx(createTx, deployer);
  const contractId = createRes.returnValue.address().toString();
  console.log(`Deployed ${wasmName} at ID: ${contractId}`);
  return contractId;
}

async function main() {
  try {
    console.log("Starting prediction market deployment...");
    const predictionMarketId = await deployContract('prediction_market.wasm');
    console.log(`\n\nSUCCESS! PREDICTION MARKET ID: ${predictionMarketId}\n\n`);
  } catch(e) {
    console.error("Deployment failed:", e);
  }
}

main();
