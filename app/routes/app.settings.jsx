import {
  Box,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,Button,TextContainer,LegacyCard,FormLayout,Checkbox,TextField,DropZone} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function AdditionalPage() {
  return (
    <Page
      backAction={{content: 'Settings', url: '#'}}
      title="Settings"
      primaryAction={<Button variant="primary">Save</Button>}
    >
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
              <DropZone label="Banner Image">
                <DropZone.FileUpload actionHint="We recommend an image which is 600px wide." />
              </DropZone>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}