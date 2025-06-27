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
              // if (!response.ok) {
              //   throw new Error(`Failed to fetch shop details: ${response.statusText}`);
              // }
              return await response.json();

        }
        catch (error) {
            console.error("Error fetching shop details:", error.message);
            return null; // Return `null` or handle errors gracefully
          }    
    }

  async updateShopDetails(formData){
    try{
      const shopId = formData.get("shopId");
      const plan = formData.get("plan");
      const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/shops/${shopId}?plan=${encodeURIComponent(plan)}`, {
          method: "PATCH",
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
              primaryDomain {
                url
                host
                sslEnabled
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
  async createShop(shop_payload_details){
        try{
            const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/shops/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', // Ensure the correct content type
            },
            body: JSON.stringify(shop_payload_details), // Convert object to JSON string
            });
            const data = await response.json();
            if (!response.ok) {
              console.error(`FastAPI error ${response.status}: ${data.message}`);
              return null;
            }
              return data;
          }
          catch (error) {
            console.error("Error fetching shop details:", error.message);
            return null; // Return `null` or handle errors gracefully
          }    
    }
    
   
}
const shopInstance = new Shop();
export {shopInstance}