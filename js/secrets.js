var secrets = [];
var sec_time = 1.5;

function add_secret (wall_type, map_x, map_y) {
	var sec = new Object ();
	sec.world_pos = [map_x * 2.0, 0.0, map_y * 2.0];
	sec.time = sec_time;
	sec.wall_type = wall_type;
	
	secrets.push (sec);
}

function open_secret () {
	var offs = mult_mat4_vec4 (cam_R, [0.0, 0.0, -1.75, 1.0]);
	var ahead_pos = add_vec3_vec3 (cam_pos, offs);
	//console.log (ahead_pos + " " + cam_pos);
	var map_row = Math.floor ((ahead_pos[2] + 1.0) / 2.0);
	var map_col = Math.floor ((ahead_pos[0] + 1.0) / 2.0);
	var map_i = map_row * 32 + map_col;
	var wt = map[map_i];
	
	// 3rd one is silver key door
	if (map[map_i] == 250 || map[map_i] == 249 || map[map_i] == 248 ||
		map[map_i] == 16581375 || map[map_i] == 16581383) {
		if (map[map_i] == 16581375) {
			if (!has_silver_key) {
				return;
			}
			has_silver_key = false;
		}
		if (map[map_i] == 16581383) {
			if (!has_gold_key) {
				return;
			}
			has_gold_key = false;
		}
	
		map[map_i] = 16646655; // gap
		
		add_secret (wt, map_col, map_row);
		
		// sound
		sounds.open_door.play();
	}
}

//
// note - does not respect order with other transparent things
function draw_secrets (s) {
	if (secrets.length == 0) {
		return;
	}
	
	gl.useProgram (heckler.sp);
	if (cam_dirty || heckler.first_draw) {
		gl.uniformMatrix4fv (heckler.V_loc, gl.FALSE, new Float32Array (V));
		gl.uniformMatrix4fv (heckler.PV_loc, gl.FALSE, new Float32Array (PV));
		heckler.first_draw = false;
		unis += 2;
	}

	var to_rem = 0;
	var from = -1;
	// update and draw pass
	for (var i = 0; i < secrets.length; i++) {
		// check for removal
		secrets[i].time -= s;
		if (secrets[i].time <= 0.0) {
			to_rem++;
			if (from < 0) {
				from = i;
			}
		}
		
		gl.activeTexture (gl.TEXTURE0);
		//console.log (secrets[i].wall_type);
		switch (secrets[i].wall_type) {
			case 248:
				gl.bindTexture (gl.TEXTURE_2D, heckler.greenwall_secret_tex);
				break;
			case 249:
				gl.bindTexture (gl.TEXTURE_2D, heckler.anton_tex);
				break;
			case 250:
				gl.bindTexture (gl.TEXTURE_2D, heckler.nthingtosee_tex);
				break;
			case 16581375:
				gl.bindTexture (gl.TEXTURE_2D, heckler.silver_door_tex);
				break;
			case 16581383:
				gl.bindTexture (gl.TEXTURE_2D, heckler.gold_door_tex);
				break;
			default:
				gl.bindTexture (gl.TEXTURE_2D, heckler.anton_tex);
		}
		
		secrets[i].world_pos[1] = 2.0 * ((sec_time - secrets[i].time) / sec_time);
		var M = translate_mat4 (identity_mat4 (), secrets[i].world_pos);
		gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE, new Float32Array (M));
		unis++;
		//
		gl.enable (gl.BLEND);
		gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.blendEquation(gl.FUNC_ADD);
		vao_ext.bindVertexArrayOES (heckler.vao);
		gl.drawArrays (gl.TRIANGLES, 0, heckler.vao.pc);
		draws++;
		gl.disable (gl.BLEND);
		
	}
	if (0 == to_rem) {
		return;
	}
	// remove pass
	
	while (to_rem > 0) {
		for (var i = from; i < secrets.length; i++) {
			if (secrets[i].time <= 0.0) {
				from = i;
				to_rem--;
				secrets.splice (i, 1);
				break;
			} // endif
		} // endfor
	} // endwhile
}
