import { NextResponse } from "next/server";
// No fulfillment webhook exists in this repository: do not accept unfulfillable payments.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Online checkout is unavailable. Contact LKC Media to arrange your purchase.",
    },
    { status: 503 },
  );
}
