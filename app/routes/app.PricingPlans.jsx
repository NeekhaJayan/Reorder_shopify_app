import {
  Page, Layout, Card, ResourceList, ResourceItem, Text, Button
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import '../styles/PricingTable.css';

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const { price } = await request.json(); // Extract price from the request body
  const shop = new URL(request.url).searchParams.get("shop"); // Extract shop from URL query params
  console.log(price,shop)
  

  

  // const response = await admin.graphql(
  //   `#graphql
  //    mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $price: Decimal!) {
  //      appSubscriptionCreate(
  //        name: $name
  //        returnUrl: $returnUrl
  //        lineItems: [
  //          {
  //            plan: {
  //              appRecurringPricingDetails: {
  //                price: { amount: $price, currencyCode: USD }
  //              }
  //            }
  //          }
  //        ]
  //        test: true
  //        trialDays: 7
  //      ) {
  //        appSubscription {
  //          id
  //        }
  //        userErrors {
  //          field
  //          message
  //        }
  //        confirmationUrl
  //      }
  //    }
  //   `,
  //   {
  //     name: "Pro Plan",
  //     returnUrl: `${process.env.SHOPIFY_APP_URL}/billing/callback?shop=${shop}`,
  //     price,
  //   }
  // );

  
};

const PricingPlans = ( ) => {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const handleSubscribe = (price) => {
    const formData = new FormData();
    // formData.append("price", price);
    // formData.append("tab","pricing");
    // formData.append("shop",shop_domain);
    // fetcher.submit(formData,{
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    // });
  };
  
  const activePlan = 'FREE';

  const plans = [
    {
      name: 'FREE',
      price: '$0.000',
      priceValue: 0.0,
      url:"/app/upgrade",
      features: ['5', true, true, '5',false],
    },
    {
      name: 'PRO',
      price: '$9.99/mo',
      priceValue: 9.99,
      url:"/app/upgrade",
      features: [true, true, true, true, true],
    },
  ];

  const featuresList = [
    'Unlimited Products',
    'Automated Reminders',
    'Reorder Coupons',
    'Buffer Time Configuration',
    'Priority Support',
  ];

  return (
    <Page title="Pricing">
      
      <Card background="bg-surface-warning">
        <div className="pricing-table">
          <div className="table-header">
            <div className="feature-column"></div>
            {plans.map((plan) => (
              <div className="plan-column" key={plan.name}>
                <Text as="h3" fontWeight="bold">{plan.name}</Text>
                <Text as="p" fontWeight="medium">{plan.price}</Text>
              </div>
            ))}
          </div>
          <div className="table-body">
            {featuresList.map((feature, index) => (
              <div className="table-row" key={feature}>
                <div className="feature-column">
                  <Text as="p">{feature}</Text>
                </div>
                {plans.map((plan) => (
                  <div className="plan-column" key={plan.name}>
                    {typeof plan.features[index] === 'string'
                      ? plan.features[index] // Show the value for specific features
                      : plan.features[index]
                      ? '✔️'
                      : '-'}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="table-footer">
            <div className="feature-column">
              <div></div>
            </div>
            {plans.map((plan) => (
              <div className="plan-column" key={plan.name}>
                <Button
                  // primary={plan.name === activePlan} 
                 primary url={plan.url}
                  outline={plan.name !== activePlan}
                  disabled={plan.name === activePlan}
                  
                >
                  {plan.name === activePlan ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Page>
  );
};

export default PricingPlans;
