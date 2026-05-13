import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, healthPreferences, dietaryProfile } = await req.json();

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          name, 
          healthPreferences, 
          dietaryProfile 
        } 
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
