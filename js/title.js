var title = new Object;

function init_title () {
	title.is_loaded = function () {
		if (this.tex.loaded && quad.vao.loaded && this.sp.linked) {
			return true;
		}
		return false;
	}
	
	title.tex = load_texture ("img/title.png", true, true);
	title.story_tex = load_texture ("img/story.png", true, true);
	title.instruct_tex = load_texture ("img/instruct.png", true, true);
	
	title.sp = build_shader ("title.vert", "title.frag", ["vp"]);
	title.offset_loc = gl.getUniformLocation (title.sp, "offset");
	title.scale_loc = gl.getUniformLocation (title.sp, "scale");
}

function update_title () {
	// space bar
	if (is_key_down (32)) {
		game_state = "story";
	}
}

function update_story () {
	// space bar
	if (is_key_down (32)) {
		game_state = "instruct";
	}
}

function update_instruct () {
	// space bar
	if (is_key_down (32)) {
		game_state = "playing";
		console.log ("game play state started");
		// make GUI visible
		gui.show (true);
	}
}

function draw_title () {
	if (!title.is_loaded ()) {
		return;
	}
	gl.useProgram (title.sp);
	gl.uniform2f (title.offset_loc, 0.0, 0.0);
	gl.uniform2f (title.scale_loc, 1.0, 1.0);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, title.tex);
	vao_ext.bindVertexArrayOES (quad.vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
}

function draw_story () {
	if (!title.story_tex.loaded) {
		return;
	}
	gl.useProgram (title.sp);
	gl.uniform2f (title.offset_loc, 0.0, 0.0);
	gl.uniform2f (title.scale_loc, 1.0, 1.0);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, title.story_tex);
	vao_ext.bindVertexArrayOES (quad.vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
}

function draw_instruct () {
	if (!title.instruct_tex.loaded) {
		return;
	}
	gl.useProgram (title.sp);
	gl.uniform2f (title.offset_loc, 0.0, 0.0);
	gl.uniform2f (title.scale_loc, 1.0, 1.0);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, title.instruct_tex);
	vao_ext.bindVertexArrayOES (quad.vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
}
