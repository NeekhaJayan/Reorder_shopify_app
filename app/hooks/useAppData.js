import { useState, useEffect, useCallback,useLayoutEffect } from "react";
import { useFetcher, useLoaderData ,useSearchParams} from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';

export function useAppData() {
    const {reorderDetails,shopID,bufferTime,templateId}=useLoaderData();
    const { plan } = useOutletContext();
    const fetcher = useFetcher();
    const [formState, setformState] = useState('');
    const [loading, setLoading] = useState(true);
    const [spinner,setSpinner]=useState(false);
    const [bannerMessage, setBannerMessage] = useState(""); // Store banner message
    const [bannerStatus, setBannerStatus] = useState("");
    const [searchParams] = useSearchParams();
    const rawMessage = searchParams.get("message");
    const message = rawMessage ? decodeURIComponent(rawMessage) : null;
    const [showBanner, setShowBanner] = useState(!!message);
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
    const { data, state } = fetcher;
    const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
    const [resetProduct,setResetProduct]=useState(null);
    const [updatedProducts, setUpdatedProducts] = useState(reorderDetails);
    useEffect(() => {
        if (message) {
            fetcher.submit(
                {
                  shopId: shopID,
                  plan:plan,
                  type:'shop_update'
                },
                { method: "patch" }
              );
            const timer = setTimeout(() => setShowBanner(false), 20000); // Auto-hide after 5 sec
            return () => clearTimeout(timer);
        }
      }, [message]);
      const handleChange = (value) => {
        // Allow only positive numbers
        if (value < 0) return;
    
        setformState((prevState) => ({ ...prevState, date: value }));
    };
    
    const handleBlur = () => {
        if (!formState.date) {
            setBannerMessage("Please enter the estimated usage days");
            setBannerStatus("critical");
            return;
        }
    
        if (formState.date <= bufferTime) {
            setBannerMessage("Estimated Usage Days should be greater than BufferTime!!!");
            setBannerStatus("critical");
            return;
        } else {
            setBannerMessage(""); // Clear the error if input is valid
            setBannerStatus("");
        }
    };
    const handleSubmit = (event) => {
        event.preventDefault();
    
        if (!formState.date) {
            setBannerMessage("Please enter the estimated usage days.");
            setBannerStatus("critical");
            return;
        }
    
        if (formState.date <= 5) {
            setBannerMessage("Estimated Usage Days should be greater than 5!!!");
            setBannerStatus("critical");
            return;
        }
    
        setBannerMessage("");
        setBannerStatus("");
    
        // If everything is valid, submit the form manually
        // event.target.submit();
        const form = event.target;
        const formData = new FormData(form);
        fetcher.submit(
            formData,
            { method: "post" }
            );

    };
    const [selectedProductIds, setSelectedProductIds] = useState(
        reorderDetails.map(product => ({
        productId: product.shopify_product_id,
        variantIds: [product.shopify_variant_id],  // Assuming selected_variant_id is available in reorderDetails
        }))
    );  // Track selected products
   
  

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
            if (selectedVariants.length > 1) {
            setBannerMessage(`You can select only one variant at a time. Please try again.`);
            setBannerStatus("critical");
            return;
        }
        const singleSelectedVariant = selectedVariants[0];
        const existingProduct = selectedProductIds.find(selected =>
            selected.variantIds.includes(singleSelectedVariant.id)
        );
        const variantDetails = selectedVariants.map(
            variant => `${title} - ${variant.title}` // Concatenate product title and variant title
        );
        if (existingProduct) {
            setBannerMessage(`Variant "${variantDetails}" is already selected.`);
            setBannerStatus("critical");
            return;
        }
    
            // Prepare product and variant information for state
            
            setSelectedProductIds(prev => {
            return [
                ...prev,
                { productId: Number(selectedId), variantIds: [singleSelectedVariant.id] }, // Store only one variant ID
            ];
        });
    
            // Update the form state with product title and variant details
            setFormProductState({
            productId: id,
            productVariantIds: [singleSelectedVariant.id], // Single variant ID
            productTitle: title,
            productVariantDetails: [variantDetails], // Single variant detail
            productHandle: handle,
            productAlt: images[0]?.altText || '',
            productImage: images[0]?.originalSrc || '',
        });
    
        setBannerMessage(`Variant "${variantDetails}" selected successfully.`);
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
    const [editWarningMessage, setEditWarningMessage] = useState("");
    const [activeEditModal, setActiveEditModal] = useState(false);
    const [activeEmailModal, setActiveEmailModal] = useState(false);  
    const [isFetchingEmailCount, setIsFetchingEmailCount] = useState(false); 
    const [scheduleEmailCount, setScheduleEmailCount] = useState(null);
    const [dispatchEmailCount, setDispatchEmailCount] = useState(null);
    const [orderSource, setOrderSource]= useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedVariantId, setSelectedVarientId] = useState(null);

    const toggleEditModal = useCallback(() => {
        setActiveEditModal((prev) => !prev);
        
    }, []);
    const toggleEmailModal = useCallback(() => {
        setActiveEmailModal((prev) => !prev);
        console.log("toggleEmailModal clicked! New State:", !activeEmailModal);
    }, []);
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
    const resetReorderfield = useCallback((productId, variantId) => {
        const updatedProduct = updatedProducts.find(
          (p) => p.shopify_variant_id === variantId
        );
    
        if (updatedProduct) {
          setSpinner(true);
          fetcher.submit(
            {
              shopId: shopID,
              productId: updatedProduct.shopify_product_id,
              variantId: updatedProduct.shopify_variant_id,
              reorder_days: null,
              type:'product_update'
            },
            { method: "patch" }
          );
    
          // Optimistically update state
          setUpdatedProducts((prev) =>
            prev.filter((product) => product.shopify_variant_id !== variantId)
          );
          setSelectedProductIds((prev) =>
            prev.filter((product) => !product.variantIds.includes(variantId))
          );
        }
    
        setEditingProduct(null);
        setSelectedProductId(null);
        setSelectedVarientId(null);
        setActiveModal(false);
    }, [fetcher, updatedProducts]);
    
    
  
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
            (p) => p.shopify_variant_id === product.shopify_variant_id );

            
        if (updatedProduct) {
            
            if (!updatedProduct.reorder_days ) {
                setEditWarningMessage("Please enter the estimated usage days.");
                setActiveEditModal(true);
                return;
              }
            if (updatedProduct.reorder_days <= bufferTime) {
                setEditWarningMessage("Estimated Usage Days should be greater than BufferTime!!!");
                setActiveEditModal(true);
                return;
              }
            setSpinner(true);
            fetcher.submit(
            {
                shopId:shopID,
                productId: updatedProduct.shopify_product_id,
                variantId: updatedProduct.shopify_variant_id,
                reorder_days: updatedProduct.reorder_days,
                type:'product_update'
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
    const showEmailCount = async (product_id,variant_id) => {
        try {
            setIsFetchingEmailCount(true);
            fetcher.submit(
                {
                    shopId: shopID,
                    productId: product_id,
                    variantId: variant_id,
                },
                { method: "post" }
            );
            
        } catch (error) {
            setIsFetchingEmailCount(false);
            console.error("Error fetching email count:", error);
            
            
            
        }
    };
    
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
        if (isFetchingEmailCount) return;
        if (fetcher.state === "submitting" || fetcher.state === "loading") {
            setSpinner(true); // Start loading spinner
        } else {
            setSpinner(false); // Stop spinner when data is ready
        }
    }, [fetcher.state, isFetchingEmailCount]);
    
    useLayoutEffect(() => {
        if (data?.type === "updateProduct" && data?.result) {
            const resultArray = Array.isArray(data.result) ? data.result : [data.result]; // Ensure it's an array
    
            setUpdatedProducts((prevData) => {
                // Create a new array with updated products
                const updatedProducts = prevData.map((product) => {
                    const foundProduct = resultArray.find(
                        (newProduct) => Number(newProduct.shopify_variant_id) === product.shopify_variant_id
                    );
                    return foundProduct ? { ...product, ...foundProduct,isNew: true } : product;
                });
                // Check for truly new products
                const existingIds = new Set(prevData.map((p) => Number(p.shopify_variant_id)));
                const newProducts = resultArray.filter((p) => !existingIds.has(Number(p.shopify_variant_id))).map((p) => ({ ...p, isNew: true }));
                return [...newProducts,...updatedProducts]; // Merge updated and new products correctly
            });
    
            // Reset form states properly
            setFormProductState(initialState);
            setformState('');
        }
        if (fetcher.data?.type === "fetchEmailCount") {    
            setScheduleEmailCount(fetcher.data.Scheduled_Count);
            setDispatchEmailCount(fetcher.data.Dispatched_Count);
            setOrderSource(fetcher.data.Reorder_Email_Source);
            toggleEmailModal();
        }
    }, [data]);
    
    return {
        fetcher,
        shopID,
        templateId,
        bufferTime,
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
        activeEmailModal,toggleEmailModal,
        activeEditModal,toggleEditModal,
        toggleModal,
        selectedProductId,
        selectedVariantId,
        handleChange,handleSubmit,plan
        ,showBanner,message,setShowBanner,showEmailCount,scheduleEmailCount,dispatchEmailCount,orderSource,editWarningMessage
      };
};

