import { cn } from "cn";
import { SubmitHandler, useForm } from "react-hook-form";

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
import { LoginFormData } from "@/types";
import { toast } from "sonner";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const formSubmit: SubmitHandler<LoginFormData> = async (data) => {
        try {
            await addExpense(data);
            toast.add({ title: "Expense Added" });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    JSON.stringify(error.response?.data?.detail, null, 2),
                );
            } else {
                console.error(error);
            }
            toast.add({
                title: "Failed to add Expense",
                description: "Please try again.",
            });
        } finally {
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
                    <form onSubmit={handleSubmit(formSubmit)}>
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
                            <Field>
                                <Button type="submit">Login</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
