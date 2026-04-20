import Fusion from "@rbxts/fusion-3.0";
import { Palette } from "../ui/theme";

const { Children, New } = Fusion;

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps {
	label: string;
	color?: Color3;
	size?: AvatarSize;
	layoutOrder?: number;
}

const SIZE_TABLE: Record<AvatarSize, { frame: number; text: number }> = {
	small: { frame: 28, text: 12 },
	medium: { frame: 40, text: 16 },
	large: { frame: 56, text: 22 },
};

// Stable palette cycle so the same label always gets the same colour.
const PALETTE_CYCLE: Color3[] = [
	Palette.primary.main,
	Palette.secondary.main,
	Palette.success.main,
	Palette.warning.main,
	Palette.info.main,
	Palette.error.main,
];

function pickColor(label: string): Color3 {
	if (label.size() === 0) return PALETTE_CYCLE[0];
	const [code] = string.byte(label, 1);
	return PALETTE_CYCLE[code % PALETTE_CYCLE.size()];
}

function initialsFor(label: string): string {
	const parts: string[] = [];
	for (const p of label.split(" ")) if (p.size() > 0) parts.push(p);
	if (parts.size() === 0) return "?";
	if (parts.size() >= 2) {
		return string.upper(string.sub(parts[0], 1, 1) + string.sub(parts[1], 1, 1));
	}
	return string.upper(string.sub(parts[0], 1, math.min(2, parts[0].size())));
}

export function Avatar(scope: Fusion.Scope<unknown>, props: AvatarProps): Frame {
	const sizing = SIZE_TABLE[props.size ?? "medium"];
	const bg = props.color ?? pickColor(props.label);

	return New(scope, "Frame")({
		Name: "Avatar",
		Size: new UDim2(0, sizing.frame, 0, sizing.frame),
		BackgroundColor3: bg,
		BorderSizePixel: 0,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
			New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 1, 0),
				BackgroundTransparency: 1,
				Text: initialsFor(props.label),
				Font: Enum.Font.GothamBold,
				TextSize: sizing.text,
				TextColor3: Palette.common.white,
				TextXAlignment: Enum.TextXAlignment.Center,
				TextYAlignment: Enum.TextYAlignment.Center,
			}),
		],
	});
}
