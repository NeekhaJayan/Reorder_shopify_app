import {
  Page, Card, Text, Button,Modal,Icon
} from "@shopify/polaris";
import { useFetcher} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { usePlanSettings } from "../../hooks/usePlanSettings";
import '../../styles/PricingTable.css';



const PricingPlans = ({ plan } ) => {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const{plans,featuresList,handleChoosePlan,handleConfirmDowngrade,activeModal,setActiveModal}=usePlanSettings();
  const activePlan = plan 
      ? (plan.toUpperCase() === 'FREE' ? 'Free Plan' : 'Pro Plan') 
      : 'Unknown Plan'; // Handles undefined or null plan
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
                  onClick={() => handleChoosePlan(plan.name)}
                >
                  
                  {plan.name === activePlan ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Modal
        open={activeModal}
        onClose={() => setActiveModal(false)}
        title={
          <>
            <Icon source={AlertTriangleIcon} color="warning" /> Confirm Downgrade Subscription
          </>
        }
        primaryAction={{
          content: "Downgrade to Free Plan",
          onAction: handleConfirmDowngrade,
        }}
        secondaryActions={[
          {
            content: "Keep Pro Plan",
            onAction: () => setActiveModal(false),
          },
        ]}
      >
        <Modal.Section>
        <p>
        You're about to downgrade to the Free plan. Your Pro features will remain active until [End Date], after which they will be disabled.
        </p>
        <ul>
          <li>🔹 No refunds will be issued for the remaining subscription period.</li>
          <li>🔹 You will lose access to Pro features like .</li>
        </ul>
        <p>Are you sure you want to continue?</p>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default PricingPlans;
