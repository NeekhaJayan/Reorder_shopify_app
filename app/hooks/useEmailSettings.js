import { useState, useEffect } from "react";
import {useLoaderData,useOutletContext} from "@remix-run/react";


export  function useEmailSettings () {
const { shop_domain, settingDetails,template_id } = useLoaderData(); 
const { plan } = useOutletContext(); 
// const [originalValues, setOriginalValues] = useState({
//   subject: "",
//   fromName: "",
//   fromEmail: "",
//   coupon: "",
//   discountPercent: "",
//   bufferTime: 5,
// });
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
  const emailSettings = settingDetails?.email_template_settings;
  
  if (emailSettings) {
    const initialData = {
      subject: emailSettings.subject || "",
      fromName: emailSettings.fromName || "",
      fromEmail: emailSettings.fromEmail || "",
      coupon: emailSettings.coupon || "",
      discountPercent: emailSettings.discountPercent || "",
      bufferTime: emailSettings.bufferTime || 5,
    };

    setSubject(initialData.subject);
    setFromName(initialData.fromName);
    setFromEmail(initialData.fromEmail);
    setCoupon(initialData.coupon);
    setDiscountPercent(initialData.discountPercent);
    setBufferTime(initialData.bufferTime);
    // setOriginalValues(initialData);
    const hasInitialValues =
      initialData.subject.trim() !== "" &&
      initialData.fromName.trim() !== "" &&
      initialData.fromEmail.trim() !== "";

    setIsInitialized(true);
    
  }

  setTimeout(() => setLoading(false), 2000);
  
}, [settingDetails]);

  
  useEffect(() => {
    if (!isInitialized || !template_id) return;
    let message = "";
    if (!subject.trim() || !fromEmail.trim() || !fromName.trim()) {
      message = "Please update the details instead of removing them and try again. If the issue persists,";
    }
    if (
      plan === 'PRO' &&
      (!String(bufferTime).trim())
    ) {
      message = "Please update the details instead of removing them and try again. If the issue persists,";
    }
    setEmailSettingsBanner(message);
}, [coupon, subject, fromEmail, fromName, discountPercent, bufferTime, plan,isInitialized,template_id]);


  return { subject, setSubject, fromName, setFromName, fromEmail, setFromEmail, coupon, setCoupon, discountPercent, setDiscountPercent, bufferTime, setBufferTime,emailSettingsbanner,setEmailSettingsBanner };
};

export default useEmailSettings;
