import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ThemeDropdown from "@/components/ThemeDropdown";

interface Route {
  id: string;
  name: string;
  description: string;
  targets: string[];
  active: boolean;
  secret?: string;
  createdAt: string;
}

interface PingResult {
  target: string;
  status: number | null;
  ok: boolean;
  error?: string;
  durationMs: number;
}

interface AuthStatus {
  firstRun: boolean;
  loggedIn: boolean;
  email: string | null;
  smtpConfigured: boolean;
}

function webhookUrl(id: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/hooks/${id}`;
}

// ── Auth Forms ──────────────────────────────────────────────

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    onDone();
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 440 }}>
      <Card.Body>
        <h4 className="mb-3">Create Admin Account</h4>
        <p className="text-muted small">
          This is the first run. Register an admin account to get started.
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@example.com"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
            {loading ? <Spinner size="sm" /> : "Register"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Request failed.");
      return;
    }
    setSent(true);
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 440 }}>
      <Card.Body>
        <h4 className="mb-3">Reset Password</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        {sent ? (
          <>
            <Alert variant="success">
              If an account with that email exists, a reset link has been sent. Check your inbox.
            </Alert>
            <Button variant="link" className="p-0" onClick={onBack}>
              Back to Sign In
            </Button>
          </>
        ) : (
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@example.com"
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading} className="w-100 mb-2">
              {loading ? <Spinner size="sm" /> : "Send Reset Link"}
            </Button>
            <Button variant="link" className="p-0" onClick={onBack}>
              Back to Sign In
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}

function LoginForm({ onDone, smtpConfigured, onClose }: { onDone: () => void; smtpConfigured: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) {
    return (
      <div className="landing-login-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="landing-login-card">
          <ForgotPasswordForm onBack={() => setShowForgot(false)} />
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }
    onDone();
  }

  return (
    <div className="landing-login-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="landing-login-card">
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Sign In</h4>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={submit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="admin@example.com"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={loading} className="w-100">
                {loading ? <Spinner size="sm" /> : "Sign In"}
              </Button>
              {smtpConfigured && (
                <div className="text-center mt-2">
                  <Button variant="link" className="p-0 small" onClick={() => setShowForgot(true)}>
                    Forgot password?
                  </Button>
                </div>
              )}
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

// ── Landing Page ────────────────────────────────────────────

function LandingPage({ onLogin, smtpConfigured }: { onLogin: () => void; smtpConfigured: boolean }) {
  const [showLogin, setShowLogin] = useState(false);

  const features = [
    {
      icon: "\u{1F517}",
      color: "rgba(96, 165, 250, 0.15)",
      title: "Single Ingress Point",
      desc: "Expose one webhook URL per route instead of configuring many. Keep your setup clean and manageable.",
    },
    {
      icon: "\u{1F4E1}",
      color: "rgba(167, 139, 250, 0.15)",
      title: "Fan Out to Many Targets",
      desc: "Forward each incoming webhook to multiple destinations in parallel \u2014 CI, chat, monitoring, and more.",
    },
    {
      icon: "\u{1F6E1}\uFE0F",
      color: "rgba(52, 211, 153, 0.15)",
      title: "Signature Verification",
      desc: "Supports GitHub, Gitea, and GitLab webhook signatures out of the box. Your routes stay secure.",
    },
    {
      icon: "\u{1F504}",
      color: "rgba(251, 191, 36, 0.15)",
      title: "Automatic Retries",
      desc: "Failed deliveries are retried up to 3 times with exponential backoff. Nothing gets lost.",
    },
  ];

  return (
    <div className="landing-hero">
      {/* Nav */}
      <Navbar bg="dark" data-bs-theme="dark" className="mb-0">
        <Container>
          <Navbar.Brand className="fw-bold">{"\u{1F500}"} Git Task Fan Out</Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Button
              variant="outline-light"
              size="sm"
              className="me-2"
              href="https://github.com/Xalior/GitTaskFanOut"
              target="_blank"
              rel="noopener noreferrer"
              as="a"
            >
              GitHub
            </Button>
            <Button variant="light" size="sm" className="me-2" onClick={() => setShowLogin(true)}>
              Sign In
            </Button>
            <ThemeDropdown />
          </Nav>
        </Container>
      </Navbar>

      {/* Hero */}
      <div className="landing-hero-content">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <h1 className="landing-logo mb-4">
                One webhook in,
                <br />
                <span className="landing-accent">many targets out.</span>
              </h1>
              <p className="landing-tagline mb-4">
                A lightweight, self-hosted webhook router for Git platforms.
                Receive webhooks on unique endpoints and fan them out to
                multiple destinations in parallel.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="lg"
                  href="https://github.com/Xalior/GitTaskFanOut"
                  target="_blank"
                  rel="noopener noreferrer"
                  as="a"
                >
                  Get Your Own
                </Button>
                <Button variant="outline-secondary" size="lg" onClick={() => setShowLogin(true)}>
                  Sign In
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="landing-diagram">
                <svg viewBox="0 0 360 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
                  {/* Source labels */}
                  <text x="80" y="24" fill="#0d6efd" fontSize="13" fontWeight="600" fontFamily="inherit">GitHub</text>
                  <text x="155" y="24" fill="#0d6efd" fontSize="13" fontWeight="600" fontFamily="inherit">Gitea</text>
                  <text x="225" y="24" fill="#0d6efd" fontSize="13" fontWeight="600" fontFamily="inherit">GitLab</text>

                  {/* Source arrows down */}
                  <line x1="103" y1="32" x2="103" y2="68" stroke="#0d6efd" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="175" y1="32" x2="175" y2="68" stroke="#0d6efd" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="250" y1="32" x2="250" y2="68" stroke="#0d6efd" strokeWidth="1.5" strokeDasharray="4 3" />

                  {/* Merge line */}
                  <line x1="103" y1="68" x2="250" y2="68" stroke="#0d6efd" strokeWidth="1.5" />
                  <line x1="180" y1="68" x2="180" y2="90" stroke="#0d6efd" strokeWidth="1.5" />

                  {/* POST label */}
                  <text x="180" y="108" fill="#6c757d" fontSize="11" fontFamily="inherit" textAnchor="middle">POST /api/hooks/a1b2c3</text>

                  {/* Arrow to box */}
                  <line x1="180" y1="115" x2="180" y2="140" stroke="#6c757d" strokeWidth="1.5" />
                  <polygon points="180,143 176,136 184,136" fill="#6c757d" />

                  {/* Central box */}
                  <rect x="80" y="148" width="200" height="48" rx="8" fill="rgba(13,110,253,0.08)" stroke="#0d6efd" strokeWidth="1.5" />
                  <text x="180" y="177" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="inherit" textAnchor="middle">Git Task Fan Out</text>

                  {/* Fan-out arrow from box */}
                  <line x1="180" y1="196" x2="180" y2="220" stroke="#6c757d" strokeWidth="1.5" />

                  {/* Fan-out split */}
                  <line x1="60" y1="220" x2="300" y2="220" stroke="#6c757d" strokeWidth="1.5" />
                  <line x1="60" y1="220" x2="60" y2="252" stroke="#6c757d" strokeWidth="1.5" />
                  <line x1="140" y1="220" x2="140" y2="252" stroke="#6c757d" strokeWidth="1.5" />
                  <line x1="220" y1="220" x2="220" y2="252" stroke="#6c757d" strokeWidth="1.5" />
                  <line x1="300" y1="220" x2="300" y2="252" stroke="#6c757d" strokeWidth="1.5" />

                  {/* Arrowheads */}
                  <polygon points="60,255 56,248 64,248" fill="#6c757d" />
                  <polygon points="140,255 136,248 144,248" fill="#6c757d" />
                  <polygon points="220,255 216,248 224,248" fill="#6c757d" />
                  <polygon points="300,255 296,248 304,248" fill="#6c757d" />

                  {/* Target boxes */}
                  <rect x="20" y="260" width="80" height="36" rx="6" fill="rgba(25,135,84,0.08)" stroke="#198754" strokeWidth="1" />
                  <text x="60" y="282" fill="#198754" fontSize="11" fontWeight="600" fontFamily="inherit" textAnchor="middle">CI Server</text>

                  <rect x="100" y="260" width="80" height="36" rx="6" fill="rgba(25,135,84,0.08)" stroke="#198754" strokeWidth="1" />
                  <text x="140" y="282" fill="#198754" fontSize="11" fontWeight="600" fontFamily="inherit" textAnchor="middle">Chat Bot</text>

                  <rect x="180" y="260" width="80" height="36" rx="6" fill="rgba(25,135,84,0.08)" stroke="#198754" strokeWidth="1" />
                  <text x="220" y="282" fill="#198754" fontSize="11" fontWeight="600" fontFamily="inherit" textAnchor="middle">Monitor</text>

                  <rect x="260" y="260" width="80" height="36" rx="6" fill="rgba(25,135,84,0.08)" stroke="#198754" strokeWidth="1" />
                  <text x="300" y="282" fill="#198754" fontSize="11" fontWeight="600" fontFamily="inherit" textAnchor="middle">Deploy</text>
                </svg>
              </div>
            </Col>
          </Row>

          {/* Features */}
          <Row className="g-4 mt-5">
            {features.map((f, i) => (
              <Col sm={6} lg={3} key={i}>
                <div className="landing-feature-card">
                  <div className="landing-feature-icon" style={{ background: f.color }}>
                    {f.icon}
                  </div>
                  <h6 className="fw-semibold mb-2">{f.title}</h6>
                  <p className="small text-muted mb-0">{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>

          {/* Self-host CTA */}
          <div className="text-center mt-5 pt-3 pb-4">
            <h5 className="fw-semibold mb-3">Self-hosted. Open source. No dependencies.</h5>
            <p className="text-muted mb-4" style={{ maxWidth: 520, margin: "0 auto" }}>
              Runs anywhere with Node.js or Docker. Config stored in simple INI files &mdash;
              no database required. LGPL-3.0 licensed.
            </p>
            <Button
              variant="outline-secondary"
              href="https://github.com/Xalior/GitTaskFanOut"
              target="_blank"
              rel="noopener noreferrer"
              as="a"
            >
              View on GitHub
            </Button>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <Container className="d-flex justify-content-between flex-wrap gap-2">
          <span>Git Task Fan Out &mdash; LGPL-3.0</span>
          <a
            href="https://github.com/Xalior/GitTaskFanOut"
            className="text-muted text-decoration-none"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/Xalior/GitTaskFanOut
          </a>
        </Container>
      </div>

      {/* Login overlay */}
      {showLogin && (
        <LoginForm
          onDone={onLogin}
          smtpConfigured={smtpConfigured}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}

// ── Change Password Modal ───────────────────────────────────

function ChangePasswordModal({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setOldPassword("");
    setNewPassword("");
    setConfirm("");
    setError("");
    setSuccess(false);
  }

  function handleHide() {
    reset();
    onHide();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Password change failed.");
      return;
    }
    setSuccess(true);
    setTimeout(handleHide, 1500);
  }

  return (
    <Modal show={show} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Password changed successfully.</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <Form.Text className="text-muted">Minimum 8 characters.</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || success}>
            {loading ? <Spinner size="sm" /> : "Change Password"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// ── Ping Results Modal ──────────────────────────────────────

function PingResultsModal({
  show,
  onHide,
  routeName,
  results,
  loading,
}: {
  show: boolean;
  onHide: () => void;
  routeName: string;
  results: PingResult[];
  loading: boolean;
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Ping Results &mdash; {routeName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Pinging targets...</p>
          </div>
        ) : results.length === 0 ? (
          <Alert variant="info">No results.</Alert>
        ) : (
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>Target</th>
                <th style={{ width: 80 }}>Status</th>
                <th style={{ width: 90 }}>Time</th>
                <th style={{ width: 70 }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="text-break small">{r.target}</td>
                  <td>{r.status ?? "N/A"}</td>
                  <td>{r.durationMs}ms</td>
                  <td>
                    <Badge bg={r.ok ? "success" : "danger"}>
                      {r.ok ? "OK" : "FAIL"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {!loading && results.some((r) => r.error) && (
          <div className="mt-2">
            {results
              .filter((r) => r.error)
              .map((r, i) => (
                <Alert key={i} variant="warning" className="small py-2">
                  <strong>{r.target}:</strong> {r.error}
                </Alert>
              ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ── Routes Dashboard ────────────────────────────────────────

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targets, setTargets] = useState("");
  const [secret, setSecret] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Ping state
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingRouteName, setPingRouteName] = useState("");
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [pingLoading, setPingLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/routes");
    if (res.ok) setRoutes(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditRoute(null);
    setName("");
    setDescription("");
    setTargets("");
    setSecret("");
    setActive(true);
    setError("");
    setShowModal(true);
  }

  function openEdit(r: Route) {
    setEditRoute(r);
    setName(r.name);
    setDescription(r.description);
    setTargets(r.targets.join("\n"));
    setSecret(r.secret || "");
    setActive(r.active);
    setError("");
    setShowModal(true);
  }

  async function save() {
    const tList = targets
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!name.trim() || tList.length === 0) {
      setError("Name and at least one target URL are required.");
      return;
    }

    const payload = {
      name,
      description,
      targets: tList,
      active,
      secret: secret || undefined,
    };

    if (editRoute) {
      const res = await fetch(`/api/routes/${editRoute.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("Failed to update route.");
        return;
      }
    } else {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("Failed to create route.");
        return;
      }
    }
    setShowModal(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this route?")) return;
    await fetch(`/api/routes/${id}`, { method: "DELETE" });
    load();
  }

  async function duplicate(id: string) {
    const res = await fetch(`/api/routes/${id}/duplicate`, { method: "POST" });
    if (res.ok) load();
  }

  async function toggle(r: Route) {
    await fetch(`/api/routes/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !r.active }),
    });
    load();
  }

  async function ping(r: Route) {
    setPingRouteName(r.name);
    setPingResults([]);
    setPingLoading(true);
    setShowPingModal(true);
    const res = await fetch(`/api/routes/${r.id}/ping`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setPingResults(data.results);
    }
    setPingLoading(false);
  }

  function copyUrl(id: string) {
    navigator.clipboard.writeText(webhookUrl(id));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout();
  }

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Git Task Fan Out</Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Navbar.Text className="me-3">
              Signed in as <strong>{email}</strong>
            </Navbar.Text>
            <Button
              variant="outline-light"
              size="sm"
              className="me-2"
              onClick={() => setShowPasswordModal(true)}
            >
              Password
            </Button>
            <Button variant="outline-light" size="sm" className="me-2" onClick={handleLogout}>
              Sign Out
            </Button>
            <ThemeDropdown />
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Routes</h4>
          <Button variant="primary" onClick={openCreate}>
            + New Route
          </Button>
        </div>

        {routes.length === 0 ? (
          <Alert variant="info">No routes configured yet. Create one to get started.</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Webhook URL</th>
                <th>Targets</th>
                <th>Status</th>
                <th style={{ width: 280 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id}>
                  <td className="align-middle">
                    <div>{r.name}</div>
                    {r.description && (
                      <small className="text-muted">{r.description}</small>
                    )}
                  </td>
                  <td className="align-middle">
                    <code className="small">/api/hooks/{r.id}</code>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => copyUrl(r.id)}
                    >
                      {copied === r.id ? "Copied!" : "Copy"}
                    </Button>
                  </td>
                  <td className="align-middle">{r.targets.length} target(s)</td>
                  <td className="align-middle">
                    <Badge
                      bg={r.active ? "success" : "secondary"}
                      role="button"
                      onClick={() => toggle(r)}
                      style={{ cursor: "pointer" }}
                    >
                      {r.active ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="align-middle">
                    <OverlayTrigger overlay={<Tooltip>Ping all targets</Tooltip>}>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-1"
                        onClick={() => ping(r)}
                      >
                        Ping
                      </Button>
                    </OverlayTrigger>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => openEdit(r)}
                    >
                      Edit
                    </Button>
                    <OverlayTrigger overlay={<Tooltip>Duplicate route</Tooltip>}>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => duplicate(r.id)}
                      >
                        Dup
                      </Button>
                    </OverlayTrigger>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => remove(r.id)}
                    >
                      Del
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Route Create/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editRoute ? "Edit Route" : "New Route"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-repo-hooks"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this route is for"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target URLs (one per line)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={targets}
                onChange={(e) => setTargets(e.target.value)}
                placeholder={"https://ci.internal/webhook\nhttps://chat.internal/git-notify"}
              />
              <Form.Text className="text-muted">
                Each incoming webhook will be forwarded to all targets in parallel.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Secret (optional)</Form.Label>
              <Form.Control
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Webhook secret for signature verification"
              />
              <Form.Text className="text-muted">
                Supports GitHub (X-Hub-Signature-256), Gitea (X-Gitea-Signature), and GitLab
                (X-Gitlab-Token).
              </Form.Text>
            </Form.Group>
            {editRoute && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              {editRoute ? "Save Changes" : "Create Route"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Password Change Modal */}
        <ChangePasswordModal
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
        />

        {/* Ping Results Modal */}
        <PingResultsModal
          show={showPingModal}
          onHide={() => setShowPingModal(false)}
          routeName={pingRouteName}
          results={pingResults}
          loading={pingLoading}
        />
      </Container>
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function Home() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth/status");
    if (res.ok) setAuth(await res.json());
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!auth) {
    return (
      <>
        <Head>
          <title>Git Task Fan Out</title>
        </Head>
        <Container className="text-center mt-5">
          <Spinner animation="border" />
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Git Task Fan Out</title>
      </Head>

      {auth.firstRun ? (
        <RegisterForm onDone={checkAuth} />
      ) : auth.loggedIn && auth.email ? (
        <Dashboard email={auth.email} onLogout={checkAuth} />
      ) : (
        <LandingPage onLogin={checkAuth} smtpConfigured={auth.smtpConfigured} />
      )}
    </>
  );
}
