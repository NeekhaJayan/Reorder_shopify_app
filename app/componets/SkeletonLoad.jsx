
import {SkeletonPage, SkeletonBodyText, SkeletonDisplayText,Layout} from "@shopify/polaris";


const SkeletonLoad= () => {

return (
      <SkeletonPage title="Loading App Data">
        <Layout>
          <Layout.Section>
            <SkeletonDisplayText size="large" />
            <SkeletonBodyText lines={3} />
          </Layout.Section>
          <Layout.Section>
            {[...Array(5)].map((_, index) => (
              <SkeletonBodyText key={index} lines={1} />
            ))}
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );

};

export default SkeletonLoad;