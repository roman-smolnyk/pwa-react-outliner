import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import log from "loglevel";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { login } from "../../api/api";
import useStore from "../../store/useStore";

const loginSchema = z.object({
  webSocketServerUrl: z.string(),
  token: z.string().min(1, "Token is required"),
});

export default function LogInForm({ className, ...props }: React.ComponentProps<"div">) {
  log.debug("LogInForm");

  const webSocketServerUrl = useStore((s) => s.webSocketServerUrl);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      webSocketServerUrl: webSocketServerUrl || "",
      token: "",
    },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    await login(data.webSocketServerUrl, data.token);
  }

  return (
    <div data-component="LogInForm" className={className} {...props}>
      <div className="m-5 text-2xl font-black flex items-center justify-center">TreeRo</div>
      <Card>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>Enter into your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="webSocketServerUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Web socket host</FieldLabel>
                    <Input {...field} id={field.name} placeholder="wss://..." aria-invalid={fieldState.invalid} autoComplete="off" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="token"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Token</FieldLabel>
                    <Input {...field} id={field.name} placeholder="Token" aria-invalid={fieldState.invalid} autoComplete="off" required />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" form="login-form">
                  Log In
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => {
                      useStore.setState({ isSignUp: true });
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
