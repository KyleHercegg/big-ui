import Fusion from "@rbxts/fusion-3.0";
import { RunService } from "@rbxts/services";
import { paletteFor, type PaletteColor } from "../ui/theme";

const { Children, Computed, New, Tween, Value, peek } = Fusion;

export interface LinearProgressProps {
	/** Required for "determinate"; ignored for "indeterminate". Normalised 0–1. */
	value?: Fusion.UsedAs<number>;
	variant?: "determinate" | "indeterminate";
	color?: PaletteColor;
	height?: number;
	layoutOrder?: number;
}

const INDETERMINATE_CYCLE_SECONDS = 1.4;
const INDETERMINATE_BAR_WIDTH = 0.35;

export function LinearProgress(
	scope: Fusion.Scope<unknown>,
	props: LinearProgressProps,
): Frame {
	const variant = props.variant ?? "determinate";
	const palette = paletteFor(props.color ?? "primary");
	const height = props.height ?? 4;

	const track = New(scope, "Frame")({
		Name: "LinearProgress",
		Size: new UDim2(1, 0, 0, height),
		BackgroundColor3: palette.light,
		BackgroundTransparency: 0.55,
		BorderSizePixel: 0,
		ClipsDescendants: true,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
	});

	if (variant === "determinate") {
		const valueState = props.value ?? Value(scope, 0);
		const fillSize = Tween(
			scope,
			Computed(scope, (use) => {
				const v = math.clamp(use(valueState), 0, 1);
				return new UDim2(v, 0, 1, 0);
			}),
			new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		);
		New(scope, "Frame")({
			Name: "Fill",
			Size: fillSize,
			BackgroundColor3: palette.main,
			BorderSizePixel: 0,
			Parent: track,
			[Children]: New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
		});
	} else {
		const phase = Value(scope, 0);
		New(scope, "Frame")({
			Name: "Bar",
			Size: new UDim2(INDETERMINATE_BAR_WIDTH, 0, 1, 0),
			Position: Computed(scope, (use) => {
				const p = use(phase);
				const x = -INDETERMINATE_BAR_WIDTH + p * (1 + INDETERMINATE_BAR_WIDTH);
				return new UDim2(x, 0, 0, 0);
			}),
			BackgroundColor3: palette.main,
			BorderSizePixel: 0,
			Parent: track,
			[Children]: New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
		});

		const conn = RunService.Heartbeat.Connect((dt) => {
			if (track.Parent === undefined) {
				conn.Disconnect();
				return;
			}
			phase.set((peek(phase) + dt / INDETERMINATE_CYCLE_SECONDS) % 1);
		});
	}

	return track;
}
