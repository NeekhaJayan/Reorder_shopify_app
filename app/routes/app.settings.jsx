import {
  Box,
  Card,
  Bleed,
  Tooltip,
  Layout,
  Page,
  Text,
  BlockStack,
  Button,
  Tabs,
  FormLayout,
  Checkbox,
  LegacyStack,
  Thumbnail,
  Form,
  TextField,
  Image,
  DropZone,
} from "@shopify/polaris";
import { Icon} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";
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
  const response = await fetch(`https://reorderappapi.onrender.com/auth/get-settings?shop_name=${shop_domain}`, {
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
    setLoading(true);

    if (Settings.tab === "template-settings") {
      const data={emailTemplateSettings:Settings}
      console.log(data);
      const response = await fetch(`https://reorderappapi.onrender.com/auth/save-settings`, {
        method: "POST", // Adjust method as per your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Settings),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText);
        setLoading(false);
        throw new Error(`Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance.`);
      
      }

      const result = await response.json();
      return { success: result };
    }

    return { success: false, error: "Invalid tab identifier" };
  } catch (error) {
    console.error("Error in action handler:", error);
    return { error:" Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance. " };
  }
};


export default function SettingsPage() {
  const { shop_domain, settingDetails } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [bufferTime, setBufferTime] = useState(settingDetails?.emailTemplateSettings?.bufferTime || '');
  const [coupon, setCoupon] = useState(settingDetails?.emailTemplateSettings?.coupon || '');
  const [discountPercent, setDiscountPercent] = useState(settingDetails?.emailTemplateSettings?.discountPercent || '');
  const [subject, setSubject] = useState(settingDetails?.emailTemplateSettings?.subject || '');
  const [fromName, setFromName] = useState(settingDetails?.emailTemplateSettings?.fromName || '');
  const [mailServer, setMailServer] = useState(settingDetails?.emailTemplateSettings?.mailServer || '');
  const [port, setPort] = useState(settingDetails?.emailTemplateSettings?.port || '');
  const [isChecked, setIsChecked] = useState(settingDetails?.emailTemplateSettings?.isChecked || true);
  const [files, setFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const hasError = rejectedFiles.length > 0;
  const [loading, setLoading] = useState(false);
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const uploadFile=settingDetails?.general_settings?.bannerImage
  useEffect(() => {
    // Optional: Handle the case where settingDetails are fetched but not immediately available
    if (settingDetails) {
      
      setBufferTime(settingDetails.email_template_settings?.bufferTime || '');
      setCoupon(settingDetails.email_template_settings?.coupon || '');
      setDiscountPercent(settingDetails.email_template_settings?.discountPercent || '');
      setSubject(settingDetails.email_template_settings?.subject || '');
      setFromName(settingDetails.email_template_settings?.fromName || '');
      setMailServer(settingDetails.email_template_settings?.mail_server || '');
      setPort(settingDetails.email_template_settings?.port || '');
      setIsChecked(settingDetails.email_template_settings?.isChecked || true);
      if (uploadFile) {
        setFiles([{
          name: settingDetails?.general_settings?.bannerImageName , // You can replace this with the actual file name
          url: uploadFile // This can be a URL or path to the image
        }]);
      }
    }
  }, [settingDetails, uploadFile]);

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
      content: 'Email Settings',
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
  const handleDrop = useCallback((droppedFiles, acceptedFiles, rejectedFiles) => {
    setFiles((files) => [...files, ...acceptedFiles]);
    setRejectedFiles(rejectedFiles);
  }, []);
  const fileUpload = !files.length && <DropZone.FileUpload actionHint="We recommend an image which is 600px wide." />;
  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          {file.url ? (
          // If the file has a URL, directly use it
          <Image source={file.url} alt={file.name || 'Uploaded Image'} />
        ) : (
          // If the file is a File object, create a URL for it
          <Image source={window.URL.createObjectURL(file)} alt={file.name} />
        )}
          <div>
            {file.name}{' '}
            <Text variant="bodySm" as="p">
              {file.size} bytes
            </Text>
          
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );
 
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
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setLoading(true);
    const formData = new FormData();
    formData.append("bannerImage", files[0]); // Ensure files is an array
    formData.append("shop_name", shop_domain);
    
    // const response = await fetch(`https://reorderappapi.onrender.com/auth/upload_to_aws/${shop_domain}`, {
    //   method: "POST", // Adjust method as per your API
    //   body: formData,
    // });
    const response = await fetcher.submit(formData, {
      method: "POST", 
      action: `https://reorderappapi.onrender.com/auth/upload_to_aws/${shop_domain}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image. Please check your content and try again. If the problem persists, contact support for assistance.
`);
    }

    const result = await response.json();
    return { success:result };
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
                <Form onSubmit={handleSubmit}>
                  <Card>
                  
                    <FormLayout >
                        
                        <input type="hidden" name="shop_name" value={shop_domain} />
                        <input type="hidden" name="tab" value={"general-settings"} />
                        <DropZone label="Banner Image"  onDrop={handleDrop}>
                        {uploadedFiles}
                        {fileUpload}
                          
                        </DropZone>
                        
                        
                        
                        
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
                </Form>
                {loading && <div className="loader">Loading...</div>}
                {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
            {data?.success && <p style={{ color: "green" }}>{data.success}</p>}
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
                  <Card sectioned roundedAbove="sm">
                    <FormLayout>
                    <input type="hidden" name="shop_name" value={shop_domain} />
                        <input type="hidden" name="tab" value={"template-settings"} />
                        <BlockStack gap="200">
                        
                          <Text as="h2" variant="headingSm">
                            Email Settings
                          </Text>
                        
                          <Box  paddingBlockEnd="200" borderRadius="100">
                            <FormLayout.Group condensed>
                            <div style={{display: "flex", alignItems: "center" }}>
                              <TextField
                                type="text"
                                label="Mail Server"
                                value={mailServer}
                                name="mail_server"
                                onChange={(value) => setMailServer(value)}
                                autoComplete="email"
                              />
                              <Tooltip dismissOnMouseOut content="Enter the SMTP server address provided by your email provider (e.g., smtp.gmail.com).">
                                <div style={{ marginRight: "8px" }}>
                                  <Icon source={InfoIcon} tone="base" />
                                </div>
                              </Tooltip>
                            </div>
                            <div style={{display: "flex", alignItems: "center" }}>
                              <TextField
                                type="text"
                                label="Port"
                                value={port}
                                name="port"
                                onChange={(value) => setPort(value)}
                                autoComplete="off"
                              />
                              <Tooltip dismissOnMouseOut content="Specify the port number used by your SMTP server. Standard ports are 587 (TLS) or 465 (SSL).">
                                <div style={{ marginRight: "8px" }}>
                                  <Icon source={InfoIcon} tone="base" />
                                </div>
                              </Tooltip>
                            </div>
                            </FormLayout.Group>
                            <FormLayout.Group condensed>
                            <div style={{display: "flex", alignItems: "center" }}>
                              <TextField
                                label="Subject"
                                name="subject"
                                value={subject}
                                onChange={(value) => setSubject(value)}
                                autoComplete="off"
                              />
                              <Tooltip dismissOnMouseOut content="Set the default subject line for automated emails sent to your customers.">
                                <div style={{ marginRight: "8px" }}>
                                  <Icon source={InfoIcon} tone="base" />
                                </div>
                              </Tooltip>
                              </div>
                              <div style={{display: "flex", alignItems: "center" }}>
                                <TextField
                                  type="email"
                                  label="From name"
                                  name="fromName"
                                  value={fromName}
                                  onChange={(value) => setFromName(value)}
                                  autoComplete="email"
                                />
                                <Tooltip dismissOnMouseOut content="This is the name that customers will see as the sender of the email (e.g., Your Store Name).">
                                  <div style={{ marginRight: "8px" }}>
                                    <Icon source={InfoIcon} tone="base" />
                                  </div>
                                </Tooltip>
                                </div>
                            </FormLayout.Group>
                          </Box>
                        </BlockStack>
                      {/* <Checkbox
                        label="Reminder emails enabled"
                        name="reminderEmailsEnabled"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                      /> */}
                      {/* <input type="hidden" name="reminderEmailsEnabled" value={isChecked ? 'true' : 'false'} /> */}
                      <Bleed marginBlockEnd="400" marginInline="400">
                        <Box borderColor="border" borderWidth="025"  padding="400" borderRadius="100">
                          <BlockStack gap="200">
                              <Text as="h2" variant="headingSm">
                              Coupon
                              </Text>
                              <Box paddingBlockEnd="200">  
                                <FormLayout.Group condensed>
                                <div style={{display: "flex", alignItems: "center" }}>
                                  <TextField
                                      label="Coupon"
                                      name="coupon"
                                      value={coupon}
                                      onChange={(value) => setCoupon(value)}
                                      autoComplete="off"
                                    />
                                  <Tooltip dismissOnMouseOut content="Enter the unique code to be sent to customers with reordering reminders (e.g., SAVE10).">
                                    <div style={{ marginRight: "8px" }}>
                                      <Icon source={InfoIcon} tone="base" />
                                    </div>
                                  </Tooltip>
                                </div>
                                <div style={{display: "flex", alignItems: "center" }}>
                                  <TextField
                                      label="Coupon Discount Percentage"
                                      name="discountPercent"
                                      value={discountPercent}
                                      onChange={(value) => setDiscountPercent(value)}
                                      autoComplete="off"
                                    />
                                  <Tooltip dismissOnMouseOut content="Enter the discount percentage (e.g., 10 for 10%) to be applied to reorder reminders.">
                                    <div style={{ marginRight: "8px" }}>
                                      <Icon source={InfoIcon} tone="base" />
                                    </div>
                                  </Tooltip>
                                </div>
                                </FormLayout.Group>
                              </Box>
                          </BlockStack>
                        </Box>
                      </Bleed>
                      <Bleed marginBlockEnd="400" marginInline="400">
                        <Box borderColor="border" borderWidth="025" padding="400" borderRadius="100">
                          <BlockStack gap="200">
                            <Text as="h2" variant="headingSm">
                            Buffer Time
                            </Text>
                            <Box paddingBlockEnd="200">  
                              <FormLayout.Group condensed>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <TextField
                                    label="Buffer Time"
                                    name="bufferTime"
                                    value={bufferTime}
                                    onChange={(value) => setBufferTime(value)}
                                    autoComplete="off"
                                  />
                                  <Tooltip dismissOnMouseOut content="Set additional time (in days) before a product runs out to trigger the reorder reminder, accounting .">
                                    <div style={{ marginRight: "8px" }}>
                                      <Icon source={InfoIcon} tone="base" />
                                    </div>
                                  </Tooltip>
                              </div>
                                
                              </FormLayout.Group>
                            </Box>
                          </BlockStack>
                        </Box>
                      </Bleed>
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
                {loading && <div className="loader">Loading...</div>}
                {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
            {data?.success && <p style={{ color: "green" }}>{data.success}</p>}
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
