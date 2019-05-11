# Goals and Non-Goals

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

## Config chain and Config loader

- Loader
  - Handles NODE_PATH
- require resolver injection

## Layer

We split the real world into reusable and hirachical abstractions, one over another, the foundation at the bottom, and disorder mess at the top.

## Config

- Defines `Composer` to compose config anchors from different `Layer`s hierachicaly

## Config `Anchor`

an config endpoint in each config layer

## Orchestrator

- `Block` orchestration
- Name `Block`s
  - Name `BlocksMap`
  - Name `BlocksList`
- Shares outlets
- Define anchor from config chain for Blocks
- Define the main block

## Plugin

Hook on Block outlets and Block hooks

## Utilities

- Error handler
