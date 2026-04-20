/**
 * Icon sprite sheet mapping (Kenney Game Icons style, white-on-black).
 *
 * Grid: 6 columns × 20 rows. Column 5 (the far right) is sparse and only
 * holds the controller shoulder-button / meta-button labels (R1, R, L2, L1,
 * START, SELECT, R2) plus a single right-arrow glyph.
 *
 * Set ICON_SIZE to whatever your uploaded sheet actually uses per cell
 * (Kenney ships a few versions — commonly 100 px or 256 px per icon). If
 * your sheet has gutters between cells, bump ICON_PADDING to match.
 *
 * Roblox usage:
 *   const icon = Icons.home;
 *   imageLabel.Image          = ICON_SHEET_ASSET_ID;
 *   imageLabel.ImageRectOffset = icon.offset;
 *   imageLabel.ImageRectSize   = icon.size;
 *
 * Or via the helper:
 *   applyIcon(imageLabel, "home");
 */

export interface IconRect {
	readonly offset: Vector2;
	readonly size: Vector2;
}

// ── Sheet constants ─────────────────────────────────────────────────────────
// Adjust these two to match the sheet you uploaded. Everything else
// recomputes automatically.
const ICON_SIZE = 50;
const ICON_PADDING = 0;

const COLS = 6;
const ROWS = 20;

/** Build a rect for the icon at (col, row) on the sheet. */
const at = (col: number, row: number): IconRect => ({
	offset: new Vector2(
		col * (ICON_SIZE + ICON_PADDING),
		row * (ICON_SIZE + ICON_PADDING),
	),
	size: new Vector2(ICON_SIZE, ICON_SIZE),
});

/**
 * Full named dictionary. Keys are camelCase; where two icons share a base
 * concept I've suffixed them (e.g. `lockOpen` vs `lock`, `zoomIn`, `zoomOut`,
 * `zoomReset`, `zoom`).
 */
export const Icons = {
	// ── Row 0 ───────────────────────────────────────────────────────────────
	buttonB:          at(0, 0),  // B in circle
	arrowUpRight:     at(1, 0),  // diagonal ↗
	resizeVertical:   at(2, 0),  // up/down arrows with divider
	listOrdered:      at(3, 0),  // numbered list
	gamepadP2:        at(4, 0),  // gamepad labelled 2
	buttonR1:         at(5, 0),

	// ── Row 1 ───────────────────────────────────────────────────────────────
	buttonA:          at(0, 1),  // A in circle
	arrowUpLeft:      at(1, 1),  // diagonal ↖
	resizeHorizontal: at(2, 1),  // left/right arrows with divider
	gridDots:         at(3, 1),  // 3×3 dots
	gamepadP1:        at(4, 1),  // gamepad labelled 1
	buttonR:          at(5, 1),

	// ── Row 2 ───────────────────────────────────────────────────────────────
	button3:          at(0, 2),  // 3 in circle
	eject:            at(1, 2),  // upward triangle
	save:             at(2, 2),  // floppy disk
	ribbonLarge:      at(3, 2),  // award ribbon
	gamepad:          at(4, 2),  // generic gamepad
	buttonL2:         at(5, 2),

	// ── Row 3 ───────────────────────────────────────────────────────────────
	button2:          at(0, 3),  // 2 in circle
	lockOpen:         at(1, 3),  // unlocked padlock
	play:             at(2, 3),  // ▶
	ribbon:           at(3, 3),  // award medal
	fastForward:      at(4, 3),  // ⏩
	buttonL1:         at(5, 3),

	// ── Row 4 ───────────────────────────────────────────────────────────────
	button1:          at(0, 4),  // 1 in circle
	trophy:           at(1, 4),
	rewind:           at(2, 4),  // ⏪
	users:            at(3, 4),  // group of people
	upload:           at(4, 4),  // arrow up to line
	arrowRightBold:   at(5, 4),  // bold →

	// ── Row 5 ───────────────────────────────────────────────────────────────
	pauseThick:       at(0, 5),  // three vertical bars
	trashOpen:        at(1, 5),  // trash can, lid removed
	undo:             at(2, 5),  // curved back arrow
	lock:             at(3, 5),  // closed padlock
	signOut:          at(4, 5),  // arrow out of box →

	// ── Row 6 ───────────────────────────────────────────────────────────────
	menu:             at(0, 6),  // ☰ three horizontal lines
	trash:            at(1, 6),  // trash can
	help:             at(2, 6),  // ?
	triangleLeft:     at(3, 6),  // ◀
	signIn:           at(4, 6),  // arrow into box ←

	// ── Row 7 ───────────────────────────────────────────────────────────────
	volume:           at(0, 7),  // speaker with waves
	record:           at(1, 7),  // ⦿ recording dot
	skipPrevious:     at(2, 7),  // ⏮
	puzzlePiece:      at(3, 7),  // tetris-ish piece
	door:             at(4, 7),

	// ── Row 8 ───────────────────────────────────────────────────────────────
	triangleLeftBold: at(0, 8),  // big solid ◀
	mobilePhone:      at(1, 8),
	power:            at(2, 8),  // ⏻ power symbol
	listNumbered:     at(3, 8),  // 1-2-3 vertical
	exclamation:      at(4, 8),  // !

	// ── Row 9 ───────────────────────────────────────────────────────────────
	arrowUp:          at(0, 9),
	stop:             at(1, 9),  // ■
	plus:             at(2, 9),
	expand:           at(3, 9),  // ↔ four arrows outward
	arrowDownRight:   at(4, 9),  // diagonal ↘

	// ── Row 10 ──────────────────────────────────────────────────────────────
	arrowRight:       at(0, 10),
	star:             at(1, 10),
	phoneOutline:     at(2, 10), // portrait device outline
	joystickUp:       at(3, 10), // joystick pushed up
	arrowDownLeft:    at(4, 10), // diagonal ↙

	// ── Row 11 ──────────────────────────────────────────────────────────────
	arrowLeft:        at(0, 11),
	collapse:         at(1, 11), // four arrows inward
	pause:            at(2, 11), // ‖ two bars
	joystickTilt:     at(3, 11), // joystick tilted
	triangleDown:     at(4, 11), // ▼

	// ── Row 12 ──────────────────────────────────────────────────────────────
	arrowDown:        at(0, 12),
	user:             at(1, 12), // single person silhouette
	keyL:             at(2, 12), // "L" shape (analog stick label?)
	joystick:         at(3, 12), // neutral joystick
	close:            at(4, 12), // ✕

	// ── Row 13 ──────────────────────────────────────────────────────────────
	zoomOut:          at(0, 13), // magnifier with −
	volumeHigh:       at(1, 13), // tall bars
	skipNext:         at(2, 13), // ⏭
	joystickTilt2:    at(3, 13), // joystick tilted other direction
	contrast:         at(4, 13), // half-filled circle ◐

	// ── Row 14 ──────────────────────────────────────────────────────────────
	zoomIn:           at(0, 14), // magnifier with +
	volumeMedium:     at(1, 14), // medium bars
	music:            at(2, 14), // ♪
	info:             at(3, 14), // i
	check:            at(4, 14), // ✓

	// ── Row 15 ──────────────────────────────────────────────────────────────
	zoomReset:        at(0, 15), // magnifier with =
	volumeLow:        at(1, 15), // single bar
	musicOff:         at(2, 15), // ♪ with slash
	download:         at(3, 15), // arrow down into tray
	buttonY:          at(4, 15),

	// ── Row 16 ──────────────────────────────────────────────────────────────
	zoom:             at(0, 16), // plain magnifier
	cart:             at(1, 16), // shopping cart
	userPair:         at(2, 16), // two people (smaller than `users`)
	home:             at(3, 16),
	buttonX:          at(4, 16),

	// ── Row 17 ──────────────────────────────────────────────────────────────
	wrench:           at(0, 17),
	basket:           at(1, 17), // shopping basket
	film:             at(2, 17), // film strip
	settings:         at(3, 17), // gear
	buttonStart:      at(4, 17),

	// ── Row 18 ──────────────────────────────────────────────────────────────
	warning:          at(0, 18), // ⚠ triangle with !
	share:            at(1, 18), // connected nodes
	bookmarkU:        at(2, 18), // bookmark / U-shape
	gamepadP4:        at(3, 18), // gamepad labelled 4
	buttonSelect:     at(4, 18),

	// ── Row 19 ──────────────────────────────────────────────────────────────
	wallet:           at(0, 19),
	shareExternal:    at(1, 19), // outbound arrow from box
	minus:            at(2, 19), // − / dash
	gamepadP3:        at(3, 19), // gamepad labelled 3
	buttonR2:         at(4, 19),
} as const;

export type IconName = keyof typeof Icons;

/**
 * Apply an icon from the sheet to an ImageLabel or ImageButton.
 * Sets ImageRectOffset / ImageRectSize; the caller should have already set
 * the Image property to ICON_SHEET_ASSET_ID.
 */
export function applyIcon(
	target: ImageLabel | ImageButton,
	name: IconName,
): void {
	const rect = Icons[name];
	target.ImageRectOffset = rect.offset;
	target.ImageRectSize = rect.size;
}

/** Sheet metadata, in case consumers need it at runtime. */
export const ICON_SHEET = {
	iconSize: ICON_SIZE,
	padding: ICON_PADDING,
	cols: COLS,
	rows: ROWS,
	width: COLS * (ICON_SIZE + ICON_PADDING) - ICON_PADDING,
	height: ROWS * (ICON_SIZE + ICON_PADDING) - ICON_PADDING,
} as const;

// ── Runtime config ──────────────────────────────────────────────────────────
// The sheet asset ID is provided by the consumer at startup (they upload the
// image from `assets/` to Roblox and pass the resulting rbxassetid). Until
// `configureIcons` is called, icons render as empty ImageLabels.

let sheetAssetId = "rbxassetid://0";

export interface IconConfig {
	sheetAssetId: string;
}

/**
 * Register the asset id of the uploaded icon sprite sheet. Call once at
 * startup, before any Icon / IconButton / Button with icons is mounted.
 *
 * @example
 * configureIcons({ sheetAssetId: "rbxassetid://123456789" });
 */
export function configureIcons(config: IconConfig): void {
	sheetAssetId = config.sheetAssetId;
}

/** Returns the currently registered sheet asset id (or the placeholder). */
export function getIconSheetAssetId(): string {
	return sheetAssetId;
}