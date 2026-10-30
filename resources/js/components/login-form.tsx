import axios from "axios";
import { cn } from "cn";
import { router } from "@inertiajs/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { LoginFormData } from "@/types";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>();

    const formSubmit: SubmitHandler<LoginFormData> = async (data) => {
        try {
            const res = await api.post("/login", data);
            toast.success(res.data.message ?? "Logged in");
            router.visit(res.data.redirect ?? "/dashboard");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const body = error.response?.data;

                // Laravel validation errors
                if (status === 422 && body?.errors) {
                    Object.entries(body.errors).forEach(([field, msgs]) => {
                        setError(field as keyof LoginFormData, {
                            message: (msgs as string[])[0],
                        });
                    });
                    return;
                }

                // Wrong email/password, or server error
                setError("root", {
                    message: body?.message ?? "Login failed. Please try again.",
                });
                toast.error(body?.message ?? "Login failed");
                return;
            }

            console.error(error);
            toast.error("Something went wrong", {
                description: "Please try again.",
            });
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(formSubmit)} noValidate>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email address",
                                        },
                                    })}
                                />
                            </Field>
                            {errors.email && (
                                <FieldDescription className="text-red-500 font-medium">
                                    {errors.email.message}
                                </FieldDescription>
                            )}

                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password", {
                                        required: "Password is required",
                                    })}
                                />
                            </Field>
                            {errors.password && (
                                <FieldDescription className="text-red-500 font-medium">
                                    {errors.password.message}
                                </FieldDescription>
                            )}

                            {errors.root && (
                                <FieldDescription className="text-red-500 font-medium">
                                    {errors.root.message}
                                </FieldDescription>
                            )}

                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Logging in..." : "Login"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
