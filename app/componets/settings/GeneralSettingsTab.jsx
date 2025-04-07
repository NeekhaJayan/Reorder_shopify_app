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
    Image,
    Thumbnail,
    DropZone,
    Banner,LegacyStack
  } from "@shopify/polaris";


const GeneralSettingsTab = ({ shop_domain,fetcher,files,progress,dropzonebanner,bannerMessage,bannerStatus,isSyncDisabled,loading,setDropzonebanner,setBannerMessage,handleSync,handleSubmit,handleDrop,handleRemoveImage} ) => {

    const fileUpload = (<DropZone.FileUpload actionHint="We recommend an image which is 500px wide." />);
    const uploadedFiles =Array.isArray(files) && files.length > 0 ? (
        <LegacyStack vertical>
          {files.map((file, index) => (
            <LegacyStack alignment="center" key={index}>
              <Thumbnail
            size="small"
            alt={file.name}
            source={file.url ? file.url : window.URL.createObjectURL(file)}
          />
              
                <Button variant="plain" onClick={handleRemoveImage}>
                  Upload a new logo to update
                </Button>
                {dropzonebanner && (
                                                <Banner
                                                  title={dropzonebanner}
                                                  tone='critical' // 'success', 'critical', or 'warning'
                                                  onDismiss={() => setDropzonebanner("")} // Dismiss the banner
                                                />
                                              )}
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
        </>
        );

};

export default GeneralSettingsTab;