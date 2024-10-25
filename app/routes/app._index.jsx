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


export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response_data = await admin.graphql(
    `#graphql
    query {
      products(first: 10, reverse: true) {
        edges {
          node {
            id
            title
            handle
            resourcePublicationOnCurrentPublication {
              publication {
                name
                id
              }
              publishDate
              isPublished
            }
          }
        }
      }
    }`,
  );

  const data = await response_data.json();

  
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
  }`
);

const shop = await response_shop.json();


  // const {admin,session }=await authenticate.admin(request);
  // const data=await admin.rest.resources.Product.all({
  //   session: session,
  // });
  // const shop = await admin.rest.resources.Shop.all({
  //     session: session,
  //   });


  const response = await fetch("https://reorderappapi.onrender.com/auth/reorder_details", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to send product data to FastAPI");
  }

  const reorderDetails = await response.json();
  console.log(data,shop)
  return json({ products: data, reorderDetails: reorderDetails,shopDetails:shop });
 
 
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
  let productData = {
    shop: shopname,
    email: email,
    product_id: productId,
    product_title:productTitle,
    reorder_days: reorder_days,
  };

  let apiUrl = "https://reorderappapi.onrender.com/auth/reorder";
  let fetchMethod = "POST"; // Default method is POST

  // If the request is PATCH, handle updating the product
  if (method === "PATCH") {
     
    apiUrl = `https://reorderappapi.onrender.com/auth/reorder/${productId}`; // Use specific API endpoint for PATCH
    fetchMethod = "PATCH"; // Update the method to PATCH
    productData={
      product_id: productId,
      reorder_days: formData.get("reorder_days"),
    }
    console.log(productData)
  }
  try {
    // Create a new fetch call for each request
    const response = await fetch(apiUrl, {
      method: method,
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
  const {products,reorderDetails,shopDetails}=useLoaderData();
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const [formState, setformState] = useState('');
  const [formProductState, setFormProductState] = useState(products);
  const [errors, setErrors] = useState({});
  const [productData, setProductData] = useState(reorderDetails);
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const [updatedProducts, setUpdatedProducts] = useState(productData);
  const handleChange = (value)=>setformState({...formState,date:value})
  // console.log("After Assigning",productData)
  async function selectProduct() {
    console.log(products)
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });
    console.log(products)
    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormProductState({
        ...formProductState,
        productId: id,
        productVariantId: variants[0].id,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }
   // Handle change in reorder_days field
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
  // console.log(data)
  useEffect(() => {
  if (data?.result) {
    const resultArray = Array.isArray(data.result) ? data.result : [data.result]; // Ensure it's an array
    setProductData((prevData) => [...prevData, ...resultArray]);
  }
}, [data]);


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
            <Card>
              
            <fetcher.Form method="post">
                <input type="hidden" name="shopname" value={shopDetails.data[0].domain} />
                <input type="hidden" name="email" value={shopDetails.data[0].customer_email}/>
                <BlockStack gap="500">
                  <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                 
                  {formProductState.productId ? (
                    <Button variant="plain" onClick={selectProduct}>
                      Change product
                    </Button>
                  ) : null}
                </InlineStack>
                {formProductState.productId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Thumbnail
                      source={formProductState.productImage || ImageIcon}
                      alt={formProductState.productAlt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formProductState.productTitle}
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                    {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </BlockStack>
                )} 
                <input
                    type="hidden"
                    name="productId"
                    value={formProductState.productId || ""}
                  /> 
                <input
                    type="hidden"
                    name="productTitle"
                    value={formProductState.productTitle || ""}
                  /> 
              </BlockStack>
                  <TextField label="Re-order Date" type="number" name="date" value={formState.date} onChange={handleChange} autoComplete="off" />
                  <Button submit>Save</Button> 
                </BlockStack> 
            </fetcher.Form>
            {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
            
            </Card>

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
