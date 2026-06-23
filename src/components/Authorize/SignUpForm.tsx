import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import log from "loglevel";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { signup } from "../../api/api";
import useStore from "../../store/useStore";

const signupSchema = z.object({
  webSocketServerUrl: z.string(),
  username: z.string().min(1, "Username is required"),
});

export default function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  log.debug("SignUpForm");

  const webSocketServerUrl = useStore((s) => s.webSocketServerUrl);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      webSocketServerUrl: webSocketServerUrl || "",
      username: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signupSchema>) {
    await signup(data.webSocketServerUrl, data.username);
  }

  return (
    <div className={className} {...props}>
      <h1 className="m-5 flex items-center justify-center">TreeRo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* <Controller
                name="webSocketServerUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Web socket host</FieldLabel>
                    <Input {...field} id={field.name} placeholder="wss://..." aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              /> */}

              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input {...field} id={field.name} placeholder="Username" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>Username does not need to be unique.</FieldDescription>
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" form="signup-form">
                  Create Account
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => {
                      useStore.setState({ isSignUp: false });
                    }}
                  >
                    Log in
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
