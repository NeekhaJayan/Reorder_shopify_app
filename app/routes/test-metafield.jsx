// routes/test-metafield.jsx

import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {createAppDataMetafieldDefinition } from "../utils/shopify";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
    // const {admin}=await authenticate.webhook(request);
  // Replace with your own shop and access token values for testing
  const shop = "deca-development-store.myshopify.com";
  const accessToken = "shpua_90a15edd94a173e07b1adaa3eef3826c";

  try {
    // Call the function to create the metafield
    await createAppDataMetafieldDefinition(accessToken, shop);
    
    return json({ message: "Metafield Created Successfully" });
  } catch (error) {
    console.error("Error creating metafield:", error);
    return json({ error: "Metafield creation failed" }, { status: 500 });
  }
};
