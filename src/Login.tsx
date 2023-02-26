import { produce } from "immer";
import {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUser,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import Form from "@cloudscape-design/components/form";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import {
  Container,
  FormField,
  Grid,
  Input,
} from "@cloudscape-design/components";
import { useCallback, useState } from "react";
import { create } from "zustand";

interface LoginStore {
  authToken: string;
  userPool: CognitoUserPool;
  currentUser: () => CognitoUser | undefined;
  signout: () => Promise<void>;
  signin: (username: string, password: string) => Promise<void>;
}

function asPromise(fn?: (callback: () => void) => void): Promise<void> {
  return fn
    ? new Promise((resolve) => {
        fn(resolve);
      })
    : Promise.resolve();
}

const toUsername = (email: string) => email.replace("@", "-at-");

const useLoginStore = create<LoginStore>((set, get) => ({
  authToken: "",
  userPool: new CognitoUserPool({
    UserPoolId: import.meta.env.COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.COGNITO_USER_POOL_CLIENT_ID,
  }),
  currentUser: () => {
    return get().userPool.getCurrentUser() ?? undefined;
  },
  signout: async () => {
    await asPromise(get().currentUser()?.signOut);
  },
  signin: async (Username: string, Password: string) => {
    Username = toUsername(Username);
    const authenticationDetails = new AuthenticationDetails({
      Username,
      Password,
    });

    const cognitoUser = new CognitoUser({ Username, Pool: get().userPool });
    const session: CognitoUserSession = await new Promise((r, j) =>
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: r,
        onFailure: j,
      })
    );
    const token = session.getIdToken().getJwtToken();

    console.log("Authenticated to cognito", Username, token);

    set(
      produce<LoginStore>((state) => {
        state.authToken = token;
      })
    );
  },
}));

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const signin = useLoginStore((s) => s.signin);

  const tryLogin = useCallback(() => {
    signin(username, password);
  }, [username, password, signin]);

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
