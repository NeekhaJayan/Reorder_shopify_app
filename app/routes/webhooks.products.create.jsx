import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload, topic} = await authenticate.webhook(request);
  
  const session = await db.shopifySession.findUnique({
    where: { shop },
  });
  console.log(`Received ${topic} webhook for ${shop}:Payload is:${payload}`);
  console.log(payload);
  const productId = payload.id;
  const productTitle=payload.title;
  console.log(productTitle);
  console.log(session);
  let responseMessage;

  try {
    switch (topic) {
      case "PRODUCTS_CREATE":
        responseMessage = await handleProductCreate(productId,productTitle);
        break;

      case "PRODUCTS_UPDATE":
        responseMessage = await handleProductUpdate(productId);
        break;

      case "PRODUCTS_DELETE":
        responseMessage = await handleProductDelete(productId);
        break;

      default:
        return new Response("Unhandled webhook topic", { status: 400 });
    }

    console.log(responseMessage);
    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    return new Response("Internal Server Error", { status: 500 });
  }
};

async function handleProductCreate(productId,productTitle) {
  console.log(`Product Created with ID: ${productId}`);
  // const metafields = await fetchProductMetafields(accessToken, shop, productId);
  // const shop_id=await fetchShopId(accessToken, shop)
  const payload = {
    shop_id: 1, // Assuming `shop` is the shop ID or domain
    shopify_product_id: productId,
    title: productTitle, // Example, adjust according to metafield structure
    reorder_days: "" // Example
  };
  const response = await fetch(`https://reorderappapi.onrender.com/auth/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({payload})
  });

  if (!response.ok) {
    throw new Error("Failed to mark the app as installed");
  }
  return `Product created and metafields fetched: ${JSON.stringify(metafields)}`;
}

async function handleProductUpdate( productId) {
  console.log(`Product Updated with ID: ${productId}`);
  // const metafields = await fetchProductMetafields(accessToken, shop, productId);
  return `Product updated and metafields fetched: ${JSON.stringify(metafields)}`;
}

async function handleProductDelete(productId) {
  console.log(`Product Deleted with ID: ${productId}`);
  return `Product deleted with ID: ${productId}`;
}

const fetchProductMetafields = async (accessToken, shop, productId) => {
  const getProductMetafield = `
    query getProductMetafields($id: ID!) {
      product(id: $id) {
        id
        title
        metafields(first: 10) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: getProductMetafield,
        variables: { id: `gid://shopify/Product/${productId}` },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error("Failed to fetch metafields due to GraphQL errors.");
    }

    return data.data.product?.metafields.edges.map(edge => edge.node) || [];
  } catch (error) {
    console.error("Error fetching metafields:", error.message);
    return [];
  }
};

const fetchShopId = async (accessToken, shop) => {
  const getShopDetailsQuery = `
    query {
      shop {
        id
        name
        email
        primaryDomain {
          url
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: getShopDetailsQuery,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error("Failed to fetch shop details due to GraphQL errors.");
    }

    // Extract shop details
    const shopDetails = data.data.shop;
    return shopDetails.id;
  } catch (error) {
    console.error("Error fetching shop details:", error.message);
    return null;
  }
};


