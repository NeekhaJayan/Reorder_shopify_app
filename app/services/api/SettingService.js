import { APP_SETTINGS } from "../../constants";
class Settings{
    async getSettingData(shop_domain){

        try{
            const settingsResponse = await fetch(
                `${APP_SETTINGS.API_ENDPOINT}/auth/get-settings?shop_name=${shop_domain}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
            if (!settingsResponse.ok) {
            throw new Error("Failed to fetch settings data from FastAPI");
            }
    
            return  await settingsResponse.json();

        }catch (error) {
            console.error("Error fetching shop details:", error.message);
            return null; // Return `null` or handle errors gracefully
          } 
        
    }

    async saveSettings(data){
        
      const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/save-settings`, {
        method: "POST", // Adjust method as per your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText);
        
        throw new Error(`Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance.`);
      
      }

      return await response.json();
      
    }

    async uploadImage(shop_domain,formData){
      
      const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/upload_to_aws/${shop_domain}`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload image. ${errorText}`);
      }
  
      
      return await response.json();
    }
}
const settingsInstance = new Settings();
export {settingsInstance}