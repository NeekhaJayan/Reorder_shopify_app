import {
  Box,
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
  LegacyCard
} from "@shopify/polaris";
import React, { useState, Suspense,useCallback } from "react";
import {useFetcher,useLoaderData} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import "react-quill/dist/quill.snow.css";

// Use React's lazy to dynamically import ReactQuill
const ReactQuill = React.lazy(() => import("react-quill"));
export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  const accessToken=session.accessToken
  const shop_domain=session.shop
  console.log(accessToken)
  return {accessToken,shop_domain};

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
  const { shop_domain } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [bufferTime, setBufferTime] = useState('');
  const [coupon, setCoupon] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [mailServer, setMailServer] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [isChecked, setIsChecked] = useState(true);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  
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
                        <DropZone label="Banner Image" name="bannerImage">
                          <DropZone.FileUpload actionHint="We recommend an image which is 600px wide." />
                        </DropZone>
                        <FormLayout.Group condensed>
                        <TextField
                          label="Buffer Time"
                          name="bufferTime"
                          value={bufferTime}
                          onChange={(value) => setBufferTime(value)}
                          autoComplete="off"
                        />
                        <TextField
                          label="Coupon"
                          name="coupon"
                          value={coupon}
                          onChange={(value) => setCoupon(value)}
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
                      <TextField
                        type="text"
                        label="Mail Server"
                        value={mailServer}
                        name="mail_server"
                        onChange={(value) => setMailServer(value)}
                        autoComplete="email"
                      />
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
                      
                      <Text as="h2" variant="headingSm" fontWeight="regular">
                        Email Content
                      </Text>
                      <Suspense fallback={<div>Loading editor...</div>}>
                        <ReactQuill theme="snow"  name="emailContent" value={mailContent} onChange={setMailContent} style={{ height: "150px",marginBottom: "var(--p-space-500)" }}/>
                        <input type="hidden" name="emailContent" value={mailContent} />
                      </Suspense>
                      
                      
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
              <Layout>
                <Layout.Section>
                  <Card></Card>
                </Layout.Section>
              </Layout>
            )}
          </div>
        </Tabs>
      </Card>
    </Page>
  );
}
