import { useState,useEffect,useCallback } from "react";
import {useFetcher,useSearchParams,useLoaderData} from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';

export function useSettings(){
    const {template_id,logo,coupon,bufferTime} = useLoaderData();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");
    const { plan } = useOutletContext();
    const fetcher = useFetcher();
    const success = searchParams.get("success") || null;
    const rawMessage = searchParams.get("error");
    const [hasError,setHasError] = useState(false);


    const completedSettings = {
      logoUploaded: Boolean(logo),
      emailSettingsUpdated: Boolean(template_id),
      couponDetailsAdded: Boolean(coupon),
      bufferTimeSet: Boolean(bufferTime),
    };
   
    const filterMessages = () => {
      const messages = [];
    
      if (!completedSettings.emailSettingsUpdated) {
        messages.push("⚠️ Your email settings need an update. Please review and save changes.");
      }
    
      if (!completedSettings.logoUploaded) {
        messages.push("📧 Your logo update is pending. Upload a new logo to complete the setup.");
      }
    
      if (plan === "PRO") {
        if (!completedSettings.couponDetailsAdded) {
          messages.push("💰 Your coupon details are missing. Add them here to activate discounts for your customers.");
        }
    
        if (!completedSettings.bufferTimeSet) {
          messages.push("⏳ Buffer time settings need to be updated. Adjust them here to optimize reorder reminders.");
        }
      }
      
      return messages;
    };
    const [settingsWarningMessages, setSettingsWarningMessages] = useState([]);
    const message = success ? success : ((hasError ? settingsWarningMessages : null));
    const [showBanner, setShowBanner] = useState(!!hasError);
    const [selectedTab, setSelectedTab] = useState(tab!=="" && Number(tab<=2?tab:0));
    const [tabKey, setTabKey] = useState(0);
    
    
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
      const filteredMessages = filterMessages();
      console.log(filteredMessages);
      setHasError(true);
      setSettingsWarningMessages(filteredMessages);
      setShowBanner(filteredMessages.length > 0);
    }, [rawMessage,logo, template_id, coupon, bufferTime, plan]);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelectedTab(selectedTabIndex);
        setTabKey(tabKey + 1); // Change the key on each selection
    }, [tabKey]);
    return {selectedTab,tabKey,tabs,handleTabChange,fetcher,showBanner,setShowBanner,message};
};