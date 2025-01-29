import { useEffect,useState, useCallback } from "react";
import { json } from "@remix-run/node";
import {  useFetcher,useLoaderData ,Form, useNavigate} from "@remix-run/react";

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
  MediaCard,
  ButtonGroup,
  InlineStack,TextContainer,TextField,Thumbnail,InlineError,IndexTable,EmptyState,Banner,SkeletonPage, SkeletonBodyText, SkeletonDisplayText
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { ImageIcon } from "@shopify/polaris-icons";
import { useOutletContext } from '@remix-run/react';



export const loader = async ({ request }) => {
  const {session }=await authenticate.admin(request);
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

  let inputData,apiUrl;

  const formData = await request.formData();
  console.log(formData);
  const method = request.method;
  const productId = formData.get("productId").replace("gid://shopify/Product/", "");
  const shopid =formData.get("shopid");
  const productImage=formData.get("productImage")
  
  

  // If the request is PATCH, handle updating the product
  if (method === "PATCH") {
     
    apiUrl = `https://reorderappapi.onrender.com/auth/products/${productId}`; // Use specific API endpoint for PATCH
     // Update the method to PATCH
     inputData={
      shop_id:formData.get("shopId"),
      shopify_product_id:productId,
      shopify_variant_id:formData.get("variantId"),
      reorder_days: parseInt(formData.get("reorder_days"), 10),
    }
    console.log(inputData)
  }
  else{
    apiUrl = "https://reorderappapi.onrender.com/auth/products";
    const variantIds = formData.get("productVariantId").split(",");
    const productTitles=formData.get("productTitle").split(",");
    const reorder_days = parseFloat(formData.get("date"));
    inputData = variantIds.map((variantId, index) => {
      return {
        shop_id: shopid,
        shopify_product_id: productId,
        shopify_variant_id: variantId.replace("gid://shopify/ProductVariant/", ""),
        title: productTitles[index],
        image_url:productImage ,  // Assign the correct title for each variant
        reorder_days: reorder_days,
      };
    });
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
  const navigate=useNavigate();
  const fetcher = useFetcher();
  const { data, state } = fetcher;
  const [formState, setformState] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinner,setSpinner]=useState(false);
  console.log(plan)
  const initialState = {
    productId: "",
    productVariantIds: "",
    productTitle: "",
    productHandle: "",
    productVariantDetails:"",
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
    reorderDetails.map(product => ({
      productId: product.shopify_product_id,
      variantIds: product.selected_variant_ids || [],  // Assuming selected_variant_id is available in reorderDetails
    }))
  );  // Track selected products
  const [bannerMessage, setBannerMessage] = useState(""); // Store banner message
  const [bannerStatus, setBannerStatus] = useState("");
  
  // {console.log(updatedProducts);}
  async function selectProduct() {
    try {
      // Open the Shopify resource picker
      const products = await window.shopify.resourcePicker({
        type: "product",
        action: "select",
      });
  
      if (products && Array.isArray(products) && products.length > 0) {
        const product = products[0];
        const { id, title, variants, images, handle } = product;
        const selectedId = id.replace("gid://shopify/Product/", "");
  
        // Check if this product with its selected variants has already been selected
        const selectedVariants = variants.map(variant => ({
          id: variant.id.replace("gid://shopify/ProductVariant/", ""),
          title: variant.title,
        }));
  
        const existingProduct = selectedProductIds.find(
          selected => selected.productId === Number(selectedId)
        );
  
        if (existingProduct) {
          const areVariantsSelected = selectedVariants.every(selectedVariant =>
            existingProduct.variantIds.includes(selectedVariant.id)
          );
  
          if (areVariantsSelected) {
            setBannerMessage(`All variants of "${title}" are already selected.`);
            setBannerStatus("critical");
            return;
          }
        }
  
        // Prepare product and variant information for state
        const variantDetails = selectedVariants.map(
          variant => `${title} - ${variant.title}` // Concatenate product title and variant title
        );
        setSelectedProductIds(prev => {
          const updatedSelected = prev.filter(
            selected => selected.productId !== Number(selectedId)
          );
  
          return [
            ...updatedSelected,
            { productId: Number(selectedId), variantIds: selectedVariants.map(variant => variant.id) },
          ];
        });
  
        // Update the form state with product title and variant details
        setFormProductState({
          productId: id,
          productVariantIds: selectedVariants.map(variant => variant.id), // Array of variant IDs
          productTitle: title,
          productVariantDetails: variantDetails, // Array of "Product Title - Variant Title"
          productHandle: handle,
          productAlt: images[0]?.altText || '',
          productImage: images[0]?.originalSrc || '',
        });
  
        setBannerMessage(`Product "${title}" with variants selected successfully.`);
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
  const [selectedVariantId, setSelectedVarientId] = useState(null);
  
  const toggleModal = useCallback(() => {
            setActiveModal((prev) => !prev);
        }, []);
  const confirmReset = useCallback((productId,variantId) => {
          setSelectedProductId(productId);
          setSelectedVarientId(variantId);
          toggleModal(); // Open the modal
           }, [toggleModal]);
  const handleReorderChange = useCallback((product_id, value) => {
    setUpdatedProducts((prev) =>
      prev.map((product) =>
        product.shopify_variant_id === product_id
          ? { ...product, reorder_days: value }
          : product
      )
    );
  }, []);
  // Handle the click of the "Edit" button
  const editReorderDay = useCallback((productId) => {
    setUpdatedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.shopify_variant_id === productId) {
          return { ...product, original_reorder_days: product.reorder_days }; // Save the original value
        }
        return product;
      })
    );
    setEditingProduct(productId); // Only the selected product should be editable
  }, []);
  // Submit updated reorder interval to the API
  const resetReorderfield = useCallback((productid,variantid) => {
    // Update the state to set reorder_days to null
    setUpdatedProducts((prev) =>
      prev.filter((product) => product.shopify_variant_id !== variantid)
    );
    // Submit the reset value to the backend
    fetcher.submit(
      {
        productId: productid,
        variantId:variantid,
        reorder_days: null,
      },
      { method: "patch" }
    );
  
    // Clear editing and reset state
    setEditingProduct(null);
    // setResetProduct(null);
    setSelectedProductId(null);
    setSelectedVarientId(null);
    setActiveModal(false);
  }, [fetcher]);
  
  const onCancel = (productId) => {
    setUpdatedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.shopify_variant_id === productId) {
          return { ...product, reorder_days: product.original_reorder_days }; // Revert to original value
        }
        return product;
      })
    );
    setEditingProduct(null); // Exit editing mode
  };
  const saveReorderDay = useCallback(
    (product) => {
      const updatedProduct = updatedProducts.find(
        (p) => p.shopify_variant_id === product.shopify_variant_id
      );

      if (updatedProduct) {
        setSpinner(true);
        fetcher.submit(
          {
            shopId:shopID,
            productId: updatedProduct.shopify_product_id,
            variantId: updatedProduct.shopify_variant_id,
            reorder_days: updatedProduct.reorder_days,
          },
          { method: "patch" }
        );

        // Optimistically update state
        
        setUpdatedProducts((prev) =>
          prev.map((p) =>
            p.shopify_variant_id === updatedProduct.shopify_variant_id
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
      setSpinner(false); // Stop loading when fetcher is idle
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (data?.result) {
      const resultArray = Array.isArray(data.result) ? data.result : [data.result]; // Ensure it's an array
      setUpdatedProducts((prevData) => [...resultArray, ...prevData]);
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
          title: spinner ? (
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
          key={product.shopify_variant_id}
          product={product}
          isEditing={editingProduct === product.shopify_variant_id}
          onEdit={() => editReorderDay(product.shopify_variant_id)}
          onReset={() => resetReorderfield(product.shopify_variant_id)}
          onSave={() => saveReorderDay(product)}
          onReorderChange={handleReorderChange}
        />
      ))}
    </IndexTable>
  );
  
  
  const ProductTableRow = ({ product, isEditing, onEdit,onReset, onSave, onReorderChange }) => (
    <IndexTable.Row id={product.shopify_variant_id} position={product.shopify_variant_id}>
      <IndexTable.Cell>{product.title}</IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={product.reorder_days || ''}
          onChange={(value) => onReorderChange(product.shopify_variant_id, value)} // Update only the edited product
          disabled={!isEditing} // Enable input only for the product being edited
        />
      </IndexTable.Cell>
      <IndexTable.Cell>{new Date(product.created_at).toDateString()}</IndexTable.Cell>
      <IndexTable.Cell><div>
        {isEditing ? (
          <ButtonGroup>
          <Button onClick={onSave} variant="primary" >
            Save
          </Button>
          <Button primary onClick={() => onCancel(product.shopify_variant_id)}>
            Cancel
          </Button>
        </ButtonGroup> // Save only the selected product
        ) : (
          <Button variant="plain" onClick={onEdit}>Edit</Button> // Start editing the specific product
        )}
        <div style={{ display: "inline-block", width: "8px" }}></div> {/* Spacer */}
        <Button variant="plain" onClick={() => confirmReset(product.shopify_product_id,product.shopify_variant_id)}>Reset</Button><style>
        {`
          .Polaris-Backdrop {
            background-color: rgba(0, 0, 0, 0.1); /* Custom backdrop color */
          }
        `}
      </style><Modal
                
                size="small"
                open={activeModal}
                onClose={toggleModal}
                title="Reset Estimated Usage Days"
                primaryAction={{
                  content: 'Reset',
                  onAction: () => resetReorderfield(selectedProductId,selectedVariantId),
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
      
      <Card roundedAbove="sm" padding="400">
        <div style={{padding:'1rem 3rem',justifyContent:'center'}}>
          <MediaCard
            title={<Text
              variant="headingLg"
              as="span"
              tone="subdued"
              fontWeight="regular"
              alignment="center"
              padding="400"
            >
              Intelligent, Automated Reorder Reminders for Repeat Sales Growth!
            </Text>}  
          >
            <img
              alt=""
              width="100%"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                marginLeft:'0.5rem',
              }}
              src="../logo.png?width=1850"
            />
          </MediaCard>
        </div>
        
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
                        value={formProductState.productVariantDetails?formProductState.productVariantDetails.join(','):""}
                      /> 
                      <input
                        type="hidden"
                        name="productVariantId"
                        value={formProductState.productVariantIds ? formProductState.productVariantIds.join(',') : ""}
                      />
                      <input
                        type="hidden"
                        name="productImage"
                        value={formProductState.productImage ||""}
                      /> 
                      
                    </BlockStack>
                    <div style={{marginTop:'5px'}}>
                      <div style={{ marginBottom: '1rem' }}>
                        <TextField label="Estimated Usage Days " type="number" name="date" value={formState.date} onChange={handleChange} autoComplete="off" />                    
                      </div>
                      <div style={{ display: 'grid', justifyContent: 'center' }}>
                        {plan === "FREE" && updatedProducts.length >= 5 ? (
                          <Button variant="secondary" onClick={() => navigate("/app/settings?tab=2")}>
                            Upgrade Now
                          </Button>
                        ) : (
                          <Button variant="secondary" submit>
                            Save
                          </Button>
                        )}
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
                      <Button variant="plain" onClick={() => {
                      navigate("/app/settings?tab=2");}} >Upgrade Now</Button>  to add more.
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