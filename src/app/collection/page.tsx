'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { button } from 'motion/react-client';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';


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
            .insert({ monster_id: nft.id, opp_mon_id: getRandomInt(0, 9), player_health: nft.health, player_energy: 15, opp_health: getRandomInt(40, 60), opp_energy: 15, moves: moves })
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
            <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
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
        <div className="min-h-screen bg-linear-to-br  to-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="flex justify-start text-center w-64">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            as="button"
                            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                        >
                            <span>← back</span>
                        </HoverBorderGradient>

                    </Link>
                    <h1 className="text-2xl">creations ({nfts.length})</h1>
                    <Link href={'/upload'} className="flex justify-end text-center w-64">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            as="button"
                            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                        >
                            <span>+ Create Monster</span>
                        </HoverBorderGradient>
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
                        <Link href="/upload" className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg">
                            Draw Monster
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {nfts.map((nft) => (
                                <CardContainer className="inter-var" key={nft.id}>
                                    <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/10 dark:bg-black dark:border-white/20 border-black/10 w-auto sm:w-100 rounded-xl p-6 border  h-full">
                                        <CardItem
                                            translateZ="50"
                                            className="text-xl font-bold text-neutral-600 dark:text-white"
                                        >
                                            {nft.name}
                                        </CardItem>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            {nft.type.toUpperCase()}
                                        </CardItem>
                                        <CardItem translateZ="100" className="w-full mt-4">
                                            <img
                                                src={nft.imageUrl}
                                                alt={nft.name}
                                                height="250"
                                                width="250"
                                                className="h-80 mx-auto w-auto object-cover rounded-xl group-hover/card:shadow-xl"
                                            />
                                        </CardItem>
                                        {/* Stats Grid - All 4 Stats */}
                                        <div className="grid grid-cols-4 gap-3 my-4">
                                            {/* Attack */}
                                            <CardItem
                                                translateZ={20}
                                                className="bg-white/5 rounded-lg w-full py-2 mx-2 text-center flex flex-col justify-center">
                                                <div className={getStatColor(nft.attack, nft.type)}>
                                                    {nft.attack}
                                                </div>
                                                <div className="text-xs text-gray-400 uppercase font-semibold">ATK</div>
                                            </CardItem>

                                            {/* Defense */}
                                            <CardItem
                                                translateZ={20}
                                                className="bg-white/5 rounded-lg w-full py-2 mx-2 text-center flex flex-col justify-center">
                                                <div className={getStatColor(nft.defense, nft.type)}>
                                                    {nft.defense}
                                                </div>
                                                <div className="text-xs text-gray-400 uppercase font-semibold">DEF</div>
                                            </CardItem>

                                            {/* Speed */}
                                            <CardItem
                                                translateZ={20}
                                                className="bg-white/5 rounded-lg w-full py-2 mx-2 text-center flex flex-col justify-center">
                                                <div className={getStatColor(nft.speed, nft.type)}>
                                                    {nft.speed}
                                                </div>
                                                <div className="text-xs text-gray-400 uppercase font-semibold">SPD</div>
                                            </CardItem>

                                            {/* Health */}
                                            <CardItem
                                                translateZ={20}
                                                className="bg-white/5 rounded-lg w-full py-2 mx-2 text-center flex flex-col justify-center">
                                                <div className={getStatColor(nft.health / 10, nft.type)}>
                                                    {nft.health}
                                                </div>
                                                <div className="text-xs text-gray-400 uppercase font-semibold">HP</div>
                                            </CardItem>
                                        </div>

                                        {/* Battle Button */}
                                        <CardItem translateZ={0} as={button}
                                            onClick={() => writeBattleDB(nft)}
                                            className="block w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl text-center shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            ⚔️ Battle
                                        </CardItem>
                                    </CardBody>
                                </CardContainer>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
