import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic, session } = await authenticate.webhook(request);
  

  console.log(`Received ${topic} webhook for ${shop}:Payload is:${payload}`);
  console.log(payload);
  // const product_ids = payload.line_items.map(item => ({
  //   product_id: item.product_id,
  //   quantity: item.quantity,
  // }));
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

  // console.log(order_payload_details);

  // return new Response(JSON.stringify(order_payload_details), {
  //   headers: { "Content-Type": "application/json" },
  // });
  return new Response();
};






