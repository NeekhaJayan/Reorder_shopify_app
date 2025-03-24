import { useState } from "react";
import { Button } from "@shopify/polaris";

const ReorderEmailPreview = ({ image_path,mail_id ,shop}) =>{
    const [placeholders, setPlaceholders] = useState({
      first_name: "John Doe",
      product_name: "Swisse Ultiboost Liver Detox Supplement ",
      product_Image:"https://cdn.shopify.com/s/files/1/0599/1304/4077/files/61nT4LnOLNL._SX679_200x200.jpg?v=1738369571",
      quantity: "2 Bags",
    });

    const generatePreview = () => {
    //   const template = `
    //   <!DOCTYPE html>
    //   <html>
    //   <head>
    //     <title>Reorder Reminder</title>
    //     <style>
    //       body {
    //         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    //         margin: 0;
    //         padding: 0;
    //         background-color: #f9fafb;
    //         color: rgb(3, 3, 3);
    //         overflow: auto;
    //         height: 100%;
    //       }
    //       .email-container {
    //         margin: 40px auto;
    //         background: #ffffff;
    //         border: 1px solid #dbe1e6;
    //         border-radius: 8px;
    //         overflow: hidden;
    //         box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    //         min-height: 1200px; 
    //       }
    //       .header {
    //         background-color: #efeee7;
    //         text-align: center;
    //         padding: 20px;
    //         color: black;
    //       }
    //       .header img {
    //         max-width: 100px; 
    //         height: auto;     
    //       }
    //       .content {
    //         padding: 20px;
    //       }
    //       .product-section {
    //         text-align: center;
    //         margin: 20px 0;
    //       }
    //       .cta {
    //         text-align: center;
    //         margin: 20px 0;
    //       }
    //       .cta a {
    //         text-decoration: none;
    //         color: white;
    //         background-color: black;
    //         padding: 10px 20px;
    //         border-radius: 4px;
    //       }
    //       .coupon {
    //           text-align: center;
    //           margin: 10px 0;
    //           font-size: 14px;
    //           background-color:white;
    //           color:black;
    //           padding: 10px;
    //           border-radius: 4px;
    //           border: 2px dotted #efeee7; /* Dotted border */
    //           position: relative;
    //       }
            
    //       .coupon::before {
    //           content: "Pro Plan Only";
    //           position: absolute;
    //           top: -10px;
    //           left: 50%;
    //           transform: translateX(-50%);
    //           background-color:transparent;
    //           color: black;
    //           font-size: 12px;
    //           padding: 2px 6px;
    //           border-radius: 4px;
    //       }
    //       .footer {
    //         text-align: center;
    //         padding: 10px;
    //         font-size: 12px;
    //         color: #8c9196;
    //       }
    //     </style>
    //   </head>
    //   <body>
    //     <div style="height: 1500px;"> 
    //       <div class="email-container">
    //         <div class="header">
    //           <img src=${image_path} alt="Shop Logo" />
    //           <h1>${shop}</h1>
    //         </div>
    //         <div class="content">
    //           <p>Hello ${placeholders.first_name},</p>
    //           <p>Your <strong>${placeholders.product_name}</strong> might be running low. Don't worry – you can reorder with just one click!</p>
    //           <table class="product-section" align="center" width="100%" cellspacing="0" cellpadding="10" border="0">
    //             <tr>
    //               <td align="center">
    //                 <img src="${placeholders.product_Image}" 
    //                     alt="${placeholders.product_name}" 
    //                     width="200" height="auto"
    //                     style="display: block; max-width: 200px; height: auto; border-radius: 4px;" />
    //               </td>
    //               <td align="left" width="70%">
    //                       <p><strong>Product Name:</strong> ${placeholders.product_name}</p>
    //                       <p><strong>Quantity Ordered:</strong>${placeholders.quantity}</p>
    //               </td>
                  
    //             </tr>
    //           </table>
    //           <div class="cta">
    //             <a href="#" target="_blank">Reorder Now and Save 10%</a>
    //           </div>
    //           <div class="coupon">
    //             Use code <strong>RESTOCK10</strong> at checkout to save 10% on your reorder.
    //           </div>
    //         </div>
    //         <div class="footer">
    //           <p>Powered by ReOrder Reminder Pro</p>
    //           <p>Need help? <a href="mailto:${mail_id}">${mail_id}</a></p>
    //         </div>
    //       </div>
    //     </div>
    //   </body>
    //   </html>
    // `;
    const template=`<!DOCTYPE html>
                                    <html>
                                    <head>
                                      
                                      <style>
                                        table, td {
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        }
                                        body {
                                          font-family: Arial, sans-serif;
                                          margin: 0;
                                          padding: 0;
                                          background-color: #f9f9f9;
                                        }
                                        .email-container {
                                          width: 100%;
                                          max-width: 600px;
                                          margin: auto;
                                          background-color: #ffffff;
                                          padding: 20px;
                                        }
                                        .header img {
                                          width: 120px;
                                        }
                                        .content {
                                          padding: 20px;
                                        }
                                        .cta a {
                                          display: inline-block;
                                          padding: 10px 20px;
                                          background-color: #007bff;
                                          color: #ffffff;
                                          text-decoration: none;
                                          border-radius: 5px;
                                          font-weight: bold;
                                        }
                                        .footer {
                                          text-align: center;
                                          font-size: 12px;
                                          color: #777777;
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <table class="email-container" cellspacing="0" cellpadding="0" border="0">
                                        <!-- Header Section -->
                                        <tr>
                                          <td align="center">
                                            <img src="${image_path}" alt="${shop}">
                                            <h1>Time to Restock&#33;</h1>
                                          </td>
                                        </tr>

                                        <!-- Content Section -->
                                        <tr>
                                          <td class="content">
                                            <p>Hello ${placeholders.first_name},</p>
                                            <p>We noticed it&#39;s been 30 days since you purchased <b>${placeholders.product_name}</b>. Based on typical usage, you might be running low about now.</p>
                                            <p>Don&#39;t wait until you run out&#33; Restock now to keep enjoying your favorite products without interruption.</p>

                                            <!-- Product Section -->
                                            <table width="100%">
                                              <tr>
                                                <td align="center">
                                                  <img src="${placeholders.product_Image}" alt="${placeholders.product_name}" style="max-width: 150px;">
                                                </td>
                                                <td>
                                                  <h3>${placeholders.product_name}</h3> 
                                                  <p><b>Quantity&#58;</b>${placeholders.quantity}</p> 
                                                </td>
                                              </tr>
                                            </table>

                                            <!-- CTA Section -->
                                            <table align="center">
                                              <tr>
                                                <td class="cta">
                                                  <a href="{placeholders["reorder_url"]}" target="_blank">REORDER NOW</a>
                                                </td>
                                              </tr>
                                            </table>

                                            <!-- Coupon Section -->
                                            <table align="center">
                                              <tr>
                                                <td>
                                                  <h3>SPECIAL OFFER</h3>
                                                  <p>Use code <b>RESTOCK10</b> at checkout</p>
                                                  <p>Save 10&#37; on your reorder</p>
                                                  <p class="expiry">Valid until &#123;&#123;coupon_expiry_date&#125;&#125;</p>
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>

                                        <!-- Footer Section -->
                                        <tr>
                                          <td class="footer">
                                            <p>${shop} | ${mail_id}} </p>
                                            <p>Powered by <b>ReOrder Reminder Pro</b></p>
                                          </td>
                                        </tr>
                                      </table>
                                    </body>
                                    </html>`
    
    const newWindow = window.open("", "Preview", "width=800,height=1000,scrollbars=yes");

    setTimeout(() => {
        newWindow.document.write(template);
        newWindow.document.close();
    }, 100);
  };
  return (
    <Button
      textAlign="center"
      variant="primary"                        
      onClick={generatePreview}
    > Preview Template</Button>
      // <button onClick={generatePreview}>Preview Email</button>
    
  );
  };
  export default ReorderEmailPreview;