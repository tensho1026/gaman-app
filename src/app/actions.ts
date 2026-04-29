"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { getDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

async function assertOwnedTarget(userId: string, targetId: string) {
  const target = await prisma.gamanTarget.findFirst({
    where: {
      id: targetId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!target) {
    throw new Error("Target not found");
  }
}

function readTargetName(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  return name.slice(0, 80);
}

function readCount(formData: FormData) {
  const count = Number.parseInt(String(formData.get("count") ?? "0"), 10);

  if (!Number.isFinite(count)) {
    return 0;
  }

  return Math.min(9999, Math.max(0, count));
}

export async function createTarget(formData: FormData) {
  const userId = await requireUserId();
  const name = readTargetName(formData);

  if (!name) {
    return;
  }

  await prisma.gamanTarget.create({
    data: {
      userId,
      name
    }
  });

  revalidatePath("/");
}

export async function incrementToday(targetId: string) {
  const userId = await requireUserId();
  await assertOwnedTarget(userId, targetId);

  const dateKey = getDateKey();

  await prisma.dailyCount.upsert({
    where: {
      targetId_dateKey: {
        targetId,
        dateKey
      }
    },
    create: {
      userId,
      targetId,
      dateKey,
      count: 1
    },
    update: {
      count: {
        increment: 1
      }
    }
  });

  revalidatePath("/");
}

export async function decrementToday(targetId: string) {
  const userId = await requireUserId();
  await assertOwnedTarget(userId, targetId);

  await prisma.dailyCount.updateMany({
    where: {
      userId,
      targetId,
      dateKey: getDateKey(),
      count: {
        gt: 0
      }
    },
    data: {
      count: {
        decrement: 1
      }
    }
  });

  revalidatePath("/");
}

export async function setTodayCount(formData: FormData) {
  const userId = await requireUserId();
  const targetId = String(formData.get("targetId") ?? "");
  const count = readCount(formData);

  await assertOwnedTarget(userId, targetId);

  const dateKey = getDateKey();

  if (count === 0) {
    await prisma.dailyCount.deleteMany({
      where: {
        userId,
        targetId,
        dateKey
      }
    });
  } else {
    await prisma.dailyCount.upsert({
      where: {
        targetId_dateKey: {
          targetId,
          dateKey
        }
      },
      create: {
        userId,
        targetId,
        dateKey,
        count
      },
      update: {
        count
      }
    });
  }

  revalidatePath("/");
}
