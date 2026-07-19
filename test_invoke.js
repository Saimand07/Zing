const StellarSdk = require('@stellar/stellar-sdk');
const { Keypair, TransactionBuilder, Networks, Contract, Address, rpc, xdr } = StellarSdk;

const sorobanServer = new rpc.Server('https://soroban-testnet.stellar.org');
const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

async function run() {
    const kp = Keypair.random();
    console.log("Funding:", kp.publicKey());
    await fetch('https://friendbot.stellar.org?addr=' + kp.publicKey());
    
    const account = await horizonServer.loadAccount(kp.publicKey());
    const contractId = 'CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46';
    const contract = new Contract(contractId);
    
    const creatorScVal = new Address(kp.publicKey()).toScVal();
    const nameScVal = xdr.ScVal.scvString("TestToken");
    const symbolScVal = xdr.ScVal.scvString("TEST");
    const supplyScVal = StellarSdk.nativeToScVal(BigInt("1000000"), { type: "i128" });
    
    let tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("launch_token", creatorScVal, nameScVal, symbolScVal, supplyScVal))
        .setTimeout(300)
        .build();
    
    try {
        console.log("Simulating...");
        const sim = await sorobanServer.simulateTransaction(tx);
        console.log(JSON.stringify(sim, null, 2));
        
        console.log("Preparing...");
        let preparedTx = await sorobanServer.prepareTransaction(tx);
        preparedTx.sign(kp);
        
        console.log("Submitting...");
        const res = await horizonServer.submitTransaction(preparedTx);
        console.log("Submit res:", res.hash);
        
        const txStatus = await sorobanServer.getTransaction(res.hash);
        console.log("Tx status:", txStatus.status);
    } catch (e) {
        console.error(e);
        if (e.response && e.response.data) {
            console.error(JSON.stringify(e.response.data, null, 2));
        }
    }
}
run();
