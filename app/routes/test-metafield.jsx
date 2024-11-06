// routes/test-metafield.jsx

import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {createAppDataMetafieldDefinition } from "../utils/shopify";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
    // const {admin}=await authenticate.webhook(request);
  // Replace with your own shop and access token values for testing
  const shop = "deca-development-store.myshopify.com";
  const accessToken = "shpua_07a08bc8f4fc9a6028ddd26807a1e3d0";

  try {
    // Call the function to create the metafield
    await createAppDataMetafieldDefinition(accessToken, shop);
    
    return json({ message: "Metafield Created Successfully" });
  } catch (error) {
    console.error("Error creating metafield:", error);
    return json({ error: "Metafield creation failed" }, { status: 500 });
  }
};
