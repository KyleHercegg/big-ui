import Fusion from "@rbxts/fusion-3.0";
import { RunService } from "@rbxts/services";
import { Palette, Shape, Transparency, Typography, paletteFor } from "../ui/theme";

const { Children, Computed, New, OnEvent, Value, peek } = Fusion;

export interface ViewportButtonProps {
	/** Model template. Cloned into the ViewportFrame; caller keeps ownership of the original. */
	modelTemplate: Model;
	size?: UDim2;
	label?: string;
	onActivate?: () => void;
	disabled?: boolean;
	selected?: boolean;
	layoutOrder?: number;
	/** Camera yaw around the model in degrees. 0° looks down +Z at the model. Default: 30°. */
	azimuth?: number;
	/** Camera pitch above the horizon in degrees. Default: 15°. */
	elevation?: number;
	/** Multiplier applied to the computed framing distance. >1 zooms out. Default: 1.4. */
	padding?: number;
	/** Degrees per second of yaw when hovered. Set to 0 to disable. Default: 50. */
	rotateOnHoverDegPerSec?: number;
	background?: Color3;
	fieldOfView?: number;
}

// Computes a camera CFrame that frames the model in the viewport, using a
// standard perspective-fit: the half-height the camera needs to cover is the
// model's half-max-dimension, and distance = half-height / tan(fov/2).
function fitCameraToModel(
	model: Model,
	camera: Camera,
	azimuthDeg: number,
	elevationDeg: number,
	padding: number,
): void {
	const [bbCFrame, bbSize] = model.GetBoundingBox();
	const center = bbCFrame.Position;
	const maxDim = math.max(bbSize.X, bbSize.Y, bbSize.Z);
	const fovRad = math.rad(camera.FieldOfView);
	const distance = (maxDim / 2 / math.tan(fovRad / 2)) * padding;

	const azimuth = math.rad(azimuthDeg);
	const elevation = math.rad(elevationDeg);
	const offset = new Vector3(
		math.sin(azimuth) * math.cos(elevation) * distance,
		math.sin(elevation) * distance,
		math.cos(azimuth) * math.cos(elevation) * distance,
	);
	camera.CFrame = CFrame.lookAt(center.add(offset), center);
}

export function ViewportButton(
	scope: Fusion.Scope<unknown>,
	props: ViewportButtonProps,
): TextButton {
	const size = props.size ?? UDim2.fromOffset(120, 120);
	const disabled = props.disabled ?? false;
	const selected = props.selected ?? false;
	const azimuth = props.azimuth ?? 30;
	const elevation = props.elevation ?? 15;
	const padding = props.padding ?? 1.4;
	const rotateDegPerSec = props.rotateOnHoverDegPerSec ?? 50;
	const fov = props.fieldOfView ?? 70;

	const hovered = Value(scope, false);

	// Clone the user's model into the viewport. The viewport takes ownership of
	// the clone; the original is untouched.
	const model = props.modelTemplate.Clone();
	const worldCenter = model.GetPivot().Position;

	const camera = new Instance("Camera");
	camera.FieldOfView = fov;

	const viewport = New(scope, "ViewportFrame")({
		Name: "Viewport",
		Size: new UDim2(1, 0, 1, 0),
		BackgroundTransparency: 1,
		LightDirection: new Vector3(-0.4, -1, -0.3),
		Ambient: Color3.fromRGB(140, 140, 140),
		LightColor: Color3.fromRGB(255, 255, 255),
		CurrentCamera: camera,
	});

	model.Parent = viewport;
	camera.Parent = viewport;
	fitCameraToModel(model, camera, azimuth, elevation, padding);

	let yaw = 0;
	if (rotateDegPerSec > 0) {
		const conn = RunService.Heartbeat.Connect((dt) => {
			if (viewport.Parent === undefined) {
				conn.Disconnect();
				return;
			}
			if (!peek(hovered)) return;
			yaw = (yaw + dt * rotateDegPerSec) % 360;
			const yawRad = math.rad(yaw);
			// Rotate the model around its world-centre pivot.
			const pivot = new CFrame(worldCenter).mul(CFrame.Angles(0, yawRad, 0));
			model.PivotTo(pivot);
		});
	}

	const palette = paletteFor("primary");
	const strokeColor = Computed(scope, (use) => {
		if (selected) return palette.main;
		if (use(hovered)) return palette.main;
		return Palette.common.black;
	});
	const strokeTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.divider;
		if (selected) return 0;
		return use(hovered) ? 0 : Transparency.divider;
	});
	const strokeThickness = Computed(scope, (use) => (selected || use(hovered) ? 2 : 1));

	const children: Instance[] = [
		New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radiusLarge) }),
		New(scope, "UIStroke")({
			Color: strokeColor,
			Transparency: strokeTransparency,
			Thickness: strokeThickness,
			ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
		}),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, 8),
			PaddingBottom: new UDim(0, 8),
			PaddingLeft: new UDim(0, 8),
			PaddingRight: new UDim(0, 8),
		}),
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, 4),
			HorizontalAlignment: Enum.HorizontalAlignment.Center,
		}),
		New(scope, "Frame")({
			Name: "ViewportWrapper",
			Size: new UDim2(1, 0, 1, props.label !== undefined ? -22 : 0),
			BackgroundTransparency: 1,
			LayoutOrder: 1,
			[Children]: viewport,
		}),
	];

	if (props.label !== undefined) {
		children.push(
			New(scope, "TextLabel")({
				Name: "Label",
				Size: new UDim2(1, 0, 0, 18),
				BackgroundTransparency: 1,
				Text: props.label,
				TextColor3: Palette.common.black,
				TextTransparency: disabled ? Transparency.textDisabled : Transparency.textSecondary,
				TextSize: Typography.caption.size,
				Font: Typography.subtitle2.font,
				TextXAlignment: Enum.TextXAlignment.Center,
				TextYAlignment: Enum.TextYAlignment.Center,
				LayoutOrder: 2,
			}),
		);
	}

	return New(scope, "TextButton")({
		Name: "ViewportButton",
		Size: size,
		BackgroundColor3: props.background ?? Palette.background.paper,
		BackgroundTransparency: disabled ? 0.4 : 0,
		BorderSizePixel: 0,
		Text: "",
		AutoButtonColor: false,
		Active: !disabled,
		LayoutOrder: props.layoutOrder ?? 0,
		[OnEvent("MouseEnter")]: () => hovered.set(true),
		[OnEvent("MouseLeave")]: () => hovered.set(false),
		[OnEvent("Activated")]: () => {
			if (!disabled && props.onActivate !== undefined) props.onActivate();
		},
		[Children]: children,
	});
}
