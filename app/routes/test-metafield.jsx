// routes/test-metafield.jsx

import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {createAndPinReorderDaysMetafieldDefinition  } from "../utils/shopify";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
    // const {admin}=await authenticate.webhook(request);
  // Replace with your own shop and access token values for testing
  const shop = "deca-development-store.myshopify.com";
  const accessToken = "shpua_07a08bc8f4fc9a6028ddd26807a1e3d0";

  try {
    // Call the function to create the metafield


    const productData=await listProductsWithMetafields(accessToken, shop);
    // await createAndPinReorderDaysMetafieldDefinition (accessToken, shop);
    return productData;
    // return json({ message: "Metafield Created Successfully" });
  } catch (error) {
    console.error("Error creating metafield:", error);
    return json({ error: "Metafield creation failed" }, { status: 500 });
  }
};
const getAllProducts = async (accessToken, shop) => {
  const getProductsQuery = `
    query {
      products(first: 50) {  
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: getProductsQuery }),
  });

  const responseData = await response.json();

  if (responseData.errors) {
    console.error("GraphQL error while fetching products:", responseData.errors);
    return;
  }

  const products = responseData.data.products.edges.map(edge => edge.node);
  return products;
};
const getMetafieldForProduct = async (accessToken, shop, productId) => {
  const getMetafieldQuery = `
    query GetProductMetafield($productId: ID!) {
      product(id: $productId) {
        metafield(namespace: "deca_reorderday", key: "reorder_days") {
          id
          namespace
          key
          value
        }
      }
    }
  `;

  const variables = { productId };

  const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: getMetafieldQuery, variables }),
  });

  const responseData = await response.json();

  if (responseData.errors) {
    console.error("GraphQL error while fetching metafield:", responseData.errors);
    return;
  }

  return responseData.data.product.metafield;
};

const listProductsWithMetafields = async (accessToken, shop) => {
  // Step 1: Fetch all products
  const products = await getAllProducts(accessToken, shop);
  if (!products) {
    return;
  }
  const productData = [];
  // Step 2: For each product, fetch its metafields
  for (const product of products) {
    const metafields = await getMetafieldForProduct(accessToken, shop, product.id);
    // Check if metafield data exists and is not null
    if (metafields) {
      productData.push({
        productId: product.id,
        productTitle: product.title,
        created_at: product.created_at,
        reorder_days: metafields.value, // Assign the metafield's value to reorder_days
      });
      console.log(`Product: ${product.title} (ID: ${product.id})`);
      console.log(`  - Metafield: ${metafields.namespace}.${metafields.key} = ${metafields.value}`);
    }
  }
  return productData
};




// Main Component

