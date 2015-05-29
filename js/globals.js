var canvas, gl, vao_ext;

var game_state = "title";

var map = [];
var map_loaded = false;
var has_silver_key = false;
var has_shotgun = false;
var sel_weap = 0;

var culls = 0;
var draws = 0;
var unis = 0;

function is_wall (map_col, map_row) {
	var map_i = map_row * 32 + map_col;
	// probably a range of values for walls?
	if (256 >= map[map_i]) {
		return true;
	}
	// bars
	if (16581379 == map[map_i]) {
		return true;
	}
	// doors
	if (map[map_i] == 16581375) {
		return true;
	}
	return false;
}

function pick_up_stuff () {
	var map_row = Math.floor ((cam_pos[2] + 1.0) / 2.0);
	var map_col = Math.floor ((cam_pos[0] + 1.0) / 2.0);
	var map_i = map_row * 32 + map_col;
	// silver key
	if (map[map_i] == 16581376) {
		// remove from map
		map[map_i] = 16646655;
		// add to inventory logic
		has_silver_key = true;
		sounds.get_key.play();
	// crown
	} else if (map[map_i] == 16581377) {
		// remove from map
		map[map_i] = 16646655;
		sounds.get_crown.play();
		// add score
		gui.set_score (gui.score + 100);
		gui.gold_timer = 0.75;
	// medkit
	} else if (map[map_i] == 16581378) {
		if (gui.health < 100) {
			// remove from map
			map[map_i] = 16646655;
			sounds.medkit.play();
			// add score
			var h = gui.health + 25;
			if (h > 100) {
				h = 100;
			}
			gui.set_health (h);
			gui.heal_timer = 0.75;
		}
	// shotgun
	} else if (map[map_i] == 16581380) {
		// remove from map
		map[map_i] = 16646655;
		sounds.get_shotgun.play();
		// add ammo
		gui.set_ammo (gui.ammo + 8);
		has_shotgun = true;
		sel_weap = 1;
	// mask
	} else if (map[map_i] == 16581381) {
		// remove from map
		map[map_i] = 16646655;
		// TODO
		//sounds.get_mask.play();
		gui.mask_timer = 3.0;
	}
}

function world_to_map (pos) {
	var col = Math.floor ((pos[0] + 1.0) * 0.5);
	var row = Math.floor ((pos[2] + 1.0) * 0.5);
	return [col, row];
}

var keys_down = [];
var keys_locked = [];

document.onkeydown = function (event) {
	keys_down[event.keyCode] = true;
}

document.onkeyup = function (event) {
	keys_down[event.keyCode] = false;
	keys_locked[event.keyCode] = false;
}

function is_key_down (code) {
	if (keys_down[code] && !keys_locked[code]) {
		keys_locked[code] = true;
		return true;
	}
	return false;
}
