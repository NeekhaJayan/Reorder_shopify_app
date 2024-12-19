const APP_SUBSCRIPTION_MUTATION = `#graphql
  mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $price: Decimal!) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: $price, currencyCode: USD }
            }
          }
        }
      ]
      test: true
      trialDays:7
    ) {
      appSubscription {
        id
      }
      userErrors {
        field
        message
      }
      confirmationUrl
    }
  }
`;

export const pricing = async (admin, shop, price) => {
  try {
    const variables = {
      name: "Pro Plan",
      returnUrl: `${process.env.APP_URL}/billing/callback?shop=${shop}`,
      price, // Use the provided price dynamically
    };

    const response = await admin.graphql(APP_SUBSCRIPTION_MUTATION, variables);
    const { data, errors } = await response.json();

    if (errors) {
      console.error("GraphQL errors:", errors);
      return null; // Return null or handle it as needed
    }

    const { appSubscriptionCreate } = data;
    const { userErrors, confirmationUrl } = appSubscriptionCreate;

    if (userErrors.length > 0) {
      console.error("User errors:", userErrors);
      return null; // Return null or handle it as needed
    }

    return confirmationUrl; // Return the confirmation URL for further use
  } catch (error) {
    console.error("Error during app subscription creation:", error);
    return null; // Return null or handle it as needed
  }
};
