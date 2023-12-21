import Stripe from "stripe";

// This is used to create a Stripe Checkout for one-time payments. It's usually triggered with the <ButtonCheckout /> component. Webhooks are used to update the user's state in the database.
export const createCheckout = async ({
  priceId,
  mode,
  successUrl,
  cancelUrl,
  couponId,
  clientReferenceId,
  user,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const trialDays = 7; //How long of a free trial are we offering at the moment

  console.log("here, in stripe, the client ref id is")
  console.log(clientReferenceId)
  const extraParams = {};



  //calculate time stuff 
  function getTrialEndTimestamp(trialDays) {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (trialDays * 24 * 60 + 10) * 60 * 1000); // 7 days and 10 minutes
    return Math.floor(futureDate.getTime() / 1000);
  }


  // console.log("debug me 3")
  // debugger;

  if (user?.customerId) {
    extraParams.customer = user.customerId;
  } else {
    if (mode === "payment") {
      extraParams.customer_creation = "always";
      extraParams.invoice_creation = { enabled: true };
      extraParams.payment_intent_data = { setup_future_usage: "on_session" };
    }
    if (user?.email) {
      extraParams.customer_email = user.email;
    }
    extraParams.tax_id_collection = { enabled: true };
  }


  let sessionConfig = {
    mode,
    allow_promotion_codes: true,
    client_reference_id: clientReferenceId,
    line_items: [{ price: priceId, quantity: 1 }],
    discounts: couponId ? [{ coupon: couponId }] : [],
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...extraParams,
  };
  
  if (trialDays && trialDays > 2) {
    const trialEndTimestamp = getTrialEndTimestamp(trialDays);
    sessionConfig.subscription_data = { trial_end: trialEndTimestamp };
  }

  const stripeSession = await stripe.checkout.sessions.create(sessionConfig);

  return stripeSession.url;
};

// This is used to create Customer Portal sessions, so users can manage their subscriptions (payment methods, cancel, etc..)
export const createCustomerPortal = async ({ customerId, returnUrl }) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return portalSession.url;
  } catch (e) {
    console.error(e);
    return null;
  }
};

//maybe this code can be used in the future instead of create checkout if it is better
export const createSubscription = async ({ customerId, returnUrl }) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const subscriptionSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      items: [
        {
          price: '{{PRICE_ID}}',
        },
      ],
      return_url: returnUrl,
      trial_end: 1610403705,
    });

    return subscriptionSession.url;
  } catch (e) {
    console.error(e);
    return null;
  }
};


// This is used to get the uesr checkout session and populate the data so we get the planId the user subscribed to
export const findCheckoutSession = async (sessionId) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return session;
  } catch (e) {
    console.error(e);
    return null;
  }
};
