import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic, session } = await authenticate.webhook(request);
  

  console.log(`Received ${topic} webhook for ${shop}:Payload is:${payload}`);
  console.log(payload);
  // const order_payload_details = {
  //   order_id: payload.id,
  //   customer_id: payload.customer.id,
  //   customer_email: payload.customer.email,
  //   customer_name: payload.customer.first_name,
  //   customer_phone: payload.customer.phone,
  //   line_items: payload.line_items.map(item => ({
  //     product_id: item.product_id,
  //     quantity: item.quantity,
  //     price: item.price
  //   })), 
  //   order_date: payload.created_at,
  // };

  const order_payload_details = {
    shop:shop,
    order_id: payload.id || "Unknown Order ID",
    customer_id: payload.customer?.id || "Unknown Customer ID",
    customer_email: payload.customer?.email || "Unknown Email",
    customer_name: payload.customer?.first_name || "Unknown Name",
    customer_phone: payload.customer?.phone || "Unknown Phone",
    shipping_phone:payload.shipping_address.phone || "Unknown Phone",
    billing_phone:payload.billing_address.phone || "Unknown Phone", 
    line_items: Array.isArray(payload.line_items)
      ? payload.line_items.map(item => ({
          product_id: item.product_id || "Unknown Product ID",
          quantity: item.quantity || 0,
          varient_id:item.variant_id || "Unknown Varient ID",
          price: item.price || "Unknown Price"
        }))
      : [],
    order_date: payload.created_at || "Unknown Date",
  };
  console.log(order_payload_details);

  fetch('https://reorderappapi.onrender.com/auth/webhook/orderfullfilled', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Ensure the correct content type
    },
    body: JSON.stringify(order_payload_details), // Convert object to JSON string
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
};






