# LifeCycle

- command start
- SandboxEnv: get basic env, spawn spawner/start
- spawner/start: create real server
- Server:
  - initialize AppEnv, changes process.env
  - initialize next and webpack
