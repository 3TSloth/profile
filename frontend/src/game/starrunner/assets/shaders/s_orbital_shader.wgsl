#import bevy_sprite::{
    mesh2d_functions as mesh_functions,
}


struct Vertex {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,

    @builtin(instance_index) instance_index: u32

};

struct VertexOutput {
    // this is `clip position` when the struct is used as a vertex stage output 
    // and `frag coord` when used as a fragment stage input
    @builtin(position) position: vec4<f32>,
    @location(0) world_position: vec4<f32>,
    @location(1) world_normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(4) color: vec4<f32>,

}



@group(2) @binding(0)
var<uniform> color : vec4<f32>;

@group(2) @binding(1)
var<uniform> time : vec4<f32>;


@vertex
fn vertex(vertex : Vertex) -> VertexOutput {

    var vertexOutput : VertexOutput;
    
    let normalized_sin = (sin(time[0]) + 1.0) / 2.0;
    
    let min_scale = 5.0;
    let max_scale = 10.0;

    // 3. Linearly interpolate (mix) between the min and max scale.
    // When normalized_sin is 0, scale will be 5.0.
    // When normalized_sin is 1, scale will be 10.0.
    let scale = mix(min_scale, max_scale, normalized_sin);

    // 4. Apply the final, safe scale.
    let final_position = vertex.position * scale;

    let world_transformation_matrix = mesh_functions::get_world_from_local(vertex.instance_index);
    let updated_world_position = mesh_functions::mesh2d_position_local_to_world(world_transformation_matrix, vec4<f32>(final_position, 1.0),);

    vertexOutput.position = mesh_functions::mesh2d_position_world_to_clip(updated_world_position);
    vertexOutput.world_normal = mesh_functions::mesh2d_normal_local_to_world(vertex.normal, vertex.instance_index);
    vertexOutput.world_position = updated_world_position;
    vertexOutput.uv = vertex.uv;
    vertexOutput.color = color;


    return vertexOutput;

}

@fragment
fn fragment(vertexOutput: VertexOutput) -> @location(0) vec4<f32> {

    let pulse = (sin(time[0]) + 1.0) / 2.0; 
    return vertexOutput.color + vec4<f32>(pulse * 0.5, pulse*0.5, pulse*0.5, 1.0);

}