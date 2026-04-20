import Fusion from "@rbxts/fusion-3.0";
import { RunService } from "@rbxts/services";
import { paletteFor, type PaletteColor } from "../ui/theme";

const { Children, New } = Fusion;

export interface CircularProgressProps {
	size?: number;
	thickness?: number;
	color?: PaletteColor;
	/** Overrides the palette-derived stroke colour. Useful on top of coloured backgrounds. */
	colorOverride?: Color3;
	layoutOrder?: number;
}

// Rotates a UIGradient on a UIStroke to fake a Material-style spinning arc. No
// sprite assets required; pure UI primitives.
export function CircularProgress(
	scope: Fusion.Scope<unknown>,
	props: CircularProgressProps,
): Frame {
	const size = props.size ?? 40;
	const thickness = props.thickness ?? 4;
	const palette = paletteFor(props.color ?? "primary");
	const strokeColor = props.colorOverride ?? palette.main;

	const container = New(scope, "Frame")({
		Name: "CircularProgress",
		Size: new UDim2(0, size, 0, size),
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
			New(scope, "UIStroke")({
				Color: strokeColor,
				Thickness: thickness,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
				[Children]: New(scope, "UIGradient")({
					Name: "ArcGradient",
					Transparency: new NumberSequence([
						new NumberSequenceKeypoint(0, 1),
						new NumberSequenceKeypoint(0.499, 1),
						new NumberSequenceKeypoint(0.5, 0),
						new NumberSequenceKeypoint(1, 0),
					]),
					Rotation: 0,
				}),
			}),
		],
	});

	const gradient = container.FindFirstChild("UIStroke", true)?.FindFirstChild("ArcGradient") as
		| UIGradient
		| undefined;

	if (gradient !== undefined) {
		const conn = RunService.Heartbeat.Connect((dt) => {
			if (container.Parent === undefined) {
				conn.Disconnect();
				return;
			}
			gradient.Rotation = (gradient.Rotation + dt * 360) % 360;
		});
	}

	return container;
}
