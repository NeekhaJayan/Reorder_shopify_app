import { useState, useEffect } from "react";
import {useLoaderData,useOutletContext} from "@remix-run/react";


export  function useEmailSettings () {
const { shop_domain, settingDetails ,shop_email} = useLoaderData(); 
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

    
  }

  setTimeout(() => setLoading(false), 2000);
  setIsInitialized(true);
}, [settingDetails]);

  useEffect(() => {
    if (!isInitialized) return;
    let message = "";
    if (!subject.trim() || !fromEmail.trim() || !fromName.trim()) {
      message = (
        <span>
          Please update the details instead of removing them and try again. If the issue persists, contact{" "}
          <Tooltip active content={shop_email|| "support@example.com"} hasUnderline>
            <Text variant="bodyLg" fontWeight="bold" as="span">
              support
            </Text>
          </Tooltip>{" "}
          for assistance.
        </span>
      );
    }
    if (plan === 'PRO' && (!coupon.trim() || !discountPercent.trim() || !bufferTime.trim())) {
      message = "Please update the details instead of removing them and try again. If the issue persists, contact support for assistance.";
    }
    setEmailSettingsBanner(message);
}, [coupon, subject, fromEmail, fromName, discountPercent, bufferTime, plan,isInitialized]);


  return { subject, setSubject, fromName, setFromName, fromEmail, setFromEmail, coupon, setCoupon, discountPercent, setDiscountPercent, bufferTime, setBufferTime,emailSettingsbanner,setEmailSettingsBanner };
};

export default useEmailSettings;
