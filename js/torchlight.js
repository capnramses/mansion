var torchlight = new Object ();
torchlight.max_draw_dist2 = 30.0 * 30.0;
torchlight.max_draw_dp = 0.42; // 65 degrees

function create_torchlight () {
	var vp = [
		-1.0, -1.0, 0.0,
		-1.0, 1.0, 0.0, 
		1.0, -1.0, 0.0,
		1.0, 1.0, 0.0
	];
	var vt = [
		0.0, 0.0,
		0.0, 1.0,
		1.0, 0.0,
		1.0, 1.0
	];
	// needed if used in heckler.vert
	var vn = [
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0, 
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0
	];
	torchlight.vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (torchlight.vao);
	var vbo_vp = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vp);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (vp), gl.STATIC_DRAW);
	gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	var vbo_vt = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vt);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (vt), gl.STATIC_DRAW);
	gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (1);
	var vbo_vn = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vn);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (vn), gl.STATIC_DRAW);
	gl.vertexAttribPointer (2, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (2);
	torchlight.vao.loaded = true;
	
	torchlight.sp =  build_shader ("torchlight.vert", "torchlight.frag", ["vp", "vt"]);
	torchlight.PV_loc = gl.getUniformLocation (torchlight.sp, "PV");
	torchlight.M_loc = gl.getUniformLocation (torchlight.sp, "M");
	torchlight.tex = load_texture ("img/torchlight.png", true, true);
	
	torchlight.first_draw = true;
	
	torchlight.is_loaded = function () {
		if (this.vao.loaded && this.tex.loaded && this.sp.linked) {
			return true;
		}
		return false;
	}
}

//
// NOTE would be slightly better if we had a sub-array of depth-sorted indices
// of just torchlight -- probably not worth the JS cost vs GPU saving
function draw_torchlight (map_index, y) {
	if (!torchlight.is_loaded ()) {
		return;
	}
	
	var map_pos = [map_index % 32 * 2.0, y, Math.floor (map_index / 32) * 2.0];
	
	// culling
	var dist3d = sub_vec3_vec3 (map_pos, cam_pos);
	var dist2 = length2_vec3 (dist3d);
	if (dist2 > torchlight.max_draw_dist2) {
		culls++;
		return;
	}
	var dir3d = normalise_vec3 (dist3d);
	var dp = dot_vec3 (dir3d, cam_fwd);
	if (dp < torchlight.max_draw_dp) {
		culls++;
		return;
	}
	
	gl.useProgram (torchlight.sp);
	if (cam_dirty) {
		gl.uniformMatrix4fv (torchlight.PV_loc, gl.FALSE, new Float32Array (PV));
		unis++;
	}
	
	//gl.disable (gl.DEPTH_TEST);
	//gl.depthMask (false);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, torchlight.tex);
	
	var hdng = direction_to_heading ([dir3d[0], 0.0, -dir3d[2]]);
//	var dp2 = dot_vec3 (cam_fwd, [0.0, 0.0, 1.0]);
//	var yr = Math.acos (dp2) * ONE_RAD_IN_DEG;
//	console.log (yr);

	// HACK
	var S = identity_mat4 ();
	if (y > 1.0) {
		S = scale_mat4 (identity_mat4 (), [0.45, 0.45, 0.45]);
	}

	var R = rotate_y_deg (S, -hdng);
	var T = translate_mat4 (R, map_pos);
//	var M = mult_mat4_mat4 (T, R);
	
	//var M = inverse_mat4 (look_at (map_pos, cam_pos, [0.0, 1.0, 0.0]));
	gl.uniformMatrix4fv (torchlight.M_loc, gl.FALSE, new Float32Array (T));
	unis++;
	
	vao_ext.bindVertexArrayOES (torchlight.vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
	draws++;
	//gl.depthMask (true);
	//gl.enable (gl.DEPTH_TEST);
}

