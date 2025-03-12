import {IndexTable,Spinner,Text} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";
import SkeletonLoad from "../componets/SkeletonLoad";

const ProductTable = ({ productData,spinner,editingProduct,editReorderDay,resetReorderfield,saveReorderDay,cancelReorderDays,handleReorderChange,activeModal,popoverActive,togglePopoverActive,toggleModal,confirmReset,selected_productId,selected_variantId,showEmailCount,scheduleEmailCount,dispatchEmailCount}) => {

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
                    {title:"Scheduled Emails"},
                    {
                    title: spinner ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner size="small" accessibilityLabel="Loading data" />
                        <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                            Saving
                        </Text>
                        </div>
                    ) : (
                        "Actions"
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
                    activeModal={activeModal}
                    popoverActive={popoverActive}
                    togglePopoverActive={togglePopoverActive}
                    toggleModal={toggleModal}
                    confirmReset={confirmReset}
                    selectedProductId={selected_productId}
                    selectedVariantId={selected_variantId}
                    showEmailCount={showEmailCount}
                    scheduleEmailCount={scheduleEmailCount}
                    dispatchEmailCount={dispatchEmailCount}
                    />
                ))}
            </IndexTable>
            )}
        </>
  );
};
export default ProductTable;

    