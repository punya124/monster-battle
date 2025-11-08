const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;

// Generate new keypair
const keypair = Keypair.generate();

console.log('=== NEW SOLANA WALLET ===');
console.log('Public Key:', keypair.publicKey.toString());
console.log('Secret Key (Base58):', bs58.encode(keypair.secretKey));
console.log('\nAdd this to your .env.local:');
console.log(`SOLANA_MINTING_WALLET_SECRET_KEY=${bs58.encode(keypair.secretKey)}`);
console.log('\nGet devnet SOL from: https://faucet.solana.com/');
