import { useEffect,useState} from "react";
import { json } from "@remix-run/node";
import {  useFetcher,useLoaderData ,Form} from "@remix-run/react";

import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,Select,TextField,Thumbnail,InlineError,IndexTable,EmptyState
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { ImageIcon } from "@shopify/polaris-icons";
import {createAndPinReorderDaysMetafieldDefinition,listProductsWithMetafields } from "../utils/shopify";

export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  const shopname= session.shop
  const access_token=session.accessToken
  // const email=session.email
  const isInstalled = await checkIfAppIsInstalled(shopname);

  if (!isInstalled)
  try {
    // Call the function to create the metafield
    
    await createAndPinReorderDaysMetafieldDefinition(admin);
    await markAppAsInstalled(shopname);
    return json({ message: "Metafield creation successful" });
  } catch (error) {
    console.error("Error creating metafield:", error);
    return json({ error: "Metafield creation failed" }, { status: 500 });
  }

  const productData=await listProductsWithMetafields(admin);
  console.log(productData)
  return json({ reorderDetails: productData});

 
 
};

export const action = async ({ request }) => {

};


export default function Index() {
  const {reorderDetails = []}=useLoaderData();
  const [productData, setProductData] = useState(reorderDetails); 
  const [updatedProducts, setUpdatedProducts] = useState(reorderDetails);

  // Handle the click of the "Edit" button
  // Submit updated reorder interval to the API
  const fetchLatestProducts = async () => {
    const latestData = await listProductsWithMetafields(session.accessToken, session.shop);
    
    // Merge new products if they are not already in the current list
    const newProducts = latestData.filter(
      (newProduct) => !updatedProducts.some((prod) => prod.productId === newProduct.productId)
    );
    
    if (newProducts.length > 0) {
      const updatedProductList = [...updatedProducts, ...newProducts];
      setProductData(updatedProductList);
      setUpdatedProducts(updatedProductList);
    }
  };

  // Set up polling to check for new products every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchLatestProducts, 1000); // 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [updatedProducts]);

  const EmptyProductState = () => (
    <EmptyState
      heading="Set the reorder interval for your product."
      action={{
        content: "Save Reorder Days",
        url: 'https://help.shopify.com',
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Allow customers to set reorder intervals and buy products using their phones.</p>
    </EmptyState>
  );
 

  const ProductTable = ({ productData }) => (
    <IndexTable
      resourceName={{
        singular: "Product",
        plural: "Products",
      }}
      itemCount={productData.length}
      headings={[
        { title: "Product Name" },
        { title: "Reorder Interval" },
      ]}
      selectable={true}
    >
      {updatedProducts.map((product) => (
        <ProductTableRow
          key={product.productId}
          product={product}
        />
      ))}
    </IndexTable>
  );
  
  // {console.log(productData);}
  const ProductTableRow = ({ product }) => (
    <IndexTable.Row id={product.productId} position={product.productId}>
      <IndexTable.Cell>{product.productTitle}</IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={product.reorder_days}
        />
      </IndexTable.Cell>
    </IndexTable.Row>
  );
  
  return (
    <Page>
      <TitleBar title="Remix app template">
        
      </TitleBar>
      <BlockStack gap="400">
        <Layout>
          <Layout.Section>
           

            <Card padding="0">
            {Array.isArray(productData) && productData.length === 0 ? (
              <EmptyProductState />
            ) : (
              <ProductTable productData={productData || []} />
            )}
          </Card>
          </Layout.Section>
          
        </Layout>
      </BlockStack>
    </Page>
  );
};

async function checkIfAppIsInstalled(shop) {
  const response = await fetch(`https://reorder-shopify-app.onrender.com/auth/checkAppInstalled?shop=${shop}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to check if app is installed");
  }

  const data = await response.json();
  console.log(data.installed);
  return data.installed;
}

async function markAppAsInstalled(shop) {
  console.log(JSON.stringify({ shop}))
  const response = await fetch(`https://reorder-shopify-app.onrender.com/auth/markAppAsInstalled`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shop})
  });
  
  if (!response.ok) {
    throw new Error("Failed to mark the app as installed");
  }
}
