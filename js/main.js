var previous_millis;
var logic_accum = 0.0;
var logic_step_s = 1.0 / 60.0;

var heckler = new Object ();
var arch = new Object ();
var gemstand = new Object ();
var chand = new Object ();
var hatchet = new Object ();
var puff = new Object ();
hatchet.attack_countd = 0.0;
hatchet.M = translate_mat4 (rotate_y_deg (identity_mat4 (), 10.0),
	[-0.75, -1.2, 1.2]);
var shotgun = new Object ();
shotgun.attack_countd = 0.0;
shotgun.M = translate_mat4 (rotate_y_deg (identity_mat4 (), 10.0),
	[-0.75, -1.2, 1.2]);
var silver_key_tex;
var gold_key_tex;
var crown_tex;
var shells_tex;
var medkit_tex;
var shotgun_tex;
var katja_tex;
var debug_el = document.getElementById ("debug");
var lost_el = document.getElementById ("lost_el");
var won_el = document.getElementById ("won_el");

function load_map () {
	var image = new Image();
	image.onload = function () {
		var canvas = document.createElement ("canvas");
		canvas.width = 32;
		canvas.height = 32;
		var c = canvas.getContext ("2d");
		c.drawImage (image, 0, 0);
		var pix = c.getImageData (0, 0, 32, 32);
		var map_i = 0;
		for (var i = 0; i < 32 * 32 * 4 ; i += 4) {
			var num = pix.data[i] * 65025 + pix.data[i + 1] * 255 +
				pix.data[i + 2];
			// white is 65281
			// black is 0
			map[map_i++] = num;
		}
		//alert (pix.data[32*32*3]);
		//console.log ("map loaded ");
		map_loaded = true;
		
		load_monsters ();
	}
	image.src = "img/map.png";
}

function init () {
	start_loading_sounds ();
	// start playing theme
	sounds.title_music.play ();

	if (!init_gl ()) {
		return false;
	}
	
	init_title ();
	init_cam ();
	load_map ();
	
	heckler.sp = build_shader ("heckler.vert", "heckler.frag", ["vp", "vt", "vn"]);
	heckler.V_loc = gl.getUniformLocation (heckler.sp, "V");
	heckler.PV_loc = gl.getUniformLocation (heckler.sp, "PV");
	heckler.M_loc = gl.getUniformLocation (heckler.sp, "M");
	heckler.tex = load_texture ("img/redbrick.png", true, false);
	heckler.turn_bk_tex = load_texture ("img/turnbk.png", true, false);
	heckler.kill_thieves_tex = load_texture ("img/kill_thieves.png", true,
		false);
	heckler.entry_tex = load_texture ("img/entry.png", true, false);
	heckler.greenwall_tex = load_texture ("img/greenwall.png", true, false);
	heckler.greenwall_secret_tex = load_texture ("img/greenwall_secret.png",
		true, false);
	heckler.whitewall_tex = load_texture ("img/whitewall.png", true, false);
	heckler.nthingtosee_tex = load_texture ("img/nthgtosee.png", true, false);
	heckler.anton_tex = load_texture ("img/anton.png", true, false);
	silver_key_tex = load_texture ("img/silver_key.png", true, false);
	gold_key_tex = load_texture ("img/gold_key.png", true, false);
	medkit_tex = load_texture ("img/medkit.png", true, false);
	shotgun_tex = load_texture ("img/shotgun.png", true, false);
	puff.tex = load_texture ("img/shot.png", true, false);
	crown_tex = load_texture ("img/crown.png", true, false);
	shells_tex = load_texture ("img/shells.png", true, false);
	katja_tex = load_texture ("img/katja.png", true, false);
	heckler.silver_door_tex = load_texture ("img/silver_door.png", true, false);
	heckler.gold_door_tex = load_texture ("img/gold_door.png", true, false);
	heckler.bars_tex = load_texture ("img/bars.png", true, false);
	heckler.vao = parse_obj_into_vbos ("mesh/wall.obj");
	heckler.first_draw = true;
	heckler.is_loaded = function () {
		if (this.tex.loaded && this.vao.loaded) {
			return true;
		}
		return false;
	}
	
	puff.sp = build_shader ("puff.vert", "puff.frag", ["vp"]);
	puff.offset_loc = gl.getUniformLocation (puff.sp, "offset");
	puff.scale_loc = gl.getUniformLocation (puff.sp, "scale");
	puff.a_loc = gl.getUniformLocation (puff.sp, "a");
	
	arch.sp = heckler.sp;
	arch.V_loc = heckler.V_loc;
	arch.PV_loc = heckler.PV_loc;
	arch.M_loc = heckler.M_loc;
	arch.tex = load_texture ("img/arch_dm.png", true, false);
	arch.vao = parse_obj_into_vbos ("mesh/arch.obj");
	arch.first_draw = true;
	arch.is_loaded = function () {
		if (this.tex.loaded && this.vao.loaded) {
			return true;
		}
		return false;
	}
	
	hatchet.sp = heckler.sp;
	hatchet.V_loc = heckler.V_loc;
	hatchet.PV_loc = heckler.PV_loc;
	hatchet.M_loc = heckler.M_loc;
	hatchet.tex = load_texture ("img/hatchet.png", true, false);
	hatchet.vao = parse_obj_into_vbos ("mesh/hatchet.obj");
	hatchet.first_draw = true;
	hatchet.is_loaded = function () {
		if (this.tex.loaded && this.vao.loaded) {
			return true;
		}
		return false;
	}
	
	shotgun.sp = heckler.sp;
	shotgun.V_loc = heckler.V_loc;
	shotgun.PV_loc = heckler.PV_loc;
	shotgun.M_loc = heckler.M_loc;
	shotgun.tex = load_texture ("img/shotgun_dm.png", true, false);
	shotgun.vao = parse_obj_into_vbos ("mesh/shotgun.obj");
	shotgun.first_draw = true;
	shotgun.is_loaded = function () {
		if (this.tex.loaded && this.vao.loaded) {
			return true;
		}
		return false;
	}
	
	gemstand.sp = heckler.sp;
	gemstand.V_loc = heckler.V_loc;
	gemstand.PV_loc = heckler.PV_loc;
	gemstand.M_loc = heckler.M_loc;
	gemstand.tex = load_texture ("img/gemstand.png", true, false);
	gemstand.vao = parse_obj_into_vbos ("mesh/gemstand.obj");
	gemstand.first_draw = true;
	gemstand.is_loaded = function () {
		if (this.tex.loaded && this.vao.loaded) {
			return true;
		}
		return false;
	}
	chand.sp = heckler.sp;
	chand.V_loc = heckler.V_loc;
	chand.PV_loc = heckler.PV_loc;
	chand.M_loc = heckler.M_loc;
	chand.tex = load_texture ("img/chand128.png", true, false);
	chand.vao = parse_obj_into_vbos ("mesh/chand.obj");
	chand.first_draw = true;
	chand.is_loaded = function () {
		if (this.tex.loaded && this.vao.loaded) {
			return true;
		}
		return false;
	}
	
	create_ground_planes ();
	create_torchlight ();
	gui.start_loading ();
	
	return true;
}

function main_loop () {
	// update timers
	var current_millis = performance.now ();//(new Date).getTime ();
	var elapsed_millis = current_millis - previous_millis;
	previous_millis = current_millis;
	var elapsed_s = elapsed_millis / 1000.0;
	
	switch (game_state) {
		case "won":
			break;
		case "lost":
			// TODO -- allow restart?
			break;
		case "title":
			update_title (elapsed_s);
			break;
		case "story":
			update_story (elapsed_s);
			break;
		case "instruct":
			update_instruct (elapsed_s);
			break;
		case "playing":
			// absolutely wait until the map is loaded before playing
			if (!map_loaded) {
				return;
			}
		
			// logic steps
			logic_accum += elapsed_s;
			while (logic_accum >= logic_step_s) {
				// input handler
				// left
				if (keys_down[37]) {
					turn_left (logic_step_s);
				// right
				} else if (keys_down[39]) {
					turn_right (logic_step_s);
				}
				// down arrow or s
				if (keys_down[40] || keys_down[83]) {
					move_bk (logic_step_s);
				}
				// up arrow or w
				if (keys_down[38] || keys_down[87]) {
					move_fwd (logic_step_s);
				}
				// a
				if (keys_down[65]) {
					move_lft (logic_step_s);
				}
				// d
				if (keys_down[68]) {
					move_rgt (logic_step_s);
				}
				// space bar
				if (keys_down[32]) {
					open_secret();
				}
				// q
				if (is_key_down (81)) {
					switch (sel_weap) {
						case 0:
							if (hatchet.attack_countd <= 0.0) {
								hatchet.attack_countd = 0.33;
								shotgun.attack_countd = 0.0;
								sounds.hatchet.play();
								hatchet_attacking = true;
							}
							break;
						case 1:
							if (shotgun.attack_countd <= 0.0 && gui.ammo > 0) {
								shotgun.attack_countd = 0.5;
								hatchet.attack_countd = 0.0;
								sounds.shotgun.play();
								shotgun_attacking = true;
								gui.set_ammo (gui.ammo - 1);
								move_bk (logic_step_s * 4.0);
								if (gui.ammo < 1) {
									sel_weap = 0;
								}
							}
							break;
						default:
					} // endswitch
				}
				
				// change weapons
				if (is_key_down (49)) {
					sel_weap = 0;
				} else if (is_key_down (50) && has_shotgun && gui.ammo > 0) {
					sel_weap = 1;
				}
				
				switch (sel_weap) {
					case 0:
						if (hatchet.attack_countd > 0.0) {
							var f = hatchet.attack_countd * 3.0;
							var a = 5.0;
							var bob = 0.025 * Math.sin (cam_pos[0] * 1.5 + cam_pos[2] * 1.6);
							var S = scale_mat4 (identity_mat4 (), [0.75, 0.75, 0.75]);
							var Rz = rotate_z_deg (S, -10.0 * f);
							var Rx = rotate_x_deg (Rz, 10.0);
							var Ry = rotate_y_deg (Rx, 10.0);
							hatchet.M = translate_mat4 (Ry, [-0.75, -1.2 + bob + f * 2.0 - 0.5,
								1.7 - f * 0.5]);
							hatchet.attack_countd -= logic_step_s;
						} else {
							var a = 10.0;
							var S = scale_mat4 (identity_mat4 (), [0.75, 0.75, 0.75]);
							var Rx = rotate_x_deg (S, a);
							var Ry = rotate_y_deg (Rx, 10.0);
							var bob = 0.025 * Math.sin (cam_pos[0] * 1.5 + cam_pos[2] * 1.6);
							hatchet.M = translate_mat4 (Ry, [-0.75, -1.2 + bob, 1.2]);
							hatchet.attack_countd -= logic_step_s;
						}
						break;
					case 1:
						if (shotgun.attack_countd > 0.0) {
							var f = shotgun.attack_countd * 3.0;
							var a = -2.5;
							var bob = 0.025 * Math.sin (cam_pos[0] * 1.5 + cam_pos[2] * 1.6);
							var S = scale_mat4 (identity_mat4 (), [0.75, 0.75, 0.33]);
							var Rx = rotate_x_deg (S, a);
							shotgun.M = translate_mat4 (Rx, [-0.75, -1.2 + bob, 1.75 - f * 1.0]);
							shotgun.attack_countd -= logic_step_s;
						} else {
							var a = -2.5;
							var S = scale_mat4 (identity_mat4 (), [0.75, 0.75, 0.33]);
							var Rx = rotate_x_deg (S, a);
							var bob = 0.025 * Math.sin (cam_pos[0] * 1.5 + cam_pos[2] * 1.6);
							shotgun.M = translate_mat4 (Rx, [-0.75, -1.2 + bob, 1.75]);
							shotgun.attack_countd -= logic_step_s;
						}
						break;
					default:
				} // endswitch weapon
				update_monsters (logic_step_s);
				pick_up_stuff ();
				
				logic_accum -= logic_step_s;
			} // end time step loop
			break;
		default:
	} // endswitch game state
	
	switch (game_state) {
		case "won":
			
			break;
		case "lost":
			
			break;
		case "title":
			gl.viewport (0, 0, canvas.clientWidth, canvas.clientHeight);
			gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			draw_title ();
			break;
		case "story":
			gl.viewport (0, 0, canvas.clientWidth, canvas.clientHeight);
			gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			draw_story ();
			break;
		case "instruct":
			gl.viewport (0, 0, canvas.clientWidth, canvas.clientHeight);
			gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			draw_instruct ();
			break;
		case "playing":
			culls = draws = unis = 0;
			gl.viewport (0, 0, canvas.clientWidth, canvas.clientHeight);
			gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gui.draw (elapsed_s);
			gl.clear (gl.DEPTH_BUFFER_BIT);
			// environment pass
			gl.viewport (10/1024 * canvas.clientWidth, 100/768 * canvas.clientHeight,
				canvas.clientWidth - 20/1024 * canvas.clientWidth,
				canvas.clientHeight - 110/768 * canvas.clientHeight);
			draw_ground ();

			for (var i = 0; i < map.length; i++) {
				if (16646655 == map[i]) {
					continue;
				}
				if (map[i] < 256) {
					if (heckler.is_loaded ()) {
						var map_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
						
						// culling
						var dist3d = sub_vec3_vec3 (map_pos, cam_pos);
						var dist2 = length2_vec3 (dist3d);
						if (dist2 > 900.0) {
							culls++;
							continue;
						}
						var dir3d = normalise_vec3 (dist3d);
						var dp = dot_vec3 (dir3d, cam_fwd);
						if (dist2 > 20.0 && dp < 0.42) {
							culls++;
							continue;
						}
					
						gl.activeTexture (gl.TEXTURE0);
						if (map[i] == 255) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.turn_bk_tex);
						} else if (map[i] == 254) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.kill_thieves_tex);
						} else if (map[i] == 253) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.entry_tex);
						} else if (map[i] == 252) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.greenwall_tex);
						} else if (map[i] == 251) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.whitewall_tex);
						} else if (map[i] == 250) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.nthingtosee_tex);
						} else if (map[i] == 249) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.anton_tex);
						} else if (map[i] == 248) {
							gl.bindTexture (gl.TEXTURE_2D, heckler.greenwall_secret_tex);
						} else {
							gl.bindTexture (gl.TEXTURE_2D, heckler.tex);
						}
						var M = translate_mat4 (identity_mat4 (), map_pos);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (heckler.vao);
						gl.drawArrays (gl.TRIANGLES, 0, heckler.vao.pc);
						draws++;
					}
				// zombie
				} else if (map[i] < 65536) {
				// boss
				} else if (map[i] < 65537) {
				// arch
				} else if (map[i] == 8355968 || map[i] == 4177984) {
					if (arch.is_loaded ()) {
						var map_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
						
						// culling
						var dist3d = sub_vec3_vec3 (map_pos, cam_pos);
						var dist2 = length2_vec3 (dist3d);
						if (dist2 > 900.0) {
							culls++;
							continue;
						}
						var dir3d = normalise_vec3 (dist3d);
						var dp = dot_vec3 (dir3d, cam_fwd);
						if (dist2 > 20.0 && dp < 0.42) {
							culls++;
							continue;
						}
					
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, arch.tex);
						var R = identity_mat4 ();
						if (map[i] == 4177984) {
							R = rotate_y_deg (R, 90.0);
						}
						var M = translate_mat4 (R, map_pos);
						gl.uniformMatrix4fv (arch.M_loc, gl.FALSE, new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (arch.vao);
						gl.drawArrays (gl.TRIANGLES, 0, arch.vao.pc);
						draws++;
					}
				// gemstand
				} else if (map[i] == 16646400) {
					if (gemstand.is_loaded ()) {
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, gemstand.tex);
						var map_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
						var R = identity_mat4 ();
						var M = translate_mat4 (R, map_pos);
						gl.uniformMatrix4fv (gemstand.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (gemstand.vao);
						gl.drawArrays (gl.TRIANGLES, 0, gemstand.vao.pc);
						draws++;
					}
				// candle chandalier
				} else if (map[i] == 16646401) {
					if (chand.is_loaded ()) {
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, chand.tex);
						var map_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
						var R = identity_mat4 ();
						var M = translate_mat4 (R, map_pos);
						gl.uniformMatrix4fv (chand.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (chand.vao);
						gl.drawArrays (gl.TRIANGLES, 0, chand.vao.pc);
						draws++;
					}
				// silver door
				} else if (map[i] == 16581375) {
				
				// silver key
				} else if (map[i] == 16581376) {
				
				// crown
				} else if (map[i] == 16581377) {
				
				// medkit
				} else if (map[i] == 16581378) {
				
				// bars
				} else if (map[i] == 16581379) {
				
				// shotgun
				} else if (map[i] == 16581380) {
				
				// katja
				} else if (map[i] == 16581381) {
				
				// shells
				} else if (map[i] == 16581382) {
				
				// gold door
				} else if (map[i] == 16581383) {
				
				// gold key
				} else if (map[i] == 16581384) {
				
				} else {
					console.log (map[i]);
					return;
				}
			}
			
			// monsters and 3d stuff
			draw_monsters (elapsed_s);
	
			var tr_list = [];
			
			//gl.disable (gl.DEPTH_TEST);
			gl.useProgram (heckler.sp);
			for (var i = 0; i < map.length; i++) {
				// TODO eliminate long distance items
			
				if (map[i] == 16646400) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				} else if (map[i] == 16646401) {
					var map_pos = [i % 32 * 2.0, 1.8, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// silver door
				} else if (map[i] == 16581375) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// silver key
				} else if (map[i] == 16581376) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// crown
				} else if (map[i] == 16581377) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// medkit
				} else if (map[i] == 16581378) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// bars
				} else if (map[i] == 16581379) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// shotgun
				} else if (map[i] == 16581380) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// katja
				} else if (map[i] == 16581381) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// shells
				} else if (map[i] == 16581382) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// gold door
				} else if (map[i] == 16581383) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				// gold key
				} else if (map[i] == 16581384) {
					var map_pos = [i % 32 * 2.0, 1.0, Math.floor (i / 32) * 2.0];
					var d = sub_vec3_vec3 (map_pos, cam_pos);
					var m = length2_vec3 (d);
					tr_list.push ([i, m]);
				} // endif
			} // endfor
			
			tr_list.sort (function (a, b) { return b[1] - a[1]; } );
			
			// transparent stuff pass
			gl.enable (gl.BLEND);
			gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.blendEquation(gl.FUNC_ADD);
			gl.activeTexture (gl.TEXTURE0);
			for (var i = 0; i < tr_list.length; i++) {
				if (tr_list[i][1] > 900.0) {
					culls++;
					continue;
				}
				// torchlight
				if (map[tr_list[i][0]] == 16646400) {
					draw_torchlight (tr_list[i][0], 1.0);
				} else if (map[tr_list[i][0]] == 16646401) {
					draw_torchlight (tr_list[i][0], 1.65);
				// silver door
				} else if (map[tr_list[i][0]] == 16581375) {
					if (heckler.silver_door_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, heckler.silver_door_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 0.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = translate_mat4 (identity_mat4 (), map_pos);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (heckler.vao);
						gl.drawArrays (gl.TRIANGLES, 0, heckler.vao.pc);
						draws++;
					}
				// silver key
				} else if (map[tr_list[i][0]] == 16581376) {
					if (torchlight.is_loaded () && silver_key_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, silver_key_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 1.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = inverse_mat4 (look_at (map_pos, cam_pos, [0.0, 1.0, 0.0]));
						var S = scale_mat4 (identity_mat4 (), [0.25, 0.25, 0.25]);
						var T = translate_mat4 (S, [0.0, -0.75, 0.0]);
						M = mult_mat4_mat4 (M, T);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;

						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					}
				// crown
				} else if (map[tr_list[i][0]] == 16581377) {
					if (torchlight.is_loaded () && crown_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, crown_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 1.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = inverse_mat4 (look_at (map_pos, cam_pos, [0.0, 1.0, 0.0]));
						var S = scale_mat4 (identity_mat4 (), [0.33, 0.33, 0.33]);
						var T = translate_mat4 (S, [0.0, -0.75, 0.0]);
						M = mult_mat4_mat4 (M, T);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					}
				// medkit
				} else if (map[tr_list[i][0]] == 16581378) {
					if (torchlight.is_loaded () && medkit_tex.loaded &&
						heckler.is_loaded ()) {
						gl.useProgram (heckler.sp);
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, medkit_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 0.3,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var dist3d = sub_vec3_vec3 (map_pos, cam_pos);
						var dir3d = normalise_vec3 (dist3d);
						var hdng = direction_to_heading ([dir3d[0], 0.0, -dir3d[2]]);
						var S = scale_mat4 (identity_mat4 (), [0.33, 0.33, 0.33]);
						var R = rotate_y_deg (S, -hdng);
						var T = translate_mat4 (R, map_pos);
						M = mult_mat4_mat4 (M, T);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (T));
						unis++;
						
						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					}
				// bars
				} else if (map[tr_list[i][0]] == 16581379) {
					if (heckler.bars_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, heckler.bars_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 0.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = translate_mat4 (identity_mat4 (), map_pos);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (heckler.vao);
						gl.drawArrays (gl.TRIANGLES, 0, heckler.vao.pc);
						draws++;
					}
				// shotgun
				} else if (map[tr_list[i][0]] == 16581380) {
					if (torchlight.is_loaded () && shotgun_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, shotgun_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 1.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = inverse_mat4 (look_at (map_pos, cam_pos, [0.0, 1.0, 0.0]));
						var S = scale_mat4 (identity_mat4 (), [0.5, 0.5, 0.5]);
						var T = translate_mat4 (S, [0.0, -0.75, 0.0]);
						M = mult_mat4_mat4 (M, T);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					} // endif
				// katja
				} else if (map[tr_list[i][0]] == 16581381) {
					if (torchlight.is_loaded () && katja_tex.loaded) {
						gl.useProgram (torchlight.sp);
						gl.bindTexture (gl.TEXTURE_2D, katja_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 0.5,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						
						var dist3d = sub_vec3_vec3 (map_pos, cam_pos);
						var dir3d = normalise_vec3 (dist3d);
						var hdng = direction_to_heading ([dir3d[0], 0.0, -dir3d[2]]);
						var S = scale_mat4 (identity_mat4 (), [0.45, 0.45, 0.45]);
						var R = rotate_y_deg (S, -hdng);
						var T = translate_mat4 (R, map_pos);
						
						gl.uniformMatrix4fv (torchlight.M_loc, gl.FALSE,
							new Float32Array (T));
						unis++;
						if (cam_dirty) {
							gl.uniformMatrix4fv (torchlight.PV_loc, gl.FALSE,
								new Float32Array (PV));
							unis++;
						}
						
						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					} // endif
				// shells
				} else if (map[tr_list[i][0]] == 16581382) {
					if (torchlight.is_loaded () && shells_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, shells_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 0.25,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var dist3d = sub_vec3_vec3 (map_pos, cam_pos);
						var dir3d = normalise_vec3 (dist3d);
						var hdng = direction_to_heading ([dir3d[0], 0.0, -dir3d[2]]);
						var S = scale_mat4 (identity_mat4 (), [0.25, 0.25, 0.25]);
						var R = rotate_y_deg (S, -hdng);
						var T = translate_mat4 (R, map_pos);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (T));
						unis++;
						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					} // endif
				// gold door
				} else if (map[tr_list[i][0]] == 16581383) {
					if (heckler.gold_door_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, heckler.gold_door_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 0.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = translate_mat4 (identity_mat4 (), map_pos);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;
						
						vao_ext.bindVertexArrayOES (heckler.vao);
						gl.drawArrays (gl.TRIANGLES, 0, heckler.vao.pc);
						draws++;
					}
				// gold key
				} else if (map[tr_list[i][0]] == 16581384) {
					if (torchlight.is_loaded () && gold_key_tex.loaded) {
						gl.useProgram (heckler.sp);
						gl.bindTexture (gl.TEXTURE_2D, gold_key_tex);
						var map_pos = [tr_list[i][0] % 32 * 2.0, 1.0,
							Math.floor (tr_list[i][0] / 32) * 2.0];
						var M = inverse_mat4 (look_at (map_pos, cam_pos, [0.0, 1.0, 0.0]));
						var S = scale_mat4 (identity_mat4 (), [0.25, 0.25, 0.25]);
						var T = translate_mat4 (S, [0.0, -0.75, 0.0]);
						M = mult_mat4_mat4 (M, T);
						gl.uniformMatrix4fv (heckler.M_loc, gl.FALSE,
							new Float32Array (M));
						unis++;

						vao_ext.bindVertexArrayOES (torchlight.vao);
						gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
						draws++;
					}
				} // endif
			} // endfor
			
			gl.disable (gl.BLEND);
			//gl.enable (gl.DEPTH_TEST);
			
			// almost certainly in front of cam ahead of other transparent stuff
			draw_secrets (elapsed_s);
	
			// hatchet / UI pass
			gl.clear (gl.DEPTH_BUFFER_BIT);
			switch (sel_weap) {
				case 0:
					if (hatchet.is_loaded ()) {
						gl.useProgram (heckler.sp);
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, hatchet.tex);
						var map_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
		
						gl.uniformMatrix4fv (hatchet.M_loc, gl.FALSE,
							new Float32Array (hatchet.M));
						unis++;
						var hatchet_V = look_at ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0],
							[0.0, 1.0, 0.0]);
						var hatchet_PV = mult_mat4_mat4 (P, hatchet_V);
		
						gl.uniformMatrix4fv (heckler.V_loc, gl.FALSE,
							new Float32Array (hatchet_V));
						gl.uniformMatrix4fv (heckler.PV_loc, gl.FALSE,
							new Float32Array (hatchet_PV));
						unis += 2;
						heckler.first_draw = false;

						vao_ext.bindVertexArrayOES (hatchet.vao);
						gl.drawArrays (gl.TRIANGLES, 0, hatchet.vao.pc);
						draws++;
					}
					break;
				case 1:
					if (shotgun.is_loaded ()) {
						// draw muzzle flash
						if (shotgun.attack_countd > 0.0 && puff.tex.loaded &&
							puff.sp.linked) {
							gl.disable (gl.DEPTH_TEST);
							gl.enable (gl.BLEND);
	
							gl.useProgram (puff.sp);
							var alpha = shotgun.attack_countd * 0.75;
							gl.uniform1f (puff.a_loc, alpha);
							unis++;
							gl.uniform2f (puff.offset_loc, 150.0/1024, -150.0/1024);
							gl.uniform2f (puff.scale_loc, 256.0/1024, 256.0/768);
							unis += 2;
							gl.activeTexture (gl.TEXTURE0);
							gl.bindTexture (gl.TEXTURE_2D, puff.tex);
	
							vao_ext.bindVertexArrayOES (quad.vao);
							gl.drawArrays (gl.TRIANGLE_STRIP, 0, quad.pc);
							draws++;
							
							gl.enable (gl.DEPTH_TEST);
							gl.disable (gl.BLEND);
						}
					
						gl.useProgram (heckler.sp);
						gl.activeTexture (gl.TEXTURE0);
						gl.bindTexture (gl.TEXTURE_2D, shotgun.tex);
						var map_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
		
						gl.uniformMatrix4fv (shotgun.M_loc, gl.FALSE,
							new Float32Array (shotgun.M));
						unis++;
						var shotgun_V = look_at ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0],
							[0.0, 1.0, 0.0]);
						var shotgun_PV = mult_mat4_mat4 (P, shotgun_V);
		
						gl.uniformMatrix4fv (heckler.V_loc, gl.FALSE,
							new Float32Array (shotgun_V));
						gl.uniformMatrix4fv (heckler.PV_loc, gl.FALSE,
							new Float32Array (shotgun_PV));
						unis += 2;
						heckler.first_draw = false;

						vao_ext.bindVertexArrayOES (shotgun.vao);
						gl.drawArrays (gl.TRIANGLES, 0, shotgun.vao.pc);
						draws++;
					}
					break;
				default:
			} // endswitch
			
			// draw overlays/crosshair
			gui.draw_cross (elapsed_s);
			
			break; // end of playing mode draws
		default:
	} // endswitch mode draws
	
	//debug_el.innerHTML = "d: " + draws + " u: " + unis + " c: " + culls;
	
	// TODO -- when hatchet gets own shader
	//cam_dirty = false;
	//
	
	// "automatically re-call this function please"
	window.requestAnimFrame (main_loop, canvas);
}

function main () {
	init ();
	previous_millis = performance.now ();//(new Date).getTime ();
	main_loop ();
}

main ();
