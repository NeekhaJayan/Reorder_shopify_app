import { json, redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shopDomain = url.searchParams.get("shop_domain");
  const variantId = url.searchParams.get("variant_id");
  const quantity = url.searchParams.get("quantity");
  const coupon = url.searchParams.get("coupon");

  if (!shopDomain || !variantId || !quantity) {
    return json({ error: "Missing parameters" }, { status: 400 });
  }

  // Shopify cart clearing API
  const checkoutUrl = `https://${shopDomain}/cart/clear.js`;

  try {
    // Clear the cart
    await fetch(checkoutUrl, { method: "POST", credentials: "include" });

    // Redirect to checkout with the product added
    const finalRedirectUrl = `https://${shopDomain}/cart/${variantId}:${quantity}?discount=${coupon}&checkout`;

    return redirect(finalRedirectUrl);
  } catch (error) {
    return json({ error: "Error processing request" }, { status: 500 });
  }
};
