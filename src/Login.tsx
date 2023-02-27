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
  Alert,
  Container,
  FormField,
  Grid,
  Input,
} from "@cloudscape-design/components";
import { useCallback, useState } from "react";
import { create } from "zustand";

interface LoginStore {
  authToken: string;
  loginState: LoginFlowState;
  userPool: CognitoUserPool;
  user: CognitoUser | null;
  currentUser: () => CognitoUser | undefined;
  signout: () => Promise<void>;
  signin: (username: string, password: string) => Promise<void>;
  newPassword: (username: string, newPassword: string) => Promise<void>;
}

type LoginFlowState = "Logged Out" | "Bad Login" | "Needs Reset" | "Logged In";

function asPromise(fn?: (callback: () => void) => void): Promise<void> {
  return fn
    ? new Promise((resolve) => {
        fn(resolve);
      })
    : Promise.resolve();
}

const useLoginStore = create<LoginStore>((set, get) => ({
  authToken: "",
  loginState: "Logged Out",
  user: null,
  userPool: new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
  }),
  currentUser: () => {
    return get().userPool.getCurrentUser() ?? undefined;
  },
  signout: async () => {
    await asPromise(get().currentUser()?.signOut);
  },
  signin: async (Username: string, Password: string) => {
    const authenticationDetails = new AuthenticationDetails({
      Username,
      Password,
    });

    // CognitoUser is stateful, use the same one.
    const cognitoUser = new CognitoUser({ Username, Pool: get().userPool });
    set(() => ({ user: cognitoUser }));
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        const token = session.getIdToken().getJwtToken();

        console.log("Authenticated to cognito", Username, token);

        set(() => ({ authToken: token, loginState: "Logged In" }));
      },
      onFailure: (err) => {
        console.log("Authentication failure", Username, err);
        set(() => ({ loginState: "Bad Login" }));
      },
      newPasswordRequired: (_userAttrs: unknown, _challenge: unknown) => {
        console.log(
          "Authentication succeeded, reset required",
          Username,
          _userAttrs,
          _challenge
        );
        set(() => ({ loginState: "Needs Reset" }));
      },
    });
  },
  newPassword: async (Username: string, newPassword: string) => {
    // const cognitoUser = new CognitoUser({ Username, Pool: get().userPool });
    const cognitoUser = get().user;
    if (cognitoUser === null) throw new Error("Missing CognitoUser");

    try {
      await new Promise<CognitoUserSession>((resolve, reject) => {
        cognitoUser.completeNewPasswordChallenge(
          newPassword,
          {},
          {
            onSuccess: resolve,
            onFailure: reject,
          }
        );
      });

      console.log("Reset succeeded", Username);
      get().signin(Username, newPassword);
    } catch (error) {
      console.error("Failed to reset password", Username, error);
      set(() => ({ loginState: "Bad Login" }));
    }
  },
}));

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signin, newPassword: reset, loginState, authToken } = useLoginStore();

  const tryLogin = useCallback(() => {
    signin(username, password);
  }, [username, password, signin]);

  const finishResetPassword = useCallback(() => {
    if (newPassword !== confirmPassword) return;
    reset(username, newPassword);
  }, [username, newPassword, confirmPassword, reset]);

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
                <Button
                  onClick={() =>
                    loginState == "Needs Reset"
                      ? finishResetPassword()
                      : tryLogin()
                  }
                  variant="primary"
                >
                  {loginState === "Needs Reset" ? "Reset" : "Login"}
                </Button>
              </SpaceBetween>
            }
          >
            {["Logged Out", "Bad Login"].includes(loginState) && (
              <>
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
                  label={`Password`}
                >
                  <Input
                    onChange={({ detail }) => setPassword(detail.value)}
                    value={password}
                    type="password"
                  />
                </FormField>
                {loginState === "Bad Login" && (
                  <Alert type="error" header="Bad Login">
                    Incorrect username or password.
                  </Alert>
                )}
              </>
            )}
            {loginState === "Needs Reset" && (
              <>
                <FormField
                  description="New password for Cognito login"
                  label="New password"
                >
                  <Input
                    onChange={({ detail }) => setNewPassword(detail.value)}
                    value={newPassword}
                    type="password"
                  />
                </FormField>
                <FormField
                  description="Confirm new password for Cognito login"
                  label="Confirm New Password"
                >
                  <Input
                    onChange={({ detail }) => {
                      debugger;
                      setConfirmPassword(detail.value);
                    }}
                    value={confirmPassword}
                    invalid={
                      confirmPassword.length > 0 &&
                      confirmPassword !== newPassword
                    }
                    type="password"
                  />
                </FormField>
              </>
            )}
            {loginState === "Logged In" && (
              <>
                <p>Logged in!</p>
                <textarea>{authToken}</textarea>
              </>
            )}
          </Form>
        </form>
      </Container>
    </Grid>
  );
}

export default Login;
