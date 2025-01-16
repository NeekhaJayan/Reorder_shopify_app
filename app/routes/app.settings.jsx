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
  SkeletonPage, SkeletonBodyText, SkeletonDisplayText,
  Form,
  TextField,
  Image,
  DropZone,
} from "@shopify/polaris";
import { Icon} from "@shopify/polaris";
import { InfoIcon,AlertTriangleIcon } from "@shopify/polaris-icons";
import React, { useState,useCallback,useEffect } from "react";
import {useFetcher,useLoaderData} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import "react-quill/dist/quill.snow.css";
import ReorderEmailPreview from "./app.ReorderEmailPreview";
import PricingPlans from "./app.PricingPlans";
import { useOutletContext } from '@remix-run/react';

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop_domain = session.shop;

  // Fetch settings data from FastAPI
  const settingsResponse = await fetch(
    `https://reorderappapi.onrender.com/auth/get-settings?shop_name=${shop_domain}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!settingsResponse.ok) {
    throw new Error("Failed to fetch settings data from FastAPI");
  }

  const settingDetails = await settingsResponse.json();

    return {shop_domain,settingDetails};  
};


export const action = async ({ request }) => {
  const {admin}=await authenticate.admin(request);
  try {
    const formData = await request.formData();
    const Settings = Object.fromEntries(formData); 
    // console.log(admin)
    if (Settings.tab === "template-settings") {
      setLoading(true);
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
    if (Settings.tab === "general-settings"){
        
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        const formattedDate = tenDaysAgo.toISOString(); // Convert to ISO 8601 format
        try {
          console.log(admin)
          const response = await admin.graphql(
            `#graphql
            query {
              orders(first: 10) {
                edges {
                  node {
                    id
                    
                  }
                }
              }
            }`,
          ); // Ensure `admin` is properly initialized
          const data = await response.json();
          const orders = data?.orders?.edges || [];

          console.log("Fetched Orders:", data);
          if (orders.length === 0) {
            console.log("No orders found.");
          }

          // Handle pagination if there are more pages
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
    }
    

    return { success: false, error: "Invalid tab identifier" };
  } catch (error) {
    console.error("Error in action handler:", error);
    return { error:" Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance. " };
  }
};


export default function SettingsPage() {
  const { shop_domain, settingDetails } = useLoaderData();
  const { plan } = useOutletContext();
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
  const [loading, setLoading] = useState(true);
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
    
    setTimeout(() => setLoading(false), 2000); // Add artificial delay for demonstration
    
  }, [settingDetails, uploadFile]);


  const handleSync = useCallback(() => {
    const formData = new FormData();
    formData.append("tab", "general-settings");
  
    fetcher.submit(formData, {
      method: "POST",
    });
  }, [fetcher]);  // Add dependencies to the useCallback hook


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
          
        </LegacyStack>
      ))}
    </LegacyStack>
  );
  const imageUrlForPreview = files.length > 0 && files[0].url ? files[0].url : (files.length > 0 && window.URL.createObjectURL(files[0]));
 
  
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setLoading(true);
    const formData = new FormData();
    formData.append("bannerImage", files[0]); // Ensure files is an array
    formData.append("shop_name", shop_domain);
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

  if (loading) {
    return (
      <SkeletonPage title="Loading Settings">
        <Layout>
          <Layout.Section>
            <SkeletonDisplayText size="medium" />
            <SkeletonBodyText lines={4} />
          </Layout.Section>
          <Layout.Section>
            {[...Array(3)].map((_, index) => (
              <SkeletonBodyText key={index} lines={2} />
            ))}
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

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
                        <DropZone label="Logo Image"  onDrop={handleDrop}>
                        {uploadedFiles}
                        {fileUpload}
                          
                        </DropZone>
                        
                        {console.log(plan)}
                        <Bleed marginBlockEnd="400" marginInline="400">
                        <Box borderColor="border"  borderWidth="025"  padding="400" borderRadius="100">
                          <BlockStack gap="200">
                              <Box paddingBlockEnd="200">  
                                <Text as="h2"  variant="headingMd">
                                        Sync Recent Orders
                                      </Text>
                                <Text as="h2" variant="headingXs" tone="subdued">
                                        Sync the last month's orders to ensure reminder emails are sent for recent purchases
                                      </Text>
                                  <div style={{marginTop:"0.5rem"}}>
                                  <Button variant="primary" disabled={plan!=='PRO'} onClick={handleSync}  >Sync  orders</Button>                                 
                                  </div>
                              </Box>
                          </BlockStack>
                        </Box>
                      </Bleed>
                        
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
            {data?.success && <p style={{ color: "darkgreen" }}> {data.success}</p>}
                </Layout.Section>
              </Layout>
            )}
            {selectedTab === 1 && (
              <Layout>
                <Layout.Section variant="oneThird">
                  <div style={{ marginTop: "var(--p-space-500)" }}>
                    <BlockStack gap="4" >
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
                            <div style={{display: "flex", alignItems: "end" }}>
                              <TextField
                                type="text"
                                label="Mail Server"
                                value={mailServer}
                                name="mail_server"
                                onChange={(value) => setMailServer(value)}
                                autoComplete="email"
                                placeholder="smtp.gmail.com"
                              />
                              <Tooltip dismissOnMouseOut content="Enter the SMTP server address provided by your email provider (e.g., smtp.gmail.com).">
                                <div style={{ marginRight: "8px" }}>
                                  <Icon source={InfoIcon} tone="base" />
                                </div>
                              </Tooltip>
                            </div>
                            <div style={{display: "flex", alignItems: "end" }}>
                              <TextField
                                type="text"
                                label="Port"
                                value={port}
                                name="port"
                                onChange={(value) => setPort(value)}
                                autoComplete="off"
                                placeholder="587"
                              />
                              <Tooltip dismissOnMouseOut content="Specify the port number used by your SMTP server. Standard ports are 587 (TLS) or 465 (SSL).">
                                <div style={{ marginRight: "8px" }}>
                                  <Icon source={InfoIcon} tone="base" />
                                </div>
                              </Tooltip>
                            </div>
                            </FormLayout.Group>
                            <FormLayout.Group condensed>
                            <div style={{display: "flex", alignItems: "end",marginTop:'1rem' }}>
                              <TextField
                                label="Subject"
                                name="subject"
                                value={subject}
                                onChange={(value) => setSubject(value)}
                                autoComplete="off"
                                placeholder="Time to Restock Your Product"
                              />
                              <Tooltip dismissOnMouseOut content="Set the default subject line for automated emails sent to your customers.">
                                <div style={{ marginRight: "8px" }}>
                                  <Icon source={InfoIcon} tone="base" />
                                </div>
                              </Tooltip>
                              </div>
                              <div style={{display: "flex", alignItems: "end",marginTop:'1rem' }}>
                                <TextField
                                  type="email"
                                  label="From name"
                                  name="fromName"
                                  value={fromName}
                                  onChange={(value) => setFromName(value)}
                                  autoComplete="email"
                                  placeholder="Your Store Name"
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
                      <Bleed marginBlockEnd="400" marginInline="400">
                        <Box borderColor="border" background={plan!== 'PRO' ? 'bg-surface-secondary' : null} borderWidth="025"  padding="400" borderRadius="100">
                          <BlockStack gap="200">
                              <Box paddingBlockEnd="200">  
                                <FormLayout.Group condensed>
                                <div style={{display: "flex", alignItems: "end" }}>
                                  <TextField
                                      label="Coupon"
                                      name="coupon"
                                      value={coupon}
                                      disabled={plan!== 'PRO'}
                                
                                      onChange={(value) => setCoupon(value)}
                                      autoComplete="off"
                                    />
                                  <Tooltip dismissOnMouseOut content="Enter the unique code to be sent to customers with reordering reminders (e.g., SAVE10).">
                                    <div style={{ marginRight: "8px" }}>
                                      <Icon source={InfoIcon} tone="base" />
                                    </div>
                                  </Tooltip>
                                </div>
                                <div style={{display: "flex", alignItems: "end" }}>
                                  <TextField
                                      label="Coupon Discount Percentage"
                                      name="discountPercent"
                                      value={discountPercent}
                                      disabled={plan!== 'PRO'}
                                      helpText={plan!== 'PRO'?(<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Icon source={AlertTriangleIcon} color="success" />
                                        <Text as="span" fontWeight="bold">
                                        Coupons Available in Pro Plan
                                        </Text>
                                      </div>):null}
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
                        <Box borderColor="border" background={plan!== 'PRO' ? 'bg-surface-secondary' : null} borderWidth="025" padding="400" borderRadius="100">
                          <BlockStack gap="200">
                            <Box paddingBlockEnd="200">  
                              <FormLayout.Group condensed>
                              <div style={{ display: "flex", alignItems: "end" }}>
                                <TextField
                                    label="Buffer Time"
                                    name="bufferTime"
                                    value={bufferTime}
                                    disabled={plan!== 'PRO'}
                                    helpText={plan!== 'PRO'?(<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <Icon source={AlertTriangleIcon} color="success" />
                                      <Text as="span" fontWeight="bold">
                                        Buffer Time Editable in Pro Plan
                                      </Text>
                                    </div>):null}
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
                      {imageUrlForPreview && (
                      <div style={{ marginTop: "var(--p-space-500)" , textAlign: "center"}}>
                          
                          <ReorderEmailPreview image_path={imageUrlForPreview} />
                      </div>
                      )}
                      
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
            {data?.success && <p style={{ color: "darkgreen" }}>{data.success}</p>}
                </Layout.Section>
                
              </Layout>
            )}
            {selectedTab === 2 && (
              <PricingPlans plan={plan} />
                         )}
          </div>
        </Tabs>
      </Card>
    </Page>
  );
}
