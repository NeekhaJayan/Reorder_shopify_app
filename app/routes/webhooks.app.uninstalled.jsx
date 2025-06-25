import { authenticate } from "../shopify.server";
import prisma from "~/db.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  // const {admin,session }=await authenticate.admin(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const shop_domain=shop
  await fetch(`https://reorderappapi.onrender.com/auth/webhook/uninstallApp?shop_domain=${shop_domain}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Ensure the correct content type
    }
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
  
   try {
    await prisma.session.deleteMany({ where: { shop: shop_domain } });
    console.log("Session deleted from Prisma for:", shop_domain);
    } catch (err) {
    console.error(" Failed to delete session from Prisma:", err.message);
    }

  return new Response();
};
