// Update your function to create and pin a metafield definition
export const createAndPinReorderDaysMetafieldDefinition = async (accessToken, shop) => {
  const uniqueKey = `reorder_days_${Date.now()}`;
  const createQuery = `
    mutation {
      metafieldDefinitionCreate(
        definition: {
          namespace: "deca_reorderday",
          key: "reorder_days",
          type: "number_integer",
          name: "Reorder Days",
          description: "Number of days until reorder",
          ownerType: PRODUCT,
          pin: true
        }
      ) {
        createdDefinition {
          id
          namespace
          key
          name
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const createResponse = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: createQuery }),
  });

  const createResponseData = await createResponse.json();

  if (createResponseData.errors) {
    console.error("GraphQL error during creation:", createResponseData.errors);
    return;
  }

  const userErrors = createResponseData.data.metafieldDefinitionCreate.userErrors;
  if (userErrors.length > 0) {
    console.error("User error during creation:", userErrors);
    return;
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

export const listProductsWithMetafields = async (accessToken, shop) => {
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
      // console.log(`Product: ${product.title} (ID: ${product.id})`);
      // console.log(`  - Metafield: ${metafields.namespace}.${metafields.key} = ${metafields.value}`);
    }
  }
  return productData
};




