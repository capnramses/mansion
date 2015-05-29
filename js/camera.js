var cam_dirty = true;
var V, P, PV;
var cam_T, cam_R;
var cam_heading_deg = 0.0;
var cam_turn_speed = 150.0;
var cam_pos = [12.0, 1.0, 60.0];
var cam_fwd = [0.0, 0.0, -1.0, 0.0];
var cam_mv_speed = 6.0;
var cam_rad = 0.9;
var no_clip = false;
var cam_bob_dist = 0.075;

function init_cam () {
	cam_dirty = true;
	cam_R = rotate_y_deg (identity_mat4 (), cam_heading_deg);
	cam_T = translate_mat4 (identity_mat4 (), cam_pos);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	var aspect = (canvas.clientWidth - 20.0) / (canvas.clientHeight - 120.0);
	P = perspective (65.0, aspect, 0.1, 30.0);
	PV = mult_mat4_mat4 (P, V);
}

function turn_left (s) {
	cam_dirty = true;
	cam_heading_deg += cam_turn_speed * s;
	cam_R = rotate_y_deg (identity_mat4 (), cam_heading_deg);
	cam_fwd = mult_mat4_vec4 (cam_R, [0.0, 0.0, -1.0, 0.0]);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	PV = mult_mat4_mat4 (P, V);
}

function turn_right (s) {
	cam_dirty = true;
	cam_heading_deg -= cam_turn_speed * s;
	cam_R = rotate_y_deg (identity_mat4 (), cam_heading_deg);
	cam_fwd = mult_mat4_vec4 (cam_R, [0.0, 0.0, -1.0, 0.0]);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	PV = mult_mat4_mat4 (P, V);
}

function validate_move (offs, further_offs) {
	var next_pos = add_vec3_vec3 (cam_pos, offs);
	
	if (!no_clip) {
		var further_pos = add_vec3_vec3 (cam_pos, further_offs);
	
		// validate not hitting wall with a radius
		var map_row = Math.floor ((further_pos[2] + 1.0) / 2.0);
		var map_col = Math.floor ((cam_pos[0] + 1.0) / 2.0);
		if (is_wall (map_col, map_row)) {
			further_pos[2] = next_pos[2] = cam_pos[2];
		}
		var map_row = Math.floor ((cam_pos[2] + 1.0) / 2.0);
		var map_col = Math.floor ((further_pos[0] + 1.0) / 2.0);
		if (is_wall (map_col, map_row)) {
			further_pos[0] = next_pos[0] = cam_pos[0];
		}
		var map_row = Math.floor ((further_pos[2] + 1.0) / 2.0);
		var map_col = Math.floor ((further_pos[0] + 1.0) / 2.0);
		if (is_wall (map_col, map_row)) {
			further_pos = next_pos = cam_pos;
		}
	}
	return next_pos;
}

function move_fwd (s) {
	cam_dirty = true;
	var offs = mult_mat4_vec4 (cam_R, [0.0, 0.0, -1.0 * cam_mv_speed * s, 1.0]);
	var further_offs = mult_mat4_vec4 (cam_R, [0.0, 0.0, -1.0 * cam_mv_speed * s
			- cam_rad, 1.0]);
	cam_pos = validate_move (offs, further_offs);
	cam_pos[1] = cam_bob_dist * Math.sin (cam_pos[0] * 1.75 + cam_pos[2] * 1.76) + 1.0;
	cam_T = translate_mat4 (identity_mat4 (), cam_pos);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	PV = mult_mat4_mat4 (P, V);
}

function move_bk (s) {
	cam_dirty = true;
	var offs = mult_mat4_vec4 (cam_R, [0.0, 0.0, 1.0 * cam_mv_speed * s, 1.0]);
	var further_offs = mult_mat4_vec4 (cam_R, [0.0, 0.0, 1.0 * cam_mv_speed * s
			 + cam_rad, 1.0]);
	cam_pos = validate_move (offs, further_offs);
	cam_pos[1] = cam_bob_dist * Math.sin (cam_pos[0] * 1.75 + cam_pos[2] * 1.76) + 1.0;
	cam_T = translate_mat4 (identity_mat4 (), cam_pos);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	PV = mult_mat4_mat4 (P, V);
}

function move_lft (s) {
	cam_dirty = true;
	var offs = mult_mat4_vec4 (cam_R, [-1.0 * cam_mv_speed * s, 0.0, 0.0, 1.0]);
	var next_pos = add_vec3_vec3 (cam_pos, offs);
	var further_offs = mult_mat4_vec4 (cam_R, [-1.0 * cam_mv_speed * s
			- cam_rad, 0.0, 0.0, 1.0]);
	cam_pos = validate_move (offs, further_offs);
	cam_pos[1] = cam_bob_dist * Math.sin (cam_pos[0] * 1.75 + cam_pos[2] * 1.76) + 1.0;
	cam_T = translate_mat4 (identity_mat4 (), cam_pos);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	PV = mult_mat4_mat4 (P, V);
}

function move_rgt (s) {
	cam_dirty = true;
	var offs = mult_mat4_vec4 (cam_R, [1.0 * cam_mv_speed * s, 0.0, 0.0, 1.0]);
	var next_pos = add_vec3_vec3 (cam_pos, offs);
	var further_offs = mult_mat4_vec4 (cam_R, [1.0 * cam_mv_speed * s
			+ cam_rad, 0.0, 0.0, 1.0]);
	cam_pos = validate_move (offs, further_offs);
	cam_pos[1] = cam_bob_dist * Math.sin (cam_pos[0] * 1.75 + cam_pos[2] * 1.76) + 1.0;
	cam_T = translate_mat4 (identity_mat4 (), cam_pos);
	V = mult_mat4_mat4 (inverse_mat4 (cam_R), inverse_mat4 (cam_T));
	PV = mult_mat4_mat4 (P, V);
}
