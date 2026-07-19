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

async function submitTxWithRetry(txBuilderFn, keypair) {
  let attempts = 0;
  while (attempts < 5) { // Try 5 times (each with 30s timeout)
    const account = await rpc.getAccount(keypair.publicKey());
    const tx = txBuilderFn(account);
    let preparedTx = await rpc.prepareTransaction(tx);
    preparedTx.sign(keypair);
    
    console.log(`Submitting transaction (attempt ${attempts + 1})...`);
    let sendResult;
    try {
      sendResult = await rpc.sendTransaction(preparedTx);
    } catch (e) {
      console.log("Send failed immediately, retrying:", e.message);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
    }

    if (sendResult.errorResultXdr) {
      console.log(`Submit error XDR: ${sendResult.errorResultXdr}`);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
    }

    let statusResult;
    let pollAttempts = 0;
    while (pollAttempts < 15) { // 15 * 3s = 45s wait max per submission
      statusResult = await rpc.getTransaction(sendResult.hash);
      if (statusResult.status !== "NOT_FOUND") {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
      pollAttempts++;
    }

    if (statusResult && statusResult.status === "SUCCESS") {
      return statusResult;
    }
    
    console.log(`Transaction NOT_FOUND or FAILED, rebuilding and retrying...`);
    attempts++;
  }
  throw new Error("Transaction failed after 5 retries");
}

async function deployContract(wasmName) {
  const deployer = Keypair.random();
  await fundAccount(deployer.publicKey());
  await new Promise(resolve => setTimeout(resolve, 5000));

  const wasmPath = path.join(__dirname, '..', 'target', 'wasm32-unknown-unknown', 'release', wasmName);
  const wasmBuffer = fs.readFileSync(wasmPath);
  
  console.log(`Uploading ${wasmName}...`);
  const uploadRes = await submitTxWithRetry((account) => {
    return new TransactionBuilder(account, { fee: "10000000", networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
      .setTimeout(300)
      .build();
  }, deployer);
  
  const wasmId = uploadRes.returnValue.value().toString('hex');
  console.log(`Wasm ID for ${wasmName}: ${wasmId}`);

  console.log(`Creating contract for ${wasmName}...`);
  const createRes = await submitTxWithRetry((account) => {
    return new TransactionBuilder(account, { fee: "10000000", networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(Operation.createCustomContract({
        address: Address.fromString(deployer.publicKey()),
        wasmHash: Buffer.from(wasmId, 'hex')
      }))
      .setTimeout(300)
      .build();
  }, deployer);
  
  const contractId = Address.fromScVal(createRes.returnValue).toString();
  console.log(`Deployed ${wasmName} at ID: ${contractId}`);
  return contractId;
}

function saveEnv(key, value) {
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  fs.writeFileSync(envPath, `\n${key}=${value}\n`, { flag: 'a' });
  console.log(`Saved ${key}=${value} to .env.local`);
}

async function main() {
  try {
    console.log("Starting deployments...");
    const campaignId = await deployContract('zing_campaign.wasm');
    saveEnv('NEXT_PUBLIC_CAMPAIGN_CONTRACT', campaignId);
    
    const competitionId = await deployContract('zing_competition.wasm');
    saveEnv('NEXT_PUBLIC_COMPETITION_CONTRACT', competitionId);
    
    const launchpadId = await deployContract('zing_launchpad.wasm');
    saveEnv('NEXT_PUBLIC_LAUNCHPAD_CONTRACT', launchpadId);
    
    const smartWalletId = await deployContract('zing_smart_wallet.wasm');
    saveEnv('NEXT_PUBLIC_SMART_WALLET_CONTRACT', smartWalletId);
    
    const predictionMarketId = await deployContract('prediction_market.wasm');
    saveEnv('NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT', predictionMarketId);
    
    // Also save to a JSON file for the readme script to read
    const contracts = {
      campaign: campaignId,
      competition: competitionId,
      launchpad: launchpadId,
      smartWallet: smartWalletId,
      predictionMarket: predictionMarketId
    };
    fs.writeFileSync(path.join(__dirname, 'deployed.json'), JSON.stringify(contracts, null, 2));
    console.log("All deployments finished!");
  } catch(e) {
    console.error("Deployment failed:", e);
  }
}

main();
