import { useEffect,useState, useCallback } from "react";
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
  Spinner,
  Modal,
  Link,
  Bleed,
  Image,
  InlineStack,TextContainer,TextField,Thumbnail,InlineError,IndexTable,EmptyState,Banner,SkeletonPage, SkeletonBodyText, SkeletonDisplayText
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { ImageIcon } from "@shopify/polaris-icons";
import { useOutletContext } from '@remix-run/react';


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
  console.log(shop.shop_id)
  
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
  const productId = formData.get("productId").replace("gid://shopify/Product/", "");
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
      throw new Error("Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance");
    }

    const result = await response.json();
    console.log("Response from FastAPI:", result);

    if (method === "POST"){return {success:"Estimated Usage Days saved successfully!",result:result};}
    return "Estimated Usage Days saved successfully!";
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance" };
  }
};


export default function Index() {
  const {reorderDetails,shopID}=useLoaderData();
  const { plan } = useOutletContext();
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const [formState, setformState] = useState('');
  const [loading, setLoading] = useState(true);
  const initialState = {
    productId: "",
    productVariantId: "",
    productTitle: "",
    productHandle: "",
    productAlt: "",
    productImage: "",
  };
  const [formProductState, setFormProductState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const [resetProduct,setResetProduct]=useState(null);
  const [updatedProducts, setUpdatedProducts] = useState(reorderDetails);
  const handleChange = (value)=>setformState({...formState,date:value})
  const [selectedProductIds, setSelectedProductIds] = useState(
    reorderDetails.map(product => product.shopify_product_id) // Assuming `savedProducts` contains the list of already saved products
  );  // Track selected products
  const [bannerMessage, setBannerMessage] = useState(""); // Store banner message
  const [bannerStatus, setBannerStatus] = useState("");
  
  
async function selectProduct() {
    try {
      // Open the Shopify resource picker
      const products = await window.shopify.resourcePicker({
        type: "product",
        action: "select", // 'select' action for choosing a product
      });

      // Ensure there is at least one product selected
      if (products && Array.isArray(products) && products.length > 0) {
        const product = products[0];
        const { id, title, variants, images, handle } = product;
        const selectedId =id.replace("gid://shopify/Product/", "");
        // Check if this product has already been selected
        const isProductSelected = selectedProductIds.includes(Number(selectedId));
        if (isProductSelected) {
          // If product is already selected, show a toast notification
          setBannerMessage(`Product "${title}" is already selected.`);
          setBannerStatus("critical");
          return;  // Exit function to avoid adding the same product
        }

        // If product is not a duplicate, add it to the selected products list
        setSelectedProductIds(prev => [...prev, Number(selectedId)]);

        // Update the form state with selected product details
        setFormProductState({
          productId: id,
          productVariantId: variants[0]?.id,
          productTitle: title,
          productHandle: handle,
          productAlt: images[0]?.altText || '',
          productImage: images[0]?.originalSrc || '',
        });

        // Optional: Show a success message if product was added successfully
        setBannerMessage(`Product "${title}" selected successfully.`);
        setBannerStatus("success");
      } else {
        console.error("No product selected.");
        setBannerMessage("No product selected. Please try again.");
        setBannerStatus("critical");
      }
    } catch (error) {
      console.error("Error selecting product:", error);
      setBannerMessage("An error occurred while selecting the product.");
      setBannerStatus("critical");
    }
  }
   // Handle change in reorder_days field
  const [activeModal, setActiveModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const toggleModal = useCallback(() => {
            setActiveModal((prev) => !prev);
        }, []);
  const confirmReset = useCallback((productId) => {
          setSelectedProductId(productId);
          toggleModal(); // Open the modal
           }, [toggleModal]);
  const handleReorderChange = useCallback((product_id, value) => {
    setUpdatedProducts((prev) =>
      prev.map((product) =>
        product.shopify_product_id === product_id
          ? { ...product, reorder_days: value }
          : product
      )
    );
  }, []);
  // Handle the click of the "Edit" button
  const editReorderDay = useCallback((productId) => {
    setEditingProduct(productId); // Only the selected product should be editable
  }, []);
  // Submit updated reorder interval to the API
  const resetReorderfield = useCallback((productid) => {
    // Update the state to set reorder_days to null
    setUpdatedProducts((prev) =>
      prev.map((product) =>
        product.shopify_product_id === productid
          ? { ...product, reorder_days: null }
          : product
      )
    );
  
    // Submit the reset value to the backend
    fetcher.submit(
      {
        productId: productid,
        reorder_days: null,
      },
      { method: "patch" }
    );
  
    // Clear editing and reset state
    setEditingProduct(null);
    // setResetProduct(null);
    setSelectedProductId(null);
    setActiveModal(false);
  }, [fetcher]);
  
  // const confirmReset = (productId) => {
  //   if (window.confirm("Are you sure you want to reset the reorder days?")) {
  //     resetReorderfield(productId);
  //   }
  // };
  const saveReorderDay = useCallback(
    (product) => {
      const updatedProduct = updatedProducts.find(
        (p) => p.shopify_product_id === product.shopify_product_id
      );

      if (updatedProduct) {
        setLoading(true);
        fetcher.submit(
          {
            productId: updatedProduct.shopify_product_id,
            reorder_days: updatedProduct.reorder_days,
          },
          { method: "patch" }
        );

        // Optimistically update state
        setUpdatedProducts((prev) =>
          prev.map((p) =>
            p.shopify_product_id === updatedProduct.shopify_product_id
              ? updatedProduct
              : p
          )
        );
      }

      setEditingProduct(null);  
      
      
    },
    [fetcher, updatedProducts]
  );
  useEffect(() => {
    // Simulate loading when index page loads
    if (reorderDetails) {
      setLoading(false);
    }
  }, [reorderDetails]);
  useEffect(() => {
    if (fetcher.state === "idle") {
      setLoading(false); // Stop loading when fetcher is idle
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (data?.result) {
      const resultArray = Array.isArray(data.result) ? data.result : [data.result]; // Ensure it's an array
      setUpdatedProducts((prevData) => [...prevData, ...resultArray]);
      setFormProductState(initialState);
      setformState('')

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
        { title: "Estimated Usage Days" },
        { title: "Date created" },
        {
          title: loading ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Spinner size="small" accessibilityLabel="Loading data" />
              <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                Saving
              </Text>
            </div>
          ) : (
            "Actions"
          ),
        },
      ]}
      selectable={false}
    >
      {productData.map((product) => (
        <ProductTableRow
          key={product.shopify_product_id}
          product={product}
          isEditing={editingProduct === product.shopify_product_id}
          onEdit={() => editReorderDay(product.shopify_product_id)}
          onReset={() => resetReorderfield(product.shopify_product_id)}
          onSave={() => saveReorderDay(product)}
          onReorderChange={handleReorderChange}
        />
      ))}
    </IndexTable>
  );
  
  // {console.log(productData);}
  const ProductTableRow = ({ product, isEditing, onEdit,onReset, onSave, onReorderChange }) => (
    <IndexTable.Row id={product.shopify_product_id} position={product.shopify_product_id}>
      <IndexTable.Cell>{product.title}</IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={product.reorder_days || ''}
          onChange={(value) => onReorderChange(product.shopify_product_id, value)} // Update only the edited product
          disabled={!isEditing} // Enable input only for the product being edited
        />
      </IndexTable.Cell>
      <IndexTable.Cell>{new Date(product.created_at).toDateString()}</IndexTable.Cell>
      <IndexTable.Cell><div>
        {isEditing ? (
          <Button onClick={onSave}>Save</Button> // Save only the selected product
        ) : (
          <Button variant="plain" onClick={onEdit}>Edit</Button> // Start editing the specific product
        )}
        <div style={{ display: "inline-block", width: "8px" }}></div> {/* Spacer */}
        <Button variant="plain" onClick={() => confirmReset(product.shopify_product_id)}>Reset</Button><Modal
                size="small"
                open={activeModal}
                onClose={toggleModal}
                title="Reset Estimated Usage Days"
                primaryAction={{
                  content: 'Reset',
                  onAction: () => resetReorderfield(selectedProductId),
                }}
                secondaryAction={{
                  content: 'Cancel',
                  onAction: toggleModal,
                }}
              >
                <Modal.Section>
                  <p>
                    Are you sure you want to reset? This will remove all Estimated Usage Days, but you can reconfigure them later.
                  </p>
                </Modal.Section>
              </Modal></div>
      </IndexTable.Cell>
      
    </IndexTable.Row>
  );

  if (loading) {
    return (
      <SkeletonPage title="Loading App Data">
        <Layout>
          <Layout.Section>
            <SkeletonDisplayText size="large" />
            <SkeletonBodyText lines={3} />
          </Layout.Section>
          <Layout.Section>
            {[...Array(5)].map((_, index) => (
              <SkeletonBodyText key={index} lines={1} />
            ))}
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  
  return (
    <Page>
      <TitleBar title="Welcome to ReOrder Reminder Pro">
            Smart, Automated Reorder Reminders for Repeat Sales Growth!
      </TitleBar>
      <Card roundedAbove="sm" padding="400">
        <Bleed marginInline="400" marginBlock="400" >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source="../logo.png" // Replace with a valid image URL
              alt="A placeholder image with purple and orange stripes"
              style={{height: 70 ,alignItems: 'center',marginTop:"1rem"}}
            />
          </div>
          <Box background="bg-surface-secondary" padding="400" style={{ alignItems: 'center',marginBottom:'1rem' }}>
            
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
              Intelligent, Automated Reorder Reminders for Repeat Sales Growth!
            </Text>
            
          </Box>
        </Bleed>
        <BlockStack gap="400" >
          <div style={{paddingLeft:'5rem',paddingRight:'5rem',paddingTop:'1rem',paddingBottom:'1rem',justifyContent:'center'}}>
            <Card background="bg-surface-info-active">
                <fetcher.Form method="post">
                <input type="hidden" name="shopid" value={shopID} />
                <BlockStack gap="500" >
                  {bannerMessage && (
                  <Banner
                    title={bannerMessage}
                    status={bannerStatus} // 'success', 'critical', or 'warning'
                    onDismiss={() => setBannerMessage("")} // Dismiss the banner
                  />
                )}
                  <div style={{paddingLeft:'1rem',paddingRight:'1rem'}}>
                    <BlockStack gap="500">
                    <InlineStack align="space-between">
                
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
                    <div style={{marginTop:'5px'}}>
                      <div style={{ marginBottom: '1rem' }}>
                        <TextField label="Estimated Usage Days " type="number" name="date" value={formState.date} onChange={handleChange} autoComplete="off" />                    
                      </div>
                      <div style={{display:'grid' ,justifyContent:'center'}}>
                        <Button submit disabled={plan === "FREE" && updatedProducts.length >= 5} >Save</Button> 
                        
                        
                      </div>
                    </div>
                  </div>
                </BlockStack> 
                </fetcher.Form>
                {state === "submitting" && <p>Submitting...</p>}
                {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
                {data?.success && <p style={{ color: "darkgreen" }}>{data.success}</p>}
            </Card>
          </div>
            <Text variant="headingLg" as="h5" fontWeight="medium" alignment="center">
            Here, you'll find a list of all products with Estimated Usage Days set up.
            </Text>
            <Text
            variant="headingMd" as="h6"
            tone="subdued"
            fontWeight="regular"
            alignment="center"
            
          >
            These products are ready to send automated reorder reminders to your customers based on their typical usage.
            </Text>
            <div style={{ marginLeft:'5rem',marginRight:'5rem'}}>
              <Card padding="0" >
              {updatedProducts.length === 0 ? (
                <EmptyProductState />
              ) : (
                <ProductTable productData={updatedProducts} />
              )}
              {plan === "FREE" && updatedProducts.length >= 5 && (
                  <TextContainer>
                    <Banner  tone="info">
                      <p>
                      You’ve reached the maximum number of products allowed for your current plan.
                      <Button variant="plain"  >Upgrade Now</Button>  to add more.
                      </p>
                    </Banner>
                  </TextContainer>
                )}
              </Card>
            </div>
            
            <Card background="bg-surface-warning-active" style={{ marginTop:'0.5rem'}}>
              <Text variant="headingMd" as="h6" alignment="center">
              How We Calculate Reminder Timing:
              </Text>
              <Text variant="headingSm" tone="subdued" as="h6" alignment="center">
                We calculate the reminder date based on the following formula:
              </Text>
              <Text variant="headingSm" as="h6" alignment="center">
              Order Date + (Ordered Quantity * Estimated Usage Days of the Product) - Buffer Time
              </Text>
            </Card>
            

        </BlockStack>
      </Card>
    </Page>
  );
};