import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Aggregate last 7 days of spending
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const spendByDay = await Transaction.aggregate([
      {
        $match: {
          userId: (session.user as any).id,
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$price" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format for Recharts
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = spendByDay.map(d => {
      const date = new Date(d._id);
      return {
        day: days[date.getDay()],
        price: d.total,
        fullDate: d._id
      };
    });

    // Pad if less than 7 days
    const totalSpend = spendByDay.reduce((acc, curr) => acc + curr.total, 0);

    return NextResponse.json({ 
      chartData, 
      totalSpend, 
      count: spendByDay.length 
    });
  } catch (error) {
    console.error("Error fetching spending stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
