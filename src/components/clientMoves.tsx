'use client';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MoveButtonsProps {
  battle: any;
  player: any;
  opponent: any;
}

export default function MoveButtons({ battle, player, opponent }: MoveButtonsProps) {
  const monMoves = () =>{
        const ranges = [
            [0, 10],
            [11, 20],
            [21, 30],
        ];
        return ranges.map(([min, max]) =>
        Math.floor(Math.random() * (max - min + 1)) + min);
    }
  const calcData = async (attack_id1: number, attack_id2: number, player: any, opp: any, monster1: number, monster2: number) =>{
        const { data: moves, error: errMoves }: any = await supabase
                .from('moves')
                .select('*')
                .in('id', [attack_id1, attack_id2]); // fetch where id is in [1, 3]
        
            if (errMoves) {
                console.error('Supabase error:', errMoves.message);
            }
        
            const { data: mon1, error: errPl } = await supabase
                    .from('monsters')
                    .select('*')
                    .eq('id', monster1) // Or eq('nft_id', id)
                    .single();
                if (errPl) {
                    console.error('Supabase error:', errPl.message);
            }
            const { data: mon2, error: errOpp } = await supabase
                    .from('monsters_enemies')
                    .select('*')
                    .eq('id', monster2) // Or eq('nft_id', id)
                    .single();
                if (errOpp) {
                    console.error('Supabase error:', errOpp.message);
            }
        
        
            
        
        
            const res ={
                player:{
                    health:0,
                    energy:0
                },
                opp:{
                    health: 0,
                    energy:0
                },
                first:1
            }
        
            // Rule 1: Defense Priority Check
            if (moves[0].isDefense && !moves[1].isDefense) {
                // Monster 0 has defense, Monster 1 does not: Monster 0 goes first (res.first = 1)
                res.first = 1;
            } else if (!moves[0].isDefense && moves[1].isDefense) {
                // Monster 1 has defense, Monster 0 does not: Monster 1 goes first (res.first = 0)
                res.first = 0;
            } 
            // Rule 2: Defense Tiebreaker (Both defense OR neither defense)
            else {
            // Defense status is the same (moves[0].isDefense === moves[1].isDefense)
            // The faster monster goes first.
            if (mon1.speed > mon2.speed) {
                res.first = 1; // Monster 0 is faster
            } else if (mon2.speed > mon1.speed) {
                res.first = 0; // Monster 1 is faster
            } else {
                // Speeds are equal (tie). You'll need a rule for this (e.g., random or Monster 0 goes first).
                res.first = 1; // Default to Monster 0 for tie
            }
        }
        
        
            // Define the rock-paper-scissors relationships: 
            // Key (Attacker) is Super Effective against Value (Defender)
            const weaknesses: Record<string, string> = {
                'Fairy': 'Fight',
                'Fight': 'Fright',
                'Fright': 'Fairy'
            };
        
            const type0 = mon1.type; 
            const type1 = mon2.type; 
        
            let mult0 = 1.0; 
            let mult1 = 1.0; 
        
            if (weaknesses[type0] === type1) {
                mult0 = 2.0; 
            } 
            else if (weaknesses[type1] === type0) {
                mult0 = 0.5;
            }
        
        
            if (weaknesses[type1] === type0) {
                mult1 = 2.0; 
            } 
            else if (weaknesses[type0] === type1) {
                mult1 = 0.5;
            }
        
        
            res.player.health = player.health-(mult0*mon2.attack*moves[1].attack_mulitplier)/mon1.health;
            res.opp.health = opp.health-(mult1*mon1.attack*moves[0].attack_mulitplier)/mon2.health;
        
            res.player.energy = player.energy-moves[0].energy_cost;
            res.opp.energy = opp.energy-moves[1].energy_cost;
        
            return res;
        
    }
  const runMove = async (attack: number) => {
    console.log(calcData(battle.moves[attack], monMoves()[0], 
        {health: battle.player_health, energy:battle.player_energy},
        {health: battle.opp_health, energy:battle.opp_energy},
        player,
        opponent
    ));
    
    // try {
    //   const response = await fetch('/api/combat', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       attack_id1: battle.moves[attack],
    //       attack_id2: monMoves(),
    //       player:{health: battle.player_health, energy:battle.player_energy},
    //       opp:{health: battle.opp_health, energy:battle.opp_energy},
    //       monster1: player,
    //       monster2:opponent
    //     }),
    //   });

    //   const result = await response.json();
    //   alert(JSON.stringify(result));
    // } catch (error) {
    //   console.error('Combat API failed:', error);
    //   alert('Failed to call combat API.');
    // }
  };

  return (
    // <div className="flex flex-col space-y-3 mr-6">
    //   {player.moves.slice(0, 3).map((move: string, index: number) => (
    //     <button
    //       key={index}
    //       onClick={() => runMove(index)}
    //       className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
    //     >
    //       {move || `Move ${index + 1}`}
    //     </button>
    //   ))}
    // </div>
    <div className="flex flex-col space-y-3 mr-6">
      <button 
        onClick={() => runMove(0)}
        className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
        >
        Move 1
                        </button>
                        <button 
                        onClick={() => runMove(1)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-red-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
                            Move 2
                        </button>
                        <button 
                        onClick={() => runMove(2)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
                            Move 3
                        </button>
                    </div>    
  );
}
