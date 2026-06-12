import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import log from "loglevel";
import { useState } from "react";
import { login, register } from "../../api/api";
import useStore from "../../store/useStore";

export default function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  log.debug("Login");

  const [token, setToken] = useState("");
  const webSocketServerUrl = useStore((s) => s.webSocketServerUrl);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="">
        <CardHeader>
          <CardTitle>TreeRo</CardTitle>
          <CardDescription>Enter your account token and host</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="host">Web socket host</FieldLabel>
                <Input
                  id="host"
                  placeholder="wss://..."
                  value={webSocketServerUrl}
                  onChange={(e) => useStore.setState({ webSocketServerUrl: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="token">Token</FieldLabel>
                <Input id="token" placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
              </Field>
              <Field>
                <Button
                  type="submit"
                  onClick={async () => {
                    if (token) {
                      await login(webSocketServerUrl, token);
                    }
                  }}
                >
                  Login
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?
                  <Button
                    variant="link"
                    onClick={async () => {
                      await register(webSocketServerUrl);
                    }}
                  >
                    Sign up
                  </Button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
