
import { Card, FormLayout, TextField, Tooltip, Icon, Button,Layout,BlockStack ,Text,Box,Bleed} from "@shopify/polaris";
import { InfoIcon,AlertTriangleIcon } from "@shopify/polaris-icons";
import ReorderEmailPreview from "../settings/ReorderEmailPreview";
import { useState } from "react";

const EmailSettingsTab = ({shop_domain,shop_email,plan,fetcher,imageUrlForPreview,subject, setSubject, fromName, setFromName, fromEmail, setFromEmail, coupon, setCoupon, discountPercent, setDiscountPercent,bufferTime, setBufferTime } ) => {
    const { data, state } = fetcher;
    const [loading, setLoading] = useState(true);
    return (
        <>
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
                                        <Button variant="plain" onClick={() => {
                      navigate("/app/settings?tab=2");}} >Upgrade Now</Button> 
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
        
                      <div style={{ marginTop: "var(--p-space-500)" , textAlign: "center"}}>
                          
                          <ReorderEmailPreview image_path={imageUrlForPreview} mail_id={shop_email}/>
                      </div>
                      
                      
                    </FormLayout>
                    
                  </Card>
                  <div style={{ marginTop: "var(--p-space-500)" }}>
                  
                      <Button
                        textAlign="center"
                        variant="primary"
                        
                        submit
                      >
                        Save
                      </Button>

                      
                  </div>
                </fetcher.Form>
                {/* {loading && <div className="loader">Loading...</div>} */}
                {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
            {data?.success && <p style={{ color: "darkgreen" }}>{data.success}</p>}
                </Layout.Section>
                
              </Layout>
            
        </>
    );
};

export default EmailSettingsTab;





