import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MoveButtons from '@/components/clientMoves';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


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

    const { data: moves, error: errMv } = await supabase
        .from('moves')
        .select('*')
        .in('id', battle.moves) // Or eq('nft_id', id)
    if (errMv) {
        console.log("moves not found")
        notFound(); // Shows 404 if monster not found
    }
    console.log(moves)


    return (
        <MoveButtons battle={battle} player={player} opponent={opponent} moves={moves} />
    )
}
