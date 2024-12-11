import {
  Box,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,Button,Tabs,FormLayout,Checkbox,TextField,DropZone} from "@shopify/polaris";
import { useState, useEffect, useRef } from "react";
// import Quill from 'quill';
import 'quill/dist/quill.snow.css';



export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [emailBody, setEmailBody] = useState('');
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && editorRef.current && !quillRef.current) {
      import("quill")
        .then(({ default: Quill }) => {
          const quill = new Quill(editorRef.current, {
            theme: "snow",
            placeholder: "Write your email content here...",
          });

          quill.on("text-change", () => {
            setEmailBody(quill.root.innerHTML); // Capture changes
          });

          quillRef.current = quill; // Store the instance
        })
        .catch((error) => {
          console.error("Failed to load Quill:", error);
        });
    }

    // Cleanup function to destroy Quill instance
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);
  const handleSave = () => {
    console.log('Email Body:', emailBody);
    // Save emailBody to the backend
  };

  const tabs = [
    { id: 'general-settings', content: 'General Settings' },
    { id: 'template-settings', content: 'Email-Template Settings' },
    { id: 'pricing', content: 'Pricing' },
  ];

  const handleTabChange = (selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  };
  
  return (
    <Page
      backAction={{content: 'Settings', url: '#'}}
      title="Settings"
      primaryAction={<Button variant="primary">Save</Button>}
    >
      <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
        <div style={{ padding: '16px' }}>
          {selectedTab === 0 && (
            <Layout>
              <Layout.Section >
              <FormLayout>
                <DropZone label="Banner Image">
                    <DropZone.FileUpload actionHint="We recommend an image which is 600px wide." />
                </DropZone>
                <TextField
                        label="Buffer Time"
                        onChange={() => {}}
                        autoComplete="off"
                      />
                <TextField
                        label="Coupon"
                        onChange={() => {}}
                        autoComplete="off"
                      />
              </FormLayout>
                
              </Layout.Section>
              
            </Layout>
            
          )
          }
          {selectedTab === 1 && (
              <Layout>
                <Layout.Section variant="oneThird">
                  <div style={{marginTop: 'var(--p-space-500)'}}>
                    <BlockStack gap="4">
                      <Text id="emailSettings" variant="headingMd" as="h2">
                        Reminder Email Settings
                      </Text>
                      <Text tone="subdued" as="p">
                        Shopify will use this information to send reorder reminder to your customers.
                      </Text>
                    </BlockStack>
                  </div>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <FormLayout>
                      <Checkbox
                        label="Reminder emails enabled"
                        checked={true}
                      />
                      <TextField
                        label="Subject"
                        onChange={() => {}}
                        autoComplete="off"
                      />
                      <TextField
                        type="email"
                        label="From name"
                        onChange={() => {}}
                        autoComplete="email"
                      />
                      <TextField
                        type="email"
                        label="Reply-To email"
                        onChange={() => {}}
                        autoComplete="email"
                      />
                      <Text as="h2" variant="headingSm" fontWeight='regular'>
                        Email Content
                      </Text>
                      <div ref={editorRef} style={{ height: '200px' }} />
                    </FormLayout>
                  </Card>
                </Layout.Section>
              </Layout>
      )}
          {selectedTab === 2 && (
            <Layout>
              <Layout.Section >
                <Card>

                </Card>
              </Layout.Section>
            </Layout>
          )}
      </div>
    </Tabs>
    </Page>
  );
}



  
