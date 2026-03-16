import webpush from "web-push";
import { prisma } from "./lib/prisma";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("Setting up node-cron Push Notification loop...");
    
    // We import dynamically to avoid Next.js edge runtime issues
    const cron = await import("node-cron");
    
    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
          console.warn("VAPID keys missing in environment, skipping push loop.");
          return;
        }

        webpush.setVapidDetails(
          "mailto:admin@aicredittracker.local",
          process.env.VAPID_PUBLIC_KEY as string,
          process.env.VAPID_PRIVATE_KEY as string
        );
        const now = new Date();

        // 1. Process Claude accounts where cooldown has expired but quota is still false
        const expiredClaude = await prisma.account.findMany({
          where: {
            claudeQuotaAvailable: false,
            claudeNextRefresh: { lte: now }
          }
        });

        // 2. Process Gemini accounts where cooldown has expired but quota is still false
        const expiredGemini = await prisma.account.findMany({
          where: {
            geminiQuotaAvailable: false,
            geminiNextRefresh: { lte: now }
          }
        });

        if (expiredClaude.length === 0 && expiredGemini.length === 0) return;

        // Check overall state *before* we update (to detect 'empty to active' transition)
        const claudeActiveCount = await prisma.account.count({ where: { claudeQuotaAvailable: true }});
        const geminiActiveCount = await prisma.account.count({ where: { geminiQuotaAvailable: true }});

        // Update the database records natively
        for (const account of expiredClaude) {
          await prisma.account.update({
            where: { id: account.id },
            data: { claudeQuotaAvailable: true, claudeNextRefresh: null }
          });
        }
        
        for (const account of expiredGemini) {
          await prisma.account.update({
            where: { id: account.id },
            data: { geminiQuotaAvailable: true, geminiNextRefresh: null }
          });
        }

        // Logic Check: Did this update strictly transition the system from 0 to 1+ active accounts?
        // Let's fetch all PushSubscriptions if either model just became usable from a dead state
        let sendClaudeAlert = expiredClaude.length > 0 && claudeActiveCount === 0;
        let sendGeminiAlert = expiredGemini.length > 0 && geminiActiveCount === 0;

        if (!sendClaudeAlert && !sendGeminiAlert) return;

        const subs = await prisma.pushSubscription.findMany();
        if (subs.length === 0) return;

        console.log(`Sending Web Push alerts. Claude unlock: ${sendClaudeAlert}, Gemini unlock: ${sendGeminiAlert}`);

        for (const sub of subs) {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: { auth: sub.auth, p256dh: sub.p256dh }
          };

          if (sendClaudeAlert) {
            await webpush.sendNotification(pushConfig, JSON.stringify({
              title: "AI Credit Tracker",
              body: `Claude is available again\nAccount: ${expiredClaude[0].email}`
            })).catch(err => console.error("Push Error (Claude):", err));
          }

          if (sendGeminiAlert) {
            await webpush.sendNotification(pushConfig, JSON.stringify({
              title: "AI Credit Tracker",
              body: `Gemini is available again\nAccount: ${expiredGemini[0].email}`
            })).catch(err => console.error("Push Error (Gemini):", err));
          }
        }
      } catch (err) {
        console.error("Cron Error", err);
      }
    });
  }
}
