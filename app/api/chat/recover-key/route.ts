import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { decryptPrivateKey } from "@/lib/chat/passphrase";

/**
 * POST /api/chat/recover-key
 * Recover private key using passphrase on new device
 */
export async function POST(req: NextRequest) {
  try {
    const { username, passphrase } = await req.json();

    if (!username || !passphrase) {
      return NextResponse.json({ error: "Username and passphrase required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch encrypted key data from database
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("encrypted_private_key, key_salt, key_iterations")
      .eq("username", username)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!profile.encrypted_private_key || !profile.key_salt) {
      return NextResponse.json({ error: "No recovery data found. Please register again." }, { status: 400 });
    }

    // Decrypt private key using passphrase
    try {
      const decryptedKey = await decryptPrivateKey(
        profile.encrypted_private_key,
        passphrase,
        profile.key_salt,
        profile.key_iterations || 100000
      );

      // Log recovery attempt
      await supabase.from("key_recovery_attempts").insert({
        username,
        success: true,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        privateKey: decryptedKey,
        message: "Private key recovered successfully",
      });
    } catch (decryptError) {
      // Log failed attempt
      await supabase.from("key_recovery_attempts").insert({
        username,
        success: false,
        error_reason: "Decryption failed - incorrect passphrase",
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 });
    }
  } catch (error) {
    console.error("POST /api/chat/recover-key error:", error);
    return NextResponse.json({ error: "Failed to recover key" }, { status: 500 });
  }
}
