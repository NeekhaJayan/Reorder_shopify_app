import { APP_SETTINGS } from "../../constants";
class OrderServices{

    transformGraphQLResponse(graphqlData){
        const orders = graphqlData?.data?.orders?.edges || [];
        
          return orders.map(({ node }) => {
            const {
              id,
              createdAt,
              billingAddress,
              shippingAddress,
              lineItems,
              customer
            } = node;
        
            const lineItemsTransformed = lineItems.edges.map(({ node: item }) => ({
              product_id: parseInt(item?.product?.id?.split("/").pop() || 0),
              varient_id: item?.variant
                ? parseInt(item?.variant?.id?.split("/").pop() || 0)
                : null,
              quantity: item?.quantity,
              status: "fulfilled", // Assuming fulfillment status is "fulfilled"
              price: "0.00" 
              // Adjust based on actual data if available
            }));
        
            return {
              shop: Settings.shop, // Replace with your shop name
              shopify_order_id: parseInt(id.split("/").pop() || 0),
              customer_id: parseInt(customer?.id?.split("/").pop() || 0),
              customer_email: customer?.email || "",
              customer_name: `${customer?.firstName || ""}`,
              customer_phone: customer?.phone || null,
              shipping_phone: shippingAddress?.phone || null,
              billing_phone: billingAddress?.phone || null,
              line_items: lineItemsTransformed,
              order_date: createdAt
            };
            
          });

    }

    async getPrevOrderDetails(created_at,admin){
        const specifiedDate = new Date(created_at);
        specifiedDate.setDate(created_at.getDate() - 10);// Replace with your desired date
        const firstOrdersCount = 10;
        const query = `#graphql
          query getFilteredOrders($first: Int!) {
            orders(first: $first, query: "created_at:>=${specifiedDate}AND fulfillment_status:fulfilled") {
              edges {
                node {
                  id
                  createdAt
                  billingAddress {
                    phone
                  }
                  shippingAddress {
                    phone
                  }
                   lineItems(first: 10) {
                      edges {
                        node {
                          id
                          quantity
                          title
                          variantTitle
                          variant {
                            id
                          }
                          product {
                            id
                          }
                        }
                      }
                    }
                  customer {
                    id
                    firstName
                    email
                    phone
                  }
                }
              }
            }
          }
        `;
        const response = await admin.graphql(query, {
            variables: {
              first: firstOrdersCount,
              // Use variables to pass dynamic date
            },
          });
        return await response.json();
    }

    async SyncOrderDetails(){
            const jsonResponse=await this.getPrevOrderDetails()
            const payload = transformGraphQLResponse(jsonResponse);
            fetch('${APP_SETTINGS.API_ENDPOINT}/auth/orderSync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Ensure the correct content type
          },
          body: JSON.stringify(payload), // Convert object to JSON string
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
            
            
            return { message: "Your store is up-to-date with 10 new orders.Customers will recieve reminders on time." };
            }).catch((error) => {
                console.error('Error sending data to FastAPI:', error.message);
              });
        
    }

     

}
const orderInstance = new OrderServices();
export {orderInstance}