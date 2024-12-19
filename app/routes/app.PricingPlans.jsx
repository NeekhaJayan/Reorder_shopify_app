
import { Badge, Text, Button,Card, Layout, InlineGrid,BlockStack } from '@shopify/polaris';
import { useLoaderData } from "@remix-run/react";
import {pricing} from '../utils/pricing';


export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  return {admin,session };
};
const PricingPlans= () => {
  const {admin,session} = useLoaderData();
  const handleSubscribe = async (price) => {
    const shop=session.shop;
    const confirmationUrl = pricing(admin,shop,price);
    window.location.href = confirmationUrl;
  };
  return (
    <Layout>
      <Layout.Section>
        <Card>

       
        <Text variant="headingLg" alignment="center" as="h2" tone="success">
          Choose Your Plan
        </Text>

        {/* InlineGrid for responsive layout */}
        <BlockStack inlineAlign="center"gap="400">
            <InlineGrid
              columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
              gap="500"
              align="center"
            >
              {/* Free Plan */}
              <div style={{height: '320px' ,width: '320px'}}>
              <Card sectioned>
                <div style={{ textAlign: "left", marginBottom: "0.5rem" }}>
                  <Badge status="attention">Free</Badge>
                </div>
                <Text alignment="left" variant="headingLg" as="h3">
                  Free Plan
                </Text>
                <Text alignment="left" as="p" padding="400" tone="subdued">
                  A great way to get started
                </Text>
                
              
                <ul style={{ listStyle: "none", padding: 15, textAlign: "left",marginTop: "var(--p-space-500)" }}>
                  <li>✅ 5 Configurable Products</li>
                  <li>✅ Automated Reorder Reminders</li>
                  <li>✅ Reorder Coupon Option</li>
                  <li>✅ Buffer Time: 5 Days</li>
                  <li>✅ Email Support</li>
                </ul>

                <div style={{ textAlign: "center", marginTop: "1rem",marginBottom: "3rem" }}>
                  {/* <Button primary>Subscribe</Button> */}
                </div>
              </Card>
              </div>

              {/* Pro Plan */}
              <div style={{height: '320px' ,width: '320px'}}>
              <Card sectioned>
                <div style={{ textAlign: "left", marginBottom: "0.5rem" }}>
                  <Badge status="success">Best Value</Badge>
                </div>
                <Text alignment="left" variant="headingLg" as="h3">
                  Pro Plan
                </Text>
                <Text alignment="left" as="p" tone="subdued">
                  Unlock full potential
                </Text>
                <Text alignment="left" variant="heading2xl" as="p">
                  $9.99/month
                </Text>

                <ul style={{ listStyle: "none", padding: 0, textAlign: "left" }}>
                  <li>✅ Unlimited Configurable Products</li>
                  <li>✅ Automated Reorder Reminders</li>
                  <li>✅ Reorder Coupon Option</li>
                  <li>✅ Editable Buffer Time</li>
                  <li>✅ Email & WhatsApp Support</li>
                </ul>

                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <Button primary onClick={handleSubscribe(9.99)}>Subscribe</Button>
                </div>
              </Card>
              </div>
              
            </InlineGrid>
        </BlockStack>

        </Card>
      </Layout.Section>
    </Layout>

  );
};
export default PricingPlans;
