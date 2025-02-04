import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  // Implement handling of mandatory compliance topics
  // See: https://shopify.dev/docs/apps/build/privacy-law-compliance
  console.log(`Received ${topic} webhook for ${shop}`);
  console.log(JSON.stringify(payload, null, 2));
  const payloadVariantIds = payload.variants?.map((variant) => variant.id) || [];
  fetch('https://reorderappapi.onrender.com/auth/webhook/product_update', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Ensure the correct content type
    },
    body: JSON.stringify({
        product_id: payload.id, // Product ID
        shop: shop, // Shop domain
        variants: payloadVariantIds, // Variant IDs
      }), // Convert object to JSON string
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
      }
      return response.json(); // Parse the JSON response from the server
    })
    .then((data) => {
      console.log('Data successfully sent to FastAPI:', data);
    })
    .catch((error) => {
      console.error('Error sending data to FastAPI:', error.message);
    });

    return new Response("Webhook received", { status: 200 });
};
