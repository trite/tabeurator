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

## Package

Run the bundle step and then package the contents for distribution. Contents will end up in a folder inside of `dist`:

- Chrome: `bundle:chrome`
- Firefox: `bundle:firefox`
