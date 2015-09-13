var zombies = [];
var zombie_code = 65025;
var boss_code = 65026;
var the_zombie = new Object ();
the_zombie.started_loading = false;
the_zombie.max_chase_d_sq = 100.0; // 8m
the_zombie.attack_d_sq = 3.0; // 1m
the_zombie.move_speed = 4.0;
the_zombie.turn_speed = 150.0;
the_zombie.hurt_cd = 0.0;
the_zombie.max_draw_dist2 = 30.0 * 30.0;
the_zombie.max_draw_dp = 0.42; // 65 degrees
var hatchet_attacking = false;
var hatchet_attack_d_sq = 5.0;
var shotgun_attacking = false;
var shotgun_attack_d_sq = 400.0; // 20m

// assumes map already loaded
function load_monsters () {
	// load zombie mesh, texture, ~shaders
	if (!the_zombie.started_loading) {
		the_zombie.sp = build_shader ("monster.vert", "monster.frag", ["vp", "vt", "vn"]);
		the_zombie.V_loc = gl.getUniformLocation (the_zombie.sp, "V");
		the_zombie.PV_loc = gl.getUniformLocation (the_zombie.sp, "PV");
		the_zombie.M_loc = gl.getUniformLocation (the_zombie.sp, "M");
		the_zombie.t_loc = gl.getUniformLocation (the_zombie.sp, "t");
		the_zombie.tex = load_texture ("img/zombie.png", true, false);
		the_zombie.anton_tex = load_texture ("img/antonsk.png", true, false);
		the_zombie.vao = parse_obj_into_vbos ("mesh/zombie.obj");
		the_zombie.attack_vao = parse_obj_into_vbos ("mesh/zombie_attack.obj");
		the_zombie.first_draw = true;
		the_zombie.is_loaded = function () {
			if (this.tex.loaded && this.vao.loaded && this.sp.linked) {
				return true;
			}
			return false;
		}
			the_zombie.started_loading = true;
	}
	// find all the zombies in the level and make an array
	for (var i = 0; i < map.length; i++) {
		
		if (zombie_code == map[i]) {
			var zombie = new Object ();
			zombie.is_attacking = false;
			zombie.world_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
			zombie.M = translate_mat4 (identity_mat4 (), zombie.world_pos);
			zombie.alive = true;
			zombie.lost_sight_timer = 0.0;
			zombie.heading = 0.0;
			zombie.swipe_cdown = 0.0;
			zombie.health = 100;
			zombie.boss = false;
			zombies.push (zombie);
		} else if (boss_code == map[i]) {
			var zombie = new Object ();
			zombie.is_attacking = false;
			zombie.world_pos = [i % 32 * 2.0, 0.0, Math.floor (i / 32) * 2.0];
			zombie.M = translate_mat4 (identity_mat4 (), zombie.world_pos);
			zombie.alive = true;
			zombie.lost_sight_timer = 0.0;
			zombie.heading = 0.0;
			zombie.swipe_cdown = 0.0;
			zombie.health = 1000;
			zombie.boss = true;
			zombies.push (zombie);
		}
	}
}

function is_los_clear (x_i, y_i, x_f, y_f) {
	var x = x_i;
	var y = y_i;
	var d_x = x_f - x_i;
	var d_y = y_f - y_i;
	var i_x = 1;
	var i_y = 1;
	if (d_x < 0) {
		i_x = -1;
		d_x = Math.abs (d_x);
	}
	if (d_y < 0) {
		i_y = -1;
		d_y = Math.abs (d_y);
	}
	var d2_x = d_x * 2;
	var d2_y = d_y * 2;
	if (d_x > d_y) {
		var err = d2_y  - d_x;
		for (var i = 0; i <= d_x; i++) {
			if (is_wall (x, y)) {
				return false;
			}
			if (err >= 0) {
				err -= d2_x;
				y += i_y;
			}
			err += d2_y;
			x += i_x;
		} // endfor
	} else {
		var err = d2_x  - d_y;
		for (var i= 0; i <= d_y; i++) {
			if (is_wall (x, y)) {
				return false;
			}
			if (err >= 0) {
				err -= d2_y;
				x += i_x;
			}
			err += d2_x;
			y += i_y;
		} // endfor
	} // endif
	return true;
}

function is_clear_for_zomb (pos) {
	var r = 0.5;
	var p = [];
	p.push (pos);
	p.push (add_vec3_vec3 (pos, [r, 0.0, 0.0]));
	p.push = (add_vec3_vec3 (pos, [-r, 0.0, 0.0]));
	p.push = (add_vec3_vec3 (pos, [0.0, 0.0, r]));
	p.push = (add_vec3_vec3 (pos, [0.0, 0.0, -r]));
	
	for (var i = 0; i < p.length; i++) {
		var m = world_to_map (p[i]);
		if (is_wall (m[0], m[1])) {
			return false;
		}
	}
	
	return true;
}

function update_monsters (s) {
	for (var i = 0; i < zombies.length; i++) {
		if (!zombies[i].alive) {
			continue;
		}
		zombies[i].is_attacking = false;
		
		zombies[i].hurt_cd -= s;
		
		// if too far away -- reject
		var dist = sub_vec3_vec3 ([cam_pos[0], 0.0, cam_pos[2]],
			zombies[i].world_pos);
		var dir = normalise_vec3 (dist);
		var d_sq = length2_vec3 (dist);
		if (d_sq > 400.0) {
			zombies[i].hurt_cd = 0.0;
			continue;
		}
		
		// check if got whacked
		if (hatchet_attacking && d_sq <= hatchet_attack_d_sq) {
			var dp = dot_vec3 (cam_fwd, dir);
			// 41 degrees or less
			if (dp < -0.975) {
				zombies[i].health -= 34;
				if (zombies[i].health <= 0) {
					zombies[i].alive = false;
					sounds.zomb_die.play ();
					gui.set_score (gui.score + 10);
					continue;
				} else {
					if (zombies[i].boss) {
						zombies[i].hurt_cd = 0.1;
					} else {
						zombies[i].hurt_cd = 1.0;
					}
					sounds.hit_zomb.play ();
				}
			}
		} else if (shotgun_attacking && d_sq <= shotgun_attack_d_sq) {
			var dp = dot_vec3 (cam_fwd, dir);
			// work out a line of fire
			// 41 degrees or less
			if (dp > -0.975) {
				continue;
			}
			// get distance from monster to line
			var p = [zombies[i].world_pos[0], zombies[i].world_pos[2]];
			var l_i = [cam_pos[0], cam_pos[2]];
			var l_f = [cam_fwd[0] * 100.0, cam_fwd[2] * 100.0];
			l_f = add_vec2_vec2 (l_i, l_f);
			var d = dist_p_to_l (p, l_i, l_f);
			if (d < 1.0) {
				zombies[i].health -= 50;
				if (zombies[i].health <= 0) {
					zombies[i].alive = false;
					sounds.zomb_die.play ();
					if (zombies[i].boss) {
						gui.set_score (gui.score + 100);
						var mapdrop = world_to_map (zombies[i].world_pos);
						var drop_i = mapdrop[1] * 32 + mapdrop[0];
						map[drop_i] = 16581384;
					} else {
						gui.set_score (gui.score + 10);
					}
					continue;
				} else {
					if (zombies[i].boss) {
						zombies[i].hurt_cd = 0.1;
					} else {
						zombies[i].hurt_cd = 1.0;
					}
					sounds.hit_zomb.play ();
				}
			}
		}
		
		// if swiping or being hurt or whatever, finish task and continue
		
		// do nothing whilst stunned
		if (zombies[i].hurt_cd > 0.0) {
			continue;
		}
		zombies[i].hurt_cd = 0.0;
		
		// no AI over certain dist
		if (d_sq > the_zombie.max_chase_d_sq) {
			continue;
		}
		
		if (zombies[i].swipe_cdown > 0.2) {
			zombies[i].is_attacking = true;
		}
		zombies[i].swipe_cdown -= s;
		// if dist to player < some length2 then swipe. and continue.
		if (d_sq <= the_zombie.attack_d_sq) {
			//console.log ("SWIPE!");
			if (zombies[i].swipe_cdown <= 0.0) {
				zombies[i].swipe_cdown = 1.0;
				sounds.zombie_punch.play();
				gui.set_health (gui.health - 10);
				gui.hurt_timer = 1.0;
			}
			continue;
		}
		
		// chase player
		zombies[i].lost_sight_timer -= s;
		if (zombies[i].lost_sight_timer > 1.0) {
			
			var mv = mult_vec3_scal (dir, the_zombie.move_speed * s);
			var next_pos = add_vec3_vec3 (zombies[i].world_pos, mv);
			var next_map = world_to_map (next_pos);
			if (!is_clear_for_zomb (next_pos)) {
				continue;
				// stuck :(
			}
			
			zombies[i].world_pos = next_pos;
			
			// rotate to face player
			//var angle = Math.acos (dot_vec3 ([0.0, 0.0, 1.0], dir)) *
			//	ONE_RAD_IN_DEG;
			var angle = Math.atan2 (dir[0], dir[2]) * ONE_RAD_IN_DEG;
			var R = rotate_y_deg (identity_mat4 (), angle);
			zombies[i].heading = angle;
			zombies[i].M = translate_mat4 (R, next_pos);
			//zombies[i].M = translate_mat4 (identity_mat4 (), zombies[i].world_pos);
			
		// check if can see player (bresenham?) and update lost sight timer
		} else {
			var monster_map = world_to_map (zombies[i].world_pos);
			var player_map = world_to_map (cam_pos); // TODO store in player?
			if (is_los_clear (monster_map[0], monster_map[1],
				player_map[0], player_map[1])) {
				//console.log ("spotted!");
				if (zombies[i].lost_sight_timer < 0.0) {
					sounds.zombie_growl.play();
				}
				zombies[i].lost_sight_timer = 2.0;
			} else {
				//console.log ("lost target");
			}
		}
		
	} // endfor
	hatchet_attacking = false;
	shotgun_attacking = false;
}

function draw_monsters (s) {
	// if not ready -- exit
	if (!the_zombie.is_loaded ()) {
		return;
	}
	// enable zombie shader
	gl.useProgram (the_zombie.sp);
	// uniforms update
	if (cam_dirty || the_zombie.first_draw) {
		the_zombie.first_draw = false;
		gl.uniformMatrix4fv (the_zombie.V_loc, gl.FALSE, new Float32Array (V));
		gl.uniformMatrix4fv (the_zombie.PV_loc, gl.FALSE, new Float32Array (PV));
		unis += 2;
	}
	gl.activeTexture (gl.TEXTURE0);
	for (var i = 0; i < zombies.length; i++) {
		// TODO -- draw dead sprite
		if (!zombies[i].alive) {
			continue;
		}
		if (zombies[i].boss) {
			gl.bindTexture (gl.TEXTURE_2D, the_zombie.anton_tex);
		} else {
			gl.bindTexture (gl.TEXTURE_2D, the_zombie.tex);
		}
		// bind vao
		if (zombies[i].is_attacking) {
			vao_ext.bindVertexArrayOES (the_zombie.attack_vao);
		} else {
			vao_ext.bindVertexArrayOES (the_zombie.vao);
		}
		// if distance too far or behind cam -- reject
		// culling
		var dist3d = sub_vec3_vec3 (zombies[i].world_pos, cam_pos);
		var dist2 = length2_vec3 (dist3d);
		if (dist2 > the_zombie.max_draw_dist2) {
			culls++;
			continue;
		}
		var dir3d = normalise_vec3 (dist3d);
		var dp = dot_vec3 (dir3d, cam_fwd);
		if (dp < the_zombie.max_draw_dp) {
			culls++;
			continue;
		}
		
		// model matrix
		gl.uniformMatrix4fv (the_zombie.M_loc, gl.FALSE,
			new Float32Array (zombies[i].M));
		gl.uniform1f (the_zombie.t_loc, zombies[i].hurt_cd);
		unis += 2;
		// update animations
	
		// draw
		gl.drawArrays (gl.TRIANGLES, 0, the_zombie.vao.pc);
		draws++;
	}
}
