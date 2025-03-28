import { useState } from "react";

const ReorderNow = ({ variant_id, quantity ,shop_domain,coupon}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReorder = async () => {
    setLoading(true);
    setError("");

    try {
      const shopifyApiUrl = `https://${shop_domain}/products/${variant_id}.json`;
      const cartClearUrl = `https://${shop_domain}/cart/clear`;
      const checkoutUrl = `https://${shop_domain}/cart/add?items[][id]=${variant_id}&items[][quantity]=${quantity}&attributes[ReorderReminderPro]=Email&discount=${coupon}&return_to=/checkout`;

      // Step 1: Check product stock
      const productResponse = await fetch(shopifyApiUrl);
      if (!productResponse.ok) {
        throw new Error("Failed to check product stock");
      }
      
      const productData = await productResponse.json();
      const available = productData?.product?.variants[0]?.available;

      if (!available) {
        throw new Error("Product is out of stock");
      }

      // Step 2: Clear the cart
      const cartResponse = await fetch(cartClearUrl);
      if (!cartResponse.ok) {
        throw new Error("Failed to clear cart");
      }

      // Step 3: Redirect to checkout
      window.location.href = checkoutUrl;

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleReorder} disabled={loading}>
        {loading ? "Processing..." : "Reorder Now"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ReorderNow;
