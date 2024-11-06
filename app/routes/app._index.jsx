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
import {createAndPinReorderDaysMetafieldDefinition } from "../utils/shopify";

export const loader = async ({ request }) => {
  const {admin,session }=await authenticate.admin(request);
  const response_shop = await admin.graphql(
    `#graphql
      query {
        shop {
          name
          email
          currencyCode
          checkoutApiSupported
          taxesIncluded
          resourceLimits {
            maxProductVariants
          }
        }
      }`,
    );
  
    // Destructure the response
  const shop_body = await response_shop.json();
    
  const shop = shop_body;

  const shopname= session.shop
  const access_token=session.accessToken
  const email= shop.data.shop.email
  const isInstalled = await checkIfAppIsInstalled(shopname);
  if (!isInstalled)
  try {
    // Call the function to create the metafield
    await createAndPinReorderDaysMetafieldDefinition(access_token, shopname);
    await markAppAsInstalled(shopname,email);
    return json({ message: "Metafield creation successful" });
  } catch (error) {
    console.error("Error creating metafield:", error);
    return json({ error: "Metafield creation failed" }, { status: 500 });
  }

  const response = await fetch("http://127.0.0.1:8000/auth/reorder_details", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to send product data to FastAPI");
  }

  const reorderDetails = await response.json();

  return json({ reorderDetails: reorderDetails,shopDetails:shop });
 
 
};

export const action = async ({ request }) => {

  const formData = await request.formData();
  const method = request.method;

  // Extract common form data
  const productId = formData.get("productId").replace("gid://shopify/Product/", "");;
  const productTitle=formData.get("productTitle");
  const email = formData.get("email");
  const shopname =formData.get("shopname");
  const reorder_days = parseFloat(formData.get("date"));

  // Construct the product data to send
  // let productData = {
  //   shop: shopname,
  //   email: email,
  //   product_id: productId,
  //   product_title:productTitle,
  //   reorder_days: reorder_days,
  // };

  // let apiUrl = "http://127.0.0.1:8000/auth/reorder";
  

  // If the request is PATCH, handle updating the product
  // if (method === "PATCH") {
     
  let apiUrl = `http://127.0.0.1:8000/auth/reorder/${productId}`; // Use specific API endpoint for PATCH
     // Update the method to PATCH
    let productData={
      product_id: productId,
      reorder_days: formData.get("reorder_days"),
    }
    // console.log(productData)
  // }
  try {
    // Create a new fetch call for each request
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error("Failed to send product data to FastAPI");
    }

    const result = await response.json();
    console.log("Response from FastAPI:", result);

    return json({ result });
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to send product data" };
  }
};


export default function Index() {
  const {reorderDetails,shopDetails}=useLoaderData();
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const [productData, setProductData] = useState(reorderDetails);
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const [updatedProducts, setUpdatedProducts] = useState(reorderDetails);

   const handleReorderChange = (productId, value) => {
    setUpdatedProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? { ...product, reorder_days: value }
          : product
      )
    );
  };
  // Handle the click of the "Edit" button
  const editReorderDay = (productId) => {
    setEditingProduct(productId); // Only the selected product should be editable
  };
  // Submit updated reorder interval to the API
  const saveReorderDay = async (product) => {
    // Find the updated product in updatedProducts
    const updatedProduct = updatedProducts.find(
      (p) => p.productId === product.productId
    );
  
    if (updatedProduct) {
      fetcher.submit(
        {
          productId: updatedProduct.productId,
          reorder_days: updatedProduct.reorder_days, // Use updated reorder_days
        },
        { method: "patch" }
      );
    }
  
    setEditingProduct(null); // Reset the editing state after saving
  };

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
        { title: "Date created" },
        { title: "Action" },
      ]}
      selectable={true}
    >
      {updatedProducts.map((product) => (
        <ProductTableRow
          key={product.productId}
          product={product}
          isEditing={editingProduct === product.productId} // Only enable editing for the selected product
          onEdit={() => editReorderDay(product.productId)} // Start editing this product
          onSave={() => saveReorderDay(product)} // Save the changes for the selected product
          onReorderChange={handleReorderChange} // Handle reorder_days change
        />
      ))}
    </IndexTable>
  );
  
  // {console.log(productData);}
  const ProductTableRow = ({ product, isEditing, onEdit, onSave, onReorderChange }) => (
    <IndexTable.Row id={product.productId} position={product.productId}>
      <IndexTable.Cell>{product.productTitle}</IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={product.reorder_days}
          onChange={(value) => onReorderChange(product.productId, value)} // Update only the edited product
          disabled={!isEditing} // Enable input only for the product being edited
        />
      </IndexTable.Cell>
      <IndexTable.Cell>{new Date(product.created_at).toDateString()}</IndexTable.Cell>
      <IndexTable.Cell>
        {isEditing ? (
          <Button onClick={onSave}>Save</Button> // Save only the selected product
        ) : (
          <Button variant="plain" onClick={onEdit}>Edit</Button> // Start editing the specific product
        )}
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
            {productData.length === 0 ? (
              <EmptyProductState />
            ) : (
              <ProductTable productData={productData} />
            )}
          </Card>
          </Layout.Section>
          
        </Layout>
      </BlockStack>
    </Page>
  );
};

async function checkIfAppIsInstalled(shop) {
  const response = await fetch(`http://127.0.0.1:8000/auth/checkAppInstalled?shop=${shop}`, {
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

async function markAppAsInstalled(shop,email) {
  const response = await fetch(`http://127.0.0.1:8000/auth/markAppAsInstalled`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shop ,email})
  });
  
  if (!response.ok) {
    throw new Error("Failed to mark the app as installed");
  }
}
