// Update your function to create and pin a metafield definition
export const createAndPinReorderDaysMetafieldDefinition = async (accessToken, shop) => {
  const uniqueKey = `reorder_days_${Date.now()}`;
  const createQuery = `
    mutation {
      metafieldDefinitionCreate(
        definition: {
          namespace: "custom",
          key: "${uniqueKey}",
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




