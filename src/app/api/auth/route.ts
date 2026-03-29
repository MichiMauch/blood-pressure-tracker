import { NextRequest } from "next/server";
import { checkCredentials, signToken, COOKIE_NAME, MAX_AGE } from "@/lib/auth";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const valid = await checkCredentials(username, password);
  if (!valid) {
    return Response.json(
      { error: "Ungueltige Anmeldedaten" },
      { status: 401 }
    );
  }

  const token = await signToken(`user:${username}:${Date.now()}`);

  const secure = IS_PROD ? "; Secure" : "";
  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`
  );

  return response;
}

export async function DELETE() {
  const secure = IS_PROD ? "; Secure" : "";
  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
  return response;
}
