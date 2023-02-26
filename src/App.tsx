import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import { ContentLayout, Link } from "@cloudscape-design/components";

import Login from "./Login";

function App() {
  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header
            variant="h1"
            info={
              <Link href="https://quip-amazon.com/fhTVAaHtCg0l/Photo-Asset-Management">
                Info
              </Link>
            }
            description="Photo Asset Manager serverless demo app."
          >
            PAM: Photo Asset Managment
          </Header>
        </SpaceBetween>
      }
    >
      <Login />
    </ContentLayout>
  );
}

export default App;
