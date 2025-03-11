import {IndexTable,ButtonGroup,Button,Modal,TextField,Thumbnail,Badge} from "@shopify/polaris";

const ProductTableRow = ({ product, isEditing, onEdit,onReset, onSave,onCancel, onReorderChange,activeModal,toggleModal,scheduleEmailCount,dispatchEmailCount,showEmailCount,confirmReset,selectedProductId,selectedVariantId}) => {

    return(
        <>

           <IndexTable.Row id={product.shopify_variant_id} position={product.shopify_variant_id}>
                <IndexTable.Cell>{product.isNew && <Badge tone="attention">New</Badge>}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Thumbnail source={product.productImage || "../product-place-holder.png"} alt={product.title|| "Product Image"} />
                  </div>
                </IndexTable.Cell>
                 <IndexTable.Cell><div style={{ whiteSpace: "normal", wordWrap: "break-word", maxWidth: "200px" }}>
               {product.title}
             </div></IndexTable.Cell>
                 <IndexTable.Cell><div style={{width: "50px",alignItems:"center"}}> 
                   {isEditing?<TextField
                     value={product.reorder_days || ''}
                     onChange={(value) => onReorderChange(product.shopify_variant_id, value)} // Update only the edited product
                     disabled={!isEditing} // Enable input only for the product being edited
                   />:product.reorder_days || ''}
                   </div>
                 </IndexTable.Cell>
                 <IndexTable.Cell>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        
                        <Button onClick={() => showEmailCount(product.shopify_product_id, product.shopify_variant_id)}>
                        <img 
                            src="../email-icon.png" // Replace with your actual image path 
                            alt="Email Icon"
                            style={{ width: "20px", height: "20px" }}
                        />No Of Emails Scheduled
                        </Button>
                        <Modal size="small" open={activeModal} onClose={toggleModal} title="Emails Scheduled">
                          <Modal.Section>
                            <Text>No of Emails Scheduled: {scheduleEmailCount !== null ? scheduleEmailCount : "Loading..."}/{dispatchEmailCount !== null ? dispatchEmailCount : "Loading..."}</Text>
                          </Modal.Section>
                        </Modal>
                    </div>
                 </IndexTable.Cell>
                 <IndexTable.Cell><div>
                   {isEditing ? (
                     <ButtonGroup>
                     <Button onClick={onSave} variant="primary" >
                       Save
                     </Button>
                     <Button primary onClick={() => onCancel(product.shopify_variant_id)}>
                       Cancel
                     </Button>
                   </ButtonGroup> // Save only the selected product
                   ) : (
                     <Button variant="plain" onClick={onEdit}>Edit</Button> // Start editing the specific product
                   )}
                   <div style={{ display: "inline-block", width: "8px" }}></div> {/* Spacer */}
                   <Button variant="plain" onClick={() => confirmReset(product.shopify_product_id,product.shopify_variant_id)}>Reset</Button><style>
                   {`
                     .Polaris-Backdrop {
                       background-color: rgba(0, 0, 0, 0.1); /* Custom backdrop color */
                     }
                   `}
                 </style><Modal
                           
                           size="small"
                           open={activeModal}
                           onClose={toggleModal}
                           title="Reset Estimated Usage Days"
                           primaryAction={{
                             content: 'Reset',
                             onAction: () => onReset(selectedProductId,selectedVariantId),
                           }}
                           secondaryAction={{
                             content: 'Cancel',
                             onAction: toggleModal,
                           }}
                         >
                           <Modal.Section>
                             <p>
                               Are you sure you want to reset? This will remove all Estimated Usage Days, but you can reconfigure them later.
                             </p>
                           </Modal.Section>
                         </Modal></div>
                 </IndexTable.Cell>
                 
               </IndexTable.Row>
               
        </>
    );
};
export default ProductTableRow;

    