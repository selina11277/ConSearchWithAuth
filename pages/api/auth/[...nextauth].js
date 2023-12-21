import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connectMongo from "@/libs/mongo";
import config from "@/config";
import User from "@/models/User"

export const authOptions = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: config.mailgun.fromNoReply,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc.. Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  adapter: MongoDBAdapter(connectMongo),
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Update user details with Google profile info
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();
        }
      }
      return true; // Return true to continue the sign-in process
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: "/logoAndName.png", 
  },
};

export default NextAuth(authOptions);
