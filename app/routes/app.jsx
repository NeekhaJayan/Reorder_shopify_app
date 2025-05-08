import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { Button} from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate ,MONTHLY_PLAN} from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const {billing} = await authenticate.admin(request);
  try {
        
        const billingCheck = await billing.require({
          plans: [MONTHLY_PLAN],
          isTest: true,
          onFailure: () => {
            throw new Error("No active Plan");
          },
        });
    
        const subscription = billingCheck.appSubscriptions[0];
        const plan = subscription ? "PRO" : "FREE";
        console.log(subscription.id)
        return json({ apiKey: process.env.SHOPIFY_API_KEY || "" ,plan});
        // return {plan};
      } catch (error) {
        if (error.message === "No active Plan") {
          return json({ apiKey: process.env.SHOPIFY_API_KEY || "",plan:"FREE" });
          // return {plan: "FREE"};
        }
        throw new Error("Unable to process the request. Please try again later.");
      }
  
};

export default function App() {
  const { apiKey ,plan} = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Reorder Reminder 
        </Link>
        <Link to="/app/settings">Settings</Link>
        <Button variant="plain" target="_top" url="https://admin.shopify.com/charges/reorder-reminder-pro/pricing_plans">
  Pricing
</Button>

      </NavMenu>
      <Outlet context={{ plan }} />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
