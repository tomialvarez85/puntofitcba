import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API base de Punto Fit CBA",
  });
}
