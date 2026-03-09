import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Password reset failed.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/"), 2000);
  }

  if (!token) {
    return (
      <>
        <Head>
          <title>Reset Password - Git Task Fan Out</title>
        </Head>
        <Container className="text-center mt-5">
          <Alert variant="danger">Missing reset token. Please use the link from your email.</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password - Git Task Fan Out</title>
      </Head>
      <Card className="mx-auto mt-5" style={{ maxWidth: 440 }}>
        <Card.Body>
          <h4 className="mb-3">Set New Password</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              Password reset successfully. Redirecting to login...
            </Alert>
          )}
          {!success && (
            <Form onSubmit={submit}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                />
                <Form.Text className="text-muted">Minimum 8 characters.</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={loading} className="w-100">
                {loading ? <Spinner size="sm" /> : "Reset Password"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
