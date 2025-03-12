class Product{
    async getAllProductDetails(shop_id)
    {
        try{
            const response = await fetch(`https://reorderappapi.onrender.com/auth/products/${shop_id}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });
            
              if (!response.ok) {
                throw new Error("Failed to send product data to FastAPI");
              }
            
              return await response.json();
        }
        catch (error) {
            console.error("Error fetching shop details:", error.message);
            return null; // Return `null` or handle errors gracefully
          }   
        
    }

    async saveProductData(formData)
    {
        const productId = formData.get("productId").replace("gid://shopify/Product/", "");
        const shopid =formData.get("shopid");
        const productImage=formData.get("productImage")
        const variantIds = formData.get("productVariantId").split(",");
        const productTitles=formData.get("productTitle").split(",");
        const reorder_days = parseFloat(formData.get("date"));
        let inputData = variantIds.map((variantId, index) => {
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
        const response = await fetch("https://reorderappapi.onrender.com/auth/products", {
            method:"POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(inputData),
        });
    
        if (!response.ok) {
            throw new Error("Failed to save Estimated Usage Days. Please check your input and try again. If the issue persists, contact support for assistance");
        }
        const result = await response.json();
        return result;
    }

    async updateProductData(formData) {
        try {
            // ✅ Extract and validate form data
            const productId = formData.get("productId")?.replace("gid://shopify/Product/", "");
            const shopId = formData.get("shopId");
            const variantId = formData.get("variantId");
            let reorder_days = formData.get("reorder_days");
    
            // ✅ Convert "null" string to actual `null`
            reorder_days = reorder_days === "null" ? null : parseInt(reorder_days, 10);
    
            // ✅ Ensure required fields exist
            if (!shopId || !productId || !variantId) {
                throw new Error("Missing required fields: shopId, productId, or variantId.");
            }
    
            const inputData = {
                shop_id: shopId,
                shopify_product_id: productId,
                shopify_variant_id: variantId,
                reorder_days: reorder_days,
            };
    
            console.log("PATCH Request to API:", inputData);
    
            const response = await fetch(`https://reorderappapi.onrender.com/auth/products/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputData),
            });
    
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
    
            const result = await response.json();
            console.log("Response from API:", result);
    
            return result;
    
        } catch (error) {
            console.error("Error in updateProductData:", error.message);
            return { error: error.message }; 
        }
    }
    async fetchEmailCount(formData){
        try {
            const product_id=formData.get("productId")
            const variant_id=formData.get("variantId")
            const shop_id=formData.get("shopId")
            const url = `https://reorderappapi.onrender.com/auth/email-status_count?product_id=${product_id}&variant_id=${variant_id}&shop_id=${shop_id}`;
             const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
                
            });
            
            const data= await response.json();
            return data
          } catch (error) {
            console.error("Error fetching email count:", error);
            
          }
    }
    
}
const productInstance = new Product();
export {productInstance}