import { useState, useEffect } from "react";
import {useLoaderData} from "@remix-run/react";


export  function useEmailSettings () {
const { shop_domain, settingDetails } = useLoaderData();   
const [bufferTime, setBufferTime] = useState(settingDetails?.email_template_settings?.bufferTime || 5);
const [coupon, setCoupon] = useState(settingDetails?.email_template_settings?.coupon || '');
const [discountPercent, setDiscountPercent] = useState(settingDetails?.email_template_settings?.discountPercent || '');
const [subject, setSubject] = useState(settingDetails?.email_template_settings?.subject || '');
const [fromName, setFromName] = useState(settingDetails?.email_template_settings?.fromName || '');
const [fromEmail, setFromEmail] = useState(settingDetails?.email_template_settings?.fromEmail || '');
const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (settingDetails?.email_template_settings) {
      setSubject(settingDetails.email_template_settings.subject || "");
      setFromName(settingDetails.email_template_settings.fromName || "");
      setFromEmail(settingDetails.email_template_settings.fromEmail || "");
      setCoupon(settingDetails.email_template_settings.coupon || "");
      setDiscountPercent(settingDetails.email_template_settings.discountPercent || "");
      setBufferTime(settingDetails.email_template_settings.bufferTime || 5);
    }
    setTimeout(() => setLoading(false), 2000);
  }, [settingDetails]);

  useEffect(() => {
    switch (true) {
        case coupon.trim() === "":
            setBannerMessage("Please update the details instead of removing them and try again. If the issue persists, contact support for assistance.");
            break;
        case subject.trim() === "":
            setBannerMessage("Subject cannot be empty!");
            break;
        case fromEmail.trim() === "":
            setBannerMessage("Email cannot be empty!");
            break;
        case fromName.trim() === "":
            setBannerMessage("Name cannot be empty!");
            break;
        default:
            setBannerMessage(""); // Clear message when all fields are valid
            break;
    }
}, [coupon, subject, fromEmail, fromName]);


  return { subject, setSubject, fromName, setFromName, fromEmail, setFromEmail, coupon, setCoupon, discountPercent, setDiscountPercent, bufferTime, setBufferTime };
};

export default useEmailSettings;
