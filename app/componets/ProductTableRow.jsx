import {IndexTable,ButtonGroup,Button,Modal,TextField,Thumbnail,Badge,Text} from "@shopify/polaris";
import ProductAnalyticsCard from "./ProductAnalyticsCard";
import { useNavigate } from "@remix-run/react";
import { useAppData } from "../hooks/useAppData";
const ProductTableRow = ({ product, isEditing, onEdit,onReset, onSave,onCancel, onReorderChange,activeEditModal,toggleEditModal,activeModal,toggleModal,confirmReset,selectedProductId,selectedVariantId,selectedProductData,activeEmailModal,toggleEmailModal,showEmailCount,onTestEmailReminder,scheduleEmailCount,dispatchEmailCount,orderSource,editWarningMessage}) => {
  const navigate =useNavigate();
  const {plan,bufferTime}=useAppData();
  
  
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
              <IndexTable.Cell>
                {isEditing?(<><div style={{width: "50px",alignItems:"center"}}><TextField
                  value={product.reorder_days}
                  onChange={(value) => onReorderChange(product.shopify_variant_id, value)} // Update only the edited product
                  disabled={!isEditing} // Enable input only for the product being edited
                  error={!!editWarningMessage}
                /></div>
                {editWarningMessage && (
                    <div
                    style={{
                      color: "red",
                      fontSize: "11px",
                      marginTop: "4px",
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      maxWidth: "225px"
                    }}
                    dangerouslySetInnerHTML={{ __html: editWarningMessage }}
                  />
                  )}
                </>):product.reorder_days || ''}
                
              </IndexTable.Cell>
              <IndexTable.Cell>
                <div style={{ display: "flex", gap:"10px",alignItems:"baseline" }}>
                    <div>
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
                          </Modal>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>   
                      <Button onClick={showEmailCount}>  <img 
                                  src="../bar-chart.png"  
                                  alt="Email Icon"
                                  style={{ width: "20px", height: "20px" }}
                              />
                        </Button>
                        {activeEmailModal && selectedVariantId === product.shopify_variant_id && (<Modal 
                      size="large" 
                      open={activeEmailModal} 
                      onClose={() => {
                          console.log("Closing modal...");
                          toggleEmailModal();
                      }} 
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src="../bar-chart.png" alt="Analytics Icon" style={{ width: '20px', height: '20px' }} />
                          <span>ReOrder Reminder Pro Performance</span>
                        </div>
                      }
                    >
                      <Modal.Section>
                      {plan === "FREE"?<div><p>Analytics Available in Pro Plan.
                        Upgrade to Pro to unlock product insights and email stats.
                    👉 <Button variant="secondary" onClick={() => navigate("/app/settings?tab=2")}>
                                Upgrade
                            </Button></p></div>:(
        selectedProductData && (<div dangerouslySetInnerHTML={{ __html: ProductAnalyticsCard({
    productName: selectedProductData.title,
    scheduleEmailCount: scheduleEmailCount,
    dispatchEmailCount: dispatchEmailCount,
    orderSource: orderSource,
    reorder_days:selectedProductData.reorder_days,
    buffer_Time:bufferTime,
  }) }} />)
                     ) }
                     <Button variant="primary" onClick={onTestEmailReminder}>
                               Test Email
                            </Button>
                      </Modal.Section>
                        </Modal> )}
                    </div>
                </div>
              </IndexTable.Cell>
              
            </IndexTable.Row>
            
        </>
    );
};
export default ProductTableRow;

    