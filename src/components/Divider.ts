import Fusion from "@rbxts/fusion-3.0";
import { Palette, Transparency } from "../ui/theme";

const { New } = Fusion;

export interface DividerProps {
	orientation?: "horizontal" | "vertical";
	layoutOrder?: number;
}

export function Divider(scope: Fusion.Scope<unknown>, props: DividerProps = {}): Frame {
	const horizontal = (props.orientation ?? "horizontal") === "horizontal";
	return New(scope, "Frame")({
		Name: "Divider",
		BackgroundColor3: Palette.common.black,
		BackgroundTransparency: Transparency.divider,
		BorderSizePixel: 0,
		Size: horizontal ? new UDim2(1, 0, 0, 1) : new UDim2(0, 1, 1, 0),
		LayoutOrder: props.layoutOrder ?? 0,
	});
}
