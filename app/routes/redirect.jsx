import { json, redirect } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";

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

export default function RedirectPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const shopDomain = searchParams.get("shop_domain");
    const variantId = searchParams.get("variant_id");
    const quantity = searchParams.get("quantity");
    const coupon = searchParams.get("coupon");

    if (!shopDomain || !variantId || !quantity) {
      setError("Missing parameters. Cannot proceed to checkout.");
      setLoading(false);
      return;
    }

    const clearCartUrl = `https://${shopDomain}/cart/clear.js`;
    const checkoutUrl = `https://${shopDomain}/cart/${variantId}:${quantity}?discount=${coupon}&checkout`;

    // Clear cart and redirect
    fetch(clearCartUrl, { method: "POST", credentials: "include" })
      .then(() => {
        window.location.href = checkoutUrl;
      })
      .catch(() => {
        setError("Failed to process checkout.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {loading ? <p>Processing...</p> : <p>Redirecting to checkout...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

