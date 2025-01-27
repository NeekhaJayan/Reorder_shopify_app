import {
  Page, Layout, Card, ResourceList, ResourceItem, Text, Button
} from "@shopify/polaris";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";

import '../styles/PricingTable.css';



const PricingPlans = ({ plan } ) => {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const navigate =useNavigate();
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
  console.log(plan)
  const activePlan = plan 
  ? (plan.toUpperCase() === 'FREE' ? 'Free Plan' : 'Pro Plan') 
  : 'Unknown Plan'; // Handles undefined or null plan
  
  const plans = [
    {
      name: 'Free Plan',
      price: '$0.000',
      priceValue: 0.0,
      url:"/app/upgrade",
      features: ['5', true, false, '5 days',false,'Email'],
    },
    {
      name: 'Pro Plan',
      price: '$14.99/mo',
      priceValue: 9.99,
      url:"/app/upgrade",
      features: ['Unlimited', true, true,'Editable', true,'Email & Whatsapp'],
    },
  ];

  const featuresList = [
    'Max Products Configurable',
    'Automated Reorder Reminders',
    'Coupon Code Integration',
    'Buffer Time for Shipping',
    'Sync Recent Orders',
    'Priority Customer Support',
  ];

  return (
    <Page title="Pricing">
      
      <Card >
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
                      : '❌'}
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
                  primary={plan.name === activePlan} 
                  outline={plan.name !== activePlan}
                  disabled={plan.name === activePlan}
                  onClick={() => {
                    if (plan.name === 'Pro Plan') {
                      navigate(plan.url);
                    }
                  }}
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
