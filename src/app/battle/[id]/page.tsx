import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MovesPanel from '@/components/MovesPanel'; // Adjust path as needed

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Monster {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    attack: number;
    imageUrl: string;
    moves: string[];
}

interface Props {
    params: Promise<{ id: string }>;
}

export default async function BattlePage({ params }: Props) {
    const { id } = await params;

    // Fetch or placeholder data
    const placeholderImage = 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Monster';
    // Optional: Fetch monster data using id
    const { data: monster, error } = await supabase
        .from('monsters') // Replace with your table
        .select('*')
        .eq('mint_address', id) // Or eq('nft_id', id)
        .single();

    if (error || !monster) {
        notFound(); // Shows 404 if monster not found
    }
    const opponent: Monster = {
        ...monster,
        name: 'Opponent Monster',
        hp: 90,
        attack: 12
    };

    if (!monster) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col relative overflow-hidden">
            {/* Opponent Section */}
            <div className="flex-1 flex flex-col items-center justify-end p-4">
                <div className="text-center z-10">
                    <img
                        src={opponent.imageUrl}
                        alt={opponent.name}
                        className="w-48 h-48 object-contain drop-shadow-2xl animate-bounce-slow"
                    />
                    <h2 className="text-2xl font-bold text-white mt-2">{opponent.name}</h2>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(opponent.hp / opponent.maxHp) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-white text-sm">{opponent.hp}/{opponent.maxHp} HP</span>
                    </div>
                    <p className="text-white text-lg">Level {opponent.level} | Attack: {opponent.attack}</p>
                </div>
            </div>

            {/* Player Section */}
            <div className="h-1/2 relative bg-gradient-to-t from-green-800 to-transparent p-4 flex items-end">
                <div className="w-full flex items-end justify-between">
                    <div className="flex-1 flex justify-center">
                        <img
                            src={monster.image_url}
                            alt={monster.name}
                            className="w-40 h-40 object-contain drop-shadow-2xl"
                        />
                        <div className="ml-4 text-left">
                            <h2 className="text-xl font-bold text-white">{monster.name}</h2>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-white">{monster.hp}/{monster.maxHp} HP</span>
                            </div>
                            <p className="text-white">Level {monster.level} | Attack: {monster.attack}</p>
                        </div>
                    </div>

                    {/* Insert the client component here */}
                    <MovesPanel monster={monster} />
                </div>
            </div>
        </div>
    );
}
