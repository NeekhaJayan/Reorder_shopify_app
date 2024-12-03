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
  const {admin,session }=await authenticate.admin(request);
  // console.log(admin,session)
  const shop_domain=session.shop
  const shop_response = await fetch(`https://reorderappapi.onrender.com/auth/shops/${shop_domain}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const shop = await shop_response.json();
  
  const response = await fetch(`https://reorderappapi.onrender.com/auth/products/${shop.shop_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to send product data to FastAPI");
  }

  const reorderDetails = await response.json();

  return json({ reorderDetails: reorderDetails,shopID:shop.shop_id });
 
 
};

export const action = async ({ request }) => {

  const formData = await request.formData();
  const method = request.method;
  let inputData
  // Extract common form data
  const productId = formData.get("productId").replace("gid://shopify/Product/", "");;
  const productTitle=formData.get("productTitle");
  const shopid =formData.get("shopid");

  const reorder_days = parseFloat(formData.get("date"));

  // Construct the product data to send
  inputData = {
    shop_id: shopid,
    shopify_product_id: productId,
    title:productTitle,
    reorder_days: reorder_days,
  };
console.log(inputData);
  let apiUrl = "https://reorderappapi.onrender.com/auth/products";
  

  // If the request is PATCH, handle updating the product
  if (method === "PATCH") {
     
    apiUrl = `https://reorderappapi.onrender.com/auth/products/${productId}`; // Use specific API endpoint for PATCH
     // Update the method to PATCH
     inputData={
      shopify_product_id:productId,
      reorder_days: parseInt(formData.get("reorder_days"), 10),
    }
    console.log(inputData)
  }
  try {
    // Create a new fetch call for each request
    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      throw new Error("Failed to send Update data to FastAPI");
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
  const {products,reorderDetails,shopID}=useLoaderData();
  console.log(products)
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const [formState, setformState] = useState('');
  const [formProductState, setFormProductState] = useState('');
  const [errors, setErrors] = useState({});
  const [productData, setProductData] = useState(reorderDetails);
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const [updatedProducts, setUpdatedProducts] = useState(reorderDetails);
  const handleChange = (value)=>setformState({...formState,date:value})
  // console.log("After Assigning",productData)
  async function selectProduct() {
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
   const handleReorderChange = (product_id, value) => {
    setUpdatedProducts((prev) =>
      prev.map((product) =>
        product.shopify_product_id === product_id
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
      (p) => p.shopify_product_id === product.shopify_product_id
    );
  
    if (updatedProduct) {
      fetcher.submit(
        {
          productId: updatedProduct.shopify_product_id,
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
    setUpdatedProducts((prevData) => [...prevData, ...resultArray]);
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
          key={product.shopify_product_id}
          product={product}
          isEditing={editingProduct === product.shopify_product_id} // Only enable editing for the selected product
          onEdit={() => editReorderDay(product.shopify_product_id)} // Start editing this product
          onSave={() => saveReorderDay(product)} // Save the changes for the selected product
          onReorderChange={handleReorderChange} // Handle reorder_days change
        />
      ))}
    </IndexTable>
  );
  
  // {console.log(productData);}
  const ProductTableRow = ({ product, isEditing, onEdit, onSave, onReorderChange }) => (
    <IndexTable.Row id={product.shopify_product_id} position={product.shopify_product_id}>
      <IndexTable.Cell>{product.title}</IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={product.reorder_days}
          onChange={(value) => onReorderChange(product.shopify_product_id, value)} // Update only the edited product
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
                <input type="hidden" name="shopid" value={shopID} />
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
            {updatedProducts.length === 0 ? (
              <EmptyProductState />
            ) : (
              <ProductTable productData={updatedProducts} />
            )}
          </Card>
          </Layout.Section>
          
        </Layout>
      </BlockStack>
    </Page>
  );
};