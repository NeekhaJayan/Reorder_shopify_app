import { APP_SETTINGS } from "../../constants";

class OrderServices{

    transformGraphQLResponse(graphqlData,shopName){
        const orders = graphqlData?.data?.orders?.edges || [];
        console.log(orders);
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
              varient_id: parseInt(item?.variant?.id?.split("/").pop() || 0),
              quantity: item?.quantity,
              status: "fulfilled", // Assuming fulfillment status is "fulfilled"
              price: "0.00" 
              // Adjust based on actual data if available
            }));
        
            return {
              shop: shopName, // Replace with your shop name
              shopify_order_id: parseInt(id.split("/").pop() || 0),
              customer_id: parseInt(customer?.id?.split("/").pop() || 0),
              customer_email: customer?.email || "Unknown",
              customer_name: `${customer?.firstName || "Unknown"}`,
              customer_phone: customer?.phone|| "Unknown",
              shipping_phone: shippingAddress?.phone || "Unknown",
              billing_phone: billingAddress?.phone || "Unknown",
              line_items: lineItemsTransformed,
              order_date: createdAt
            };
            
          });

    }

    async getPrevOrderDetails(specifiedDate,admin){
        
      if (!isNaN(specifiedDate)) { // Ensure the date is valid
        specifiedDate.setDate(specifiedDate.getDate() - 10);
        console.log("10 days earlier:", specifiedDate);
        console.log("10 days earlier:", specifiedDate.toISOString());
    } else {
        console.error("Invalid date:", specifiedDate);
    }

        // specifiedDate.setDate(created_at.getDate() - 10);// Replace with your desired date
        const firstOrdersCount = 10;
        const filterQuery = `created_at:>=${specifiedDate} AND fulfillment_status:fulfilled`;
        const query = `#graphql
          query getFilteredOrders($first: Int!, $filterQuery: String!) {
            orders(first: $first, query: $filterQuery) {
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
            filterQuery: filterQuery, 
            // Use variables to pass dynamic date
          },
        });
        console.log(query)
        return await response.json();
    }

    async SyncOrderDetails(shop,created_at,admin){
      try{
            const jsonResponse=await this.getPrevOrderDetails(created_at,admin)
            // console.log(jsonResponse)
            const payload = this.transformGraphQLResponse(jsonResponse,shop);
            console.log(payload);
            const response = await fetch(`${APP_SETTINGS.API_ENDPOINT}/auth/orderSync`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
          });
          
            if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(`Error from server: ${response.status} - ${errorDetails.message}`);
            }
            const data = await response.json();
            console.log('Data successfully sent to FastAPI:', data);

            return { message: "Your store is up-to-date with new orders. Customers will receive reminders on time." };
          } catch (error) {
            console.error('Error sending data to FastAPI:', error.message);
            return { error: 'Failed to sync orders. Please try again later.' };
        }
        
    }

}
const orderInstance = new OrderServices();
export {orderInstance}