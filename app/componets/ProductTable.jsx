import {IndexTable,Spinner,Text} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";
import SkeletonLoad from "../componets/SkeletonLoad";

const ProductTable = ({ productData,spinner,editingProduct,editReorderDay,resetReorderfield,saveReorderDay,cancelReorderDays,handleReorderChange,activeModal,toggleModal,confirmReset,selected_productId,selected_variantId,selectedProductData,activeEditModal,toggleEditModal,activeEmailModal,toggleEmailModal,showEmailCount,testEmailReminder,scheduleEmailCount,dispatchEmailCount,orderSource,editWarningMessage}) => {

    return(
        <>
            {spinner ? (
                <SkeletonLoad /> // Show skeleton loader while data is being processed
            ): (
            <IndexTable
                resourceName={{
                    singular: "Product",
                    plural: "Products",
                }}
                itemCount={productData.length}
                headings={[
                    { title: "Product Image" },
                    { title: "Product Name" },
                    { title: "Estimated Usage Days" },
                    {
                    title: spinner ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner size="small" accessibilityLabel="Loading data" />
                        <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                            Saving
                        </Text>
                        </div>
                    ) : (
                        ""
                    ),
                    },
                ]}
                selectable={false}
                >
                {productData.map((product) => (
                    <ProductTableRow
                    key={product.shopify_variant_id}
                    product={product}
                    isEditing={editingProduct === product.shopify_variant_id}
                    onEdit={() => editReorderDay(product.shopify_variant_id)}
                    onReset={resetReorderfield}
                    onSave={() => saveReorderDay(product)}
                    onCancel={()=>cancelReorderDays(product.shopify_variant_id)}
                    onReorderChange={handleReorderChange}
                    activeEditModal={activeEditModal}
                    toggleEditModal={toggleEditModal}
                    activeModal={activeModal}
                    toggleModal={toggleModal}
                    confirmReset={confirmReset}
                    selectedProductId={selected_productId}
                    selectedVariantId={selected_variantId}
                    selectedProductData={selectedProductData}
                    activeEmailModal={activeEmailModal} 
                    toggleEmailModal={toggleEmailModal} 
                    scheduleEmailCount={scheduleEmailCount} 
                    dispatchEmailCount={dispatchEmailCount} 
                    showEmailCount={() =>showEmailCount(product,product.shopify_product_id,product.shopify_variant_id)}
                    testEmailReminder={() =>testEmailReminder(product.shopify_product_id,product.shopify_variant_id)}
                    orderSource={orderSource}
                    editWarningMessage={editWarningMessage}
                    />
                ))}
            </IndexTable>
            )}
        </>
  );
};
export default ProductTable;

    