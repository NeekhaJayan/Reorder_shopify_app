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
    const coupon_section = `
    <tr>
  <td align="center" style="padding: 0; position: relative;">
    <!-- Pro Plan Label -->
    <div style="position: relative; display: inline-block; margin-top: 20px;">
      <div style="
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: #f9f9f9;
        color: #444;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #ddd;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        Pro Plan Only
      </div>

      <!-- Offer Box -->
      <div style="padding:15px; border-radius:5px; border: 2px dotted #d67e00; background-color:#f9f1dc;">
        <h3 style="color:#d67e00; margin:0;">SPECIAL OFFER</h3>
        <p style="font-size:16px;">
          Use code <span style="font-size:18px; font-weight:bold; color:#d67e00; background:#fff; padding:5px 10px; border-radius:4px;">
            RESTOCK10
          </span> at checkout
        </p>
        <p style="font-size:16px;">Save <b>10%</b> on your reorder</p>
      </div>
    </div>
  </td>
</tr>

  `;

  const logo_image_section = image_path
  ? `
    <tr>
      <td align="center" bgcolor="#eeeeee" style="padding:20px; border-radius:8px 8px 0 0;">
        <img src="${image_path}" alt="${shop}" width="120" style="display:block;">
        <h1 style="font-size:24px; color:#333333; font-family:Arial, sans-serif;">Time to Restock!</h1>
      </td>
    </tr>
  `
  : `
    <tr>
      <td align="center" bgcolor="#eeeeee" style="padding:20px; border-radius:8px 8px 0 0;">
        <h1 style="font-size:30px; color:#333333; font-family:Arial, sans-serif;">${shop}</h1>
        <h1 style="font-size:24px; color:#333333; font-family:Arial, sans-serif;">Time to Restock!</h1>
      </td>
    </tr>
  `;

    const template=`<!DOCTYPE html>
                                    <html>
                                    <head>
                                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                    </head>
                                    <body style="margin:0; padding:0; background-color:#f4f4f4;">
                                      <table role="presentation" width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td align="center">
                                            <table role="presentation" width="600" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" style="margin:20px auto; padding:20px; border-radius:8px;">
                                              
                                              ${logo_image_section}
                                              
                                              <tr>
                                                <td align="center" style="padding:20px; font-family:Arial, sans-serif; color:#333333;">
                                                  <p style="font-size:16px;">Hello ${placeholders.first_name},</p>
                                                  <p style="font-size:16px;">Just a quick reminder - based on your last purchase, you might be running low on<b>${placeholders.product_name}</b>.</p>
                                                  
                                                </td>
                                              </tr>

                                              <tr>
                                                <td align="center" style="padding:10px;">
                                                  <img src="${placeholders.product_Image}" alt="${placeholders.product_name}" width="150" style="display:block; margin:0 auto; border-radius:5px;">
                                                </td>
                                              </tr>
                                              <tr>
                                                <td align="center" style="padding:5px 20px; font-family:Arial, sans-serif;">
                                                  
                                                  <p style="font-size:16px;">To make sure you don't run out, you can easily reorder it here:</p>
                                                </td>
                                              </tr>

                                              <tr>
                                                <td align="center" style="padding:20px;">
                                                  <a href="#" target="_blank" style="display:inline-block; padding:12px 20px; background-color:#007bff; color:#ffffff; text-decoration:none; border-radius:5px; font-size:16px; font-weight:bold;">
                                                    REORDER NOW
                                                  </a>
                                                </td>
                                              </tr>

                                              ${coupon_section}

                                              <tr>
                                                <td align="center" style="padding:20px; font-size:12px; color:#777777; font-family:Arial, sans-serif;">
                                                  <p>${shop} | ${mail_id}} </p>
                                                  <p>Powered by <b>ReOrder Reminder Pro</b></p>
                                                </td>
                                              </tr>

                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                    </body>
                                    </html>

                                    
                                     `
    
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