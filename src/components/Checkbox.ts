import Fusion from "@rbxts/fusion-3.0";
import {
	Palette,
	Shape,
	Transparency,
	paletteFor,
	type PaletteColor,
} from "../ui/theme";

const { Children, Computed, New, OnEvent, peek } = Fusion;

export interface CheckboxProps {
	value: Fusion.Value<boolean>;
	indeterminate?: boolean;
	disabled?: boolean;
	label?: string;
	color?: PaletteColor;
	onChange?: (next: boolean) => void;
	layoutOrder?: number;
}

export function Checkbox(scope: Fusion.Scope<unknown>, props: CheckboxProps): Frame {
	const palette = paletteFor(props.color ?? "primary");
	const disabled = props.disabled ?? false;
	const indeterminate = props.indeterminate ?? false;

	const isOn = Computed(scope, (use) => use(props.value) || indeterminate);

	// The box is ALWAYS visible: white/paper when unchecked, coloured fill when
	// on. A strong dark outline keeps it readable over either surface.
	const boxBg = Computed(scope, (use) => {
		if (disabled) return Palette.background.default;
		return use(isOn) ? palette.main : Palette.background.paper;
	});
	const boxBgTransparency = disabled ? 0.3 : 0;
	const strokeColor = Computed(scope, (use) => {
		if (disabled) return Palette.common.black;
		return use(isOn) ? palette.main : Palette.common.black;
	});
	const strokeTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.divider;
		return use(isOn) ? 0 : 0.3;
	});
	const glyph = indeterminate ? "–" : "✓";
	const glyphTransparency = Computed(scope, (use) => (use(isOn) ? 0 : 1));

	const toggle = () => {
		if (disabled) return;
		const nextValue = !peek(props.value);
		props.value.set(nextValue);
		if (props.onChange !== undefined) props.onChange(nextValue);
	};

	const box = New(scope, "TextButton")({
		Name: "Box",
		Size: new UDim2(0, 20, 0, 20),
		BackgroundColor3: boxBg,
		BackgroundTransparency: boxBgTransparency,
		BorderSizePixel: 0,
		Text: glyph,
		TextColor3: palette.contrast,
		TextTransparency: glyphTransparency,
		TextSize: 16,
		Font: Enum.Font.GothamBold,
		AutoButtonColor: false,
		Active: !disabled,
		LayoutOrder: 1,
		[OnEvent("Activated")]: toggle,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
			New(scope, "UIStroke")({
				Color: strokeColor,
				Transparency: strokeTransparency,
				Thickness: 2,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
		],
	});

	const children: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Horizontal,
			SortOrder: Enum.SortOrder.LayoutOrder,
			VerticalAlignment: Enum.VerticalAlignment.Center,
			Padding: new UDim(0, 8),
		}),
		box,
	];

	if (props.label !== undefined) {
		children.push(
			New(scope, "TextButton")({
				Name: "Label",
				Size: new UDim2(0, 0, 0, 20),
				AutomaticSize: Enum.AutomaticSize.X,
				BackgroundTransparency: 1,
				Text: props.label,
				TextColor3: Palette.common.black,
				TextTransparency: disabled ? Transparency.textDisabled : Transparency.textPrimary,
				TextSize: 14,
				Font: Enum.Font.Gotham,
				TextXAlignment: Enum.TextXAlignment.Left,
				AutoButtonColor: false,
				Active: !disabled,
				LayoutOrder: 2,
				[OnEvent("Activated")]: toggle,
			}),
		);
	}

	return New(scope, "Frame")({
		Name: "Checkbox",
		Size: new UDim2(0, 0, 0, 20),
		AutomaticSize: Enum.AutomaticSize.X,
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: children,
	});
}
