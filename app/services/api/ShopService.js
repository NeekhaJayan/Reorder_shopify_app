class Shop{
   async getShopDetails(shop_domain){
        try{
            const response = await fetch(`https://reorderappapi.onrender.com/auth/shops/${shop_domain}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              if (!response.ok) {
                throw new Error(`Failed to fetch shop details: ${response.statusText}`);
              }
              return await response.json();

        }
        catch (error) {
            console.error("Error fetching shop details:", error.message);
            return null; // Return `null` or handle errors gracefully
          }    
    }

    async getShopifyShopDetails(admin){
        const response_shop = await admin.graphql(
            `#graphql
              query {
                shop {
                name
                createdAt
                domains {
                  url
                }
                email
              }
            }`,
            );
          
            // Destructure the response
            const shop_body = await response_shop.json();
            
            const shop_data = shop_body;
            return shop_data.data.shop
    }
    
   
}
const shopInstance = new Shop();
export {shopInstance}