import { APP_SETTINGS } from "../../constants";
class Shop{
   async getShopDetails(shop_domain){
        try{
            const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/shops/${shop_domain}`, {
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
                myshopifyDomain
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