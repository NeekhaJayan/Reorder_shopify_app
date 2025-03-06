
import {EmptyState} from "@shopify/polaris";

const EmptyProductState = () => {
    return (
    <>
        <EmptyState
              heading="Set the reorder interval for your product."
              action={{
                content: "Save Reorder Days",
                url: 'https://help.shopify.com',
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Allow customers to set reorder intervals and buy products using their phones.</p>
        </EmptyState>
    </>
    );
};

export default EmptyProductState;