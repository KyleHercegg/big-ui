import Fusion from "@rbxts/fusion-3.0";
import { Palette, Shape, Spacing, Transparency } from "../ui/theme";

const { Children, New } = Fusion;

export interface CardProps {
	children: Array<Instance | undefined>;
	size?: UDim2;
	padding?: number;
	elevation?: 0 | 1 | 2 | 3;
	background?: Color3;
	layoutOrder?: number;
	childGap?: number;
}

export function Card(scope: Fusion.Scope<unknown>, props: CardProps): Frame {
	const padding = props.padding ?? Spacing(2);
	const childGap = props.childGap ?? Spacing(1);
	const elevation = props.elevation ?? 1;

	const children: Instance[] = [
		New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radiusLarge) }),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, padding),
			PaddingBottom: new UDim(0, padding),
			PaddingLeft: new UDim(0, padding),
			PaddingRight: new UDim(0, padding),
		}),
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, childGap),
		}),
	];
	if (elevation > 0) {
		children.push(
			New(scope, "UIStroke")({
				Color: Palette.common.black,
				Transparency: Transparency.divider,
				Thickness: elevation,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
		);
	}
	for (const child of props.children) {
		if (child !== undefined) children.push(child);
	}

	return New(scope, "Frame")({
		Name: "Card",
		Size: props.size ?? new UDim2(1, 0, 0, 0),
		AutomaticSize: props.size === undefined ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None,
		BackgroundColor3: props.background ?? Palette.background.paper,
		BorderSizePixel: 0,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: children,
	});
}
