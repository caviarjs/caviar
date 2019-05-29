> Drafts, that may be outdated

# Terminology

- **Users** who cares about business logic
- **Implementors** who cases about the development experience of users.

# Goals & Non-Goals

## Tagline

The framework skeleton of web frameworks.

## Scope

Some reusable and relatively insulated operation blocks need to work with each other to reach the shared goals.

## Goals

- Try to eliminate configurations for normal users
- Provide a way to create layers which can be empowered by Docker
- Finally start the server
- Better for debugging
- Serverless support?

## Non-Goals

- Cares about a certain library or framework

# Thinking

- How to reuse orchestrators
- How to generate docker image by caviar. How to extend it.
- How a plugin to create sub hooks? use `getHooks()`

# Thinking in caviar ecosystem

- How to reuse babel configuration
- How to support build phase
- How to replace a block type of a binder with another block who has a similar interface.

# Principle

# Features

## Debugging

- local configurations or testing env
- with or without sandbox

## Two Phases

- **build** The phase to build the docker image
- **ready** The phase to start the server

# Types

## Hook

`tapable` hook

## Trigger

Start a block, or resume a paused block

Actually a reversed `tapable` hook

## Operation `Block`

- Provides `Hook`s
- Provides `Trigger`s
- Config `Composer`

Should be

- `Orchestrator`-agnostic

### Built-in Block (Roe)

> Inherit tree should be reviewed

- `Sandbox`
- `Orchestrator`
- `Server`

## Config chain and Config loader

- Loader
  - Handles `NODE_PATH`
- require resolver injection

## Layer (Spoon)

We split the real world into reusable and hirachical abstractions, one over another, the foundation at the bottom, and disorder mess at the top.

## ConfigLoader

- Supports chainable
- Defines `Composer` to compose config anchors from different `Layer`s hierachicaly

## Config `Anchor`

an config endpoint in each config layer

## Orchestrator (Sauce)

- `Block` orchestration to determine what your caviar really tastes
- Name `Block`s
  - Name `BlocksMap`
  - Name `BlocksList`
- Shares outlets
- Define config loader
- Define the main block

## Plugin

Hook on Block outlets and Block hooks

## Plugin System

Support to plugin a hook into a generic `Block` type rather than hooking into an instance of a `Block`

## Utilities

- Error handler
- Sub hooks creator
- Cli
