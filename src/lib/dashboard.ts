import { daysInclusive, formatDateLabel, getDateKey, getRecentDateKeys } from "@/lib/date";
import { prisma } from "@/lib/prisma";

const HISTORY_LENGTH = 30;

export async function getDashboardData(userId: string) {
  const todayKey = getDateKey();
  const historyKeys = getRecentDateKeys(todayKey, HISTORY_LENGTH);

  const targets = await prisma.gamanTarget.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      dailyCounts: {
        where: {
          dateKey: {
            in: historyKeys
          }
        },
        orderBy: {
          dateKey: "desc"
        }
      }
    }
  });

  const targetIds = targets.map((target) => target.id);
  const totals = targetIds.length
    ? await prisma.dailyCount.groupBy({
        by: ["targetId"],
        where: {
          userId,
          targetId: {
            in: targetIds
          }
        },
        _sum: {
          count: true
        }
      })
    : [];

  const totalsByTarget = new Map(
    totals.map((total) => [total.targetId, total._sum.count ?? 0])
  );

  const targetSummaries = targets.map((target) => {
    const countsByDate = new Map(
      target.dailyCounts.map((record) => [record.dateKey, record.count])
    );
    const createdDateKey = getDateKey(target.createdAt);
    const trackedDays = daysInclusive(createdDateKey, todayKey);
    const total = totalsByTarget.get(target.id) ?? 0;

    return {
      id: target.id,
      name: target.name,
      createdDateKey,
      trackedDays,
      todayCount: countsByDate.get(todayKey) ?? 0,
      total,
      dailyAverage: total / trackedDays,
      countsByDate
    };
  });

  const firstDateKey = targetSummaries[0]?.createdDateKey ?? todayKey;
  const overallTrackedDays = daysInclusive(firstDateKey, todayKey);
  const overallTotal = targetSummaries.reduce((sum, target) => sum + target.total, 0);

  return {
    todayKey,
    todayLabel: formatDateLabel(todayKey),
    historyKeys,
    historyLabels: new Map(historyKeys.map((key) => [key, formatDateLabel(key)])),
    targets: targetSummaries,
    overall: {
      total: overallTotal,
      dailyAverage: targetSummaries.length ? overallTotal / overallTrackedDays : 0,
      trackedDays: targetSummaries.length ? overallTrackedDays : 0
    }
  };
}
