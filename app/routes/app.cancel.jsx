import { redirect } from "@remix-run/node";
import { authenticate, MONTHLY_PLAN } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing,session } = await authenticate.admin(request);
  let {shop}=session
  let myShop=shop.replace(".myshopify.com","")
  const message = encodeURIComponent(`
    Your plan has been downgraded to the Free plan. Your Pro subscription will remain active until [End Date], after which Pro features will be disabled.
    Please note that no refunds are issued for the remaining subscription period.
    If you ever want to regain access to Pro features, you can upgrade anytime!
    [Upgrade to Pro]
  `);
  try {
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN],
      onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
    });

    const subscription = billingCheck.appSubscriptions[0];
    const cancelledSubscription = await billing.cancel({
    subscriptionId: subscription.id,
    isTest: true,
    prorate: true,
    });
    
    return redirect(`/app?message=${message}`);
  
  }
  catch (error) {
    console.error("Error while canceling subscription:", error);
    throw new Response("Subscription cancellation failed", { status: 500 });
  }

};