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
  LegacyCard,Grid,Badge, InlineGrid
} from "@shopify/polaris";
import React, { useState, Suspense,useCallback } from "react";
import {useFetcher,useLoaderData} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import "react-quill/dist/quill.snow.css";
import ReorderEmailPreview from "./app.ReorderEmailPreview";
import PricingPlans from "./app.PricingPlans";


export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  const accessToken=session.accessToken
  const shop_domain=session.shop
  console.log(shop_domain)
  return {shop_domain,accessToken};

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
  const {shop_domain ,accessToken} = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [bufferTime, setBufferTime] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discountPercent,setDiscountPercent]= useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [mailServer, setMailServer] = useState('');
  const [port, setPort] = useState('');
  const [isChecked, setIsChecked] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);

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
  const handleDrop = (files) => {
    setUploadedFile(files[0]);
  };
  // const PricingPlans= () => {
  //   const handleSubscribe = async (price) => {
  //     const confirmationUrl = pricing(admin,shop,price);
  //     window.location.href = confirmationUrl;
  //   };
  //   return (
  //     <Layout>
  //       <Layout.Section>
  //         <Card>
  
         
  //         <Text variant="headingLg" alignment="center" as="h2" tone="success">
  //           Choose Your Plan
  //         </Text>
  
  //         {/* InlineGrid for responsive layout */}
  //         <BlockStack inlineAlign="center"gap="400">
  //             <InlineGrid
  //               columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
  //               gap="500"
  //               align="center"
  //             >
  //               {/* Free Plan */}
  //               <div style={{height: '320px' ,width: '320px'}}>
  //               <Card sectioned>
  //                 <div style={{ textAlign: "left", marginBottom: "0.5rem" }}>
  //                   <Badge status="attention">Free</Badge>
  //                 </div>
  //                 <Text alignment="left" variant="headingLg" as="h3">
  //                   Free Plan
  //                 </Text>
  //                 <Text alignment="left" as="p" padding="400" tone="subdued">
  //                   A great way to get started
  //                 </Text>
                  
                
  //                 <ul style={{ listStyle: "none", padding: 15, textAlign: "left",marginTop: "var(--p-space-500)" }}>
  //                   <li>✅ 5 Configurable Products</li>
  //                   <li>✅ Automated Reorder Reminders</li>
  //                   <li>✅ Reorder Coupon Option</li>
  //                   <li>✅ Buffer Time: 5 Days</li>
  //                   <li>✅ Email Support</li>
  //                 </ul>
  
  //                 <div style={{ textAlign: "center", marginTop: "1rem",marginBottom: "3rem" }}>
  //                   {/* <Button primary>Subscribe</Button> */}
  //                 </div>
  //               </Card>
  //               </div>
  
  //               {/* Pro Plan */}
  //               <div style={{height: '320px' ,width: '320px'}}>
  //               <Card sectioned>
  //                 <div style={{ textAlign: "left", marginBottom: "0.5rem" }}>
  //                   <Badge status="success">Best Value</Badge>
  //                 </div>
  //                 <Text alignment="left" variant="headingLg" as="h3">
  //                   Pro Plan
  //                 </Text>
  //                 <Text alignment="left" as="p" tone="subdued">
  //                   Unlock full potential
  //                 </Text>
  //                 <Text alignment="left" variant="heading2xl" as="p">
  //                   $9.99/month
  //                 </Text>
  
  //                 <ul style={{ listStyle: "none", padding: 0, textAlign: "left" }}>
  //                   <li>✅ Unlimited Configurable Products</li>
  //                   <li>✅ Automated Reorder Reminders</li>
  //                   <li>✅ Reorder Coupon Option</li>
  //                   <li>✅ Editable Buffer Time</li>
  //                   <li>✅ Email & WhatsApp Support</li>
  //                 </ul>
  
  //                 <div style={{ textAlign: "center", marginTop: "1rem" }}>
  //                   <Button primary onClick={handleSubscribe(9.99)}>Subscribe</Button>
  //                 </div>
  //               </Card>
  //               </div>
                
  //             </InlineGrid>
  //         </BlockStack>
  
  //         </Card>
  //       </Layout.Section>
  //     </Layout>
  
  //   );
  // };

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
                          name="coupon_discount_percentage"
                          value={discountPercent}
                          onChange={(value) => setDiscountPercent(value)}
                          autoComplete="off"
                        />
                      </FormLayout.Group>
                      {/* <Text as="h2" variant="headingSm" fontWeight="regular">
                        Email Content
                      </Text> */}
                      {/* <Suspense fallback={<div>Loading editor...</div>}>
                        <ReactQuill theme="snow"  name="emailContent" value={mailContent} onChange={setMailContent} style={{ height: "150px",marginBottom: "var(--p-space-500)" }}/>
                        <input type="hidden" name="emailContent" value={mailContent} />
                      </Suspense> */}
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
