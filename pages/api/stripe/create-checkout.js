import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { createCheckout } from "@/libs/stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import { NextResponse } from "next/server";


// // This function is used to create a Stripe Checkout Session
// // It's called by the <ButtonCheckout /> component
// // It forces user to be authenticated but you can remove all the auth logic if you want (if (session) {} | if (!user) {}, etc...)


export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    await connectMongo();

    const { id } = session.user;
    const { method, body } = req;

    switch (method) {
      case "POST": {
        if (!body.priceId) {
          return res.status(404).send({ error: "Need a Price ID for Stripe" });
        } else if (!body.successUrl || !body.cancelUrl) {
          return res
            .status(404)
            .send({ error: "Need valid success/failure URL to return to" });
        }

        try {
          const user = await User.findById(id);
          console.log("we here!")
          console.log(user)
          console.log(user._id.toString())

          if (!user) {
            console.log("issue here ")
            return res.status(404).json({ error: "User doesn't exist" });
          }

          const { coupon, successUrl, cancelUrl } = body;

          const stripeSessionURL = await createCheckout({
            successUrl,
            cancelUrl,
            clientReferenceId: user._id.toString(),
            priceId: body.priceId,
            coupon,
            mode: body.mode,
          });

          return res.status(200).json({ url: stripeSessionURL });
        } catch (e) {
          console.error(e);
          return res.status(500).json({ error: e?.message });
        }
      }

      default:
        res.status(404).json({ error: "Unknown request type" });
    }
  } else {
    // Not Signed in
    res.status(401).end();
  }
}




// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card
// export async function POST(req) {
//   const body = await req.json();

//   if (!body.priceId) {
//     return NextResponse.json(
//       { error: "Price ID is required" },
//       { status: 400 }
//     );
//   } else if (!body.successUrl || !body.cancelUrl) {
//     return NextResponse.json(
//       { error: "Success and cancel URLs are required" },
//       { status: 400 }
//     );
//   } else if (!body.mode) {
//     return NextResponse.json(
//       {
//         error:
//           "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
//       },
//       { status: 400 }
//     );
//   }

//   try {
//     const session = await getServerSession(authOptions);

//     await connectMongo();

//     const user = await User.findById(session?.user?.id);

//     const { priceId, mode, successUrl, cancelUrl } = body;

//     const stripeSessionURL = await createCheckout({
//       priceId,
//       mode,
//       successUrl,
//       cancelUrl,
//       // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
//       clientReferenceId: user?._id?.toString(),
//       // If user is logged in, this will automatically prefill Checkout data like email and/or credit card for faster checkout
//       user,
//       // If you send coupons from the frontend, you can pass it here
//       // couponId: body.couponId,
//     });

//     return NextResponse.json({ url: stripeSessionURL });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: e?.message }, { status: 500 });
//   }
// }