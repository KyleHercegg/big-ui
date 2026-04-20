import Fusion from "@rbxts/fusion-3.0";
import { UserInputService } from "@rbxts/services";
import { Palette, Transparency, Typography } from "../ui/theme";

const { Children, Computed, New, peek } = Fusion;

export interface SliderProps {
	value: Fusion.Value<number>;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	label?: string;
	showValue?: boolean;
	onChange?: (next: number) => void;
	layoutOrder?: number;
}

const TRACK_HEIGHT = 4;
const HANDLE_SIZE = 16;
const BODY_HEIGHT = 24;
const HEADER_HEIGHT = 20;

function formatValue(value: number, step: number): string {
	if (step >= 1) return `${math.floor(value + 0.5)}`;
	const decimals = math.max(0, -math.floor(math.log10(step) + 0.0001));
	return string.format(`%.${decimals}f`, value);
}

export function Slider(scope: Fusion.Scope<unknown>, props: SliderProps): Frame {
	const min = props.min ?? 0;
	const max = props.max ?? 100;
	const step = props.step ?? 1;
	const disabled = props.disabled ?? false;
	const showHeader = props.label !== undefined || (props.showValue ?? true);

	const ratio = Computed(scope, (use) => {
		const clamped = math.clamp(use(props.value), min, max);
		return max - min === 0 ? 0 : (clamped - min) / (max - min);
	});

	const fillBg = disabled ? Palette.common.black : Palette.primary.main;
	const fillTransparency = disabled ? Transparency.disabledBg : 0;
	const handleBg = disabled ? Palette.common.black : Palette.primary.main;
	const handleTransparency = disabled ? Transparency.disabledBg : 0;

	const body = New(scope, "Frame")({
		Name: "SliderBody",
		Size: new UDim2(1, 0, 0, BODY_HEIGHT),
		BackgroundTransparency: 1,
		LayoutOrder: 2,
	});

	const track = New(scope, "Frame")({
		Name: "Track",
		AnchorPoint: new Vector2(0, 0.5),
		Size: new UDim2(1, 0, 0, TRACK_HEIGHT),
		Position: new UDim2(0, 0, 0.5, 0),
		BackgroundColor3: Palette.common.black,
		BackgroundTransparency: Transparency.divider,
		BorderSizePixel: 0,
		Parent: body,
		[Children]: New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
	});

	New(scope, "Frame")({
		Name: "Fill",
		AnchorPoint: new Vector2(0, 0.5),
		Size: Computed(scope, (use) => new UDim2(use(ratio), 0, 0, TRACK_HEIGHT)),
		Position: new UDim2(0, 0, 0.5, 0),
		BackgroundColor3: fillBg,
		BackgroundTransparency: fillTransparency,
		BorderSizePixel: 0,
		Parent: body,
		[Children]: New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
	});

	New(scope, "Frame")({
		Name: "Handle",
		AnchorPoint: new Vector2(0.5, 0.5),
		Size: new UDim2(0, HANDLE_SIZE, 0, HANDLE_SIZE),
		Position: Computed(scope, (use) => new UDim2(use(ratio), 0, 0.5, 0)),
		BackgroundColor3: handleBg,
		BackgroundTransparency: handleTransparency,
		BorderSizePixel: 0,
		Parent: body,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
			New(scope, "UIStroke")({
				Color: Palette.background.paper,
				Transparency: 0.6,
				Thickness: 2,
			}),
		],
	});

	if (!disabled) {
		let dragging = false;
		const updateFromX = (mouseX: number) => {
			const absPos = track.AbsolutePosition.X;
			const absWidth = track.AbsoluteSize.X;
			if (absWidth <= 0) return;
			const r = math.clamp((mouseX - absPos) / absWidth, 0, 1);
			let nextValue = min + r * (max - min);
			if (step > 0) nextValue = math.round(nextValue / step) * step;
			nextValue = math.clamp(nextValue, min, max);
			if (peek(props.value) !== nextValue) {
				props.value.set(nextValue);
				if (props.onChange !== undefined) props.onChange(nextValue);
			}
		};

		body.InputBegan.Connect((input) => {
			if (
				input.UserInputType === Enum.UserInputType.MouseButton1 ||
				input.UserInputType === Enum.UserInputType.Touch
			) {
				dragging = true;
				updateFromX(input.Position.X);
			}
		});
		body.InputEnded.Connect((input) => {
			if (
				input.UserInputType === Enum.UserInputType.MouseButton1 ||
				input.UserInputType === Enum.UserInputType.Touch
			) {
				dragging = false;
			}
		});
		UserInputService.InputChanged.Connect((input) => {
			if (!dragging) return;
			if (
				input.UserInputType === Enum.UserInputType.MouseMovement ||
				input.UserInputType === Enum.UserInputType.Touch
			) {
				updateFromX(input.Position.X);
			}
		});
	}

	const headerRow = showHeader
		? New(scope, "Frame")({
			Size: new UDim2(1, 0, 0, HEADER_HEIGHT),
			BackgroundTransparency: 1,
			LayoutOrder: 1,
			[Children]: [
				props.label !== undefined
					? New(scope, "TextLabel")({
						BackgroundTransparency: 1,
						Size: new UDim2(0.5, 0, 1, 0),
						Text: props.label,
						TextColor3: Palette.text.secondary,
						TextTransparency: Transparency.textSecondary,
						TextSize: Typography.caption.size,
						Font: Typography.subtitle2.font,
						TextXAlignment: Enum.TextXAlignment.Left,
					})
					: undefined,
				(props.showValue ?? true)
					? New(scope, "TextLabel")({
						BackgroundTransparency: 1,
						Size: new UDim2(0.5, 0, 1, 0),
						Position: new UDim2(0.5, 0, 0, 0),
						Text: Computed(scope, (use) => formatValue(use(props.value), step)),
						TextColor3: Palette.text.primary,
						TextTransparency: Transparency.textPrimary,
						TextSize: Typography.caption.size,
						Font: Typography.subtitle2.font,
						TextXAlignment: Enum.TextXAlignment.Right,
					})
					: undefined,
			],
		})
		: undefined;

	return New(scope, "Frame")({
		Name: "Slider",
		Size: new UDim2(1, 0, 0, BODY_HEIGHT + (showHeader ? HEADER_HEIGHT + 4 : 0)),
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Vertical,
				SortOrder: Enum.SortOrder.LayoutOrder,
				Padding: new UDim(0, 4),
			}),
			headerRow,
			body,
		],
	});
}
