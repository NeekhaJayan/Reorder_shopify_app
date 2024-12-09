
import React from 'react';
import {Bleed, Box, Card,  Divider,Image, Text,Page,Layout, TextContainer ,InlineGrid, InlineStack} from '@shopify/polaris';
// import {Page, Card, Text, Layout, Button, Image,Box, InlineGrid, InlineStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
// import {CustomTableExample} from "./app.customTable";

export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  return null;
 
};

const SpacingBackground = ({children,width = '100%',}) => {
  return (
    <div
      style={{
        background: 'var(--p-color-bg-surface-success)',
        width,
        height: 'auto',
      }}
    >
      {children}
    </div>
  );
};

const Placeholder = ({height = 'auto', width = 'auto'}) => {
  return (
    <div
      style={{
        display: 'inherit',
        background: 'var(--p-color-text-info)',
        height: height ?? undefined,
        width: width ?? undefined,
        border: '1px solid #ccc',
      }}
    />
  );
};
const CenteredText = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        color:'black',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: 'var(--p-color-text-info)',
      }}
       // Adjust height for different row sizes if needed
       
    >
      {children}
    </div>
  );
};


function InlineGridWithVaryingGapExample() {
  return (
    <SpacingBackground>
      <InlineGrid  columns={3}>
        {/* Row 1 */}
        <Placeholder height="150px">
        Customize Reminder Message
        </Placeholder>
        <Placeholder height="150px">
        <Text variant="headingMd" as="h3">Customize Reminder Message</Text>
        </Placeholder>
        <Placeholder height="150px">
          <CenteredText>Row 3, Column 3</CenteredText>
        </Placeholder>

        {/* Row 2 */}
        <Placeholder height="200px">
          <CenteredText>Set Usage Duration</CenteredText>
        </Placeholder>
        <Placeholder height="200px">
          <CenteredText>Personalize the email reminder your customers will receive.</CenteredText>
        </Placeholder>
        <Placeholder height="200px">
          <CenteredText>Row 2, Column 3</CenteredText>
        </Placeholder>

        {/* Row 3 */}
        <Placeholder height="100px">
          <CenteredText><Text variant="headingMd" as="h3">Activate Relex</Text> </CenteredText>
        </Placeholder>
        <Placeholder height="100px">
          <CenteredText><Text as="p" alignment="center">
                  ReOrder Reminder Pro takes care of the rest, sending timely reminders to boost repeat sales.
                </Text>
          </CenteredText>
        </Placeholder>
        <Placeholder height="100px">
          <CenteredText><Image
                  source="https://via.placeholder.com/100x100?text=Activate+Relex"
                  alt="Activate Relex"
                  width={100}
                /></CenteredText>
        </Placeholder>
      </InlineGrid>
    </SpacingBackground>
  );
}
function CardWithFlushedSection() {
  return (
    <Card roundedAbove="sm">
      <Bleed marginInline="400" marginBlock="400">
        <Image
          source="https://via.placeholder.com/300" // Replace with a valid image URL
          alt="A placeholder image with purple and orange stripes"
        />
        <Box background="bg-surface-secondary" padding="400">
          <Text variant="heading2xl" as="h2" alignment="center">
            Welcome to ReOrder Reminder Pro
          </Text>
          <Text
            variant="headingLg"
            as="span"
            tone="subdued"
            fontWeight="regular"
            alignment="center"
            padding="400"
          >
            Smart, Automated Reorder Reminders for Repeat Sales Growth!
          </Text>
          <Divider borderColor="border-inverse" />
          <Text variant="headingXl" fontWeight="regular" alignment="center">
            Get started in 3 easy steps
          </Text>
          <Text
            variant="headingMd"
            as="h4"
            tone="subdued"
            fontWeight="regular"
            alignment="center"
          >
            Set up reorder reminders based on product usage duration to keep
            your customers stocked. ReOrder Reminder Pro automates reminders to
            drive repeat purchases effortlessly.
          </Text>

          <InlineGridWithVaryingGapExample />
        </Box>
      </Bleed>
    </Card>
  );
}


export default function Index() {

  return (
    <Page>
      <TitleBar title="Welcome to ReOrder Reminder Pro">
      Smart, Automated Reorder Reminders for Repeat Sales Growth!
      </TitleBar>
      <CardWithFlushedSection/>
    </Page>
    
  );
};