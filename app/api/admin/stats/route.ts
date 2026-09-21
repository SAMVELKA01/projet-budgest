import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import Budget from "@/lib/models/Budget";
import Objectif from "@/lib/models/Objectif";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const [
      totalUsers,
      totalTransactions,
      totalBudgets,
      totalObjectifs,
      recentUsers,
      totalAmount,
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      Objectif.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
      Transaction.aggregate([
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } }
      ]),
    ]);

    // Évolution sur les 7 derniers jours (exemple simple)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTransactions,
        totalBudgets,
        totalObjectifs,
        totalVolume: totalAmount[0]?.total || 0,
      },
      recentUsers,
      dailyStats,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
