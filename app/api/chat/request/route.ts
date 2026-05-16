import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * POST /api/chat/request
 * User sends chat request to another user
 * GET /api/chat/request?username=bob
 * Get all pending requests for a user
 */

export async function POST(req: NextRequest) {
  try {
    const { requester, recipient } = await req.json();

    if (!requester || !recipient) {
      return NextResponse.json({ error: "Missing requester or recipient" }, { status: 400 });
    }

    if (requester === recipient) {
      return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if recipient exists
    const { data: userExists } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", recipient)
      .single();

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already chatting
    const { data: activeChat } = await supabase
      .from("active_chats")
      .select("id")
      .or(`and(user1.eq.${requester},user2.eq.${recipient}),and(user1.eq.${recipient},user2.eq.${requester})`)
      .eq("status", "connected")
      .single();

    if (activeChat) {
      return NextResponse.json({ error: "Already chatting with this user" }, { status: 409 });
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from("chat_requests")
      .select("id")
      .eq("requester", requester)
      .eq("recipient", recipient)
      .eq("status", "pending")
      .single();

    if (existingRequest) {
      return NextResponse.json({ error: "Request already sent" }, { status: 409 });
    }

    // Create new request
    const { data: newRequest, error: insertError } = await supabase
      .from("chat_requests")
      .insert({
        requester,
        recipient,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      message: "Chat request sent successfully",
    });
  } catch (error) {
    console.error("POST /api/chat/request error:", error);
    return NextResponse.json({ error: "Failed to send chat request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get all pending requests for this user
    const { data: requests, error } = await supabase
      .from("chat_requests")
      .select("id, requester, recipient, status, created_at")
      .eq("recipient", username)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      requests: requests || [],
      count: requests?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/chat/request error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
