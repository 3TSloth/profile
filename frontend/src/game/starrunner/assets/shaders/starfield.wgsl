// assets/shaders/starfield.wgsl
// Viewport-sized, camera-parented starfield with hex distribution, anti-tiling,
// per-layer density, per-star color & size variation, and viewport-based sampling.

struct StarParams {
    color: vec4<f32>,
    // linear RGBA tint
    params: vec4<f32>,
    // (radius, soft_edge_fraction, twinkle_amplitude, base_density)
    time: vec4<f32>,
    // (time_seconds, twinkle_speed, seed_x, seed_y)
    camera: vec4<f32>,
    // (cam_x, cam_y, _, _)
    layer_density: vec4<f32>,
    // (layer0, layer1, layer2, _)
    viewport: vec4<f32>,
    // (viewport_world_width, viewport_world_height, _, _)
}

;

@group(2) @binding(0)
var<uniform> star_params: StarParams;

// -------------------- Utilities --------------------

fn hash_2d_to_1d(position: vec2<f32>) -> f32 {
    let h = dot(position, vec2<f32>(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

fn hash_2d_to_2d(position: vec2<f32>) -> vec2<f32> {
    let h = vec2<f32>(dot(position, vec2<f32>(127.1, 311.7)), dot(position, vec2<f32>(269.5, 183.3)));
    return fract(sin(h) * 43758.5453123);
}

fn rotate_2d(v: vec2<f32>, a: f32) -> vec2<f32> {
    let c = cos(a);
    let s = sin(a);
    return vec2<f32>(c * v.x - s * v.y, s * v.x + c * v.y);
}

// No-mix lerps (toolchain-safe)
fn lerp1(a: f32, b: f32, t: f32) -> f32 {
    return a + (b - a) * t;
}

fn lerp3(a: vec3<f32>, b: vec3<f32>, t: f32) -> vec3<f32> {
    return a + (b - a) * t;
}

fn luma(rgb: vec3<f32>) -> f32 {
    return dot(rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
}

// Soft-edged radial falloff (soft_edge_fraction is relative to radius)
fn star_radial_falloff(distance_to_center: f32, radius: f32, soft_edge_fraction: f32) -> f32 {
    let soft = clamp(soft_edge_fraction, 0.0, 0.9) * radius;
    return 1.0 - smoothstep(radius - soft, radius, distance_to_center);
}

// Saturation boost: amount = 1 keeps same; >1 increases saturation
fn saturate_rgb(rgb: vec3<f32>, amount: f32) -> vec3<f32> {
    let y = luma(rgb);
    return vec3<f32>(y, y, y) + (rgb - vec3<f32>(y, y, y)) * amount;
}

// Warm → neutral → cool palette; input in [0,1]
fn star_palette(temperature_u: f32) -> vec3<f32> {
    let warm = vec3<f32>(1.00, 0.70, 0.35);
    // richer orange
    let neutral = vec3<f32>(1.00, 0.98, 0.95);
    let cool = vec3<f32>(0.55, 0.75, 1.15);
    // mild HDR blue

    let t = clamp(temperature_u, 0.0, 1.0);
    let mid = smoothstep(0.25, 0.75, t);
    let a = lerp3(warm, neutral, mid);
    let b = lerp3(neutral, cool, mid);
    return lerp3(a, b, t);
}

fn star_temperature_from_cell(cell_id: vec2<f32>, seed_xy: vec2<f32>) -> f32 {
    let raw = hash_2d_to_1d(cell_id + seed_xy * 4.11);
    return pow(raw, 0.9);
    // slight bias toward cooler temps
}

fn star_color_from_temperature(temperature_u: f32, cell_id: vec2<f32>, seed_xy: vec2<f32>) -> vec3<f32> {
    var rgb = star_palette(temperature_u);

    // 10% chance of saturated accent
    let accent_u = hash_2d_to_1d(cell_id + seed_xy * 6.77);
    if (accent_u < 0.10) {
        let pick = hash_2d_to_1d(cell_id + seed_xy * 8.23);
        if (pick < 0.25) {
            rgb = vec3<f32>(1.00, 0.35, 0.35);
        }
        else if (pick < 0.50) {
            rgb = vec3<f32>(0.45, 0.85, 1.00);
        }
        else if (pick < 0.75) {
            rgb = vec3<f32>(1.00, 0.90, 0.45);
        }
        else {
            rgb = vec3<f32>(0.70, 0.70, 1.00);
        }
    }

    // tiny desaturation for realism
    let neutral_mix = 0.05;
    let y = luma(rgb);
    return lerp3(vec3<f32>(y, y, y), rgb, 1.0 - neutral_mix);
}

fn star_radius_scale_from_cell(temperature_u: f32, cell_id: vec2<f32>, seed_xy: vec2<f32>) -> f32 {
    let correlated = lerp1(1.6, 0.7, temperature_u);
    // warm → bigger, cool → smaller
    let jitter_u = hash_2d_to_1d(cell_id + seed_xy * 9.37);
    let jitter = lerp1(0.85, 1.15, jitter_u);
    return clamp(correlated * jitter, 0.5, 2.5);
}

// -------------------- Hex math (pointy-topped, size = 1) --------------------

fn pixel_to_axial(point: vec2<f32>) -> vec2<f32> {
    let s3 = sqrt(3.0);
    return vec2<f32>(s3 * point.x / 3.0 - point.y / 3.0, 2.0 * point.y / 3.0);
}

fn axial_to_pixel(axial: vec2<f32>) -> vec2<f32> {
    let s3 = sqrt(3.0);
    return vec2<f32>(s3 * axial.x + (s3 * 0.5) * axial.y, 1.5 * axial.y);
}

fn axial_to_cube(axial: vec2<f32>) -> vec3<f32> {
    let x = axial.x;
    let z = axial.y;
    let y = - x - z;
    return vec3<f32>(x, y, z);
}

fn cube_to_axial(cube: vec3<f32>) -> vec2<f32> {
    return vec2<f32>(cube.x, cube.z);
}

fn axial_round_to_cell(axial: vec2<f32>) -> vec2<f32> {
    let cube = axial_to_cube(axial);
    var rx = round(cube.x);
    var ry = round(cube.y);
    var rz = round(cube.z);
    let dx = abs(rx - cube.x);
    let dy = abs(ry - cube.y);
    let dz = abs(rz - cube.z);
    if (dx > dy && dx > dz) {
        rx = - ry - rz;
    }
    else if (dy > dz) {
        ry = - rx - rz;
    }
    else {
        rz = - rx - ry;
    }
    return cube_to_axial(vec3<f32>(rx, ry, rz));
}

// -------------------- Varyings (from Bevy Mesh2D) --------------------

struct Varyings {
    @location(0) world_position: vec4<f32>,
    @location(1) world_normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

;

// -------------------- Fragment --------------------

@fragment
fn fragment(inputs: Varyings) -> @location(0) vec4<f32> {
    // Uniforms
    let tint_color = star_params.color;

    let base_star_radius = max(star_params.params.x, 1e-5);
    let soft_edge_fraction = star_params.params.y;
    let twinkle_amplitude = star_params.params.z;
    let base_density = clamp(star_params.params.w, 0.0, 1.0);

    let time_seconds = star_params.time.x;
    let twinkle_speed = star_params.time.y;
    let random_seed_xy = star_params.time.zw;

    // Layer configuration
    const LAYER_COUNT: u32 = 3u;
    let layer_frequencies = array<f32, 3>(0.30, 0.55, 1.00);
    // hex cells per world unit
    let layer_weights = array<f32, 3>(0.80, 0.55, 0.35);
    // brightness
    let layer_warp_amounts = array<f32, 3>(0.06, 0.05, 0.04);
    // domain warp (cell units)
    let layer_halo_strengths = array<f32, 3>(0.10, 0.09, 0.08);
    let layer_rotations_rad = array<f32, 3>(0.19, - 0.47, 0.82);
    let parallax_scales = array<f32, 3>(0.30, 0.60, 1.00);
    // far → near scroll amount

    // -------- Viewport-based sampling (key fix) --------
    // Build world sample position from camera.xy + screen-local offset in *world units*.
    // This keeps stars scrolling even when the quad is parented to the camera.
    let view_local_xy = (inputs.uv - vec2<f32>(0.5, 0.5)) * star_params.viewport.xy;
    let world_xy = - star_params.camera.xy + view_local_xy;

    var accumulated_rgb = vec3<f32>(0.0, 0.0, 0.0);

    for (var layer_index: u32 = 0u; layer_index < LAYER_COUNT; layer_index = layer_index + 1u) {
        let frequency = layer_frequencies[layer_index];
        let layer_weight = layer_weights[layer_index];
        let warp_amount = layer_warp_amounts[layer_index];
        let halo_strength = layer_halo_strengths[layer_index];
        let rotation_radians = layer_rotations_rad[layer_index];

        // Per-layer density scale from uniform
        var density_scale: f32 = 1.0;
        if (layer_index == 0u) {
            density_scale = star_params.layer_density.x;
        }
        else if (layer_index == 1u) {
            density_scale = star_params.layer_density.y;
        }
        else {
            density_scale = star_params.layer_density.z;
        }
        let per_layer_density = clamp(base_density * density_scale, 0.0, 1.0);

        // Parallax per layer
        var hex_pixel_space = world_xy * frequency * parallax_scales[layer_index];

        // Anti-tiling: coarse domain warp
        let coarse_space = hex_pixel_space * 0.6;
        let coarse_cell = floor(coarse_space);
        let coarse_jitter = (hash_2d_to_2d(coarse_cell + random_seed_xy) - vec2<f32>(0.5, 0.5)) * warp_amount;
        hex_pixel_space = hex_pixel_space + coarse_jitter;

        // Optional rotation per layer
        hex_pixel_space = rotate_2d(hex_pixel_space, rotation_radians);

        // Hex coords
        let axial_coords = pixel_to_axial(hex_pixel_space);
        let cell_axial_rounded = axial_round_to_cell(axial_coords);
        let cell_center_pixel = axial_to_pixel(cell_axial_rounded);
        let local_position_cell = hex_pixel_space - cell_center_pixel;

        // Spawn decision
        let spawn_random = hash_2d_to_1d(cell_axial_rounded + random_seed_xy);
        if (spawn_random < per_layer_density) {
            // Random star center within inscribed circle
            let inradius = sqrt(3.0) * 0.5;
            let max_offset_radius = inradius * 0.85;
            let random_pair = hash_2d_to_2d(cell_axial_rounded + random_seed_xy * 2.37);
            let random_angle = random_pair.x * 6.2831853;
            let random_radius = sqrt(random_pair.y) * max_offset_radius;
            let star_offset = vec2<f32>(cos(random_angle), sin(random_angle)) * random_radius;

            let vector_from_star = local_position_cell - star_offset;
            let distance_to_center = length(vector_from_star);

            // Per-star color & size
            let temperature_u = star_temperature_from_cell(cell_axial_rounded, random_seed_xy);
            var star_rgb = star_color_from_temperature(temperature_u, cell_axial_rounded, random_seed_xy);
            star_rgb = saturate_rgb(star_rgb, 1.35);
            let radius_scale = star_radius_scale_from_cell(temperature_u, cell_axial_rounded, random_seed_xy);
            let star_radius = base_star_radius * radius_scale;

            // Per-star twinkle
            let twinkle_phase = hash_2d_to_1d(cell_axial_rounded + random_seed_xy * 3.11);
            let twinkle_value = 1.0 + twinkle_amplitude * sin(6.2831853 * (time_seconds * twinkle_speed + twinkle_phase));

            // Core + halo
            let core_intensity = star_radial_falloff(distance_to_center, star_radius, soft_edge_fraction);
            let halo_intensity = halo_strength / (1.0 + 60.0 * distance_to_center);

            // Tone intensity to avoid clipping
            let star_intensity = (core_intensity + halo_intensity) * twinkle_value * 0.65;

            accumulated_rgb = accumulated_rgb + star_rgb * star_intensity * layer_weight;
        }
    }

    let clamped_rgb = clamp(accumulated_rgb, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));
    let final_rgb = tint_color.rgb * clamped_rgb;
    let final_alpha = clamp(luma(accumulated_rgb), 0.0, 1.0) * tint_color.a;
    return vec4<f32>(final_rgb, final_alpha);
}
