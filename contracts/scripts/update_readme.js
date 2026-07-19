const fs = require('fs');
const path = require('path');

try {
  const deployedPath = path.join(__dirname, 'deployed.json');
  const readmePath = path.join(__dirname, '..', '..', 'README.md');
  
  if (!fs.existsSync(deployedPath)) {
    console.log("No deployed.json found, skipping README update.");
    process.exit(0);
  }
  
  const contracts = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  let readme = fs.readFileSync(readmePath, 'utf8');

  // Replace badge links
  readme = readme.replace(/\[\!\[Launchpad\]\(.*?\)\]\(.*?\)/, `[![Launchpad](https://img.shields.io/badge/Launchpad-Contract-purple)](https://stellar.expert/explorer/testnet/contract/${contracts.launchpad})`);
  readme = readme.replace(/\[\!\[Campaigns\]\(.*?\)\]\(.*?\)/, `[![Campaigns](https://img.shields.io/badge/Campaigns-Contract-purple)](https://stellar.expert/explorer/testnet/contract/${contracts.campaign})`);
  readme = readme.replace(/\[\!\[Competitions\]\(.*?\)\]\(.*?\)/, `[![Competitions](https://img.shields.io/badge/Competitions-Contract-purple)](https://stellar.expert/explorer/testnet/contract/${contracts.competition})`);
  readme = readme.replace(/\[\!\[Predictions\]\(.*?\)\]\(.*?\)/, `[![Predictions](https://img.shields.io/badge/Predictions-Contract-purple)](https://stellar.expert/explorer/testnet/contract/${contracts.predictionMarket})`);

  // Replace table entries
  readme = readme.replace(/\| \*\*Zing Launchpad\*\* \| \`.*?\` \| \[View on Stellar Expert\]\(.*?\) \|/, `| **Zing Launchpad** | \`${contracts.launchpad}\` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/${contracts.launchpad}) |`);
  readme = readme.replace(/\| \*\*Social Booster \(Campaigns\)\*\* \| \`.*?\` \| \[View on Stellar Expert\]\(.*?\) \|/, `| **Social Booster (Campaigns)** | \`${contracts.campaign}\` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/${contracts.campaign}) |`);
  readme = readme.replace(/\| \*\*Trading Competitions\*\* \| \`.*?\` \| \[View on Stellar Expert\]\(.*?\) \|/, `| **Trading Competitions** | \`${contracts.competition}\` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/${contracts.competition}) |`);
  readme = readme.replace(/\| \*\*Prediction Markets\*\* \| \`.*?\` \| \[View on Stellar Expert\]\(.*?\) \|/, `| **Prediction Markets** | \`${contracts.predictionMarket}\` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/${contracts.predictionMarket}) |`);
  // Note: Smart Wallet wasn't in the table but we have it deployed.

  fs.writeFileSync(readmePath, readme);
  console.log("README.md updated with live contract IDs!");
} catch (e) {
  console.error("Failed to update README:", e);
}
