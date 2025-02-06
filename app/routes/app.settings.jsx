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
  ProgressBar,
  LegacyStack,
  SkeletonPage, SkeletonBodyText, SkeletonDisplayText,
  Form,
  TextField,
  Image,
  DropZone,
  Banner
} from "@shopify/polaris";
import { Icon} from "@shopify/polaris";
import { InfoIcon ,AlertTriangleIcon} from "@shopify/polaris-icons";
import React, { useState,useCallback,useEffect } from "react";
import {useFetcher,useLoaderData,useSearchParams} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import "react-quill/dist/quill.snow.css";
import ReorderEmailPreview from "./app.ReorderEmailPreview";
import PricingPlans from "./app.PricingPlans";
import { useOutletContext } from '@remix-run/react';
import {getShopDetails} from '../utils/shopify';

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
    console.log("Settings.tab:", Settings.tab);
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
        
        throw new Error(`Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance.`);
      
      }

      const result = await response.json();
      return { success: result };
    }
    if (Settings.tab === "general-settings") {
      try {
        const shopDetail=await getShopDetails(admin);
        const created_at=new Date(shopDetail.createdAt);
        const specifiedDate = new Date(created_at);
        specifiedDate.setDate(created_at.getDate() - 10);// Replace with your desired date
        const firstOrdersCount = 10;
        const query = `#graphql
          query getFilteredOrders($first: Int!) {
            orders(first: $first, query: "created_at:>=${specifiedDate}AND fulfillment_status:fulfilled") {
              edges {
                node {
                  id
                  createdAt
                  billingAddress {
                    phone
                  }
                  shippingAddress {
                    phone
                  }
                   lineItems(first: 10) {
                      edges {
                        node {
                          id
                          quantity
                          title
                          variantTitle
                          variant {
                            id
                          }
                          product {
                            id
                          }
                        }
                      }
                    }
                  customer {
                    id
                    firstName
                    email
                    phone
                  }
                }
              }
            }
          }
        `;
    
        // Execute the query with variables
        const response = await admin.graphql(query, {
          variables: {
            first: firstOrdersCount,
            // Use variables to pass dynamic date
          },
        });
        const transformGraphQLResponse = (graphqlData) => {
        const orders = graphqlData?.data?.orders?.edges || [];
        
          return orders.map(({ node }) => {
            const {
              id,
              createdAt,
              billingAddress,
              shippingAddress,
              lineItems,
              customer
            } = node;
        
            const lineItemsTransformed = lineItems.edges.map(({ node: item }) => ({
              product_id: parseInt(item?.product?.id?.split("/").pop() || 0),
              varient_id: item?.variant
                ? parseInt(item?.variant?.id?.split("/").pop() || 0)
                : null,
              quantity: item?.quantity,
              status: "fulfilled", // Assuming fulfillment status is "fulfilled"
              price: "0.00" 
              // Adjust based on actual data if available
            }));
        
            return {
              shop: Settings.shop, // Replace with your shop name
              shopify_order_id: parseInt(id.split("/").pop() || 0),
              customer_id: parseInt(customer?.id?.split("/").pop() || 0),
              customer_email: customer?.email || "",
              customer_name: `${customer?.firstName || ""}`,
              customer_phone: customer?.phone || null,
              shipping_phone: shippingAddress?.phone || null,
              billing_phone: billingAddress?.phone || null,
              line_items: lineItemsTransformed,
              order_date: createdAt
            };
            
          });
        };
    
        const jsonResponse = await response.json();
        const payload = transformGraphQLResponse(jsonResponse);
        console.log(JSON.stringify(payload))

        if (payload.length === 0) {
          return { message: "No previous Orders to sync" };
        }
        // Check for GraphQL errors
        if (jsonResponse.errors) {
          console.error("GraphQL Errors:", jsonResponse.errors);
          return { error: "Failed to fetch orders", details: jsonResponse.errors };
        }

        await fetch('https://reorderappapi.onrender.com/auth/orderSync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Ensure the correct content type
          },
          body: JSON.stringify(payload), // Convert object to JSON string
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
            }
            return response.json(); // Parse the JSON response from the server
          })
          .then((data) => {
            console.log('Data successfully sent to FastAPI:', data);
            
            
            return { message: "Your store is up-to-date with 10 new orders.Customers will recieve reminders on time." };

          })
          .catch((error) => {
            console.error('Error sending data to FastAPI:', error.message);
          });
      
        
    
        
        
      } catch (error) {
        console.error("Error fetching orders:", error);
        return { error: "Failed to fetch orders", details: error.message };
      }
    }
    
    

    return {  error: "Invalid tab identifier" };
  } catch (error) {
    console.error("Error in action handler:", error);
    return { error:" Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance. " };
  }
};


export default function SettingsPage() {
  const { shop_domain, settingDetails } = useLoaderData();
  const { plan } = useOutletContext();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const [selectedTab, setSelectedTab] = useState(tab!=="" && Number(tab<=2?tab:0));
  const [tabKey, setTabKey] = useState(0);
  console.log(plan);
  const [bufferTime, setBufferTime] = useState(settingDetails?.emailTemplateSettings?.bufferTime || 5);
  const [coupon, setCoupon] = useState(settingDetails?.emailTemplateSettings?.coupon || '');
  const [discountPercent, setDiscountPercent] = useState(settingDetails?.emailTemplateSettings?.discountPercent || '');
  const [subject, setSubject] = useState(settingDetails?.emailTemplateSettings?.subject || '');
  const [fromName, setFromName] = useState(settingDetails?.emailTemplateSettings?.fromName || '');
  const [fromEmail, setFromEmail] = useState(settingDetails?.emailTemplateSettings?.fromEmail || '');
  const [mailServer, setMailServer] = useState(settingDetails?.emailTemplateSettings?.mailServer || '');
  const [port, setPort] = useState(settingDetails?.emailTemplateSettings?.port || '');
  const [isChecked, setIsChecked] = useState(settingDetails?.emailTemplateSettings?.isChecked || true);
  const [files, setFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [imageChanged, setImageChanged] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // const hasError = rejectedFiles.length > 0;
  const [loading, setLoading] = useState(true);
  
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const uploadFile=settingDetails?.general_settings?.bannerImage

  const [bannerMessage, setBannerMessage] = useState(""); // Store banner message
  const [bannerStatus, setBannerStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSyncDisabled, setIsSyncDisabled] = useState(plan === 'FREE');
  useEffect(() => {
    // Optional: Handle the case where settingDetails are fetched but not immediately available
    if (settingDetails) {
      
      setBufferTime(settingDetails.email_template_settings?.bufferTime || 5);
      setCoupon(settingDetails.email_template_settings?.coupon || '');
      setDiscountPercent(settingDetails.email_template_settings?.discountPercent || '');
      setSubject(settingDetails.email_template_settings?.subject || '');
      setFromName(settingDetails.email_template_settings?.fromName || '');
      setFromEmail(settingDetails.email_template_settings?.fromEmail || '');
      setMailServer(settingDetails.email_template_settings?.mail_server || '');
      setPort(settingDetails.email_template_settings?.port || '');
      setIsChecked(settingDetails.email_template_settings?.isChecked || true);
      setIsSyncDisabled(!settingDetails.general_settings.syncStatus);
      if (uploadFile) {
        setFiles([{
          name: settingDetails?.general_settings?.bannerImageName , // You can replace this with the actual file name
          url: uploadFile // This can be a URL or path to the image
        }]);
      }else {
        setFiles([]); // Ensure it's empty if no uploaded file exists
      }
    }
    
    setTimeout(() => setLoading(false), 2000); // Add artificial delay for demonstration
    
  }, [settingDetails, uploadFile]);


  const handleSync = useCallback(() => {
    setBannerMessage("Syncing orders...");
    setBannerStatus("info");
    const formData = new FormData();
    formData.append("tab", "general-settings");
    formData.append("shop",shop_domain)
    fetcher.submit(formData, {
      method: "POST",
    });
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval); // Clear interval when progress reaches 100%
          return 100; // Ensure progress doesn't exceed 100
        }
        return prev + 10; // Increment progress
      });
    }, 500); 
    return () => clearInterval(interval);
  }, [fetcher,shop_domain]);  // Add dependencies to the useCallback hook

  useEffect(() => {
        if (fetcher.data?.message) {
         setBannerMessage(fetcher.data.message);
          setBannerStatus("success");
      }  }, [fetcher.data]);
     
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

 

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
    setTabKey(tabKey + 1); // Change the key on each selection
  }, [tabKey]);
 
  const handleDrop = useCallback((_droppedFiles, acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFiles((files) => [...files, ...acceptedFiles]); // Store only the latest uploaded file
    }
    setRejectedFiles(rejectedFiles);
    setImageChanged(true);
  }, []);
  
  const handleRemoveImage = () => {
    if (imageChanged) {
      setFiles([]); 
      setHasError("");
    }
  };
  const fileUpload = (<DropZone.FileUpload actionHint="We recommend an image which is 600px wide." />);
  const uploadedFiles =Array.isArray(files) && files.length > 0 ? (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <Image
            source={file.url ? file.url : window.URL.createObjectURL(file)}
            alt={file.name || "Uploaded image"}
          />
          {!file.url && (
            <Button variant="plain" onClick={handleRemoveImage}>
              Remove Upload
            </Button>
          )}
        </LegacyStack>
      ))}
    </LegacyStack>
  ) : null;
  
  const imageUrlForPreview = files.length > 0 && files[0].url ? files[0].url : (files.length > 0 && window.URL.createObjectURL(files[0]));
 
  
  const handleSubmit = async (event) => {
    event.preventDefault(); 
  
    const formData = new FormData();
    formData.append("bannerImage", files[0]); // Ensure files is an array
    formData.append("shop_name", shop_domain);
  
    try {
      const response = await fetch(`https://reorderappapi.onrender.com/auth/upload_to_aws/${shop_domain}`, {
        method: "POST", 
        body: formData, 
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload image. ${errorText}`);
      }
  
      const result = await response.json();
      console.log("Upload success:", result);
      
    } catch (error) {
      console.error("Upload failed:", error);
     
    }
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
      backAction={{ content: "Settings", url: "/app" }}
      title="Settings"
    >
      <Card>
        <style>
          {`
            .Polaris-Tabs__Tab--active {
              color:rgb(10, 10, 10); /* Active tab text color */
              background-color:rgb(211, 136, 140); /* Optional: active tab background color */
            }
          `}
        </style>
        <Tabs key={tabKey} tabs={tabs} selected={selectedTab} onSelect={handleTabChange} fitted>
          <div style={{ padding: "16px" }}>
            {selectedTab === 0 && (
              <Layout>
                <Layout.Section>
                <Form onSubmit={handleSubmit}>
                  <Card>
                  
                    <FormLayout >
                        
                        <input type="hidden" name="shop_name" value={shop_domain} />
                        <input type="hidden" name="tab" value={"general-settings"} />
                        
                        <DropZone accept="image/*" maxSize={3000000} type="image"  label="Logo Image"  onDrop={handleDrop} >
                        {!files.length?fileUpload: uploadedFiles}
                        </DropZone>
                        
                        <Bleed marginBlockEnd="400" marginInline="400">
                        <Box borderColor="border"  borderWidth="025"  padding="400" borderRadius="100">
                          <BlockStack gap="200">
                              <Box paddingBlockEnd="200">  
                                <Text as="h2"  variant="headingMd">
                                        Sync Recent Orders
                                      </Text>
                                <Text as="h2" variant="headingXs" tone="subdued" style={{marginTop:"1rem"}}>
                                        Sync the last month's orders to ensure reminder emails are sent for recent purchases
                                  </Text>
                                  {progress > 0 && (<ProgressBar progress={progress} />)}
                                  
                                  <div style={{marginTop:"0.5rem"}}>
                                  <Button variant="primary" disabled={isSyncDisabled} onClick={handleSync}  >Sync Now</Button>                                 
                                  </div>
                                  {bannerMessage && (
                                                <Banner
                                                  title={bannerMessage}
                                                  tone={bannerStatus} // 'success', 'critical', or 'warning'
                                                  onDismiss={() => setBannerMessage("")} // Dismiss the banner
                                                />
                                              )}
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
                                <TextField
                                  type="text"
                                  label="From name"
                                  name="fromName"
                                  value={fromName}
                                  onChange={(value) => setFromName(value)}
                                  autoComplete="off"
                                  placeholder="Your Store Name"
                                />
                                <Tooltip dismissOnMouseOut content="This is the name that customers will see as the sender of the email (e.g., Your Store Name).">
                                  <div style={{ marginRight: "8px" }}>
                                    <Icon source={InfoIcon} tone="base" />
                                  </div>
                                </Tooltip>
                                <TextField
                                  type="email"
                                  label="From Email"
                                  name="fromEmail"
                                  value={fromEmail}
                                  onChange={(value) => setFromEmail(value)}
                                  autoComplete="email"
                                  placeholder="Your Store Email"
                                />
                                <Tooltip dismissOnMouseOut content="This is the email that customers will see as the sender email (e.g., Your Store Name).">
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
                                        <Button variant="plain"  >Upgrade Now</Button> 
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
                                    helpText={<div><div>
                                    Set additional time (in days) before a product runs out to trigger the reorder reminder.
                                  </div>{plan!== 'PRO'?(<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div><Icon source={AlertTriangleIcon} color="success"/></div>
                                      
                                      <Text as="span" fontWeight="bold">
                                        Buffer Time Editable in Pro Plan
                                      </Text>
                                    </div>):null}</div>}
                                    onChange={(value) => setBufferTime(value)}
                                    autoComplete="off"
                                  />
                                  
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
