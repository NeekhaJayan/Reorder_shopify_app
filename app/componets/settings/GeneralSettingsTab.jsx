import {
  Box,
  Card,
  Bleed,
  Layout,
  Text,
  BlockStack,
  Button,
  FormLayout,
  ProgressBar,
  Form,
  Icon,
  Thumbnail,
  DropZone,
  Banner,LegacyStack
} from "@shopify/polaris";
import { AlertTriangleIcon } from "@shopify/polaris-icons";

const GeneralSettingsTab = ({ shop_domain,plan,fetcher,files,progress,dropzonebanner,bannerMessage,bannerStatus,isSyncDisabled,loading,setDropzonebanner,setBannerMessage,handleSync,handleSubmit,handleDrop,handleRemoveImage} ) => {

  const fileUpload = (<DropZone.FileUpload actionHint="We recommend an image which is 500px wide." />);
  const uploadedFiles =Array.isArray(files) && files.length > 0 ? (
      <LegacyStack vertical>
        {files.map((file, index) => (
          <LegacyStack alignment="center" key={index}>
            <Thumbnail
          size="large"
          alt={file.name}
          source={file.url ? file.url : window.URL.createObjectURL(file)}
        />
            
              <Button variant="plain" onClick={handleRemoveImage}>
                Upload a new logo to update
              </Button>
              
          </LegacyStack>
        ))}
      </LegacyStack>
    ) : null;
  const { data, state } = fetcher;
  return (
      <>
           <Layout>
              <Layout.Section>
              <Form onSubmit={handleSubmit}>
                <Card>
                
                  <FormLayout >
                      
                      <input type="hidden" name="shop_name" value={shop_domain} />
                      <input type="hidden" name="tab" value={"general-settings"} />
                      
                      <DropZone accept="image/*" maxSize={3000000} type="image"  label="Logo Image"  onDrop={handleDrop} >
                      <div  style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
                        {!files.length ? fileUpload : uploadedFiles}
                      </div>
                      <div>
                        {dropzonebanner && (
                              <div style={{ marginTop: "1rem", width: "100%" }}>
                                <Banner
                                  title={dropzonebanner}
                                  tone="critical"
                                  onDismiss={() => setDropzonebanner("")}
                                />
                              </div>
                            )}
                      </div>
                      </DropZone>
                      
                      <Bleed marginBlockEnd="400" marginInline="400">
                      <Box borderColor="border"  borderWidth="025"  padding="400" borderRadius="100">
                        <BlockStack gap="200">
                            <Box paddingBlockEnd="200">  
                              <Text as="h2"  variant="headingMd">
                                      Sync Recent Orders
                                    </Text>
                              <Text as="h2" variant="headingXs" tone="subdued" style={{marginTop:"1rem"}}>
                                     Sync the last 10 orders with products set for estimated usage days to ensure timely reminder emails.
                                </Text>
                                {progress > 0 && (<ProgressBar progress={progress} />)}
                                
                                <div style={{marginTop:"0.5rem" ,display:"flex"}}>
                                <Button  variant="primary"  disabled={isSyncDisabled} onClick={handleSync}  >Sync Now</Button>                                 
                                {plan!== 'PRO'?(<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <Icon source={AlertTriangleIcon} color="success" />
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                          <Text as="span" fontWeight="bold">
                                                                          Available in Pro Plan  </Text>
                                                                          <Button variant="plain" onClick={() => navigate("/app/settings?tab=2")}>Upgrade Now</Button> 
                                                                        </div>  
                                                                      </div>):null}
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
      </>
      );

};

export default GeneralSettingsTab;