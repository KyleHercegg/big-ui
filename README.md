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

## Icons

Icons come from a single sprite sheet (Kenney Game Icons — 6 columns × 20 rows, white-on-transparent). The PNG lives at [src/assets/icons.png](src/assets/icons.png) in this repo. Ship once, reference everywhere by name.

### One-time setup

1. Upload [src/assets/icons.png](src/assets/icons.png) to Roblox as a Decal/Image asset.
2. Register the resulting asset ID at startup:

```ts
import { configureIcons } from "@rbxts/big-ui";

configureIcons({ sheetAssetId: "rbxassetid://123456789" });
```

Call `configureIcons` **before mounting UI** (same rule as `configureTheme`). Until it's called, icons render blank.

### Using icons

**As standalone glyphs:**

```ts
import { Icon } from "@rbxts/big-ui";

Icon(scope, { name: "settings", size: 24, color: "primary" });
Icon(scope, { name: "close", color: Color3.fromRGB(255, 100, 100) });
```

**Inside an `IconButton`:**

```ts
import { IconButton } from "@rbxts/big-ui";

IconButton(scope, {
    icon: "trash",
    size: "medium",
    color: "error",
    onActivate: () => print("delete"),
});
```

**Before / after a `Button` label** (same convention as MUI):

```ts
import { Button } from "@rbxts/big-ui";

Button(scope, {
    label: "Save",
    startIcon: "save",
    variant: "contained",
});

Button(scope, {
    label: "Continue",
    endIcon: "arrowRight",
    variant: "outlined",
});
```

### Available icon names

The full set is defined in [src/ui/icons.ts](src/ui/icons.ts) and typed as `IconName`. Your IDE will autocomplete. Examples: `close`, `check`, `settings`, `trash`, `save`, `play`, `pause`, `home`, `user`, `users`, `star`, `warning`, `info`, `help`, `zoomIn`, `zoomOut`, `volume`, `arrowUp`/`Down`/`Left`/`Right`, gamepad buttons (`buttonA`, `buttonB`, `buttonX`, `buttonY`, `buttonL1`/`L2`/`R1`/`R2`, `buttonStart`, `buttonSelect`), and many more.

### Raw offsets

If you need to place an icon yourself (e.g. on a custom `ImageLabel`), use the `Icons` dictionary and `applyIcon` helper:

```ts
import Fusion from "@rbxts/fusion-3.0";
import { Icons, applyIcon, getIconSheetAssetId } from "@rbxts/big-ui";

const img = Fusion.New(scope, "ImageLabel")({
    Size: new UDim2(0, 32, 0, 32),
    Image: getIconSheetAssetId(),
    BackgroundTransparency: 1,
});
applyIcon(img, "wrench"); // sets ImageRectOffset + ImageRectSize
```

### Using a different sheet

To swap in your own sprite sheet, either edit [src/ui/icons.ts](src/ui/icons.ts) with your own `Icons` dictionary before publishing a fork, or treat this package as a reference implementation and register your own `Icon` component against your own atlas.

## Components

### Inputs
- `Button` — `contained` / `outlined` / `text` variants, six palette colors, three sizes, loading spinner, optional `startIcon` / `endIcon`
- `IconButton` — compact icon-only button (uses the sprite sheet)
- `Icon` — standalone sprite-sheet icon
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
