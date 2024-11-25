import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic, session } = await authenticate.webhook(request);
  

  console.log(`Received ${topic} webhook for ${shop}:Payload is:${payload}`);
  console.log(request);
  const productId = payload.id;
  const admin = payload.admin;
  const accessToken = session?.accessToken;

  if (!accessToken) {
    console.error("Missing access token.");
    return new Response("Unauthorized", { status: 401 });
  }
  let responseMessage;

  try {
    switch (topic) {
      case "PRODUCTS_CREATE":
        responseMessage = await handleProductCreate(productId,admin);
        break;

      case "PRODUCTS_UPDATE":
        responseMessage = await handleProductUpdate(productId,admin);
        break;

      case "PRODUCTS_DELETE":
        responseMessage = await handleProductDelete(productId,admin);
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

async function handleProductCreate(productId,admin) {
  console.log(`Product Created with ID: ${productId}`);
  const metafields = await fetchProductMetafields( productId,admin);
  const shop_id=await fetchShopId(accessToken, shop)
  const payload = {
    shop_id: shop_id, // Assuming `shop` is the shop ID or domain
    shopify_product_id: productId,
    title: payload.title, // Example, adjust according to metafield structure
    reorder_days: metafields.find(metafield => metafield.key === "reorder_days")?.value || 0 // Example
  };
  const response = await fetch(`http://127.0.0.1:8000/auth/products`, {
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

async function handleProductUpdate(productId,admin) {
  console.log(`Product Updated with ID: ${productId}`);
  const metafields = await fetchProductMetafields(productId,admin);
  return `Product updated and metafields fetched: ${JSON.stringify(metafields)}`;
}

async function handleProductDelete(productId) {
  console.log(`Product Deleted with ID: ${productId}`);
  return `Product deleted with ID: ${productId}`;
}

// const fetchProductMetafields = async (accessToken, shop, productId) => {
//   const getProductMetafield = `
//     query getProductMetafields($id: ID!) {
//       product(id: $id) {
//         id
//         title
//         metafields(first: 10) {
//           edges {
//             node {
//               namespace
//               key
//               value
//             }
//           }
//         }
//       }
//     }
//   `;

//   try {
//     const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": accessToken,
//       },
//       body: JSON.stringify({
//         query: getProductMetafield,
//         variables: { id: `gid://shopify/Product/${productId}` },
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`GraphQL request failed: ${response.statusText}`);
//     }

//     const data = await response.json();

//     if (data.errors) {
//       console.error("GraphQL Errors:", data.errors);
//       throw new Error("Failed to fetch metafields due to GraphQL errors.");
//     }

//     return data.data.product?.metafields.edges.map(edge => edge.node) || [];
//   } catch (error) {
//     console.error("Error fetching metafields:", error.message);
//     return [];
//   }
// };

const fetchShopId = async (admin, shop) => {
  // Define the GraphQL query
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
    // Send the GraphQL request using admin's graphql method
    const response = await admin.graphql(getShopDetailsQuery);
    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error("Failed to fetch shop details due to GraphQL errors.");
    }
    const shopDetails = data.data.shop;
    return shopDetails.id;
  } catch (error) {
    console.error("Error fetching shop details:", error.message);
    return null;
  }
};


async function fetchProductMetafields(productId,admin) {
  const query = `
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

  const variables = {
    id: `gid://shopify/Product/${productId}`,
  };

  const response = await admin.graphql(query,variables);

  const data = await response.json();
  return data.data.product?.metafields.edges.map(edge => edge.node) || [];
}


