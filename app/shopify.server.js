import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";

// import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";

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
  hooks: {
    afterAuth: async ({ admin, session }) => {
      await shopify.registerWebhooks({ session });
  
      try {
        const metafield = await getMetafield(admin);
  
        if (metafield == null) {
          await createMetafield(admin);
        }
      } catch (error) { // Removed ":any"
        if ("graphQLErrors" in error) {
          console.error(error.graphQLErrors);
        } else {
          console.error(error);
        }
  
        throw error;
      }
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


async function getMetafield(admin) {
  const response = await admin.graphql(getMetafieldQuery, {
    variables: {
      key: "reorder_days",
      namespace: "deca_reorderday",
      ownerType: "PRODUCT",
    },
  });

  const json = await response.json();
  return json.data?.metafieldDefinitions.nodes[0];
}

const getMetafieldQuery = `
query getMetafieldDefinition($key: String!, $namespace: String!, $ownerType: MetafieldOwnerType!) {
  metafieldDefinitions(first: 1, key: $key, namespace: $namespace, ownerType: $ownerType) {
    nodes {
      id
    }
  }
}
`;

async function createMetafield(admin) {
  const response = await admin.graphql(createMetafieldMutation, {
    variables: {
      definition: {
        namespace: "deca_reorderday",
        key: "reorder_days",
        type: "number_integer",
        name: "Configure Product Usage Days",
        description: "Number of days until reorder",
        ownerType: "PRODUCT",
        pin: true
      },
    },
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

const createMetafieldMutation = `
mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      key
      namespace
    }
    userErrors {
      field
      message
    }
  }
}
`;



