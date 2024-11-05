// routes/auth.callback.jsx

import { json, redirect } from "@remix-run/node";
import {createAndPinReorderDaysMetafieldDefinition } from "../utils/shopify"; // Path to GraphQL function
import fetch from "node-fetch";

// OAuth callback handler
export const loader = async ({ request }) => {
  console.log("Loader triggered");
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  console.log("Shop:", shop); // Debugging line
  
  console.log("Code:", code);
  // Exchange authorization code for access token
  const accessToken = await getAccessToken(shop, code);

  // Verify if access token was obtained successfully
  if (accessToken) {
    // Save shop and access token to your database, if needed
    await saveShopCredentials(shop, accessToken);

    // Call metafield definition creation function
    await createAndPinReorderDaysMetafieldDefinition(accessToken, shop);

    // Redirect to main app page
    return redirect(`/app?shop=${shop}`);
  } else {
    return json({ error: "Failed to complete OAuth process" }, { status: 500 });
  }
};

// Helper function to exchange code for access token
async function getAccessToken(shop, code) {
  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
}

// Placeholder function to save shop credentials
async function saveShopCredentials(shop, accessToken) {
  // Save shop and accessToken to your database
}
