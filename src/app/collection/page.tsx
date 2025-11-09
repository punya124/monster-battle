'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Monster = {
    id: string,
    health: number,

}

export default function CollectionPage() {
    const { connected, publicKey } = useWallet();
    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        if (connected && publicKey) {
            fetchNFTs();
        } else {
            setNfts([]);
            setLoading(false);
        }
    }, [connected, publicKey]);

    const fetchNFTs = async () => {
        if (!publicKey || !supabase) {
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log('Fetching for wallet:', publicKey.toBase58());

        try {
            const { data, error } = await supabase
                .from('monsters')
                .select('*, owner_wallet')
                .eq('owner_wallet', publicKey.toBase58());

            console.log('Query error:', error);
            console.log('Query data:', data);

            if (error) {
                console.error('Error fetching monsters:', error);
                setNfts([]);
            } else {
                const monsterNfts = data?.map(monster => ({
                    id: monster.id,
                    mintAddress: monster.mint_address,
                    name: monster.name,
                    type: monster.type,
                    attack: monster.attack,
                    defense: monster.defense,
                    speed: monster.speed,
                    health: monster.health,
                    imageUrl: monster.image_url
                })) || [];
                console.log('Mapped NFTs:', monsterNfts);
                setNfts(monsterNfts);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setNfts([]);
        } finally {
            setLoading(false);
        }
    };

    // Type badge color mapping
    const getTypeBadgeStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'fight':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'fright':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'fairy':
                return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    function getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        // The maximum is inclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async function fetchRandomMoveIds(): Promise<number[] | null> {
        // 1. Make the RPC call.
        const { data, error } = await supabase
            .rpc('get_three_random_move_ids');

        if (error) {
            console.error('Error fetching random move IDs:', error);
            return null;
        }

        // 2. Assert the correct type: an array of numbers.
        const moveIds = data as number[];

        // 3. Handle the case where the data might be null or not an array.
        if (!Array.isArray(moveIds)) {
            console.error("Data received is not an array:", moveIds);
            return [];
        }

        // 4. Return the data directly. It's already in the correct format.
        console.log('Successfully fetched move IDs:', moveIds);
        return moveIds; // Returns [12, 34, 56]
    }


    const writeBattleDB = async (nft: any) => {

        const moves = await fetchRandomMoveIds();
        console.log(moves)

        // 2. Guard against errors or an empty array
        if (!moves || moves.length < 3) {
            console.error("Could not fetch 3 move IDs for the battle.");
            return;
        }
        const { data, error } = await supabase
            .from('battles')
            .insert({ monster_id: nft.id, opp_mon_id: getRandomInt(0, 9), player_health: nft.health, player_energy: 15, opp_health: getRandomInt(10, 100), opp_energy: 15, moves: moves })
            .select('id');

        if (error) {
            console.error('Error inserting data:', error);
        } else if (data) {
            const newId = data[0].id;
            console.log('Newly inserted ID:', newId);

            router.push(`/battle/${newId}`);

        }


    }

    // Stat color mapping
    const getStatColor = (stat: number, type: string) => {
        const baseColor = stat >= 7 ? 'text-lg' : stat >= 4 ? 'text-base' : 'text-sm';
        const colorClass = stat >= 7 ? 'text-red-400' : stat >= 4 ? 'text-yellow-400' : 'text-gray-400';
        return `${baseColor} font-bold ${colorClass}`;
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
        <div className="min-h-screen bg-gradient-to-br  to-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-2xl font-bold">← Back</Link>
                    <h1 className="text-3xl font-bold">My Monster Collection</h1>
                    <Link href="/upload" className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">
                        + Create Monster
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4 animate-spin">⚔️</div>
                        <p className="text-xl">Loading your monsters...</p>
                    </div>
                ) : nfts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-8">🃏</div>
                        <h2 className="text-3xl font-bold mb-4">No Monsters Yet</h2>
                        <p className="text-gray-300 mb-8 text-lg">Draw your first monster and bring it to life!</p>
                        <Link href="/upload" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg">
                            Draw Monster
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {nfts.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
                                >
                                    {/* Monster Image - 1:1 Aspect Ratio */}
                                    <div className="relative mb-4">
                                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300">
                                            {nft.imageUrl ? (
                                                <img
                                                    src={nft.imageUrl}
                                                    alt={nft.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                🐉
                                            </div>
                                        </div>

                                        {/* Type Badge */}
                                        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold border-2 ${getTypeBadgeStyle(nft.type)}`}>
                                            {nft.type.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Monster Name */}
                                    <h3 className="text-xl font-bold mb-3 text-center text-white truncate">
                                        {nft.name}
                                    </h3>

                                    {/* Stats Grid - All 4 Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {/* Attack */}
                                        <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                                            <div className={getStatColor(nft.attack, nft.type)}>
                                                {nft.attack}
                                            </div>
                                            <div className="text-xs text-gray-400 uppercase font-semibold">ATK</div>
                                        </div>

                                        {/* Defense */}
                                        <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                                            <div className={getStatColor(nft.defense, nft.type)}>
                                                {nft.defense}
                                            </div>
                                            <div className="text-xs text-gray-400 uppercase font-semibold">DEF</div>
                                        </div>

                                        {/* Speed */}
                                        <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                                            <div className={getStatColor(nft.speed, nft.type)}>
                                                {nft.speed}
                                            </div>
                                            <div className="text-xs text-gray-400 uppercase font-semibold">SPD</div>
                                        </div>

                                        {/* Health */}
                                        <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                                            <div className={getStatColor(nft.health / 10, nft.type)}>
                                                {nft.health}
                                            </div>
                                            <div className="text-xs text-gray-400 uppercase font-semibold">HP</div>
                                        </div>
                                    </div>

                                    {/* Mint Address (truncated) */}
                                    <div className="text-xs text-gray-400 mb-4 text-center truncate">
                                        {nft.mintAddress ? `${nft.mintAddress.slice(0, 8)}...` : 'No mint address'}
                                    </div>

                                    {/* Battle Button */}
                                    <button
                                        onClick={() => writeBattleDB(nft)}
                                        className="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl text-center shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        ⚔️ Battle
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Collection Summary */}
                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center bg-white/10 backdrop-blur rounded-full px-8 py-3 border border-white/20">
                                <div className="text-3xl mr-3">🗡️</div>
                                <div>
                                    <p className="text-4xl font-bold text-white mb-1">{nfts.length}</p>
                                    <p className="text-gray-400 uppercase tracking-wider font-semibold">Total Monsters</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
