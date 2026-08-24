import * as StellarSdk from "@stellar/stellar-sdk";
import { Asset, TransactionBuilder, Operation, Networks, Memo } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export const PREDICTION_MARKET_CONTRACT_ID = 
  process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT || "CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR";

// Destination escrow/contract account for prediction pool staking on Stellar testnet
const PREDICTION_ESCROW_ADDRESS = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

/**
 * Builds an on-chain transaction for placing a Prediction Market bet with XLM.
 */
export async function buildPredictionBetTx(
  userPubKey: string,
  marketId: string,
  side: "YES" | "NO",
  amountXLM: string
): Promise<string> {
  try {
    const userAccount = await server.loadAccount(userPubKey);
    
    // Memo payload encoding market and chosen outcome
    const memoText = `${side.slice(0, 3)}:${marketId.slice(0, 20)}`;

    const tx = new TransactionBuilder(userAccount, {
      fee: "1000",
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: PREDICTION_ESCROW_ADDRESS,
          asset: Asset.native(),
          amount: amountXLM
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(180)
      .build();

    return tx.toXDR();
  } catch (error) {
    console.error("Failed to build prediction bet transaction:", error);
    throw new Error("Unable to build on-chain bet transaction. Ensure your wallet has sufficient XLM for gas.");
  }
}

/**
 * Builds an on-chain transaction for creating and funding a new prediction contest with XLM.
 */
export async function buildCreateContestTx(
  userPubKey: string,
  question: string,
  initialLiquidityXLM: string
): Promise<string> {
  try {
    const userAccount = await server.loadAccount(userPubKey);
    const memoText = `NEW:${question.slice(0, 20)}`;

    const tx = new TransactionBuilder(userAccount, {
      fee: "1000",
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: PREDICTION_ESCROW_ADDRESS,
          asset: Asset.native(),
          amount: initialLiquidityXLM
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(180)
      .build();

    return tx.toXDR();
  } catch (error) {
    console.error("Failed to build create contest transaction:", error);
    throw new Error("Unable to initialize contest on-chain. Please check your XLM balance.");
  }
}

/**
 * Submits the user-signed XDR directly to the Stellar network.
 */
export async function submitStellarTx(signedXdr: string): Promise<string> {
  try {
    const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const response = await server.submitTransaction(tx);
    return response.hash;
  } catch (error: any) {
    console.error("Transaction submission failed:", error);
    const resultCodes = error?.response?.data?.extras?.result_codes;
    if (resultCodes) {
      throw new Error(`On-chain transaction rejected: ${JSON.stringify(resultCodes)}`);
    }
    throw new Error(error?.message || "Failed to submit transaction to Stellar Testnet.");
  }
}
