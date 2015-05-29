var ground_vao, ground_tex, ceil_vao, ceil_tex;

function create_ground_planes () {
	var scale = 100.0;
	var tex_scale = 100.0;
	var vp = [
		1.0 * scale, 2.0, 1.0 * scale,
		-1.0 * scale, 2.0, 1.0 * scale,
		-1.0 * scale, 2.0, -1.0 * scale,
		-1.0 * scale, 2.0, -1.0 * scale,
		1.0 * scale, 2.0, -1.0 * scale,
		1.0 * scale, 2.0, 1.0 * scale,
		
		-1.0 * scale, 0.0, 1.0 * scale,
		1.0 * scale, 0.0, 1.0 * scale,
		1.0 * scale, 0.0, -1.0 * scale,
		1.0 * scale, 0.0, -1.0 * scale,
		-1.0 * scale, 0.0, -1.0 * scale,
		-1.0 * scale, 0.0, 1.0 * scale
	];
	var vt = [
		1.0 * tex_scale, 1.0 * tex_scale,
		0.0, 1.0 * tex_scale,
		0.0, 0.0,
		0.0, 0.0,
		1.0 * tex_scale, 0.0,
		1.0 * tex_scale, 1.0 * tex_scale,
		
		1.0 * tex_scale, 1.0 * tex_scale,
		0.0, 1.0 * tex_scale,
		0.0, 0.0,
		0.0, 0.0,
		1.0 * tex_scale, 0.0,
		1.0 * tex_scale, 1.0 * tex_scale
	];
	var vn = [
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0
	];

	ceil_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (ceil_vao);
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
	
	ground_vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (ground_vao);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vp);
	gl.vertexAttribPointer (0, 3, gl.FLOAT, false, 0, 6*3*4);
	gl.enableVertexAttribArray (0);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vt);
	gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 6*2*4);
	gl.enableVertexAttribArray (1);
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vn);
	gl.vertexAttribPointer (2, 3, gl.FLOAT, false, 0, 6*3*4);
	gl.enableVertexAttribArray (2);
	
	ground_tex = load_texture ("img/floor.png", false, false);
	ceil_tex = load_texture ("img/ceil.png", false, false);
}

function draw_ground () {
	gl.useProgram (heckler.sp);
	if (cam_dirty || heckler.first_draw) {
		gl.uniformMatrix4fv (heckler.V_loc, gl.FALSE, new Float32Array (V));
		gl.uniformMatrix4fv (heckler.PV_loc, gl.FALSE, new Float32Array (PV));
		unis += 2;
		heckler.first_draw = false;
	}

	gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
		new Float32Array (identity_mat4 ()));
	unis++;
	gl.activeTexture (gl.TEXTURE0);
	if (ground_tex.loaded) {
		gl.bindTexture (gl.TEXTURE_2D, ground_tex);
		vao_ext.bindVertexArrayOES (ground_vao);
		gl.drawArrays (gl.TRIANGLES, 0, 6);
		draws++;
	}
	if (ceil_tex.loaded) {
		gl.bindTexture (gl.TEXTURE_2D, ceil_tex);
		vao_ext.bindVertexArrayOES (ceil_vao);
		gl.drawArrays (gl.TRIANGLES, 0, 6);
		draws++;
	}
}
