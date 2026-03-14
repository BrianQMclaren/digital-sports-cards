"use client";

import { ActionResponse, signUpAction, SignUpData } from "@/actions/auth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialFormData: SignUpData = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
};

export default function SignUpForm() {
  const [formData, setFormData] = useState<SignUpData>(initialFormData);
  const [response, setResponse] = useState<ActionResponse>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await signUpAction(formData);
    setResponse(response);
  };

  const toFieldErrors = (errors?: string[]) =>
    errors?.map((message) => ({ message }));

  const errors = response?.success === false ? response.errors : undefined;

  return (
    <Card className="w-full max-w-sm max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field data-invalid={!!errors?.firstName}>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                aria-invalid={!!errors?.firstName}
              />
              <FieldError errors={toFieldErrors(errors?.firstName)} />
            </Field>

            <Field data-invalid={!!errors?.lastName}>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                aria-invalid={!!errors?.lastName}
              />
              <FieldError errors={toFieldErrors(errors?.lastName)} />
            </Field>

            <Field data-invalid={!!errors?.username}>
              <FieldLabel htmlFor="username">UserName</FieldLabel>
              <Input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter a username"
                aria-invalid={!!errors?.username}
              />
              <FieldError errors={toFieldErrors(errors?.username)} />
            </Field>

            <Field data-invalid={!!errors?.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                placeholder="you@example.com"
                onChange={handleChange}
                aria-invalid={!!errors?.email}
              />
              <FieldError errors={toFieldErrors(errors?.email)} />
            </Field>

            <Field data-invalid={!!errors?.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                placeholder="••••••••"
                onChange={handleChange}
                aria-invalid={!!errors?.password}
              />
              <FieldError errors={toFieldErrors(errors?.password)} />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
