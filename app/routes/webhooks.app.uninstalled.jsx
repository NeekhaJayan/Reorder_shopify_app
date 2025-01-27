import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  // const {admin,session }=await authenticate.admin(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  fetch('https://reorderappapi.onrender.com/auth//webhook/uninstallApp', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Ensure the correct content type
    },
    body: JSON.stringify(shop), // Convert object to JSON string
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
      }
      return response.json(); // Parse the JSON response from the server
    })
    .then((data) => {
      console.log('Data successfully sent to FastAPI:', data);
    })
    .catch((error) => {
      console.error('Error sending data to FastAPI:', error.message);
    });
  
  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  // if (session) {
  //   const session = await db.session.findUnique({
  //     where: { shop }, // Find the session by shop field
  //     select: { accessToken: true }, // Retrieve only the accessToken field
  //   });
  //   if (!session || !session.accessToken) {
  //     throw new Error(`Access token not found for shop: ${shop}`);
  //   }
  //   const deleteResponse = await deleteMetafieldForAllProducts(session.accessToken,shop);
  
  //   const deleteDefinition=await deleteMetafieldDefinition(session.accessToken,shop);
  //   console.log(`Deleted ${deleteResponse} from ${shop}`);
  //   await db.session.deleteMany({ where: { shop } });
  // }


  return new Response();
};
