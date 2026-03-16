"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  return await prisma.account.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function addAccount(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    throw new Error("Invalid input");
  }

  await prisma.account.create({
    data: { email },
  });

  revalidatePath("/");
}

export async function setClaudeCooldown(id: string, hours: number, minutes: number, quotaAvailable?: boolean) {
  const nextRefresh = new Date();
  nextRefresh.setMinutes(nextRefresh.getMinutes() + minutes);
  nextRefresh.setHours(nextRefresh.getHours() + hours);

  await prisma.account.update({
    where: { id },
    data: { 
      claudeNextRefresh: nextRefresh,
      ...(quotaAvailable !== undefined && { claudeQuotaAvailable: quotaAvailable })
    },
  });
  revalidatePath("/");
}

export async function setGeminiCooldown(id: string, hours: number, minutes: number, quotaAvailable?: boolean) {
  const nextRefresh = new Date();
  nextRefresh.setMinutes(nextRefresh.getMinutes() + minutes);
  nextRefresh.setHours(nextRefresh.getHours() + hours);

  await prisma.account.update({
    where: { id },
    data: { 
      geminiNextRefresh: nextRefresh,
      ...(quotaAvailable !== undefined && { geminiQuotaAvailable: quotaAvailable }) 
    },
  });
  revalidatePath("/");
}



export async function deleteAccount(id: string) {
  await prisma.account.delete({
    where: { id },
  });
  revalidatePath("/");
}
