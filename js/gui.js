var gui = new Object ();
gui.port_change_cd = 2.0;
gui.show_tima = true;

gui.start_loading = function () {
	gui.score = 0;
	gui.health = 100;
	gui.ammo = 0;
	gui.hurt_timer = 0.0;
	gui.heal_timer = 0.0;
	gui.gold_timer = 0.0;
	gui.mask_timer = 0.0;
	// html elements
	gui.score_el = document.getElementById ("score_el");
	gui.health_el = document.getElementById ("health_el");
	gui.ammo_el = document.getElementById ("ammo_el");
	var top = 655 / 768 * canvas.clientHeight;
	var left = 180 / 1024 * canvas.clientWidth;
	var size = 200 / 768 * canvas.clientHeight;
	gui.score_el.style.top = top;
	gui.score_el.style.left = left;
	gui.score_el.style.fontSize = size + "%";
	left = 340 / 1024 * canvas.clientWidth;
	gui.health_el.style.top = top;
	gui.health_el.style.left = left;
	gui.health_el.style.fontSize = size + "%";
	left = 900 / 1024 * canvas.clientWidth;
	gui.ammo_el.style.top = top;
	gui.ammo_el.style.left = left;
	gui.ammo_el.style.fontSize = size + "%";

	// texture
	gui.tex = load_texture ("img/gui.png", true, false);
	gui.tim_tex = load_texture ("img/tim.png", true, false);
	gui.tim2_tex = load_texture ("img/tim2.png", true, false);
	gui.cross_tex = load_texture ("img/crosshair.png", true, false);
	// shaders
	gui.cross_sp = build_shader ("cross.vert", "cross.frag", ["vp"]);
	gui.cross_colour_loc = gl.getUniformLocation (gui.cross_sp, "colour");
	
	// geometry
	
}

// monkeywork
gui.is_loaded = function () {
	if (this.tex.loaded && quad.vao.loaded && title.sp.linked) {
		return true;
	}
	return false;
}

gui.set_health = function (amt) {
	this.health = amt;
	this.health_el.innerHTML = "Health<br />" + amt + "%";
}

gui.set_score = function (amt) {
	this.score = amt;
	this.score_el.innerHTML = "Score<br />" + amt;
}

gui.set_ammo = function (amt) {
	this.ammo = amt;
	this.ammo_el.innerHTML = "Ammo<br />" + amt;
}

gui.show = function (show) {
	if (show) {
		gui.score_el.style.visibility = "visible";
		gui.health_el.style.visibility = "visible";
		gui.ammo_el.style.visibility = "visible";
	} else {
		gui.score_el.style.visibility = "hidden";
		gui.health_el.style.visibility = "hidden";
		gui.ammo_el.style.visibility = "hidden";
	}
}

gui.draw = function (s) {
	this.port_change_cd -= s;
	if (this.port_change_cd <= 0.0) {
		this.show_tima = !gui.show_tima;
		this.port_change_cd = 2.0;
	}
	if (gui.is_loaded ()) {
		gl.disable (gl.DEPTH_TEST);
		gl.enable (gl.BLEND);
		gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.blendEquation(gl.FUNC_ADD);
			
		gl.useProgram (title.sp);
		gl.uniform2f (title.offset_loc, 0.0, 0.0);
		gl.uniform2f (title.scale_loc, 1.0, 1.0);
		unis += 2;
		gl.activeTexture (gl.TEXTURE0);
		gl.bindTexture (gl.TEXTURE_2D, gui.tex);
		vao_ext.bindVertexArrayOES (quad.vao);
		gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
		draws++;
		
		if (has_silver_key) {
			if (silver_key_tex.loaded) {
				gl.uniform2f (title.offset_loc, 0.0 + 325.0 / 1024,
					-1.0 + 64.0 / 768);
				gl.uniform2f (title.scale_loc, 64.0 / 1024,
					64.0 / 768);
				unis += 2;
				gl.bindTexture (gl.TEXTURE_2D, silver_key_tex);
				gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
				draws++;
			}
		}
		if (has_shotgun) {
			if (shotgun_tex.loaded) {
				gl.uniform2f (title.offset_loc, 0.0 + 600.0 / 1024.0,
					-1.0 + 145.0 / 768.0);
				gl.uniform2f (title.scale_loc, 128.0 / 1024,
					128.0 / 768);
				unis += 2;
				gl.bindTexture (gl.TEXTURE_2D, shotgun_tex);
				gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
				draws++;
			}
		}
		// portrait
		if (this.tim_tex.loaded && this.tim2_tex.loaded) {
			gl.uniform2f (title.offset_loc, -0.5/1024, -1.0 + 100.0 / 768);
			gl.uniform2f (title.scale_loc, 80.0/1024, 80.0/768);
			unis += 2;
			if (gui.show_tima) {
				gl.bindTexture (gl.TEXTURE_2D, gui.tim_tex);
			} else {
				gl.bindTexture (gl.TEXTURE_2D, gui.tim2_tex);
			}
			gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
			draws++;
		}
		gl.enable (gl.DEPTH_TEST);
		gl.disable (gl.BLEND);
	}
}

gui.draw_cross = function (s) {
	if (!this.cross_tex.loaded || !quad.vao.loaded || !this.cross_sp.linked) {
		return;
	}
	gl.disable (gl.DEPTH_TEST);
	gl.enable (gl.BLEND);
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.blendEquation (gl.FUNC_ADD);
	
	gl.useProgram (this.cross_sp);

	if (this.mask_timer > 0.0) {
		this.mask_timer -= s;
		if (this.mask_timer < 0.0) {
			this.mask_timer = 0.0;
			game_state = "won";
		}
		// change game state to finished
		var alpha = 1.0 - this.mask_timer / 3.0;
		gl.uniform4f (this.cross_colour_loc, 0.0, 0.0, 0.0, alpha);
		unis++;
	} else if (this.hurt_timer > 0.0) {
		this.hurt_timer -= s;
		if (this.hurt_timer < 0.0) {
			this.hurt_timer = 0.0;
		}
		gl.uniform4f (this.cross_colour_loc, 1.0, 0.0, 0.0, this.hurt_timer * 0.8);
		unis++;
	} else if (this.heal_timer > 0.0) {
		this.heal_timer -= s;
		if (this.heal_timer < 0.0) {
			this.heal_timer = 0.0;
		}
		gl.uniform4f (this.cross_colour_loc, 0.0, 1.0, 0.0, this.heal_timer * 0.8);
		unis++;
	} else if (this.gold_timer > 0.0) {
		this.gold_timer -= s;
		if (this.gold_timer < 0.0) {
			this.gold_timer = 0.0;
		}
		gl.uniform4f (this.cross_colour_loc, 1.0, 1.0, 0.0, this.gold_timer * 0.8);
		unis++;
	}
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, this.cross_tex);
	
	vao_ext.bindVertexArrayOES (quad.vao);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
	
	draws++;
	gl.enable (gl.DEPTH_TEST);
	gl.disable (gl.BLEND);
}
