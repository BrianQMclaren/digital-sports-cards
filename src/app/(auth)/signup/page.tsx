"use client";

import { ActionResponse, signUpAction, SignUpData } from "@/actions/auth";
import { use, useState } from "react";

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
    console.log("Server response:", response);
    setResponse(response);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter your first name"
        />
        <ul>
          {response?.success === false &&
            response.errors?.firstName?.map((error, index) => {
              return <li key={index}>{error}</li>;
            })}
        </ul>
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
        />
        <ul>
          {response?.success === false &&
            response.errors?.lastName?.map((error, index) => {
              return <li key={index}>{error}</li>;
            })}
        </ul>
      </div>
      <div>
        <label htmlFor="username">UserName</label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        <ul>
          {response?.success === false &&
            response.errors?.username?.map((error, index) => {
              return <li key={index}>{error}</li>;
            })}
        </ul>
      </div>
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
        <ul>
          {response?.success === false &&
            response.errors?.password?.map((error, index) => {
              return <li key={index}>{error}</li>;
            })}
        </ul>
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}
