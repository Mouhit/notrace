import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { encryptPrivateKey, generateSalt } from "@/lib/chat/passphrase";

/**
 * POST /api/chat/register
 * Register with passphrase-based key recovery
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password, passphrase, publicKey, privateKey } = await req.json();

    if (!username || !password || !passphrase || !publicKey || !privateKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (passphrase.length < 12) {
      return NextResponse.json({ error: "Passphrase must be at least 12 characters" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const salt = await generateSalt();
    const iterations = 100000;

    const encryptedKey = await encryptPrivateKey(privateKey, passphrase, salt, iterations);

    const passwordHash = Buffer.from(password).toString("base64");

    const { error: insertError } = await supabase.from("profiles").insert({
      username,
      password_hash: passwordHash,
      public_key: publicKey,
      encrypted_private_key: encryptedKey,
      key_salt: salt,
      key_iterations: iterations,
    });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      username,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
