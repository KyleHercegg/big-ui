import Fusion from "@rbxts/fusion-3.0";
import { Palette, Transparency } from "../ui/theme";

const { Children, Computed, New, OnEvent, Tween, peek } = Fusion;

export interface SwitchProps {
	value: Fusion.Value<boolean>;
	disabled?: boolean;
	onChange?: (next: boolean) => void;
	layoutOrder?: number;
}

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const HANDLE_SIZE = 20;
const HANDLE_INSET = 2;

export function Switch(scope: Fusion.Scope<unknown>, props: SwitchProps): TextButton {
	const disabled = props.disabled ?? false;

	const trackBg = Computed(scope, (use) => {
		if (disabled) return Palette.common.black;
		return use(props.value) ? Palette.primary.main : Palette.common.black;
	});

	const trackTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.disabledBg;
		return use(props.value) ? 0 : Transparency.divider;
	});

	const targetHandleX = Computed(scope, (use) =>
		use(props.value) ? TRACK_WIDTH - HANDLE_SIZE - HANDLE_INSET : HANDLE_INSET,
	);
	const animatedHandleX = Tween(
		scope,
		targetHandleX,
		new TweenInfo(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
	);
	const handlePosition = Computed(
		scope,
		(use) => new UDim2(0, use(animatedHandleX), 0.5, 0),
	);

	return New(scope, "TextButton")({
		Name: "Switch",
		Size: new UDim2(0, TRACK_WIDTH, 0, TRACK_HEIGHT),
		BackgroundColor3: trackBg,
		BackgroundTransparency: trackTransparency,
		BorderSizePixel: 0,
		Text: "",
		AutoButtonColor: false,
		Active: !disabled,
		LayoutOrder: props.layoutOrder ?? 0,
		[OnEvent("Activated")]: () => {
			if (disabled) return;
			const nextValue = !peek(props.value);
			props.value.set(nextValue);
			if (props.onChange !== undefined) props.onChange(nextValue);
		},
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
			New(scope, "Frame")({
				Name: "Handle",
				AnchorPoint: new Vector2(0, 0.5),
				Size: new UDim2(0, HANDLE_SIZE, 0, HANDLE_SIZE),
				Position: handlePosition,
				BackgroundColor3: Palette.background.paper,
				BorderSizePixel: 0,
				[Children]: [
					New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
					New(scope, "UIStroke")({
						Color: Palette.common.black,
						Transparency: Transparency.divider,
						Thickness: 1,
					}),
				],
			}),
		],
	});
}
