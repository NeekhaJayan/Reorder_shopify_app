import React, { useState } from "react";
import { Button } from "@shopify/polaris";

const ReorderEmailPreview = () =>{
    const [placeholders, setPlaceholders] = useState({
      first_name: "John Doe",
      product_name: "Premium Coffee Beans",
      quantity: "2 Bags",
      remaining_days: "5",
      reorder_url: "https://yourstore.com/reorder",
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
            color: #202223;
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
            background-color: #007ace;
            text-align: center;
            padding: 20px;
            color: white;
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
            background-color: #007ace;
            padding: 10px 20px;
            border-radius: 4px;
          }
          .coupon {
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
            background-color: #eef4fb;
            color: #007ace;
            padding: 10px;
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
            <h1>Your Shop</h1>
          </div>
          <div class="content">
            <p>Hello ${placeholders.first_name},</p>
            <p>Your <strong>${placeholders.product_name}</strong> might be running low. Don't worry – you can reorder with just one click!</p>
            <div class="product-section">
              <img src="https://via.placeholder.com/150x150.png?text=Product+Image" alt="${placeholders.product_name}" />
              <p><strong>Product Name:</strong> ${placeholders.product_name}</p>
              <p><strong>Quantity Ordered:</strong> ${placeholders.quantity}</p>
              <p><strong>Estimated Days Remaining:</strong> ${placeholders.remaining_days}</p>
            </div>
            <div class="cta">
              <a href="${placeholders.reorder_url}" target="_blank">Reorder Now and Save 10%</a>
            </div>
            <div class="coupon">
              Use code <strong>RESTOCK10</strong> at checkout to save 10% on your reorder.
            </div>
          </div>
          <div class="footer">
            <p>Powered by ReOrder Reminder Pro</p>
            <p>Need help? <a href="mailto:support@yourstore.com">support@yourstore.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    const newWindow = window.open("", "Preview", "width=800,height=600");
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