import {BlockStack, Banner, Card, InlineStack, Thumbnail, Text, Button,InlineError,TextField} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useState} from "react";
import { ImageIcon } from "@shopify/polaris-icons";



const ProductForm = ({ bannerMessage,bannerStatus,setBannerMessage,handleChange,handleBlur,formState,formProductState,selectProduct,plan,updatedProducts,fetcher,shopID} ) => {
    const navigate =useNavigate();
    const [errors, setErrors] = useState({});

    return (
    <>
        <Card background="bg-surface-emphasis-active">
                    <fetcher.Form method="post">
                    <input type="hidden" name="shopid" value={shopID} />
                    <BlockStack gap="500" >
                    {bannerMessage && (
                    <Banner
                        title={bannerMessage}
                        tone={bannerStatus} // 'success', 'critical', or 'warning'
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
                            value={formProductState.productVariantIds ?formProductState.productVariantIds.join(','): ""}
                        />
                        <input
                            type="hidden"
                            name="productImage"
                            value={formProductState.productImage ||""}
                        /> 
                        
                        </BlockStack>
                        <div style={{marginTop:'5px'}}>
                        <div style={{ marginBottom: '1rem' }}>
                            <TextField label="Estimated Usage Days " type="number" name="date" value={formState.date} onChange={handleChange} onBlur={handleBlur} autoComplete="off" />                    
                        </div>
                        <div style={{ display: 'grid', justifyContent: 'center' }}>
                            {plan === "FREE" && updatedProducts.length >= 5 ? (
                            <Button variant="secondary" onClick={() => navigate("/app/settings?tab=2")}>
                                Upgrade
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
                    
        </Card>
        </>
    );
};

export default ProductForm;





