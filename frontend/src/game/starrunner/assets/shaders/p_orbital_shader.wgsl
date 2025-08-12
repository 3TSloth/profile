#import bevy_sprite::{
    mesh2d_functions as mesh_functions,
}


struct Vertex {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(instance_index) instance_index: u32
}

struct VertexOutput {
    // this is `clip position` when the struct is used as a vertex stage output 
    // and `frag coord` when used as a fragment stage input
    @builtin(position) position: vec4<f32>,
    @location(0) world_position: vec4<f32>,
    @location(1) world_normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(4) color: vec4<f32>,
}



@group(2) @binding(0) var<uniform> color: vec4<f32>;
@group(2) @binding(1) var<uniform> time : vec4<f32>;


// --- JIGGLE EFFECT ---
// Feel free to change these values to get the effect you want!
const JIGGLE_AMPLITUDE: f32 = 10.0; // How much it jiggles
const JIGGLE_SPEED: f32 = 3.0;     // How fast it jiggles
// ---



@vertex
fn vertex(vertex: Vertex) -> VertexOutput {
    var output: VertexOutput;


    let jiggle_offset = sin(time[0] * JIGGLE_SPEED + vertex.position.y * 2.0);
    let jiggle_displacement = vertex.normal * jiggle_offset * JIGGLE_AMPLITUDE;


    var world_from_local = mesh_functions::get_world_from_local(vertex.instance_index);
    let vertex_world_position = mesh_functions::mesh2d_position_local_to_world(
        world_from_local,
        vec4<f32>(vertex.position, 1.0)
    );

    let final_position = vertex.position + jiggle_displacement;

    // Recalculate world position with the new final_position
    output.world_position = mesh_functions::mesh2d_position_local_to_world(
        world_from_local,
        vec4<f32>(final_position, 1.0)
    );


    output.position = mesh_functions::mesh2d_position_world_to_clip(output.world_position);
    output.world_normal = mesh_functions::mesh2d_normal_local_to_world(vertex.normal, vertex.instance_index);
    output.uv = vertex.uv;
    output.color = color;


    return output;
}


@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4<f32> {


    return color + (vec4(sin(time[0]) + 0.5, sin(time[0]) + 0.5, sin(time[0]) + 0.5, 0.0));
}