import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  // const {admin}=await authenticate.admin(request);
  console.log(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  // console.log(JSON.stringify(payload, null, 2));
  const productId = payload.id;

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  switch (topic) {
    case 'PRODUCTS_CREATE':
      console.log("product create ")
      responseMessage = await handleProductCreate(productId);
      console.log(responseMessage)
      break;
    case 'PRODUCTS_UPDATE':
      responseMessage = await handleProductUpdate(productId);
      break;
    case 'PRODUCTS_DELETE':
      responseMessage = await handleProductDelete(productId);
      break;
    default:
      return json({ message: 'Unhandled webhook topic' }, { status: 400 });
  }

  return new Response();
};

async function handleProductCreate(productId) {
    console.log(`Product Created with ID: ${productId}`);
    const metafields = await fetchProductMetafields(productId);
    return `Product created and metafields fetched: ${JSON.stringify(metafields)}`;
  }
  
  // Handle product update
  async function handleProductUpdate(productId) {
    console.log(`Product Updated with ID: ${productId}`);
    const metafields = await fetchProductMetafields(productId);
    return `Product updated and metafields fetched: ${JSON.stringify(metafields)}`;
  }
  
  // Handle product deletion
  async function handleProductDelete(productId) {
    console.log(`Product Deleted with ID: ${productId}`);
    return `Product deleted with ID: ${productId}`;
  }
  
  // Fetch metafields using GraphQL
  async function fetchProductMetafields(productId) {
    const query = `
      query getProductMetafields($id: ID!) {
        product(id: $id) {
          id
          title
          metafields(first: 10) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
      }
    `;
  
    const variables = {
      id: `gid://shopify/Product/${productId}`,
    };
  
    const response = await admin.graphql(query,variables);
  
    const data = await response.json();
    return data.data.product?.metafields.edges.map(edge => edge.node) || [];
  }
