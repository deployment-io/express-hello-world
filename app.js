const express = require("express");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type('html').send(html));

// Troubleshooting helper: reports the environment variables this deployment is
// running with. process.env holds secrets in most deployments, so the route is
// off unless DEBUG_ENV_TOKEN is set, callers must present that token, and
// values under secret-looking keys are redacted even for authorized callers.
const debugEnvToken = process.env.DEBUG_ENV_TOKEN;

const SECRET_KEY = /pass|secret|token|key|cred|auth|session|cookie|salt|sign|private|dsn|uri|url|conn/i;

const timingSafeEqual = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const presentedToken = (req) => {
  const authorization = req.get("authorization") || "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : req.get("x-debug-token") || "";
};

const redactedEnv = () =>
  Object.fromEntries(
    Object.entries(process.env).map(([key, value]) =>
      SECRET_KEY.test(key) ? [key, "[redacted]"] : [key, value]
    )
  );

app.get("/debug/env", (req, res) => {
  // Not configured means not deployed: stay indistinguishable from a typo.
  if (!debugEnvToken) return res.status(404).type("txt").send("Not Found");

  if (!timingSafeEqual(presentedToken(req), debugEnvToken)) {
    return res
      .status(401)
      .set("WWW-Authenticate", 'Bearer realm="debug"')
      .json({ error: "unauthorized" });
  }

  res.set("Cache-Control", "no-store").json(redactedEnv());
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Deployment.io!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Deployment.io!
    </section>
  </body>
</html>
`
