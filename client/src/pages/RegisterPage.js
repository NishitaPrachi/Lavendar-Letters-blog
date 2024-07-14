import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function register(ev) {
    ev.preventDefault();

    const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
      alert("Registration Successfull");
    } else {
      alert("Registration failed");
    }
  }

  return (
    <form className="register" onSubmit={register}>
      <h1 className="cursive">Register</h1>

      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        className="input-text"
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        className="input-text"
      />

      <button className="lavender-btn">Register</button>
    </form>
  );
}