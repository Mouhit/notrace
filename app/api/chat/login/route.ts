import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/chat/login
 * Login with username and password
 * Returns: username, publicKey, isEncrypted (if needs passphrase recovery)
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch user profile
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("username, password_hash, public_key, encrypted_private_key, key_salt, key_iterations")
      .eq("username", username)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password (simple base64 comparison - use bcrypt in production!)
    const providedPasswordHash = Buffer.from(password).toString("base64");
    if (providedPasswordHash !== profile.password_hash) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Check if encrypted key exists (new system with passphrase recovery)
    const hasEncryptedKey = Boolean(profile.encrypted_private_key && profile.key_salt);

    // Login successful
    return NextResponse.json({
      success: true,
      username: profile.username,
      publicKey: profile.public_key,
      // NEW: Flag to indicate if client needs to handle passphrase recovery
      requiresPassphraseRecovery: hasEncryptedKey,
      // NEW: Salt needed for client-side key derivation (if implementing it)
      keySalt: hasEncryptedKey ? profile.key_salt : null,
      keyIterations: hasEncryptedKey ? profile.key_iterations : null,
      message: "Login successful",
    });
  } catch (error) {
    console.error("POST /api/chat/login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
