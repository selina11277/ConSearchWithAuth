// pages/api/user/hasAccess.js
import { getServerSession } from "next-auth/next";
import { useSession, signIn } from "next-auth/react";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export default async function handler(req, res) {

    console.log("this is where I am ")
    const session = await getServerSession(req, res, authOptions);

    const { id } = session.user;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Assuming you have a MongoDB connection setup
    const db = await connectMongo();
    const user = await User.findById(id);

    console.log("session ")
    console.log(session)

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ hasAccess: user.hasAccess });
    }
