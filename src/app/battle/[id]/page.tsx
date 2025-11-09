import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MoveButtons from '@/components/clientMoves';

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
    const battleID = id;

    const { data: battle, error: errBat } = await supabase
        .from('battles')
        .select('*')
        .eq('id', battleID)
        .single();
    if (errBat) {
        console.log("battle not found")
        notFound(); // Shows 404 if monster not found
    }

    const { data: opponent, error: errMons } = await supabase
        .from('monsters_enemies')
        .select('*')
        .eq('id', battle.opp_mon_id) // Or eq('nft_id', id)
        .single();
    if (errMons) {
        console.log("enemy monster not found")
        notFound(); // Shows 404 if monster not found
    }

    const { data: player, error: errPl } = await supabase
        .from('monsters')
        .select('*')
        .eq('id', battle.monster_id) // Or eq('nft_id', id)
        .single();
    if (errPl) {
        console.log("player monster not found")
        notFound(); // Shows 404 if monster not found
    }
    // const runMove = async (attack: number) => {
    //     window.alert("ran");
    //     console.log(calcData(battle.moves[attack], monMoves()[0], 
    //     {health: battle.player_health, energy:battle.player_energy},
    //     {health: battle.opp_health, energy:battle.opp_energy},
    //     player,
    //     opponent
    // ))

    // action here
    // try {
    //     const response = await fetch('/api/combat', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             battleID: battleID,
    //             attack_id1: battle.moves[attack],
    //             attack_id2: monMoves(),
    //             player:{health: battle.player_health, energy:battle.player_energy},
    //             opp:{health: battle.opp_health, energy:battle.opp_energy},
    //             monster1: player,
    //             monster2:opponent

    //         })
    //     })
    //     const result = await response.json();
    //     if(result){
    //         window.alert(result);
    //     } else {
    //         alert("No stats")
    //     }
    // } catch(error){
    //     console.error('combat api failed:', error);
    //     alert('Failed call api. Please try again.');
    // }



    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col relative overflow-hidden">
            {/* Opponent Section */}
            <div className="flex-1 flex flex-col items-center justify-end p-4">
                <div className="text-center z-10">
                    <img
                        src={opponent.image_url}
                        alt={opponent.name}
                        className="w-48 h-48 object-contain drop-shadow-2xl animate-bounce-slow"
                    />
                    <h1>{opponent.imageUrl}</h1>
                    <h2 className="text-2xl font-bold text-white mt-2">{opponent.name}</h2>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                        <div className="w-32 bg-gray-700 rounded-full h-2">

                        </div>
                        <span className="text-white text-sm">{battle.opp_health}: HP</span>
                    </div>
                    <p className="text-white text-lg">Level {opponent.level} | Attack: {opponent.attack}</p>
                </div>
            </div>

            {/* Player Section */}
            <div className="h-1/2 relative bg-gradient-to-t from-green-800 to-transparent p-4 flex items-end">
                <div className="w-full flex items-end justify-between">
                    <div className="flex-1 flex justify-center">
                        <img
                            src={player.image_url}
                            alt={player.name}
                            className="w-40 h-40 object-contain drop-shadow-2xl"
                        />
                        <div className="ml-4 text-left">
                            <h2 className="text-xl font-bold text-white">{player.name}</h2>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-700 rounded-full h-2">

                                </div>
                                <span className="text-white">{battle.player_health} HP</span>
                            </div>
                            <p className="text-white">Level {player.level} | Attack: {player.attack}</p>
                        </div>
                    </div>

                    {/* Insert the client component here */}
                    {/* <MovesPanel monster={player} /> */}
                    {/* Move Buttons */}
                    {/* <div className="flex flex-col space-y-3 mr-6">
                        <button 
                            onClick={() => {window.alert("hello")}}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
                            >
                            Move 1
                        </button>
                        <button 
                        // onClick={() => runMove(1)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-red-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
                            Move 2
                        </button>
                        <button 
                        // onClick={() => runMove(2)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
                            Move 3
                        </button>
                    </div> */}
                    <MoveButtons battle={battle} player={player} opponent={opponent} />

                </div>
            </div>
        </div>




    )
}
