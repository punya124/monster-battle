import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


export async function GET(request: NextRequest) {
    const body = await request.json();
    const {attack_id1, attack_id2, player, opp, monster1, monster2} = body;

    // const attack_id1:number  = 1;
    // const attack_id2:number  = 3;

    // const player = {health: 50, energy: 20}
    // const opp = {health: 40, energy: 20}

    // const monster1: number = 1;
    // const monster2: number = 2;

    // Query both IDs in one request
    const { data: moves, error: errMoves } = await supabase
        .from('moves')
        .select('*')
        .in('id', [attack_id1, attack_id2]); // fetch where id is in [1, 3]

    if (errMoves) {
        console.error('Supabase error:', errMoves.message);
        return NextResponse.json({ error: errMoves.message }, { status: 500 });
    }
    
    const { data: monsters, error: errMons } = await supabase
        .from('monsters')
        .select('*')
        .in('id', [monster1, monster2]); // fetch where id is in [1, 3]

    if (errMons) {
        console.error('Supabase error:', errMons.message);
        return NextResponse.json({ error: errMons.message }, { status: 500 });
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
    if (monsters[0].speed > monsters[1].speed) {
        res.first = 1; // Monster 0 is faster
    } else if (monsters[1].speed > monsters[0].speed) {
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

    const type0 = monsters[0].type; 
    const type1 = monsters[1].type; 

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


    res.player.health = player.health-(mult0*monsters[1].attack*moves[1].attack_mulitplier)/monsters[0].health;
    res.opp.health = opp.health-(mult1*monsters[0].attack*moves[0].attack_mulitplier)/monsters[1].health;

    res.player.energy = player.energy-moves[0].energy_cost;
    res.opp.energy = opp.energy-moves[1].energy_cost;

    return NextResponse.json(res, { status: 200 });

}