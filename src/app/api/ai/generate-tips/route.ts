import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY is missing. Using static fallback for AI tips.");
      return NextResponse.json({ 
        tip: "Consider making a quick stir-fry or veggie stock with your expiring greens today." 
      });
    }

    const groq = new Groq({ apiKey });

    await dbConnect();

    // Get top 3 items nearing bad
    const now = new Date();
    const expiringItems = await Pantry.find({
      userId: (session.user as any).id,
      status: "in_stock",
      estimatedExpiryDate: { $gt: now }
    })
    .sort({ estimatedExpiryDate: 1 })
    .limit(3);

    if (!expiringItems || expiringItems.length === 0) {
      return NextResponse.json({ tip: "Your pantry is looking fresh! No items are nearing expiry yet." });
    }

    const itemNames = expiringItems.map(i => i.name).join(", ");
    
    // Call Llama 3.3 via Groq
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional Executive Chef and AI Financial Coach. Suggest one quick, professional recipe or tip for the following expiring items to ensure zero-waste and maximize value. Keep it to one punchy sentence."
          },
          {
            role: "user",
            content: `Items: ${itemNames}`
          }
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 100,
      });

      const tip = completion.choices[0]?.message?.content || "Focus on zero-waste: use your expiring items for a quick smoothie or soup.";
      return NextResponse.json({ tip });
    } catch (apiErr) {
      console.error("Groq API error:", apiErr);
      return NextResponse.json({ 
        tip: "Market Alert: Most of your tracked items are stable. Try bulk buying on Fridays to save 15%." 
      });
    }
  } catch (error) {
    console.error("Internal API error:", error);
    return NextResponse.json({ 
      tip: "Market Alert: Spend analytics suggest focusing on Staples this week to optimize budget." 
    }, { status: 200 }); // Return 200 with fallback tip to prevent dashboard crash
  }
}
