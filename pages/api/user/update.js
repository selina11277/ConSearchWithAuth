import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export default async function handler(req, res) {

    const session = await getServerSession(req, res, authOptions);

    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }

    if (!session) {
        return res.status(401).json({ message: 'You must be logged in to perform this action' });
    }

    await connectMongo();

    const { firstName, lastName, email } = req.body;
    const userId = session.user.id; 

    console.log("here we are ")
    console.log(userId)

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name: `${firstName} ${lastName}`, email },
        );

        res.status(200).json({ message: 'User updated', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}