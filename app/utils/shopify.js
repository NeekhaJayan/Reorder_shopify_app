// Update your function to create and pin a metafield definition
export const createAndPinReorderDaysMetafieldDefinition = async (admin) => {
  const response = await admin.graphql(
    `#graphql
       mutation {
    metafieldDefinitionCreate(
      definition: {
        namespace: "deca_reorderday",
        key: "reorder_days",
        type: "number_integer",
        name: "Configure Product Usage Days",
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
  }`
  );
  const createResponseData = await response.json();
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

const getAllProducts = async (admin) => {
  const response = await admin.graphql(
    `#graphql
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
  `);

  const responseData = await response.json();

  if (responseData.errors) {
    console.error("GraphQL error while fetching products:", responseData.errors);
    return;
  }

  const products = responseData.data.products.edges.map(edge => edge.node);
  return products;
};
const getMetafieldForProduct = async (admin, productId) => {
 const response = await admin.graphql(
    `#graphql
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
  `,{
    variables: {
      productId:productId,
    },
  },);

  const responseData = await response.json();

  if (responseData.errors) {
    console.error("GraphQL error while fetching metafield:", responseData.errors);
    return;
  }

  return responseData.data.product.metafield;
};

export const listProductsWithMetafields = async (admin) => {
  // Step 1: Fetch all products
  const products = await getAllProducts(admin);
  if (!products) {
    return;
  }
  const productData = [];
  // Step 2: For each product, fetch its metafields
  for (const product of products) {
    const metafields = await getMetafieldForProduct(admin, product.id);
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

const getMetafieldDefinitionId = async (admin) => {
  const response = await admin.graphql(
    `#graphql
    {
      metafieldDefinitions(first: 10, namespace: "deca_reorderday", ownerType: PRODUCT) {
        edges {
          node {
            id
            namespace
            key
            name
          }
        }
      }
    }
  `);

  const responseData = await response.json();

  if (responseData.errors) {
    console.error("GraphQL error while fetching metafield:", responseData.errors);
    return null;
  }

  // Extract the ID of the first metafield definition, if it exists
  const metafieldId = responseData.data.metafieldDefinitions.edges[0]?.node.id;
  return metafieldId;
};

const getProductsWithMetafield = async (admin) => {
  const response = await admin.graphql(
    `#graphql
    {
      products(first: 50) {
        edges {
          node {
            id
            metafields(namespace: "deca_reorderday", first: 1) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
          }
        }
      }
    }`
  );

  const responseData = await response.json();
  // console.log(responseData)

  if (responseData.errors) {
    console.error("GraphQL error while fetching products:", responseData.errors);
    return [];
  }

  return responseData.data.products.edges;
};
const deleteProductMetafield = async (admin, metafieldId) => {
  
  const response = await admin.graphql(
    `#graphql
    mutation metafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        "input": {
          "id": metafieldId
        }
      },
    },
  );
  
  const responseData = await response.json();
  
  

  if (responseData.errors) {
    console.error("GraphQL error while deleting product metafield:", responseData.errors);
    return null;
  }

  return responseData.data.metafieldDelete;
};

// Function to delete metafields for all products
export const deleteMetafieldForAllProducts = async (admin) => {
  const metafieldId = await getMetafieldDefinitionId(admin);
  const products = await getProductsWithMetafield(admin);

  if (!products.length) {
    console.log("No products found with the specified metafield.");
    return;
  }

  for (const product of products) {
    const metafieldEdges = product.node.metafields.edges;
    console.log("metafieldEdges",metafieldEdges)
    if (metafieldEdges.length > 0) {
      const metafieldId = metafieldEdges[0].node.id;
      console.log("metafieldId",metafieldId)
      console.log(`Deleting metafield: ${metafieldId} for product: ${product.node.id}`);
      const deleteResult = await deleteProductMetafield(admin, metafieldId);

      if (deleteResult?.deletedMetafieldId) {
        console.log(`Successfully deleted metafield: ${deleteResult.deletedMetafieldId}`);
      } else {
        console.error("Failed to delete metafield:", deleteResult?.userErrors);
      }
    }
  }  
};

export const deleteMetafieldDefinition = async (admin) => {
  const metafieldId = await getMetafieldDefinitionId(admin);
  console.log(metafieldId)
  if (!metafieldId) {
    console.error("No metafield definition found with the specified namespace.");
    return;
  }
  const response = await admin.graphql(
    `#graphql
    mutation {
      metafieldDefinitionDelete(
        id: "${metafieldId}"
      ) {
        deletedDefinitionId
        userErrors {
          field
          message
        }
      }
    }
  `);

  const responseData = await response.json();

  if (responseData.errors) {
    console.error("GraphQL error while deleting metafield:", responseData.errors);
    return;
  }

  return responseData.data.metafieldDefinitionDelete;

 
};
export const getShopDetails = async (admin) =>{
  const response_shop = await admin.graphql(
    `#graphql
      query {
        shop {
        name
        createdAt
        domains {
          url
        }
        email
        myshopifyDomain
      }
    }`,
    );
  
    // Destructure the response
    const shop_body = await response_shop.json();
    
    const shop_data = shop_body;
    return shop_data.data.shop
  
}


