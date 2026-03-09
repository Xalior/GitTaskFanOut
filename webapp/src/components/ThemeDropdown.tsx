import { useEffect, useState, useCallback } from "react";
import { SunFill, MoonStarsFill, CircleHalf, Check2 } from "react-bootstrap-icons";
import { Nav, Dropdown } from "react-bootstrap";

type Theme = "light" | "dark" | "auto";
const COOKIE = "gtfo-theme";

const getCookie = (name: string) => {
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
};

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

const prefersDark = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

export default function ThemeDropdown() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("auto");

  const apply = useCallback((t: Theme) => {
    const effective = t === "auto" ? (prefersDark() ? "dark" : "light") : t;
    document.documentElement.setAttribute("data-bs-theme", effective);
  }, []);

  useEffect(() => {
    setMounted(true);
    const v = getCookie(COOKIE);
    const initial: Theme = v === "light" || v === "dark" || v === "auto" ? (v as Theme) : "auto";
    setTheme(initial);
    apply(initial);
  }, [apply]);

  useEffect(() => {
    if (!mounted || theme !== "auto") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("auto");

    mql.addEventListener("change", onChange);

    const onPageShow = () => apply("auto");
    window.addEventListener("pageshow", onPageShow);

    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [mounted, theme, apply]);

  const choose = (t: Theme) => {
    setCookie(COOKIE, t);
    setTheme(t);
    apply(t);
  };

  const isActive = (t: Theme) => theme === t;
  const ToggleIcon = !mounted
    ? CircleHalf
    : theme === "dark"
      ? MoonStarsFill
      : theme === "light"
        ? SunFill
        : CircleHalf;

  return (
    <Dropdown as={Nav.Item} align="end">
      <Dropdown.Toggle as={Nav.Link} id="bd-theme" className="px-2 py-2 d-flex align-items-center">
        <ToggleIcon />
        <span className="d-lg-none ms-2">Toggle theme</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item as="button" className="d-flex align-items-center" active={isActive("light")} onClick={() => choose("light")}>
          <SunFill />
          <span className="ms-2">Light</span>
          {isActive("light") && <Check2 className="ms-auto" aria-hidden="true" />}
        </Dropdown.Item>
        <Dropdown.Item as="button" className="d-flex align-items-center" active={isActive("dark")} onClick={() => choose("dark")}>
          <MoonStarsFill />
          <span className="ms-2">Dark</span>
          {isActive("dark") && <Check2 className="ms-auto" aria-hidden="true" />}
        </Dropdown.Item>
        <Dropdown.Item as="button" className="d-flex align-items-center" active={isActive("auto")} onClick={() => choose("auto")}>
          <CircleHalf />
          <span className="ms-2">Auto</span>
          {isActive("auto") && <Check2 className="ms-auto" aria-hidden="true" />}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
