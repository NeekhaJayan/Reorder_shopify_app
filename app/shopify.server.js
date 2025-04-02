import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,BillingInterval,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import { shopInstance } from "../app/services/api/ShopService";

// import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";
export const MONTHLY_PLAN = 'Monthly subscription';
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  billing: {
    [MONTHLY_PLAN]: {
      lineItems: [
        {
          amount: 14.99,
          currencyCode: 'USD',
          interval: BillingInterval.Every30Days,
        }
      ],
    },
  },
  webhooks: {
    ORDERS_CREATE: {
      deliveryMethod: "http",
      callbackUrl: "/webhooks/order", // Your webhook endpoint
    },
  },
  hooks: {
    afterAuth: async ({ admin,session }) => {
      await shopify.registerWebhooks({session});
      // const shopName = session.shop.split(".")[0];
      const shopDetail=await shopInstance.getShopifyShopDetails(admin);
      const shop_payload_details={
        shopify_domain: session.shop,
        shop_name:shopDetail.name,
        email:shopDetail.email
      }
      try{

            const response = await fetch('https://reorderappapi.onrender.com/auth/shops/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json', // Ensure the correct content type
              },
              body: JSON.stringify(shop_payload_details), // Convert object to JSON string
            })
            if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
            }

            console.log('Data successfully sent to FastAPI:', await response.json());

          } catch (error) {
            console.error('Error sending data to FastAPI:', error.message);
          }
          return {
            redirectUrl: 'app/settings' // Ensure it includes the full app URL
          };
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;



