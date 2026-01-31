"use client";

import { useState } from "react";
import { ActionResponse, signInAction, SignInData } from "@/actions/auth";
import { error } from "console";

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
    console.log("Server response:", response);
    setResponse(response);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
        />
        <ul>
          {response?.success === false &&
            response.errors?.email?.map((error, index) => {
              return <li key={index}>{error}</li>;
            })}
        </ul>
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <ul>
        {response?.success === false &&
          response.errors?.password?.map((error, index) => {
            return <li key={index}>{error}</li>;
          })}
      </ul>
      <button type="submit">Sign In</button>
    </form>
  );
}
