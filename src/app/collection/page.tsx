'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

export default function CollectionPage() {
    const { connected, publicKey } = useWallet();
    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (connected && publicKey) {
            fetchNFTs();
        }
    }, [connected, publicKey]);

    const fetchNFTs = async () => {
        // This would call your API to get NFTs from database
        // For now, mock data for demo
        setLoading(true);

        setTimeout(() => {
            setNfts([
                {
                    mintAddress: '8xj2vZP9rQ8h8MNy...',
                    name: 'Fire Dragon',
                    attack: 8,
                    defense: 5,
                    health: 70
                },
                {
                    mintAddress: '9yK3wAp0sR9i9NpZ...',
                    name: 'Water Serpent',
                    attack: 6,
                    defense: 7,
                    health: 65
                }
            ]);
            setLoading(false);
        }, 1000);
    };

    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">🔒 Wallet Not Connected</h1>
                    <Link href="/" className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-2xl font-bold">← Back</Link>
                    <h1 className="text-3xl font-bold">My Collection</h1>
                    <Link href="/upload" className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg">
                        + Create
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">⏳</div>
                        <p>Loading your monsters...</p>
                    </div>
                ) : nfts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😢</div>
                        <h2 className="text-2xl font-bold mb-4">No Monsters Yet</h2>
                        <p className="text-gray-300 mb-6">Create your first monster to start battling!</p>
                        <Link href="/upload" className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg inline-block">
                            Create Monster
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-3 gap-6">
                            {nfts.map((nft, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition">
                                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 h-48 rounded-lg mb-4 flex items-center justify-center text-6xl">
                                        🐉
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4 truncate">{nft.mintAddress}</p>

                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-400">{nft.attack}</div>
                                            <div className="text-xs text-gray-400">ATK</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-400">{nft.defense}</div>
                                            <div className="text-xs text-gray-400">DEF</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-400">{nft.health}</div>
                                            <div className="text-xs text-gray-400">HP</div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/battle/new`}
                                        className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-center"
                                    >
                                        ⚔️ Battle
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400">Total Monsters: {nfts.length}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
