import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


export async function GET(request: NextRequest) {
    //const body = await request.json();
    //const {p1_id, attack_id1, monster1, p2id, attack_id2, monster2} = body;

    const attack_id1:number  = 1;
    const attack_id2:number  = 3;

    const p1_id:string = "12345A";
    const p2_id:string = "12345B";

    // Query both IDs in one request
    const { data: moves, error: errMoves } = await supabase
        .from('moves')
        .select('*')
        .in('id', [attack_id1, attack_id2]); // fetch where id is in [1, 3]

    if (errMoves) {
        console.error('Supabase error:', errMoves.message);
        return NextResponse.json({ error: errMoves.message }, { status: 500 });
    }
    

    
    console.log(moves);
    return NextResponse.json(moves, { status: 200 });

}