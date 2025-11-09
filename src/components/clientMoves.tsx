'use client';
import { createClient } from '@supabase/supabase-js';
import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { HealthBar } from './ui/HealthBar';
import WinLosePopup from './WinLosePopup';
import AttackPopups from '@/components/AttackPopups';
import StaticBackground from './StaticBackgrounds';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MoveButtonsProps {
    battle: any;
    player: any;
    opponent: any;
    moves: any;
}

export default function MoveButtons({ battle, player, opponent, moves }: MoveButtonsProps) {

    const [battleData, setBattleData] = useState(battle);
    const [playerHealth, setPlayerHealth] = useState(battle.player_health);
    const [opponentHealth, setOpponentHealth] = useState(battle.opp_health);
    const [popup, setPopup] = useState<null | { move: any; damage: number; receiver: 'p' | 'o'; id: number }>(null);

    useEffect(() => {
        setBattleData(battle);
    }, [playerHealth, opponentHealth]);


    function calculateDamage(attack_move: any, attacker: any, defense_move: any, defender: any): number {
        const adv: any = {
            "Fairy": "Fight",
            "Fight": "Fright",
            "Fright": "Fairy"
        }

        let type_mult: number = 1;
        if (attack_move == "Neutral" || adv[defender.type] == "Neutral") {
            type_mult = 1;
        } else if (adv[attack_move.type] === defender.type) {
            console.log(adv[attack_move.type] + " " + defender.type)
            type_mult = 2;

        } else if (adv[defender.type] === attack_move.type) {
            type_mult = 0.5
        }
        console.log(attack_move.type);
        console.log(adv[attack_move.type] + " " + defender.type);
        console.log("Attacker: " + attack_move.type + " Defender:  " + defender.type + " -> " + type_mult)
        const damage = (attack_move.attack_multiplier * attacker.attack * type_mult) / (defense_move.defense_multiplier * defender.defense)
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

    const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    async function runMove(moveId: number): Promise<void> {
        const opp_move = getRandomInt(1, 30)


        const { data: move_data, error: errMove } = await supabase
            .from('moves')
            .select('*')
            .in('id', [moveId, opp_move]);

        if (errMove) {
            console.log("moves not found");
        }

        if (move_data) {

            console.log(move_data)

            const pcm = move_data.find(move => move.id === moveId);
            const ocm = move_data.find(move => move.id === opp_move);


            if (pcm && ocm) {
                const opponentDamage = calculateDamage(pcm, player, ocm, opponent);
                const playerDamage = calculateDamage(ocm, opponent, pcm, player);

                if (pcm.speed * player.speed <= ocm.speed * opponent.speed) {
                    if (await setPlayerDB(playerDamage, pcm.energy_cost) > 0) {
                        setOppDB(opponentDamage, ocm.energy)
                    }

                    // when player gets hit:
                    setPopup({ move: ocm, damage: playerDamage, receiver: 'p', id: Date.now() });

                    await wait(2500); // let popup animate

                    setPlayerHealth(playerHealth - playerDamage);
                    if (playerHealth > 0) {
                        setOpponentHealth(opponentHealth - opponentDamage);
                    }
                    // when opponent gets hit:
                    setPopup({ move: pcm, damage: opponentDamage, receiver: 'o', id: Date.now() });


                }
                else {
                    if (await setOppDB(opponentDamage, ocm.energy_cost) > 0) {
                        setPlayerDB(playerDamage, pcm.energy)
                    }

                    // when opponent gets hit:
                    setPopup({ move: pcm, damage: opponentDamage, receiver: 'o', id: Date.now() });

                    await wait(2500); // let popup animate

                    setOpponentHealth(opponentHealth - opponentDamage);
                    if (playerHealth > 0) {
                        setPlayerHealth(playerHealth - playerDamage);
                    }

                    // when player gets hit:
                    setPopup({ move: ocm, damage: playerDamage, receiver: 'p', id: Date.now() });


                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden outli">
            {/* Opponent Section */}
            <div className={[
                "h-100 w-100 rounded-full bg-black absolute -right-16 -top-16 overflow-hidden flex items-end-safe justify-center",
                // valid z-index utility
                "z-10",
                // outline color by player.type
                opponent.type === "Fight"
                    ? "outline outline-2 outline-red-500"
                    : opponent.type === "Fairy"
                        ? "outline outline-2 outline-pink-500"
                        : opponent.type === "Fright"
                            ? "outline outline-2 outline-purple-950"
                            : "outline outline-2 outline-white", // Neutral / default
            ].join(" ")}
            >
                <img
                    src={opponent.image_url}
                    alt={opponent.name}
                    className="h-3/4 w-auto object-cover m-1"
                />
            </div>
            <div className="w-1/2 h-64 rounded-4xl bg-gray-800 absolute right-0 -top-8 z-1 p-4 pr-[25%] flex flex-col gap-4 justify-center">
                <h2 className="text-white text-3xl font-semibold pl-8">{opponent.name}</h2>

                <div className="grid grid-cols-3 gap-4">
                    {/* Item 1 */}
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl font-bold leading-none">{opponent.attack}</span>
                        <span className="text-xs uppercase tracking-widest mt-1">ATK</span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl font-bold leading-none">{opponent.defense}</span>
                        <span className="text-xs uppercase tracking-widest mt-1">DEF</span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl font-bold leading-none">{opponent.speed}</span>
                        <span className="text-xs uppercase tracking-widest mt-1">SPD</span>
                    </div>
                </div>
                <HealthBar hp={opponentHealth} maxhp={battle.opp_health} className="max-w-lg" />
            </div>

            {/* Player Section */}
            <div
                className={[
                    "h-100 w-100 rounded-full bg-black absolute left-[-4rem] bottom-[-4rem] overflow-hidden flex items-start justify-center",
                    // valid z-index utility
                    "z-10",
                    // outline color by player.type
                    player.type === "Fight"
                        ? "outline outline-2 outline-red-500"
                        : player.type === "Fairy"
                            ? "outline outline-2 outline-pink-500"
                            : player.type === "Fright"
                                ? "outline outline-2 outline-purple-950"
                                : "outline outline-2 outline-white", // Neutral / default
                ].join(" ")}
            >
                <img
                    src={player.image_url}
                    alt={player.name}
                    className="h-3/4 w-auto object-cover m-1"
                />
            </div>

            <div className="w-1/2 h-64 rounded-4xl bg-gray-800 absolute left-0 -bottom-8 z-1 p-4 pl-[25%] flex flex-col gap-4 justify-center">
                <h2 className="text-white text-3xl font-semibold pl-8">{player.name}</h2>

                <div className="grid grid-cols-3 gap-4">
                    {/* Item 1 */}
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl font-bold leading-none">{player.attack}</span>
                        <span className="text-xs uppercase tracking-widest mt-1">ATK</span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl font-bold leading-none">{player.defense}</span>
                        <span className="text-xs uppercase tracking-widest mt-1">DEF</span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col items-center justify-center text-white">
                        <span className="text-xl font-bold leading-none">{player.speed}</span>
                        <span className="text-xs uppercase tracking-widest mt-1">SPD</span>
                    </div>
                </div>
                <HealthBar hp={playerHealth} maxhp={battle.player_health} className="max-w-lg" />
            </div>
            <div className="h-3/4 w-80 rounded-4xl bg-gray-800 absolute -left-8 bottom-0 z-1 p-4 pb-[25%] items-center">

                <div className="flex flex-col space-y-3 ml-2">
                    {moves.slice(0, 3).map((m: { type: string; id: any; name: string; }, i: number) => {
                        // Inline outline color based on type
                        const outline =
                            m.type === "Fight"
                                ? "outline outline-2 outline-red-500"
                                : m.type === "Fairy"
                                    ? "outline outline-2 outline-pink-300"
                                    : m.type === "Fright"
                                        ? "outline outline-2 outline-purple-950"
                                        : "outline outline-2 outline-white"; // Neutral or fallback

                        return (
                            <button
                                key={m.id ?? m.name ?? i}
                                onClick={() => runMove(m.id)}
                                className={[
                                    "px-5 py-2 m-6 rounded-xl",
                                    "bg-transparent text-white", // no background, white text
                                    outline, // inline computed outline
                                    "hover:scale-105 transition-transform duration-200",
                                    "focus:outline-offset-2",
                                ].join(" ")}
                            >
                                {m.name}
                            </button>
                        );
                    })}
                </div>
            </div>
            {popup && (
                <>
                    <h2>{popup.move.name} was used!</h2>
                    <AttackPopups
                        key={popup.id}
                        move={popup.move}
                        damage={popup.damage}
                        receiver={popup.receiver}
                    />
                </>
            )}
            {
                playerHealth <= 0 && (
                    <WinLosePopup
                        imageUrl={player.image_url}
                        name={player.name}
                        result='lose'
                    />
                )
            }
            {
                opponentHealth <= 0 && (
                    <WinLosePopup
                        imageUrl={player.image_url}
                        name={player.name}
                        result='win'
                    />
                )
            }
        </div>
    );
}