import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
      },
      create: {
        endpoint: subscription.endpoint,
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
