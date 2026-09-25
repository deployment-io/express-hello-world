# README

This is the [Express](https://expressjs.com) [Hello world](https://expressjs.com/en/starter/hello-world.html) example on [Deployment.io](https://deployment.io).

## Deployment requirement: `/debug/env`

`GET /debug/env` returns the **complete, unredacted process environment** as JSON.
The support tooling parses that exact shape, so the route carries no
authentication, header check, IP restriction, redaction, allowlist or
environment-based kill switch by design. Containment is a deployment
responsibility, not an application one:

- **Do not expose this service on public ingress.** Block `/debug/env` at the
  load balancer / reverse proxy, or bind the service to a private network.
- **Rotate on exposure.** Any credential present in the environment of a
  deployment that served this route should be treated as disclosed.
- Each request is logged to stderr with the client IP, timestamp and
  user-agent, so exposure can be detected after the fact.

