import { NextRequest, NextResponse } from 'next/server';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from '@metaplex-foundation/umi';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { base58 } from '@metaplex-foundation/umi/serializers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, attack, defense, health, description, imageUrl } = body;

        if (!name) {
            return NextResponse.json({ error: 'Missing name' }, { status: 400 });
        }

        // Initialize Umi with devnet
        const umi = createUmi('https://api.devnet.solana.com');

        // Load minting wallet
        const mintingWalletSecret = process.env.SOLANA_MINTING_WALLET_SECRET_KEY;
        if (!mintingWalletSecret) {
            return NextResponse.json({ error: 'Minting wallet not configured' }, { status: 500 });
        }

        const secretKeyArray = base58.serialize(mintingWalletSecret);
        const keypair = umi.eddsa.createKeypairFromSecretKey(secretKeyArray);
        const myKeypairSigner = createSignerFromKeypair(umi, keypair);

        umi.use(signerIdentity(myKeypairSigner));
        umi.use(mplTokenMetadata());

        // Create metadata JSON
        const metadata = {
            name: name,
            symbol: "MNSTR",
            description: description || "A hand-drawn monster",
            image: imageUrl || "https://placeholder.com/monster.png",
            attributes: [
                { trait_type: "Attack", value: attack || 5 },
                { trait_type: "Defense", value: defense || 5 },
                { trait_type: "Health", value: health || 50 }
            ]
        };

        // OPTION 1: Upload to NFT.Storage (free, simple)
        const metadataUri = await uploadToNFTStorage(metadata);

        // OPTION 2: Use a short placeholder (for quick testing)
        // const metadataUri = "https://arweave.net/placeholder";

        console.log('Metadata URI:', metadataUri);
        console.log('URI length:', metadataUri.length); // Must be < 200

        // Generate mint address
        const mintSigner = generateSigner(umi);

        console.log('Minting NFT...');

        // Create and mint the NFT
        const transaction = await createNft(umi, {
            mint: mintSigner,
            name: name.substring(0, 32), // Name max 32 bytes
            symbol: "MNSTR", // Symbol max 10 bytes
            uri: metadataUri, // URI max 200 bytes
            sellerFeeBasisPoints: percentAmount(2.5),
            creators: [
                {
                    address: myKeypairSigner.publicKey,
                    verified: true,
                    share: 100
                }
            ]
        }).sendAndConfirm(umi);

        const signature = base58.deserialize(transaction.signature)[0];

        console.log('✅ NFT Minted!');
        console.log('Mint Address:', mintSigner.publicKey);

        return NextResponse.json({
            success: true,
            mintAddress: mintSigner.publicKey,
            signature: signature,
            explorerUrl: `https://explorer.solana.com/address/${mintSigner.publicKey}?cluster=devnet`,
            metadata: {
                name,
                attack,
                defense,
                health
            }
        });

    } catch (error: any) {
        console.error('Minting error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to mint NFT'
        }, { status: 500 });
    }
}

// Helper function to upload metadata to NFT.Storage
async function uploadToNFTStorage(metadata: any): Promise<string> {
    const NFT_STORAGE_KEY = process.env.NFT_STORAGE_API_KEY;

    if (!NFT_STORAGE_KEY) {
        // Fallback: use a simple hosted JSON
        console.warn('NFT.Storage key not found, using placeholder');
        return "https://arweave.net/placeholder";
    }

    try {
        const response = await fetch('https://api.nft.storage/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NFT_STORAGE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });

        const data = await response.json();
        return `https://nftstorage.link/ipfs/${data.value.cid}`;
    } catch (error) {
        console.error('NFT.Storage upload failed:', error);
        return "https://arweave.net/placeholder";
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'NFT Minting API',
        note: 'URI must be < 200 characters'
    });
}
