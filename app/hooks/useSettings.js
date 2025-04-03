import { useState,useEffect,useCallback } from "react";
import {useFetcher,useSearchParams} from "@remix-run/react";

export function useSettings(){
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");

    const rawMessage = searchParams.get("error");
    const errorMessage = `<p>⚠️ <strong>Action Required:</strong> Please review and update your settings to ensure smooth functionality.</p> 
  
  <ul>
    <li>📧 <strong>Email Settings:</strong> Your email settings need an update. Please review and save the changes.</li>
    <li>🖼️ <strong>Logo Update:</strong> Your logo is missing. Upload a new logo to complete the setup.</li>
    <li>💰 <strong>Coupon Details:</strong> No coupon details found! Add them to activate discounts for your customers.</li>
    <li>⏳ <strong>Buffer Time Settings:</strong> Adjust your buffer time settings to optimize reorder reminders.</li>
  </ul>

  <p>✅ Once you've made the necessary updates, save your changes to continue.</p>
  <p>❓ Need help? <a href="support_link" style="color: #007bff;">Contact Support</a></p>`;
    const message = rawMessage ? errorMessage : null; 
    const [showBanner, setShowBanner] = useState(!!message);
    const [selectedTab, setSelectedTab] = useState(tab!=="" && Number(tab<=2?tab:0));
    const [tabKey, setTabKey] = useState(0);
    const fetcher = useFetcher();
    
    const tabs = [
        {
        id: 'general-settings',
        content: 'General Settings',
        accessibilityLabel: 'All customers',
        panelID: 'general-settings-fitted-content-2',
        },
        {
        id: 'template-settings',
        content: 'Email Settings',
        panelID: 'template-settings-fitted-Ccontent-2',
        },
        {
        id: 'pricing',
        content: 'Pricing',
        panelID: 'pricing-fitted-Ccontent-2',
        },
    ];
 
    useEffect(() => {
            if (message) {
                setTimeout(() => setShowBanner(false), 900000); // Auto-hide after 5 sec
            }
          }, [message]);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelectedTab(selectedTabIndex);
        setTabKey(tabKey + 1); // Change the key on each selection
    }, [tabKey]);
    return {selectedTab,tabKey,tabs,handleTabChange,fetcher,showBanner,setShowBanner};
};