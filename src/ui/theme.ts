// Material-UI-inspired theme for @rbxts/big-ui.
// Every UI primitive reads from this module; there should be no raw
// colour/size literals anywhere else.
//
// The exported objects (Palette, Transparency, Shape, Typography, ZIndex) are
// mutable. Consumers override them at startup by calling `configureTheme(...)`,
// which deep-merges user values into the defaults. Components read live values
// at render time, so configureTheme should be called before mounting UI.
//
// Transparency values are Roblox-style (0 = fully opaque, 1 = fully transparent)
// and were chosen so that black-on-white overlays approximate MUI's `rgba(0,0,0,A)`
// action-colour scheme: hover = 0.04A, selected = 0.08A, divider = 0.12A, etc.

export interface ColorGroup {
	main: Color3;
	dark: Color3;
	light: Color3;
	contrast: Color3;
}

export interface TextPalette {
	primary: Color3;
	secondary: Color3;
	disabled: Color3;
}

export interface BackgroundPalette {
	default: Color3;
	paper: Color3;
}

export interface CommonPalette {
	black: Color3;
	white: Color3;
}

export interface PaletteDef {
	primary: ColorGroup;
	secondary: ColorGroup;
	error: ColorGroup;
	warning: ColorGroup;
	info: ColorGroup;
	success: ColorGroup;
	text: TextPalette;
	background: BackgroundPalette;
	common: CommonPalette;
}

export interface TransparencyDef {
	textPrimary: number;
	textSecondary: number;
	textDisabled: number;
	divider: number;
	hover: number;
	selected: number;
	disabledBg: number;
	backdrop: number;
}

export interface ShapeDef {
	radius: number;
	radiusLarge: number;
	radiusPill: number;
}

export interface TypographySpec {
	size: number;
	font: Enum.Font;
	lineHeight: number;
}

export type TypographyVariant =
	| "h4"
	| "h5"
	| "h6"
	| "subtitle1"
	| "subtitle2"
	| "body1"
	| "body2"
	| "button"
	| "caption"
	| "overline";

export type TypographyDef = Record<TypographyVariant, TypographySpec>;

export interface ZIndexDef {
	hud: number;
	drawer: number;
	modalBackdrop: number;
	modal: number;
	tooltip: number;
}

export const Palette: PaletteDef = {
	primary: {
		main: Color3.fromRGB(25, 118, 210),
		dark: Color3.fromRGB(21, 101, 192),
		light: Color3.fromRGB(66, 165, 245),
		contrast: Color3.fromRGB(255, 255, 255),
	},
	secondary: {
		main: Color3.fromRGB(156, 39, 176),
		dark: Color3.fromRGB(123, 31, 162),
		light: Color3.fromRGB(186, 104, 200),
		contrast: Color3.fromRGB(255, 255, 255),
	},
	error: {
		main: Color3.fromRGB(211, 47, 47),
		dark: Color3.fromRGB(198, 40, 40),
		light: Color3.fromRGB(239, 83, 80),
		contrast: Color3.fromRGB(255, 255, 255),
	},
	warning: {
		main: Color3.fromRGB(237, 108, 2),
		dark: Color3.fromRGB(230, 81, 0),
		light: Color3.fromRGB(255, 152, 0),
		contrast: Color3.fromRGB(255, 255, 255),
	},
	info: {
		main: Color3.fromRGB(2, 136, 209),
		dark: Color3.fromRGB(1, 87, 155),
		light: Color3.fromRGB(3, 169, 244),
		contrast: Color3.fromRGB(255, 255, 255),
	},
	success: {
		main: Color3.fromRGB(46, 125, 50),
		dark: Color3.fromRGB(27, 94, 32),
		light: Color3.fromRGB(76, 175, 80),
		contrast: Color3.fromRGB(255, 255, 255),
	},
	text: {
		primary: Color3.fromRGB(0, 0, 0),
		secondary: Color3.fromRGB(0, 0, 0),
		disabled: Color3.fromRGB(0, 0, 0),
	},
	background: {
		default: Color3.fromRGB(250, 250, 250),
		paper: Color3.fromRGB(255, 255, 255),
	},
	common: {
		black: Color3.fromRGB(0, 0, 0),
		white: Color3.fromRGB(255, 255, 255),
	},
};

export const Transparency: TransparencyDef = {
	textPrimary: 0.13,
	textSecondary: 0.4,
	textDisabled: 0.62,
	divider: 0.88,
	hover: 0.96,
	selected: 0.92,
	disabledBg: 0.88,
	backdrop: 0.5,
};

export const Shape: ShapeDef = {
	radius: 4,
	radiusLarge: 8,
	radiusPill: 999,
};

export const Spacing = (multiplier: number): number => multiplier * 8;

export const Typography: TypographyDef = {
	h4: { size: 34, font: Enum.Font.GothamMedium, lineHeight: 42 },
	h5: { size: 24, font: Enum.Font.GothamMedium, lineHeight: 32 },
	h6: { size: 20, font: Enum.Font.GothamBold, lineHeight: 28 },
	subtitle1: { size: 16, font: Enum.Font.GothamMedium, lineHeight: 24 },
	subtitle2: { size: 14, font: Enum.Font.GothamMedium, lineHeight: 20 },
	body1: { size: 16, font: Enum.Font.Gotham, lineHeight: 24 },
	body2: { size: 14, font: Enum.Font.Gotham, lineHeight: 20 },
	button: { size: 14, font: Enum.Font.GothamBold, lineHeight: 20 },
	caption: { size: 12, font: Enum.Font.Gotham, lineHeight: 16 },
	overline: { size: 11, font: Enum.Font.GothamBold, lineHeight: 16 },
};

export const ZIndex: ZIndexDef = {
	hud: 10,
	drawer: 500,
	modalBackdrop: 1300,
	modal: 1300,
	tooltip: 1500,
};

export type PaletteColor = "primary" | "secondary" | "error" | "warning" | "info" | "success";

export function paletteFor(color: PaletteColor): ColorGroup {
	switch (color) {
		case "secondary":
			return Palette.secondary;
		case "error":
			return Palette.error;
		case "warning":
			return Palette.warning;
		case "info":
			return Palette.info;
		case "success":
			return Palette.success;
		case "primary":
		default:
			return Palette.primary;
	}
}

// ---------------------------------------------------------------------------
// Custom theme overrides
// ---------------------------------------------------------------------------

export interface ColorGroupOverride {
	main?: Color3;
	dark?: Color3;
	light?: Color3;
	contrast?: Color3;
}

export interface PaletteOverride {
	primary?: ColorGroupOverride;
	secondary?: ColorGroupOverride;
	error?: ColorGroupOverride;
	warning?: ColorGroupOverride;
	info?: ColorGroupOverride;
	success?: ColorGroupOverride;
	text?: Partial<TextPalette>;
	background?: Partial<BackgroundPalette>;
	common?: Partial<CommonPalette>;
}

export type TypographyOverride = {
	[K in TypographyVariant]?: Partial<TypographySpec>;
};

export interface ThemeOverrides {
	palette?: PaletteOverride;
	transparency?: Partial<TransparencyDef>;
	shape?: Partial<ShapeDef>;
	typography?: TypographyOverride;
	zIndex?: Partial<ZIndexDef>;
}

function mergeInto<T extends object>(target: T, source: Partial<T> | undefined): void {
	if (source === undefined) return;
	for (const [key, value] of pairs(source as { [k: string]: defined })) {
		if (value !== undefined) {
			(target as unknown as { [k: string]: defined })[key as string] = value;
		}
	}
}

/**
 * Deep-merge user overrides into the live theme. Call this once at startup,
 * before any components are mounted. Any fields left undefined keep their
 * default values.
 *
 * @example
 * configureTheme({
 *   palette: {
 *     primary: { main: Color3.fromRGB(120, 80, 255) },
 *   },
 *   shape: { radius: 8 },
 * });
 */
export function configureTheme(overrides: ThemeOverrides): void {
	if (overrides.palette !== undefined) {
		const p = overrides.palette;
		mergeInto(Palette.primary, p.primary);
		mergeInto(Palette.secondary, p.secondary);
		mergeInto(Palette.error, p.error);
		mergeInto(Palette.warning, p.warning);
		mergeInto(Palette.info, p.info);
		mergeInto(Palette.success, p.success);
		mergeInto(Palette.text, p.text);
		mergeInto(Palette.background, p.background);
		mergeInto(Palette.common, p.common);
	}
	mergeInto(Transparency, overrides.transparency);
	mergeInto(Shape, overrides.shape);
	mergeInto(ZIndex, overrides.zIndex);
	if (overrides.typography !== undefined) {
		for (const [variant, spec] of pairs(
			overrides.typography as { [k: string]: Partial<TypographySpec> },
		)) {
			mergeInto(Typography[variant as TypographyVariant], spec);
		}
	}
}
