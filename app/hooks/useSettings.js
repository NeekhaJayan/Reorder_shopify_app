import { useState,useEffect,useCallback } from "react";
import {useFetcher,useSearchParams} from "@remix-run/react";

export function useSettings(){
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");
    const rawMessage = searchParams.get("error");
    const message = rawMessage ? decodeURIComponent(rawMessage) : null;
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
    return {selectedTab,tabKey,tabs,handleTabChange,fetcher,showBanner,setShowBanner,message};
};