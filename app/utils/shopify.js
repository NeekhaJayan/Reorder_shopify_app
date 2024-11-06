// Update your function to create and pin a metafield definition
// export const createAndPinReorderDaysMetafieldDefinition = async (accessToken, shop) => {
//   const uniqueKey = `reorder_days_${Date.now()}`;
//   const createQuery = `
//     mutation {
//       metafieldDefinitionCreate(
//         definition: {
//           namespace: "custom",
//           key: "reorder_days",
//           type: "number_integer",
//           name: "Reorder Days",
//           description: "Number of days until reorder",
//           ownerType: PRODUCT,
//           pin: true
//         }
//       ) {
//         createdDefinition {
//           id
//           namespace
//           key
//           name
//         }
//         userErrors {
//           field
//           message
//         }
//       }
//     }
//   `;

//   const createResponse = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Access-Token": accessToken,
//     },
//     body: JSON.stringify({ query: createQuery }),
//   });

//   const createResponseData = await createResponse.json();

//   if (createResponseData.errors) {
//     console.error("GraphQL error during creation:", createResponseData.errors);
//     return;
//   }

//   const userErrors = createResponseData.data.metafieldDefinitionCreate.userErrors;
//   if (userErrors.length > 0) {
//     console.error("User error during creation:", userErrors);
//     return;
//   }

// };

export const createAppDataMetafieldDefinition = async (accessToken, shop) => {
  // Step 1: Get the app installation ID
  const appIdQuery = `query {
    currentAppInstallation {
      id
    }
  }`;
  
  const appIdResponse = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: appIdQuery }),
  });
  
  const appIdResponseData = await appIdResponse.json();

  if (appIdResponseData.errors) {
    console.error("GraphQL error during app ID fetch:", appIdResponseData.errors);
    return;
  }

  const appInstallationId = appIdResponseData.data.currentAppInstallation?.id;
  if (!appInstallationId) {
    console.error("App installation ID not found.");
    return;
  }

  // Step 2: Create the metafield definition using the app installation ID
  const createQuery = `
    mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafieldsSetInput) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const metafieldsSetInput = [
    {
      ownerId: appInstallationId,
      namespace: "reorderdays",
      key: "reorderdays",
      value: "30",
      type: "single_line_text_field"
    }
  ];

  const createResponse = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: createQuery,
      variables: { metafieldsSetInput }
    }),
  });

  const createResponseData = await createResponse.json();

  if (createResponseData.errors) {
    console.error("GraphQL error during metafield creation:", createResponseData.errors);
    return;
  }

  const userErrors = createResponseData.data.metafieldsSet.userErrors;
  if (userErrors.length > 0) {
    console.error("User error during metafield creation:", userErrors);
    return;
  }

  console.log("Metafield created successfully:", createResponseData.data.metafieldsSet.metafields);
};





