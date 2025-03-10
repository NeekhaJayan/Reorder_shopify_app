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
      const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reorder Reminder</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            color:rgb(3, 3, 3);
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #dbe1e6;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #efeee7;
            text-align: center;
            padding: 20px;
            color: black;
          }
          .header img {
            max-width: 100px; 
            height: auto;     
          }
          .content {
            padding: 20px;
          }
          .product-section {
            text-align: center;
            margin: 20px 0;
          }
          .cta {
            text-align: center;
            margin: 20px 0;
          }
          .cta a {
            text-decoration: none;
            color: white;
            background-color: black;
            padding: 10px 20px;
            border-radius: 4px;
          }
          .coupon {
              text-align: center;
              margin: 10px 0;
              font-size: 14px;
              background-color:white;
              color:black;
              padding: 10px;
              border-radius: 4px;
              border: 2px dotted #efeee7; /* Dotted border */
              position: relative;
          }
            
          .coupon::before {
              content: "Pro Plan Only";
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background-color:transparent;
              color: black;
              font-size: 12px;
              padding: 2px 6px;
              border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #8c9196;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src=${image_path} alt="Shop Logo" />
            <h1>${shop}</h1>
          </div>
          <div class="content">
            <p>Hello ${placeholders.first_name},</p>
            <p>Your <strong>${placeholders.product_name}</strong> might be running low. Don't worry – you can reorder with just one click!</p>
            <table class="product-section" align="center" width="100%" cellspacing="0" cellpadding="10" border="0">
              <tr>
                <td align="center">
                  <img src="${placeholders.product_Image}" 
                      alt="${placeholders.product_name}" 
                      width="200" height="auto"
                      style="display: block; max-width: 200px; height: auto; border-radius: 4px;" />
                </td>
                <td align="left" width="70%">
                        <p><strong>Product Name:</strong> ${placeholders.product_name}</p>
                        <p><strong>Quantity Ordered:</strong>${placeholders.quantity}</p>
                </td>
                
              </tr>
            </table>
            <div class="cta">
              <a href="#" target="_blank">Reorder Now and Save 10%</a>
            </div>
            <div class="coupon">
              Use code <strong>RESTOCK10</strong> at checkout to save 10% on your reorder.
            </div>
          </div>
          <div class="footer">
            <p>Powered by ReOrder Reminder Pro</p>
            <p>Need help? <a href="mailto:${mail_id}">${mail_id}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    const newWindow = window.open("", "Preview", "width=800,height=1000");
    newWindow.document.write(template);
    newWindow.document.close();
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