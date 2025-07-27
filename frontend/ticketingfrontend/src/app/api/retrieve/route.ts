
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabase";

export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabase.from("Tickets").select()

        if (error) {
            throw error
        }

        return NextResponse.json({ payload: data, status: 200 })
    } catch (error) {
        console.log("Error occured: ", error)

    }

}