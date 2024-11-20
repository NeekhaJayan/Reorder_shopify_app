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
  InlineStack,Select,TextField,Thumbnail,InlineError,IndexTable,EmptyState,MediaCard
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { ImageIcon } from "@shopify/polaris-icons";
import {listProductsWithMetafields } from "../utils/shopify";

export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  const shopname= session.shop
  const access_token=session.accessToken
  const productData=await listProductsWithMetafields(admin);
  return json({ reorderDetails: productData,shop:shopname});

 
 
};

export const action = async ({ request }) => {};


export default function Index() {
  const {reorderDetails = [],shop}=useLoaderData();
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
      selectable={false}
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
     {product.reorder_days} 
      </IndexTable.Cell>
      <IndexTable.Cell>
      <a
        href={`https://${shop}/admin/products/${product.productId.replace("gid://shopify/Product/","",)}`}
        target="_blank"
        rel="noopener noreferrer"
      > Edit 
      </a>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
  
  return (
    <Page>
      <TitleBar title="Reorder Reminder">
        Set the typical usage duration for each product
      </TitleBar>
      <BlockStack gap="800">
        <MediaCard
        title="Getting Started"
        primaryAction={{
          content: 'Configure your re-order reminder email settings ',
          onAction: () => {window.location.href = '/app/settings'; },
        }}
        description="Set the typical usage duration for each product,allowing you to specify how many days a product is expected to last under normal use.Based on this duration,the app will calculate when to send a reorder reminder to your customers,ensuring they receive a timely nudge to restock before running low"
        popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
        style={{ marginBottom: '20px' }}
      >
        <img
          alt=""
          width="100%"
          height="100%"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          src="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
        />
        </MediaCard>
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
      </BlockStack>
      
      
    </Page>
  );
};
