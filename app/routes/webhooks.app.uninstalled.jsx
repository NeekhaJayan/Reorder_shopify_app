import { authenticate } from "../shopify.server";
import db from "../db.server";
import {deleteMetafieldDefinition  } from "../utils/shopify";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(session)
  const access_token=session.accessToken
  console.log(access_token)
  console.log(`Received ${topic} webhook for ${shop}`);
  const deleteResponse = await deleteMetafieldDefinition(access_token, shop);

  console.log(`Deleted ${deleteResponse} from ${shop}`);
  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    const response = await fetch(`https://reorderappapi.onrender.com/auth/markAppAsUnInstalled`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shop})
    });
    
    if (!response.ok) {
      throw new Error("Failed to mark the app as installed");
    }
    await db.session.deleteMany({ where: { shop } });
    
  }

  return new Response();
};
