import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import Categorie from "@/lib/models/Categorie";

type Granularity = "day" | "week" | "month";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Semaine calendaire commençant le lundi
function startOfWeek(d: Date) {
  const date = startOfDay(d);
  const day = date.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function getRange(granularity: Granularity, offset: number) {
  const now = new Date();
  if (granularity === "day") {
    const start = startOfDay(now);
    start.setDate(start.getDate() + offset);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  if (granularity === "week") {
    const start = startOfWeek(now);
    start.setDate(start.getDate() + offset * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

function formatLabel(granularity: Granularity, start: Date, end: Date) {
  if (granularity === "day") {
    return start.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  if (granularity === "week") {
    const last = new Date(end);
    last.setDate(last.getDate() - 1);
    const startStr = start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const endStr = last.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    return `Semaine du ${startStr} au ${endStr}`;
  }
  return start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const granularity = (searchParams.get("granularity") as Granularity) || "week";
    const rawOffset = parseInt(searchParams.get("offset") || "0", 10);

    if (!["day", "week", "month"].includes(granularity)) {
      return NextResponse.json({ error: "Granularité invalide" }, { status: 400 });
    }

    // On interdit de naviguer dans le futur au-delà de la période courante
    const offset = Math.min(Number.isNaN(rawOffset) ? 0 : rawOffset, 0);

    await connectDB();

    const { start, end } = getRange(granularity, offset);

    const [transactions, categories] = await Promise.all([
      Transaction.find({
        userId: session.user.id,
        date: { $gte: start, $lt: end },
      }).sort({ date: 1 }),
      Categorie.find({ userId: session.user.id }),
    ]);

    const categoryMap: Record<string, { colorHex: string; icon: string }> = {};
    categories.forEach((c) => {
      categoryMap[c._id.toString()] = { colorHex: c.colorHex, icon: c.icon };
    });
    const categoryNameById: Record<string, string> = {};
    categories.forEach((c) => { categoryNameById[c._id.toString()] = c.name; });
    const resolveCategoryKey = (t: { categorieId?: unknown; category: string }) =>
      t.categorieId ? String(t.categorieId) : `legacy:${t.category}`;

    let bucketCount: number;
    let bucketLabels: string[];
    let getBucketIndex: (d: Date) => number;

    if (granularity === "day") {
      bucketCount = 24;
      bucketLabels = Array.from({ length: 24 }, (_, i) => `${i}h`);
      getBucketIndex = (d) => d.getHours();
    } else if (granularity === "week") {
      bucketCount = 7;
      bucketLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      getBucketIndex = (d) => {
        const day = d.getDay();
        return day === 0 ? 6 : day - 1;
      };
    } else {
      bucketCount = Math.round((end.getTime() - start.getTime()) / 86400000);
      bucketLabels = Array.from({ length: bucketCount }, (_, i) => String(i + 1));
      getBucketIndex = (d) => d.getDate() - 1;
    }

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      label: bucketLabels[i],
      revenus: 0,
      depenses: 0,
    }));

    const categoryTotals: Record<string, number> = {};
    let revenusTotal = 0;
    let depensesTotal = 0;
    let depensesCount = 0;

    transactions.forEach((t) => {
      const idx = getBucketIndex(new Date(t.date));
      if (t.amount > 0) {
        buckets[idx].revenus += t.amount;
        revenusTotal += t.amount;
      } else {
        const abs = Math.abs(t.amount);
        buckets[idx].depenses += abs;
        depensesTotal += abs;
        depensesCount += 1;
        const key = resolveCategoryKey(t);
        categoryTotals[key] = (categoryTotals[key] || 0) + abs;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([key, amount]) => ({
        name: categoryNameById[key] || key.replace(/^legacy:/, ""),
        amount: Math.round((amount as number) * 100) / 100,
        colorHex: categoryMap[key]?.colorHex || "#64748B",
        icon: categoryMap[key]?.icon || "🏷️",
      }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      granularity,
      offset,
      label: formatLabel(granularity, start, end),
      canGoNext: offset < 0,
      rangeStart: start.toISOString(),
      rangeEnd: end.toISOString(),
      totals: {
        revenus: Math.round(revenusTotal * 100) / 100,
        depenses: Math.round(depensesTotal * 100) / 100,
        solde: Math.round((revenusTotal - depensesTotal) * 100) / 100,
        count: transactions.length,
        depensesCount,
      },
      buckets,
      categoryBreakdown,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
