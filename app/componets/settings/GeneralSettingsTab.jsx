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
  DropZone,Modal,TextContainer,
  Banner,LegacyStack
} from "@shopify/polaris";
import { AlertTriangleIcon } from "@shopify/polaris-icons";
import {useGeneralSettings} from "../../hooks/useGeneralSettings";
import { useNavigate } from "@remix-run/react";

const GeneralSettingsTab = ({ shop_domain,plan,fetcher} ) => {

  const { files,progress,dropzonebanner,bannerMessage,bannerStatus,isSyncDisabled,setBannerMessage,setDropzonebanner, handleSync ,handleSubmit,handleDrop,handleRemoveImage,loading,showSyncModal,setShowSyncModal,hasConfiguredProducts ,order_sync_count} = useGeneralSettings();
  const fileUpload = (<DropZone.FileUpload actionHint="We recommend an image which is 500px wide." />);
  const navigate =useNavigate();
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
                                     Sync the last {order_sync_count} orders with products set for estimated usage days to ensure timely reminder emails.
                                </Text>
                                {progress > 0 && (<ProgressBar progress={progress} />)}
                                
                                <div style={{marginTop:"0.5rem" ,display:"flex"}}>
                                <Button  variant="primary"  disabled={isSyncDisabled} onClick={setShowSyncModal}  >Sync Now</Button>                                 
                                {plan!== 'PRO'?(<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <Icon source={AlertTriangleIcon} color="success" />
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                          <Text as="span" fontWeight="bold">
                                                                          Available in Pro Plan  </Text>
                                                                          <Button variant="plain" onClick={() => navigate("/app/settings?tab=2")}>Upgrade Now</Button> 
                                                                        </div>  
                                                                      </div>):null}
                                        <Modal
                                            open={showSyncModal}
                                            onClose={() => setShowSyncModal(false)}
                                            
                                            primaryAction={
                                              hasConfiguredProducts === 0
                                                ? null
                                                : {
                                                    content: "Continue",
                                                    onAction: () => {
                                                      setShowSyncModal(false);
                                                      handleSync();
                                                    },
                                                  }
                                            }
                                            secondaryActions={[
                                              {
                                                content: "Add",
                                                onAction: () => {
                                                  setShowSyncModal(false);
                                                  navigate("/app"); // or wherever the setup page is
                                                },
                                              },
                                            ]}
                                          >
                                            <Modal.Section>
                                              <TextContainer>
                                                {hasConfiguredProducts === 0 ? (
                                                  <p>
                                                    Your store doesn’t have any products configured with <strong>Estimated Usage Days</strong>. <br />
                                                    Please set them up before starting order sync.
                                                  </p>
                                                ) : (
                                                  <p>
                                                    Make sure all relevant products have their <strong>Estimated Usage Days</strong> configured. 
                                                    Order sync relies on this data to calculate reminder schedules.
                                                  </p>
                                                )}
                                              </TextContainer>
                                            </Modal.Section>
                                          </Modal>
                                </div>
                                {bannerMessage && (
                                              <Banner
                                          tone={bannerStatus} // 'success' for green, 'critical' for red, etc.
                                          onDismiss={() => setBannerMessage("")}
                                        >
                                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                            <Text as="span" fontWeight="bold" tone="success">
                                              {bannerMessage}
                                            </Text>
                                            <Text as="span" tone="subdued">
                                              Some orders were skipped because the purchased products don't have Estimated Usage Days configured.
                                            </Text>
                                          </div>
                                        </Banner>
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