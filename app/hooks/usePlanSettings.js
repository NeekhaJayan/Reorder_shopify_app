import { useFetcher, useNavigate} from "@remix-run/react";
import { useState } from "react";

export function usePlanSettings(){
    const navigate =useNavigate();
    const [activeModal, setActiveModal] = useState(false);

    const handleChoosePlan = (selectedPlan) => {
        if (selectedPlan === 'Free Plan') {
          // Show modal instead of navigating
          setActiveModal(true);
        } else {
          navigate("/app/upgrade");
        }
      };

    const handleConfirmDowngrade = () => {
    setActiveModal(false);
    navigate("/app/cancel"); // Navigate only after confirmation
    };
    
      
      const plans = [
        {
          name: 'Free Plan',
          price: '$0.00/month',
          priceValue: 0.00,
          url:"/app/cancel",
          features: ['2', true, false, '5 days',false,'Email'],
        },
        {
          name: 'Pro Plan',
          price: '$14.99/month',
          priceValue: 14.99,
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
    
    return {plans,featuresList,handleChoosePlan,handleConfirmDowngrade,activeModal,setActiveModal};
};