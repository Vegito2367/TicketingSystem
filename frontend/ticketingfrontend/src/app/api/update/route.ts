
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabase";
import { TicketProps } from "@/app/page";

export async function POST(request: NextRequest) {
    const body: TicketProps = await request.json()
    console.log("IN POST REQ")
    try {
        const { data, error } = await supabase.from("Tickets").update(
            {description: body.description}
        ).eq("id",body.id)
        
        console.log(data)
        if (error) {
            throw error
        }

        return NextResponse.json({status:200})
    } catch (error) {
        console.log("Error occured: ", error)
        return NextResponse.json({status: 500})
    }

}