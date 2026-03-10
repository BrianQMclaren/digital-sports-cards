"use client";

import { useState } from "react";
import { ActionResponse, signInAction, SignInData } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialFormData: SignInData = {
  email: "",
  password: "",
};

export default function SignInForm() {
  const [formData, setFormData] = useState<SignInData>(initialFormData);
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
    const response = await signInAction(formData);
    setResponse(response);
  };

  const toFieldErrors = (errors?: string[]) =>
    errors?.map((message) => ({ message }));

  const errors = response?.success === false ? response.errors : undefined;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
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
          </FieldGroup>
          <Field data-invalid={!!errors?.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors?.password}
            />
            <FieldError errors={toFieldErrors(errors?.password)} />
          </Field>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
