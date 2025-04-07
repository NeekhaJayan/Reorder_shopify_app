import { useState, useEffect } from "react";
import {useLoaderData,useOutletContext} from "@remix-run/react";


export  function useEmailSettings () {
const { shop_domain, settingDetails } = useLoaderData(); 
const { plan } = useOutletContext();  
const [originalValues, setOriginalValues] = useState({
  subject: "",
  fromName: "",
  fromEmail: "",
  coupon: "",
  discountPercent: "",
  bufferTime: 5
});
const [bufferTime, setBufferTime] = useState(settingDetails?.email_template_settings?.bufferTime || 5);
const [coupon, setCoupon] = useState(settingDetails?.email_template_settings?.coupon || '');
const [discountPercent, setDiscountPercent] = useState(settingDetails?.email_template_settings?.discountPercent || '');
const [subject, setSubject] = useState(settingDetails?.email_template_settings?.subject || '');
const [fromName, setFromName] = useState(settingDetails?.email_template_settings?.fromName || '');
const [fromEmail, setFromEmail] = useState(settingDetails?.email_template_settings?.fromEmail || '');
const [emailSettingsbanner, setEmailSettingsBanner] = useState("");
const [isInitialized, setIsInitialized] = useState(false);
const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (settingDetails?.email_template_settings) {
      setSubject(settingDetails.email_template_settings.subject || "");
      setFromName(settingDetails.email_template_settings.fromName || "");
      setFromEmail(settingDetails.email_template_settings.fromEmail || "");
      setCoupon(settingDetails.email_template_settings.coupon || "");
      setDiscountPercent(settingDetails.email_template_settings.discountPercent || "");
      setBufferTime(settingDetails.email_template_settings.bufferTime || 5);

      setOriginalValues({
        subject: settings.subject || "",
        fromName: settings.fromName || "",
        fromEmail: settings.fromEmail || "",
        coupon: settings.coupon || "",
        discountPercent: settings.discountPercent || "",
        bufferTime: settings.bufferTime || 5
      });
      setIsInitialized(true); 
    }
    setTimeout(() => setLoading(false), 2000);
  }, [settingDetails]);

  useEffect(() => {
    if (!isInitialized) return; 
    let message = "";

  const restoreIfEmpty = (value, setter, original) => {
    if (!value || !value.toString().trim()) {
      setter(original);
      return true;
    }
    return false;
  };

  let wasRestored = false;
  wasRestored |= restoreIfEmpty(subject, setSubject, originalValues.subject);
  wasRestored |= restoreIfEmpty(fromName, setFromName, originalValues.fromName);
  wasRestored |= restoreIfEmpty(fromEmail, setFromEmail, originalValues.fromEmail);

  if (plan === 'PRO') {
    wasRestored |= restoreIfEmpty(coupon, setCoupon, originalValues.coupon);
    wasRestored |= restoreIfEmpty(discountPercent, setDiscountPercent, originalValues.discountPercent);
    wasRestored |= restoreIfEmpty(bufferTime, setBufferTime, originalValues.bufferTime);
  }

  if (wasRestored) {
    message = "Please update the details instead of removing them and try again. If the issue persists, contact support for assistance.";
  }

  setEmailSettingsBanner(message);
}, [coupon, subject, fromEmail, fromName, discountPercent, bufferTime, plan,isInitialized]);


  return { subject, setSubject, fromName, setFromName, fromEmail, setFromEmail, coupon, setCoupon, discountPercent, setDiscountPercent, bufferTime, setBufferTime,emailSettingsbanner,setEmailSettingsBanner };
};

export default useEmailSettings;
