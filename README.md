# @rbxts/big-ui

A Material-UI-inspired component library for [Roblox-TS](https://roblox-ts.com/) built on top of [Fusion 3.0](https://elttob.uk/Fusion/0.3/). Ships 23 themeable primitives — buttons, dialogs, forms, navigation, feedback, and progress — with a single `configureTheme` entrypoint for customization.

## Installation

```sh
npm install @rbxts/big-ui
```

Peer dependencies (pulled in automatically):

- `@rbxts/fusion-3.0`
- `@rbxts/services`

## Quick start

Every component takes a Fusion `Scope` as its first argument and a props object as its second, and returns a Roblox `Instance` you can parent into your UI tree.

```ts
import Fusion from "@rbxts/fusion-3.0";
import { Button, Card, Text } from "@rbxts/big-ui";
import { Players } from "@rbxts/services";

const scope = Fusion.scoped();

const card = Card(scope, {
    children: [
        Text(scope, { variant: "h6", text: "Welcome" }),
        Button(scope, {
            label: "Click me",
            variant: "contained",
            color: "primary",
            onActivate: () => print("clicked"),
        }),
    ],
});

const screen = Fusion.New(scope, "ScreenGui")({
    Name: "App",
    Parent: Players.LocalPlayer.WaitForChild("PlayerGui"),
    [Fusion.Children]: card,
});
```

## Theming

Every component reads from a single live theme module. Override it once at startup with `configureTheme` — any fields you omit keep their Material defaults.

```ts
import { configureTheme } from "@rbxts/big-ui";

configureTheme({
    palette: {
        primary: {
            main: Color3.fromRGB(120, 80, 255),
            dark: Color3.fromRGB(90, 60, 200),
            light: Color3.fromRGB(160, 130, 255),
            contrast: Color3.fromRGB(255, 255, 255),
        },
        background: {
            paper: Color3.fromRGB(30, 30, 38),
        },
    },
    shape: {
        radius: 8,
    },
    typography: {
        button: { font: Enum.Font.SourceSansBold },
    },
});
```

### What you can override

| Section        | Shape                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `palette`      | `primary`, `secondary`, `error`, `warning`, `info`, `success` (each has `main`/`dark`/`light`/`contrast`)    |
|                | plus `text`, `background`, `common`                                                                          |
| `transparency` | `textPrimary`, `textSecondary`, `textDisabled`, `divider`, `hover`, `selected`, `disabledBg`, `backdrop`     |
| `shape`        | `radius`, `radiusLarge`, `radiusPill`                                                                        |
| `typography`   | Per-variant `size`, `font`, `lineHeight` for `h4`–`overline`                                                 |
| `zIndex`       | `hud`, `drawer`, `modalBackdrop`, `modal`, `tooltip`                                                         |

Call `configureTheme` **before mounting UI**. Components read live values during construction, not reactively, so changing the theme after a component is built does not re-render it.

You can also read theme values directly if you need them in your own code:

```ts
import { Palette, Spacing, Typography } from "@rbxts/big-ui";

const padding = Spacing(2); // => 16
const heading = Typography.h5;
const accent = Palette.primary.main;
```

## Components

### Inputs
- `Button` — `contained` / `outlined` / `text` variants, six palette colors, three sizes, loading spinner
- `IconButton` — compact glyph-only button
- `Checkbox` — controlled boolean with optional label
- `Switch` — controlled toggle
- `RadioGroup` — controlled single-select list
- `Slider` — controlled numeric slider with min/max/step
- `TextField` — controlled text input with label and helper text
- `Dropdown` — controlled select with overlay menu
- `ViewportButton` — button whose content is a 3D viewport

### Layout & surfaces
- `Card` — elevated surface with padding
- `Divider` — horizontal / vertical rule
- `Accordion` — collapsible section
- `List` / `ListItem` — vertically stacked items
- `Tabs` — horizontal tab strip with animated indicator

### Feedback & overlays
- `Alert` — severity banner (`info` / `success` / `warning` / `error`)
- `Modal` — centered dialog with backdrop and action bar
- `Drawer` — edge-anchored sliding panel (`left` / `right` / `top` / `bottom`)
- `PopoverMenu` — context menu anchored to a screen position

### Display
- `Text` — typography variants (`h4`–`overline`) with color tokens
- `Avatar` — circular image or initials
- `Badge` — small status pill
- `CircularProgress` — indeterminate ring
- `LinearProgress` — indeterminate bar

Each component exports its props interface — e.g. `ButtonProps`, `ModalProps` — so you can type consumer code.

## Controlled state

State-holding components take a `Fusion.Value<T>` rather than a plain value. The component reads from it and writes back on user interaction.

```ts
import Fusion from "@rbxts/fusion-3.0";
import { Switch } from "@rbxts/big-ui";

const scope = Fusion.scoped();
const enabled = Fusion.Value(scope, false);

Switch(scope, {
    value: enabled,
    onChange: (next) => print("toggled:", next),
});
```

## Building from source

```sh
npm install
npm run build    # rbxtsc → out/
npm run watch    # incremental rebuilds
```

The compiled output lives under `out/` and is published as the package's `main` entrypoint (`out/init.luau`).
