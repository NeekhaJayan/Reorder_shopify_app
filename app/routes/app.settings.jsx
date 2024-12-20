import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Button,
  Tabs,
  FormLayout,
  Checkbox,
  TextField,
  DropZone,
} from "@shopify/polaris";
import React, { useState,useCallback,useEffect } from "react";
import {useFetcher,useLoaderData} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import "react-quill/dist/quill.snow.css";
import ReorderEmailPreview from "./app.ReorderEmailPreview";
import PricingPlans from "./app.PricingPlans";


export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  const accessToken=session.accessToken
  const shop_domain=session.shop
  const response = await fetch(`http://127.0.0.1:8000/auth/get-settings?shop_name=${shop_domain}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to send product data to FastAPI");
  }

  const settingDetails = await response.json();
  return {shop_domain,settingDetails};

}

export const action = async ({ request }) => {

  try {
    const formData = await request.formData();
    const Settings = Object.fromEntries(formData); 
    console.log(Settings);
    // Convert formData to a plain object
    
    // Extract tab-specific logic
    if (Settings.tab === "general-settings") {
      const data={generalSettings:Settings}
      // Call your API or perform necessary actions
      const response = await fetch(`http://127.0.0.1:8000/auth/save-settings`, {
        method: "POST", // Adjust method as per your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const result = await response.json();
      return { success: true, result };
    }
    if (Settings.tab === "template-settings") {
      const data={emailTemplateSettings:Settings}
      console.log(data);
      const response = await fetch(`https://reorderappapi.onrender.com/auth/save-settings`, {
        method: "POST", // Adjust method as per your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const result = await response.json();
      return { success: true, result };
    }

    return { success: false, error: "Invalid tab identifier" };
  } catch (error) {
    console.error("Error in action handler:", error);
    return { error: "Failed to send data"  };
  }
};


export default function SettingsPage() {
  const { shop_domain, settingDetails } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [bufferTime, setBufferTime] = useState(settingDetails?.generalSettings?.bufferTime || '');
  const [coupon, setCoupon] = useState(settingDetails?.emailTemplateSettings?.coupon || '');
  const [discountPercent, setDiscountPercent] = useState(settingDetails?.emailTemplateSettings?.discountPercent || '');
  const [subject, setSubject] = useState(settingDetails?.emailTemplateSettings?.subject || '');
  const [fromName, setFromName] = useState(settingDetails?.emailTemplateSettings?.fromName || '');
  const [mailServer, setMailServer] = useState(settingDetails?.emailTemplateSettings?.mailServer || '');
  const [port, setPort] = useState(settingDetails?.emailTemplateSettings?.port || '');
  const [isChecked, setIsChecked] = useState(settingDetails?.emailTemplateSettings?.isChecked || true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fetcher = useFetcher();
  const { data, state } = fetcher;

  useEffect(() => {
    // Optional: Handle the case where settingDetails are fetched but not immediately available
    if (settingDetails) {
      console.log(settingDetails.general_settings?.bufferTime)
      setBufferTime(settingDetails.general_settings?.bufferTime || '');
      setCoupon(settingDetails.email_template_settings?.coupon || '');
      setDiscountPercent(settingDetails.email_template_settings?.discountPercent || '');
      setSubject(settingDetails.email_template_settings?.subject || '');
      setFromName(settingDetails.email_template_settings?.fromName || '');
      setMailServer(settingDetails.email_template_settings?.mail_server || '');
      setPort(settingDetails.email_template_settings?.port || '');
      setIsChecked(settingDetails.email_template_settings?.isChecked || true);
    }
  }, [settingDetails]);

  console.log(bufferTime)
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  
  const tabs = [
    {
      id: 'general-settings',
      content: 'General Settings',
      accessibilityLabel: 'All customers',
      panelID: 'general-settings-fitted-content-2',
    },
    {
      id: 'template-settings',
      content: 'Email-Template Settings',
      panelID: 'template-settings-fitted-Ccontent-2',
    },
    {
      id: 'pricing',
      content: 'Pricing',
      panelID: 'pricing-fitted-Ccontent-2',
    },
  ];

  const handleTabChange = useCallback(
    (selectedTab) => setSelectedTab(selectedTab),
    [],
  );
  const handleDrop = (files) => {
    setUploadedFile(files[0]);
  };
  return (
    <Page
      backAction={{ content: "Settings", url: "#" }}
      title="Settings"
    >
      <Card>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} fitted>
          <div style={{ padding: "16px" }}>
            {selectedTab === 0 && (
              <Layout>
                <Layout.Section>
                <fetcher.Form method="post">
                  <Card>
                  
                    <FormLayout >
                        
                        <input type="hidden" name="shop_name" value={shop_domain} />
                        <input type="hidden" name="tab" value={"general-settings"} />
                        <DropZone label="Banner Image"  onDrop={handleDrop}>
                          <DropZone.FileUpload actionHint="We recommend an image which is 600px wide." />
                        </DropZone>
                        {uploadedFile && (
                          <p style={{ marginTop: "10px", color: "green" }}>
                            Uploaded File: {uploadedFile.name}
                          </p>
                        )}
                        <input type="hidden" name="bannerImage" value={uploadedFile ? uploadedFile.name : ""}/>
                        <FormLayout.Group condensed>
                        <TextField
                          label="Buffer Time"
                          name="bufferTime"
                          value={bufferTime}
                          onChange={(value) => setBufferTime(value)}
                          autoComplete="off"
                        />
                        
                        </FormLayout.Group>
                        
                    </FormLayout>
                  
                  </Card>
                  <div style={{ marginTop: "var(--p-space-500)" }}>
                  
                      <Button
                        textAlign="right"
                        variant="primary"
                        submit
                        
                      >
                        Save
                      </Button>
                      
                  </div>
                </fetcher.Form>
                {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
                </Layout.Section>
              </Layout>
            )}
            {selectedTab === 1 && (
              <Layout>
                <Layout.Section variant="oneThird">
                  <div style={{ marginTop: "var(--p-space-500)" }}>
                    <BlockStack gap="4">
                      <Text id="emailSettings" variant="headingMd" as="h2">
                        Reminder Email Settings
                      </Text>
                      <Text tone="subdued" as="p">
                        Shopify will use this information to send reorder reminders to your customers.
                      </Text>
                    </BlockStack>
                  </div>
                </Layout.Section>
                <Layout.Section>
                <fetcher.Form method="post">
                  <Card sectioned>
                    <FormLayout>
                    <input type="hidden" name="shop_name" value={shop_domain} />
                        <input type="hidden" name="tab" value={"template-settings"} />
                      <Checkbox
                        label="Reminder emails enabled"
                        name="reminderEmailsEnabled"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                      />
                      <input type="hidden" name="reminderEmailsEnabled" value={isChecked ? 'true' : 'false'} />
                      <FormLayout.Group condensed>
                        <TextField
                          type="text"
                          label="Mail Server"
                          value={mailServer}
                          name="mail_server"
                          onChange={(value) => setMailServer(value)}
                          autoComplete="email"
                        />
                        <TextField
                          type="text"
                          label="Port"
                          value={port}
                          name="port"
                          onChange={(value) => setPort(value)}
                          autoComplete="off"
                        />
                      </FormLayout.Group>
                      
                      <FormLayout.Group condensed>
                      <TextField
                        label="Subject"
                        name="subject"
                        value={subject}
                        onChange={(value) => setSubject(value)}
                        autoComplete="off"
                      />
                      <TextField
                        type="email"
                        label="From name"
                        name="fromName"
                        value={fromName}
                        onChange={(value) => setFromName(value)}
                        autoComplete="email"
                      />
                      </FormLayout.Group>

                      <FormLayout.Group condensed>
                      <TextField
                          label="Coupon"
                          name="coupon"
                          value={coupon}
                          onChange={(value) => setCoupon(value)}
                          autoComplete="off"
                        />
                      <TextField
                          label="Coupon Discount Percentage"
                          name="discountPercent"
                          value={discountPercent}
                          onChange={(value) => setDiscountPercent(value)}
                          autoComplete="off"
                        />
                      </FormLayout.Group>
                    
                      <div style={{ marginTop: "var(--p-space-500)" , textAlign: "center"}}>
                          
                          <ReorderEmailPreview/>
                      </div>
                      
                      
                    </FormLayout>
                    
                  </Card>
                  <div style={{ marginTop: "var(--p-space-500)" }}>
                  
                      <Button
                        textAlign="right"
                        variant="primary"
                        
                        submit
                      >
                        Save
                      </Button>

                      
                  </div>
                </fetcher.Form>
                {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
                </Layout.Section>
                
              </Layout>
            )}
            {selectedTab === 2 && (
              <PricingPlans/>
                         )}
          </div>
        </Tabs>
      </Card>
    </Page>
  );
}
