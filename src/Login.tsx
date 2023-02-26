import Form from "@cloudscape-design/components/form";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import {
  Container,
  FormField,
  Grid,
  Input,
} from "@cloudscape-design/components";
import { useCallback, useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const tryLogin = useCallback(() => {
    console.log(
      "Attempting cognito login",
      username,
      password.slice(0, 3) + "..." + password.slice(password.length - 3)
    );
  }, [username, password]);

  return (
    <Grid
      gridDefinition={[
        {
          colspan: { default: 12, xxs: 10, xs: 8, s: 6, m: 4 },
          offset: { default: 0, xxs: 1, xs: 2, s: 3, m: 4 },
        },
      ]}
    >
      <Container>
        <form onSubmit={(e) => e.preventDefault()}>
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button formAction="none" variant="link">
                  Cancel
                </Button>
                <Button onClick={tryLogin} variant="primary">
                  Login
                </Button>
              </SpaceBetween>
            }
          >
            <FormField
              description="Username for Cognito login"
              label="Username"
            >
              <Input
                onChange={({ detail }) => setUsername(detail.value)}
                value={username}
              />
            </FormField>
            <FormField
              description="Password for Cognito login"
              label="Password"
            >
              <Input
                onChange={({ detail }) => setPassword(detail.value)}
                value={password}
                type="password"
              />
            </FormField>
          </Form>
        </form>
      </Container>
    </Grid>
  );
}

export default Login;
