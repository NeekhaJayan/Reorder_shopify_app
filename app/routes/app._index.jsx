
import { json } from "@remix-run/node";

import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  MediaCard,
  TextContainer,Banner,Link
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { useNavigate } from "@remix-run/react";
import ProductTable  from "../componets/ProductTable";
import ProductForm from "../componets/ProductForm";
import EmptyProductState from "../componets/EmptyProductState";
import SkeletonLoad from "../componets/SkeletonLoad";
import { useAppData } from "../hooks/useAppData";
import { shopInstance } from "../services/api/ShopService";
import { productInstance } from "../services/api/ProductService";
import '../styles/index.css';

export const loader = async ({ request }) => {
  const {session }=await authenticate.admin(request);
  const shop_domain=session.shop
  let shop;
  let retries = 3;
  let delay = 2000;
  for (let attempt = 1; attempt <= retries; attempt++) {
     shop = await shopInstance.getShopDetails(shop_domain);
    if (shop && shop.shop_id) break; // Exit loop if shop ID exists
    console.log(`Retrying shop fetch: Attempt ${attempt}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!shop || !shop.shop_id) {
    throw new Error("Shop data not found in FastAPI after retries");
  }
  const reorderDetails = await productInstance.getAllProductDetails(shop.shop_id);
  return json({ reorderDetails: reorderDetails,shopID:shop.shop_id,bufferTime:shop.buffer_time }); 
 
};

export const action = async ({ request }) => {

  const formData = await request.formData();
  const method = request.method;
  let result;
  try{
    if (method === "PATCH") {
      result = await productInstance.updateProductData(formData);
      console.log(result);
      return {success:"",result:result};
    } else {
      result = await productInstance.saveProductData(formData);
      return {success:"Estimated Usage Days saved successfully!",result:result};
    } 
  }catch (error) {
    console.error("Error:", error);
    return { error: "Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance" };
  }

 
};


export default function Index() {
  const {fetcher,shopID,
    formState,
    setformState,
    formProductState,
    setFormProductState,
    loading,
    spinner,
    updatedProducts,
    editingProduct,
    bannerMessage,
    bannerStatus,
    setBannerMessage,
    selectProduct,
    handleReorderChange,
    editReorderDay,
    saveReorderDay,
    resetReorderfield,
    onCancel,
    confirmReset,
    activeModal,
    toggleModal,
    selectedProductId,
    selectedVariantId,
    handleChange,plan,showBanner,message,setShowBanner}=useAppData();
    const { data, state } = fetcher;

    const navigate =useNavigate();
  

  return (
    <>
    {loading? (<SkeletonLoad/>):(
      
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
        {showBanner && (
          <Banner tone="success" onDismiss={() => setShowBanner(false)}>
            <p>{message}</p>
            <Button variant="plain" onClick={() => {
                      navigate("/app/settings?tab=2");}}>Upgrade to Pro</Button>
          </Banner>
        )}
        <BlockStack gap="400" >
          <div style={{paddingLeft:'5rem',paddingRight:'5rem',paddingTop:'1rem',paddingBottom:'1rem',justifyContent:'center'}}>
            <ProductForm bannerMessage={bannerMessage}
            bannerStatus={bannerStatus}
            setBannerMessage={setBannerMessage}
            handleChange={handleChange}
            formState={formState}
            formProductState={formProductState}
            selectProduct={selectProduct} 
            plan={plan} 
            updatedProducts={updatedProducts}
            fetcher={fetcher}
            shopID={shopID}/>
            {state === "submitting" && <p>Submitting...</p>}
            {data?.error && <p style={{ color: "red" }}>Error: {data.error}</p>}
            {data?.success && <p style={{ color: "darkgreen" }}>{data.success}</p>}
          </div>
            <Text variant="headingLg" as="h5" fontWeight="medium" alignment="center">
            Here, you'll find a list of all products with Estimated Usage Days set up.
            </Text>
            <Text variant="headingMd" as="h6" tone="subdued" fontWeight="regular" alignment="center">
            These products are ready to send automated reorder reminders to your customers based on their typical usage.
            </Text>
            <div style={{ marginLeft:'5rem',marginRight:'5rem'}}>
              <Card padding="0" >
              {updatedProducts.length === 0 ? (
                <EmptyProductState />
              ) : (
                
                <ProductTable productData={updatedProducts} 
                            spinner={spinner} 
                            editingProduct={editingProduct} 
                            editReorderDay={editReorderDay} 
                            resetReorderfield={resetReorderfield} 
                            saveReorderDay={saveReorderDay} 
                            cancelReorderDays={onCancel}
                            handleReorderChange={handleReorderChange} 
                            activeModal={activeModal} 
                            toggleModal={toggleModal}
                            confirmReset={confirmReset}
                            selected_productId={selectedProductId}
                            selected_variantId={selectedVariantId}/>
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
            
            <div className="whatsapp-button">
          <a
            href="https://wa.me/6282086660?text=Hello!%20I'm%20interested%20in%20your%20services"
            
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="../help.png" alt="Chat with us on WhatsApp" />
          </a>
        </div>        
        </BlockStack>
        
      </Card>
    </Page>)}
  
  </>
  );
};