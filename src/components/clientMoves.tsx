'use client';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MoveButtonsProps {
    battle: any;
    player: any;
    opponent: any;
}

export default function MoveButtons({ battle, player, opponent }: MoveButtonsProps) {

    const [battleData, setBattleData] = useState(battle);
    const [playerHealth, setPlayerHealth] = useState(battle.player_health);
    const [opponentHealth, setOpponentHealth] = useState(battle.opp_health)

    useEffect(() => {
        console.log(player, opponent)
        setBattleData(battle);
        console.log(playerHealth, opponentHealth)
    }, [playerHealth, opponentHealth]);

    function calculateDamage(attack_move: any, attacker: any, defense_move: any, defender: any): number {
        const damage = (attack_move.attack_multiplier * attacker.attack) / (defense_move.defense_multiplier * defender.defense)
        return Math.round(damage * 10);
    }

    async function setPlayerDB(playerDamage: number, energy: number) {
        const { data, error } = await supabase
            .from('battles')
            .update({
                // an object with the new values
                player_health: playerHealth - playerDamage,
                player_energy: battleData.player_energy - energy
            })
            .eq('id', battle.id) // specify the row to update, for example, where id is 123
            .select('player_health');

        if (error) {
            console.error('Error updating row:', error);
        } else {
            console.log('Row updated successfully:', data);
        }
        return playerHealth - playerDamage;
    }

    async function setOppDB(opponentDamage: number, energy: number) {
        const { data, error } = await supabase
            .from('battles')
            .update({
                // an object with the new values
                opp_health: opponentHealth - opponentDamage,
                opp_energy: battleData.opp_energy - energy
            })
            .eq('id', battle.id) // specify the row to update, for example, where id is 123
            .select('opp_health');

        if (error) {
            console.error('Error updating row:', error);
        } else {
            console.log('Row updated successfully:', data);
        }
        return opponentHealth - opponentDamage;
    }

    function getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        // The maximum is inclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async function runMove(moveNo: number): Promise<void> {
        const opp_move = getRandomInt(1, 30)


        const { data: move_data, error: errMove } = await supabase
            .from('moves')
            .select('*')
            .in('id', [battle.moves[moveNo], opp_move]);

        if (errMove) {
            console.log("moves not found");
        }

        if (move_data) {

            console.log(move_data)

            const pcm = move_data.find(move => move.id === battle.moves[moveNo]);
            const ocm = move_data.find(move => move.id === opp_move);

            console.log(pcm)
            console.log(ocm)


            if (pcm && ocm) {
                const opponentDamage = calculateDamage(pcm, player, ocm, opponent);
                const playerDamage = calculateDamage(ocm, opponent, pcm, player);
                console.log(opponentDamage)
                console.log(playerDamage)
                if (pcm.speed * player.speed <= ocm.speed * opponent.speed) {
                    if (await setPlayerDB(playerDamage, pcm.energy_cost) > 0) {
                        setOppDB(opponentDamage, ocm.energy)
                    }

                    setPlayerHealth(playerHealth - playerDamage);
                    if (playerHealth > 0) {
                        setOpponentHealth(opponentHealth - opponentDamage);
                    }


                }
                else {
                    if (await setOppDB(opponentDamage, ocm.energy_cost) > 0) {
                        setPlayerDB(playerDamage, pcm.energy)
                    }


                    setOpponentHealth(opponentHealth - opponentDamage);
                    if (playerHealth > 0) {
                        setPlayerHealth(playerHealth - playerDamage);
                    }

                }
            }
        }
    }

    return (
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



