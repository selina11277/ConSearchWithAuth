


import Stripe from "stripe";
import { buffer } from "micro";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  await connectMongo();

  if (method !== "POST") {
    return res.status(405).end('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const buf = await buffer(req);

  try {
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);

    console.log("Event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        const session = await findCheckoutSession(event.data.object.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = event.data.object.client_reference_id;
        const customerEmail = event.data.object.customer_details.email;

        const existingCustomers = await stripe.customers.list({
          email: customerEmail,
        });

        let stripeCustomer;
        if (existingCustomers.data.length > 0) {
          // Customer already exists in Stripe
          stripeCustomer = existingCustomers.data[0];
          console.log("Existing customer found:", stripeCustomer.id);
        } else {
          // Create a new customer in Stripe
          stripeCustomer = await stripe.customers.create({
            email: customerEmail,
          });
          console.log("New customer created:", stripeCustomer.id);
        }


        const user = userId ? await User.findById(userId) : await User.findOne({ email: customerEmail });
        

        if (!user) {
          console.error("No user found for ID:", userId);
          return res.status(400).end('User not found');
        }

        // console.log("debug me")
        // debugger;

        // Update user data
        user.customerId = stripeCustomer.id; 
        user.priceId = priceId;
        user.hasAccess = true;
        await user.save();

        console.log("User updated:", user);
        break;

      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const subscriptionDeleted = event.data.object;
        // Retrieve the user by their Stripe customer ID
        const userOnDelete = await User.findOne({ customerId: subscriptionDeleted.customer });

        if (!userOnDelete) {
          console.error("No user found for customer ID:", subscriptionDeleted.customer);
          return res.status(400).end('User not found');
        }

        // Update user data to reflect the subscription cancellation
        userOnDelete.hasAccess = false;
        // You may also want to remove or update other fields related to the subscription
        await userOnDelete.save();

        console.log("Subscription deleted for user:", userOnDelete);
        break;

      case "invoice.payment_failed":
        // Handle payment failure, which might lead to subscription expiration
        const invoice = event.data.object;
        // Retrieve the user by their Stripe customer ID
        const userOnPaymentFailure = await User.findOne({ customerId: invoice.customer });

        if (!userOnPaymentFailure) {
          console.error("No user found for customer ID:", invoice.customer);
          return res.status(400).end('User not found');
        }

        // Update user data to reflect the payment failure
        // You might want to mark the user as at risk of losing access
        userOnPaymentFailure.atRiskOfLosingAccess = true;
        await userOnPaymentFailure.save();

        console.log("Payment failed for user:", userOnPaymentFailure);
        break;

      // Add more cases as needed for other event types

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Webhook processed');
  } catch (err) {
    console.error("Error processing webhook:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
