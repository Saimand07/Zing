const fs = require('fs');
const { Keypair, TransactionBuilder, Networks, Contract, xdr, Address, nativeToScVal } = require('@stellar/stellar-sdk');
const StellarSdk = require('@stellar/stellar-sdk');
const { rpc } = require('@stellar/stellar-sdk');

const sorobanServer = new rpc.Server('https://soroban-testnet.stellar.org');
const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

async function deployWasm(account, kp, wasmPath) {
    console.log(`Uploading ${wasmPath}...`);
    const wasm = fs.readFileSync(wasmPath);
    let tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: Networks.TESTNET })
        .addOperation(StellarSdk.Operation.uploadContractWasm({ wasm }))
        .setTimeout(300)
        .build();
    let preparedTx = await sorobanServer.prepareTransaction(tx);
    preparedTx.sign(kp);
    const sim = await sorobanServer.simulateTransaction(preparedTx);
    if (sim.error) {
        throw new Error("Simulate error: " + sim.error);
    }
    const res = await horizonServer.submitTransaction(preparedTx);
    
    // Wait for the WASM to be available (polling logic missing, but let's hope it's fast)
    // Actually, getting the wasm id from simulation is better:
    const resultMetaXdr = res.result_meta_xdr;
    // For simplicity, I will just grab the wasm id from simulation:
    const wasmId = sim.result.retval.value().toString('hex');
    console.log(`Wasm uploaded: ${wasmId}`);
    return Buffer.from(sim.result.retval.value());
}

async function createContract(account, kp, wasmIdBuf) {
    console.log(`Deploying contract from wasm...`);
    let tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: Networks.TESTNET })
        .addOperation(StellarSdk.Operation.createCustomContract({
            wasmHash: wasmIdBuf,
            address: new Address(kp.publicKey())
        }))
        .setTimeout(300)
        .build();
    let preparedTx = await sorobanServer.prepareTransaction(tx);
    preparedTx.sign(kp);
    const sim = await sorobanServer.simulateTransaction(preparedTx);
    const res = await horizonServer.submitTransaction(preparedTx);
    
    const contractId = Address.fromScVal(sim.result.retval).toString();
    console.log(`Deployed contract: ${contractId}`);
    return contractId;
}

async function initializeLaunchpad(account, kp, launchpadAddress, tokenWasmIdBuf) {
    console.log(`Initializing Launchpad...`);
    const contract = new Contract(launchpadAddress);
    const admin = new Address(kp.publicKey()).toScVal();
    const wasmScVal = xdr.ScVal.scvBytes(tokenWasmIdBuf);
    
    let tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call('initialize', admin, wasmScVal))
        .setTimeout(300)
        .build();
    let preparedTx = await sorobanServer.prepareTransaction(tx);
    preparedTx.sign(kp);
    const res = await horizonServer.submitTransaction(preparedTx);
    console.log(`Launchpad initialized successfully!`);
}

async function run() {
    const kp = Keypair.random();
    console.log("Funding admin account: ", kp.publicKey());
    await fetch('https://friendbot.stellar.org?addr=' + kp.publicKey());
    
    const account = await horizonServer.loadAccount(kp.publicKey());
    
    try {
        const tokenWasm = await deployWasm(account, kp, 'contracts/target/wasm32-unknown-unknown/release/zing_token.wasm');
        
        // Refresh account sequence
        const acc2 = await horizonServer.loadAccount(kp.publicKey());
        const launchpadWasm = await deployWasm(acc2, kp, 'contracts/target/wasm32-unknown-unknown/release/zing_launchpad.wasm');
        
        const acc3 = await horizonServer.loadAccount(kp.publicKey());
        const launchpadAddress = await createContract(acc3, kp, launchpadWasm);
        
        const acc4 = await horizonServer.loadAccount(kp.publicKey());
        await initializeLaunchpad(acc4, kp, launchpadAddress, tokenWasm);
        
        console.log("==== DEPLOYMENT COMPLETE ====");
        console.log("NEXT_PUBLIC_LAUNCHPAD_CONTRACT=" + launchpadAddress);
    } catch (e) {
        console.error(e);
    }
}

run();
