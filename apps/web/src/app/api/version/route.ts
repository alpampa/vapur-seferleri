import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Her derlemede benzersiz sürüm belirteci
const BUILD_TIMESTAMP =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.BUILD_ID ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  "vapur-build-20261023-1400";

export async function GET() {
  return NextResponse.json(
    {
      version: BUILD_TIMESTAMP,
      serverTime: new Date().toISOString(),
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
