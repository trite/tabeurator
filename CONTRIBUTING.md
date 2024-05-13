# Contributing

This documentation is very much a WIP.

## Manifest v2 vs v3 and Firefox vs Chrome

Currently (as of 2024-05-12) Chrome throws deprecation warnings if using manifest v2, and Firefox doesn't support everything that Tabeurator needs when using manifest v3. As such, until Firefox has gotten further along in their support for web extension manifest v3 there are separate paths for handling Chrome and Firefox.

# Commands

How to do things and stuff.

## Setup

`npm install`

## Build

One-off builds:

- Chrome: `build:chrome`
- Firefox: `build:firefox`

## Watch

Running a build in watch mode:

- Chrome: `watch:chrome`
- Firefox: `watch:firefox`

## Bundle

For performing bundling, not sure if this really even needs to be a separate command from `package` (below):

- Chrome: `bundle:chrome`
- Firefox: `bundle:firefox`

## Package-only

Exists as its own command largely for debugging purposes, generally shouldn't be run by itself unless you're testing something specific to the packaging process and don't want to re-run bundling every time (since bundling takes way longer than packaging right now).

## Package

Run the bundle step and then then package-only steps for a particular distribution. Artifacts will end up in a `dist-{browser}` folder:

- Chrome: `package:chrome`
  - Artifacts: `dist-chrome`
- Firefox: `package:firefox`
  - Artifacts: `dist-firefox`

There's also a `package:both` command to bundle and package for both browsers. When using this command the respective output packages will be in `dist-{browser}`.

## Clean

Remove build artifacts (`dist-{browser}` folders).

## Hard-reset

Run `clean` and then remove node_modules. A `npm install` will be needed before work can resume.
