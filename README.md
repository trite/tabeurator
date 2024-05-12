# Tabeurator

## Quirks/Issues

This project is in a VERY EARLY state right now. I have only spent a few hours so far putting this all together, and there is a lot of room for improvement.

### Feature requests and bug reports

Please submit any issue requests or bug reports at [https://github.com/trite/tabeurator/issues](https://github.com/trite/tabeurator/issues).

### Currently known issues

- Window support
  - Focus so far has been on moving tabs within the same window, there's some wonky behavior when swapping to tabs in another window.
  - Searching tabs searches between all windows, without any options (yet) to filter windows.
- Search result ordering
  - Sorting/ordering currently works by sorting tabs based on the chosen method (Fuzzy Search Score, Alphabetical, Most Recently Visited (MRV)) and then filtering based on the fuzzy search terms in the search box.
  - This currently causes sorting to not work quite how I want it to, and will be focused on eventually.
  - The fuzzy search is using default options from the search library (Fuse.js) right now.
  - Eventually want to make sorting factor in multiple criteria at once (example: hybrid score generated from Fuzzy Search Score combined with MRV value).
- Options dialog is ugly and doesn't respect dark mode theme
- Popup is slow sometimes. This happens more on Chrome in my testing than Firefox, but can be slightly relieved on Chrome by `pinning` the extension (click the extensions button in Chrome, then click the pin icon next to Tabeurator). Part of the slowness in Chrome seems to come from a non-pinned addon being called, since Chrome plays an animation showing the extension icon sliding into view which takes a few moments, and the popup won't open till after the animation. Pinning the extension prevents the animation.
- Popup isn't always scrolled to top (yet).
- Popup sometimes takes multiple presses of hotkey to be summoned.
- Some websites don't play nicely with the `Ctrl+Space` and/or `Ctrl+Shift+Space` hotkeys.

### Chrome/Firefox and Manifest v3/v2

As of 2024-05-12 Firefox doesn't yet support everything I need in manifest v3, and Chrome throws deprecation warnings if using manifest v2. So for now the build process is bifurcated: there are `build:firefox`, `build:chrome`, and similar duplicates for various commands specific to each manifest. Naming them against Chrome/Firefox instead of v2/v3 is to keep development life easier as I test features out in each browser... But if later supporting more browsers that'll need to change most likely.

Eventually this should all be able to work on manifest v3, once Firefox finishes implementing support for it.

## Shortcuts

Mac default hotkeys use CTRL instead of CMD because I want to use `Ctrl+Space` and `Ctrl+Shift+Space` on my windows machines, and translating the first one to `Cmd+Space` invokes the spotlight tool on Mac.

### Current shortcuts

#### Open search pane

The search pane can be opened by default with `Ctrl+Space` (on all OSes).

#### Previous tab

If the `Most Recently Visited (MRV)` option is enabled then most recently visited tabs are tracked (poorly, just using tab id's for now). Using `Ctrl+Shift+Space` (on all OSes) will navigate to the most recently visited tab.

### Configuring Shortcuts

Open the extension options dialog and update it there. Currently only the search box hotkey is configurable, previous tab hotkey will be soon.

# Working notes

## TODO

- [ ] Figure out better fuzzy search settings, there's lots to work with but just need to sit down and take the time
- [x] Jump to previous tab via shortcut
- [ ] Change filtering in search box on the fly via keyword or key character
- [ ] Check Fuse.js docs to see if there's any option for things like hard filtering
  - [ ] Might be something [here](https://www.fusejs.io/api/options.html#useextendedsearch)
- [ ] Will the current method have issues when tabs are reordered? Might need to see if there's a unique ID that follows tabs around when they are reordered.
- [ ] Better window switching support: still need to get the previous tab shortcut to work with it and doesn't yet capture when moving to a window without also changing tabs, which kind of messes with the goal of last tab meaning last tab viewed (focused)?
- [ ] Better window support: options to limit searching to current window or specific window(s)
- [ ] Add hotkey configuration support for previous tab action
- [ ] Search popup should always be scrolled to top on opening
- [ ] Add sidebar version that doesn't need to be popped up with a hotkey (or maybe then the hotkey controls opening/closing the sidebar?)
- [ ] Popup sometimes takes multiple presses of hotkey to be summoned.
- [ ] Some websites don't play nicely with the `Ctrl+Space` and/or `Ctrl+Shift+Space` hotkeys.

## Maybe

- [ ] Jump to X tabs ago via shortcut (limited by the MRV list length, only available if MRV is enabled)
