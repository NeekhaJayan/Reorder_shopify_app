import { useFetcher, useNavigate} from "@remix-run/react";
import { useState } from "react";
import { redirect } from "@remix-run/node";
import { ProductIcon,NotificationIcon, DiscountIcon,CalendarTimeIcon,ChartVerticalFilledIcon,OrderIcon,QuestionCircleIcon } from "@shopify/polaris-icons";

export function usePlanSettings(){
    const navigate =useNavigate();
    const [activeModal, setActiveModal] = useState(false);

    const handleChoosePlan = (selectedPlan) => {
        if (selectedPlan === 'Free Plan') {
          // Show modal instead of navigating
          setActiveModal(true);
        } else {
            navigate("/app/upgrade");
          // redirect("https://admin.shopify.com/charges/reorder-reminder-pro/pricing_plans");
          // window.open("https://admin.shopify.com/charges/reorder-reminder-pro/pricing_plans", "_blank");
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
          features: ['2', true, false, '5 days',false,false,'Email'],
        },
        {
          name: 'Pro Plan',
          price: '$14.99/month',
          priceValue: 14.99,
          url:"/app/upgrade",
          features: ['Unlimited', true, true,'Editable', true,true,'Email & Whatsapp'],
        },
      ];
    
      const featuresList = [
        'Max Products Configurable',
        'Automated Reorder Reminders',
        'Coupon Code Integration',
        'Buffer Time for Shipping',
        'Analytics',
        'Sync Recent Orders',
        'Priority Customer Support',
      ];
      const iconList = [
        ProductIcon,
        NotificationIcon,
        DiscountIcon,
        CalendarTimeIcon,
        ChartVerticalFilledIcon,
        OrderIcon,
        QuestionCircleIcon ,
      ];
    
    return {plans,featuresList,iconList,handleChoosePlan,handleConfirmDowngrade,activeModal,setActiveModal};
};